const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../utils/authMiddleware');
const lettersController = require('../controllers/lettersController');

const upload = multer({ dest: 'uploads/' });

router.post('/', authenticateToken, upload.array('attachments', 5), lettersController.createLetter);
router.get('/', authenticateToken, lettersController.listLetters);
router.get('/:id', authenticateToken, lettersController.getLetter);
router.put('/:id/status', authenticateToken, lettersController.updateStatus);

module.exports = router;
