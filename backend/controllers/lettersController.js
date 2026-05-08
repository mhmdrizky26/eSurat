const db = require('../config/db');
const { s3, S3_BUCKET } = require('../config/aws');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { pipeline } = require('stream/promises');

function canAccessAllLetters(role) {
  return role === 'officer';
}

// Bersihkan nama file dari karakter aneh sebelum jadi key S3
function sanitizeFilename(name) {
  return String(name).replace(/[^\w.\-]+/g, '_').slice(0, 120);
}

// Tentukan Content-Disposition berdasarkan tipe file
// inline = buka di browser, attachment = download
function getContentDisposition(mimetype, filename) {
  const inlineTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/msword', // .doc (older)
  ];
  const safeName = sanitizeFilename(filename);
  const disposition = inlineTypes.includes(mimetype) ? 'inline' : 'attachment';
  return `${disposition}; filename="${safeName}"`;
}

exports.createLetter = async (req, res) => {
  const { letter_type, subject, body } = req.body;
  const user = req.user;
  const files = req.files || [];
  const conn = db.promise();

  try {
    const [result] = await conn.query(
      `INSERT INTO letters (user_id, letter_type, subject, body, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [user.id, letter_type || '', subject || '', body || '', 'submitted']
    );
    const letterId = result.insertId;

    // Upload semua lampiran ke S3 (paralel)
    await Promise.all(files.map(async file => {
      const safeName = sanitizeFilename(file.originalname);
      const key = `letters/${letterId}/${Date.now()}_${safeName}`;

      await s3.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: file.buffer,           // langsung dari memory, tidak lewat disk
        ContentType: file.mimetype,
        ContentDisposition: getContentDisposition(file.mimetype, file.originalname),
      }));

      await conn.query(
        `INSERT INTO attachments (letter_id, s3_key, filename, mime_type, size)
         VALUES (?, ?, ?, ?, ?)`,
        [letterId, key, file.originalname, file.mimetype, file.size]
      );
    }));

    res.json({ id: letterId, message: 'Letter submitted', attachments: files.length });
  } catch (err) {
    console.error('[createLetter]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listLetters = async (req, res) => {
  const user = req.user;
  try {
    const [rows] = canAccessAllLetters(user.role)
      ? await db.promise().query('SELECT * FROM letters ORDER BY created_at DESC')
      : await db.promise().query(
          'SELECT * FROM letters WHERE user_id = ? ORDER BY created_at DESC',
          [user.id]
        );
    res.json(rows);
  } catch (err) {
    console.error('[listLetters]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLetter = async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  try {
    const [letters] = await db.promise().query('SELECT * FROM letters WHERE id = ?', [id]);
    if (!letters.length) return res.status(404).json({ message: 'Not found' });

    const letter = letters[0];
    if (!canAccessAllLetters(user.role) && letter.user_id !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [attachments] = await db.promise().query(
      'SELECT id, filename, mime_type, s3_key FROM attachments WHERE letter_id = ?',
      [id]
    );

    // Setiap attachment dapet presigned URL — berlaku 5 menit
    const files = await Promise.all(attachments.map(async a => {
      return {
        id: a.id,
        filename: a.filename,
        mime_type: a.mime_type,
        url: `/api/letters/${id}/attachments/${a.id}/open`,
      };
    }));

    res.json({ letter, attachments: files });
  } catch (err) {
    console.error('[getLetter]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.openAttachment = async (req, res) => {
  const letterId = req.params.id;
  const attachmentId = req.params.attachmentId;
  const user = req.user;

  try {
    const [letters] = await db.promise().query('SELECT * FROM letters WHERE id = ?', [letterId]);
    if (!letters.length) return res.status(404).json({ message: 'Not found' });

    const letter = letters[0];
    if (!canAccessAllLetters(user.role) && letter.user_id !== user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [attachments] = await db.promise().query(
      'SELECT id, filename, mime_type, s3_key FROM attachments WHERE id = ? AND letter_id = ? LIMIT 1',
      [attachmentId, letterId]
    );

    if (!attachments.length) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const attachment = attachments[0];
    const result = await s3.send(new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: attachment.s3_key,
    }));

    if (!result.Body) {
      return res.status(404).json({ message: 'Attachment stream not available' });
    }

    res.setHeader('Content-Type', attachment.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', getContentDisposition(attachment.mime_type, attachment.filename));

    await pipeline(result.Body, res);
  } catch (err) {
    console.error('[openAttachment]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const user = req.user;
  if (user.role !== 'officer') return res.status(403).json({ message: 'Forbidden' });

  const allowed = ['submitted', 'processing', 'approved', 'rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await db.promise().query(
      'UPDATE letters SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('[updateStatus]', err);
    res.status(500).json({ message: 'Server error' });
  }
};