const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../utils/authMiddleware');
const lettersController = require('../controllers/lettersController');

// Pakai memory storage — file ditahan di buffer, langsung di-stream ke S3,
// tidak menulis ke disk sama sekali.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5,                   // maksimum 5 lampiran
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Tipe berkas tidak didukung. Hanya PDF, JPG, dan PNG.'));
  },
});

// Wrapper biar error multer (file kebesaran, tipe salah, dst.) keluar dengan rapi
function handleUpload(req, res, next) {
  upload.array('attachments', 5)(req, res, err => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Gagal unggah: ${err.message}` });
    }
    return res.status(400).json({ message: err.message || 'Gagal unggah berkas' });
  });
}

router.post('/', authenticateToken, handleUpload, lettersController.createLetter);
router.get('/', authenticateToken, lettersController.listLetters);
router.get('/:id', authenticateToken, lettersController.getLetter);
router.put('/:id/status', authenticateToken, lettersController.updateStatus);

module.exports = router;