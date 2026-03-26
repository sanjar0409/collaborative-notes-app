const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const uploadFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      const uploadedPath = path.join(__dirname, '..', '..', 'uploads', 'files', req.file.filename);
      if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO note_files (note_id, user_id, filename, original_name, mimetype, size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *, (SELECT name FROM users WHERE id = $2) as uploaded_by`,
      [id, req.user.id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size]
    );

    const file = result.rows[0];

    const io = req.app.get('io');
    if (io) {
      io.to(`note:${id}`).emit('file-uploaded', file);
    }

    res.status(201).json(file);
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFiles = async (req, res) => {
  try {
    const { id } = req.params;

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT f.*, u.name as uploaded_by
       FROM note_files f
       JOIN users u ON f.user_id = u.id
       WHERE f.note_id = $1
       ORDER BY f.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id, fid } = req.params;
    const file = await pool.query('SELECT * FROM note_files WHERE id = $1 AND note_id = $2', [fid, id]);

    if (file.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const note = await pool.query('SELECT user_id FROM notes WHERE id = $1', [id]);
    const isUploader = file.rows[0].user_id === req.user.id;
    const isOwner = note.rows.length > 0 && note.rows[0].user_id === req.user.id;

    if (!isUploader && !isOwner) {
      return res.status(403).json({ error: 'Only the uploader or note owner can delete' });
    }

    const safeFilename = path.basename(file.rows[0].filename);
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'files', safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM note_files WHERE id = $1', [fid]);

    const io = req.app.get('io');
    if (io) {
      io.to(`note:${id}`).emit('file-deleted', { fileId: parseInt(fid) });
    }

    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

async function verifyNoteAccess(noteId, userId) {
  const note = await pool.query('SELECT user_id FROM notes WHERE id = $1', [noteId]);
  if (note.rows.length === 0) return false;
  if (note.rows[0].user_id === userId) return true;

  const collab = await pool.query(
    'SELECT id FROM note_collaborators WHERE note_id = $1 AND user_id = $2',
    [noteId, userId]
  );
  return collab.rows.length > 0;
}

module.exports = { uploadFile, getFiles, deleteFile, verifyNoteAccess };
