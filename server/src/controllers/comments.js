const pool = require('../config/db');
const { verifyNoteAccess } = require('./files');

const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT c.*, u.name as user_name, u.avatar_url as user_avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.note_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO comments (note_id, user_id, content) VALUES ($1, $2, $3)
       RETURNING *, (SELECT name FROM users WHERE id = $2) as user_name,
       (SELECT avatar_url FROM users WHERE id = $2) as user_avatar_url`,
      [id, req.user.id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const resolveComment = async (req, res) => {
  try {
    const { id, cid } = req.params;

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'UPDATE comments SET resolved = NOT resolved WHERE id = $1 AND note_id = $2 RETURNING *',
      [cid, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Resolve comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id, cid } = req.params;

    const comment = await pool.query('SELECT user_id, note_id FROM comments WHERE id = $1', [cid]);
    if (comment.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });

    if (comment.rows[0].note_id !== parseInt(id)) {
      return res.status(400).json({ error: 'Comment does not belong to this note' });
    }

    const note = await pool.query('SELECT user_id FROM notes WHERE id = $1', [id]);
    const isAuthor = comment.rows[0].user_id === req.user.id;
    const isNoteOwner = note.rows.length > 0 && note.rows[0].user_id === req.user.id;

    if (!isAuthor && !isNoteOwner) {
      return res.status(403).json({ error: 'Only the author or note owner can delete' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [cid]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getComments, addComment, resolveComment, deleteComment };
