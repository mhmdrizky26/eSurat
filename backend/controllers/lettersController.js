const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { s3 } = require('../config/aws');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);

function canAccessAllLetters(role) {
  return role === 'officer';
}

exports.createLetter = async (req, res) => {
  const { letter_type, subject, body } = req.body;
  const user = req.user;
  const files = req.files || [];
  const conn = db.promise();

  try {
    const [result] = await conn.query(
      'INSERT INTO letters (user_id, letter_type, subject, body, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [user.id, letter_type || '', subject || '', body || '', 'submitted']
    );
    const letterId = result.insertId;

    for (const file of files) {
      if (process.env.S3_BUCKET) {
        const fileStream = fs.createReadStream(file.path);
        const key = `letters/${letterId}/${Date.now()}_${file.originalname}`;
        await s3.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: fileStream,
          ContentType: file.mimetype
        }));
        await conn.query(
          'INSERT INTO attachments (letter_id, s3_key, filename, mime_type, size) VALUES (?, ?, ?, ?, ?)',
          [letterId, key, file.originalname, file.mimetype, file.size]
        );
        await unlinkAsync(file.path);
      } else {
        const dir = path.join(__dirname, '..', 'uploads', 'letters', String(letterId));
        fs.mkdirSync(dir, { recursive: true });
        const destName = `${Date.now()}_${file.originalname}`;
        const destPath = path.join(dir, destName);
        fs.renameSync(file.path, destPath);
        const key = `letters/${letterId}/${destName}`;
        await conn.query(
          'INSERT INTO attachments (letter_id, s3_key, filename, mime_type, size) VALUES (?, ?, ?, ?, ?)',
          [letterId, key, file.originalname, file.mimetype, file.size]
        );
      }
    }

    res.json({ id: letterId, message: 'Letter submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listLetters = async (req, res) => {
  const user = req.user;
  try {
    let rows;
    if (canAccessAllLetters(user.role)) {
      const [result] = await db.promise().query('SELECT * FROM letters ORDER BY created_at DESC');
      rows = result;
    } else {
      const [result] = await db.promise().query('SELECT * FROM letters WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
      rows = result;
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
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

    const [attachments] = await db.promise().query('SELECT id, filename, mime_type, s3_key FROM attachments WHERE letter_id = ?', [id]);

    const files = await Promise.all(attachments.map(async a => {
      if (process.env.S3_BUCKET) {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: a.s3_key }),
          { expiresIn: 60 * 5 }
        );
        return { id: a.id, filename: a.filename, mime_type: a.mime_type, url };
      }
      const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
      const url = `${base}/uploads/${a.s3_key}`;
      return { id: a.id, filename: a.filename, mime_type: a.mime_type, url };
    }));

    res.json({ letter, attachments: files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const user = req.user;
  if (user.role !== 'officer') return res.status(403).json({ message: 'Forbidden' });
  try {
    await db.promise().query('UPDATE letters SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
