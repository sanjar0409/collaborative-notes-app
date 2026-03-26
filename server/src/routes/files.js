const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { fileUpload } = require('../config/upload');
const { uploadFile, getFiles, deleteFile } = require('../controllers/files');

router.post('/:id/files', auth, fileUpload.single('file'), uploadFile);
router.get('/:id/files', auth, getFiles);
router.delete('/:id/files/:fid', auth, deleteFile);

module.exports = router;
