const pool = require('../config/db');
const { verifyNoteAccess } = require('./files');

const createNote = async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO notes (title, user_id) VALUES ($1, $2) RETURNING *',
      [title || 'Untitled', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getNotes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT n.*, u.name as owner_name,
        CASE WHEN n.user_id = $1 THEN 'owner' ELSE 'collaborator' END as role
       FROM notes n
       JOIN users u ON n.user_id = u.id
       WHERE n.user_id = $1
       UNION
       SELECT n.*, u.name as owner_name, 'collaborator' as role
       FROM notes n
       JOIN users u ON n.user_id = u.id
       JOIN note_collaborators nc ON nc.note_id = n.id
       WHERE nc.user_id = $1
       ORDER BY updated_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT n.*, u.name as owner_name FROM notes n
       JOIN users u ON n.user_id = u.id
       WHERE n.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = result.rows[0];
    const isOwner = note.user_id === req.user.id;
    const collab = await pool.query(
      'SELECT id FROM note_collaborators WHERE note_id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    const isCollaborator = collab.rows.length > 0;

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ ...note, isOwner, isCollaborator });
  } catch (err) {
    console.error('Get note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await pool.query('SELECT user_id FROM notes WHERE id = $1', [id]);
    if (note.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    if (note.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can delete' });
    }

    await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const note = await pool.query('SELECT user_id, title FROM notes WHERE id = $1', [id]);
    if (note.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    if (note.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can invite' });
    }

    const user = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    if (user.rows[0].id === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });

    const existing = await pool.query(
      'SELECT id FROM note_collaborators WHERE note_id = $1 AND user_id = $2',
      [id, user.rows[0].id]
    );
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Already a collaborator' });

    const existingInvite = await pool.query(
      "SELECT id FROM pending_invitations WHERE note_id = $1 AND invitee_id = $2 AND status = 'pending'",
      [id, user.rows[0].id]
    );
    if (existingInvite.rows.length > 0) return res.status(400).json({ error: 'Invitation already sent' });

    const invitation = await pool.query(
      'INSERT INTO pending_invitations (note_id, inviter_id, invitee_id) VALUES ($1, $2, $3) RETURNING *',
      [id, req.user.id, user.rows[0].id]
    );

    const io = req.app.get('io');
    io.to(`user:${user.rows[0].id}`).emit('invitation-received', {
      id: invitation.rows[0].id,
      noteId: parseInt(id),
      noteTitle: note.rows[0].title,
      inviterName: req.user.name,
      inviterId: req.user.id,
    });

    res.status(201).json({ message: 'Invitation sent' });
  } catch (err) {
    console.error('Add collaborator error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getPendingInvitations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pi.id, pi.note_id as "noteId", pi.status, pi.created_at,
              n.title as "noteTitle", u.name as "inviterName", u.id as "inviterId"
       FROM pending_invitations pi
       JOIN notes n ON pi.note_id = n.id
       JOIN users u ON pi.inviter_id = u.id
       WHERE pi.invitee_id = $1 AND pi.status = 'pending'
       ORDER BY pi.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get pending invitations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const inv = await pool.query(
      "SELECT * FROM pending_invitations WHERE id = $1 AND invitee_id = $2 AND status = 'pending'",
      [invitationId, req.user.id]
    );
    if (inv.rows.length === 0) return res.status(404).json({ error: 'Invitation not found' });

    await pool.query(
      'INSERT INTO note_collaborators (note_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [inv.rows[0].note_id, req.user.id]
    );

    await pool.query(
      "UPDATE pending_invitations SET status = 'accepted' WHERE id = $1",
      [invitationId]
    );

    res.json({ message: 'Invitation accepted', noteId: inv.rows[0].note_id });
  } catch (err) {
    console.error('Accept invitation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const inv = await pool.query(
      "SELECT * FROM pending_invitations WHERE id = $1 AND invitee_id = $2 AND status = 'pending'",
      [invitationId, req.user.id]
    );
    if (inv.rows.length === 0) return res.status(404).json({ error: 'Invitation not found' });

    await pool.query(
      "UPDATE pending_invitations SET status = 'declined' WHERE id = $1",
      [invitationId]
    );

    res.json({ message: 'Invitation declined' });
  } catch (err) {
    console.error('Decline invitation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCollaborators = async (req, res) => {
  try {
    const { id } = req.params;

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, nc.role, nc.created_at
       FROM note_collaborators nc
       JOIN users u ON nc.user_id = u.id
       WHERE nc.note_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get collaborators error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const removeCollaborator = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const note = await pool.query('SELECT user_id FROM notes WHERE id = $1', [id]);
    if (note.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    if (note.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can remove collaborators' });
    }

    await pool.query('DELETE FROM note_collaborators WHERE note_id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Collaborator removed' });
  } catch (err) {
    console.error('Remove collaborator error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getVersions = async (req, res) => {
  try {
    const { id } = req.params;

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT nv.*, u.name as saved_by_name
       FROM note_versions nv
       JOIN users u ON nv.saved_by = u.id
       WHERE nv.note_id = $1
       ORDER BY nv.created_at DESC
       LIMIT 5`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get versions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const restoreVersion = async (req, res) => {
  try {
    const { id, vid } = req.params;

    const access = await verifyNoteAccess(id, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const version = await pool.query('SELECT * FROM note_versions WHERE id = $1 AND note_id = $2', [vid, id]);
    if (version.rows.length === 0) return res.status(404).json({ error: 'Version not found' });

    const current = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
    await pool.query(
      'INSERT INTO note_versions (note_id, title, content, saved_by) VALUES ($1, $2, $3, $4)',
      [id, current.rows[0].title, current.rows[0].content, req.user.id]
    );

    const v = version.rows[0];
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [v.title, v.content, id]
    );

    await pool.query(
      `DELETE FROM note_versions WHERE note_id = $1 AND id NOT IN (
        SELECT id FROM note_versions WHERE note_id = $1 ORDER BY created_at DESC LIMIT 5
      )`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Restore version error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createNote, getNotes, getNote, updateNote, deleteNote,
  addCollaborator, getCollaborators, removeCollaborator,
  getVersions, restoreVersion,
  getPendingInvitations, acceptInvitation, declineInvitation
};
