const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const onlineUsers = new Map();
const noteRooms = new Map();
const saveTimers = new Map();
const versionTimers = new Map();

async function checkNoteAccess(noteId, userId) {
  const note = await pool.query('SELECT user_id FROM notes WHERE id = $1', [noteId]);
  if (note.rows.length === 0) return false;
  if (note.rows[0].user_id === userId) return true;

  const collab = await pool.query(
    'SELECT id FROM note_collaborators WHERE note_id = $1 AND user_id = $2',
    [noteId, userId]
  );
  return collab.rows.length > 0;
}

function initSocket(io) {
  io.use((socket, next) => {
    let token;

    token = socket.handshake.auth?.token;
    if (!token) {
      const cookieHeader = socket.handshake.headers?.cookie || '';
      if (cookieHeader) {
        const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
        if (match) token = match[1];
      }
    }

    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);

    onlineUsers.set(socket.id, {
      userId: socket.user.id,
      name: socket.user.name,
      avatar_url: socket.user.avatar_url,
    });
    broadcastOnlineUsers(io);

    socket.on('join-note', async ({ noteId }) => {
      try {
        const hasAccess = await checkNoteAccess(noteId, socket.user.id);
        if (!hasAccess) {
          return socket.emit('error', { message: 'Access denied to this note' });
        }

        socket.join(`note:${noteId}`);

        if (!noteRooms.has(noteId)) noteRooms.set(noteId, new Set());
        const room = noteRooms.get(noteId);

        const alreadyInRoom = Array.from(room).some((u) => u.userId === socket.user.id);

        room.add({
          socketId: socket.id,
          userId: socket.user.id,
          name: socket.user.name,
          avatar_url: socket.user.avatar_url,
        });

        const uniqueUsers = [...new Map(
          Array.from(room).map((u) => [u.userId, { userId: u.userId, name: u.name, avatar_url: u.avatar_url }])
        ).values()];
        socket.emit('note-users', uniqueUsers);

        if (!alreadyInRoom) {
          socket.to(`note:${noteId}`).emit('user-joined', {
            userId: socket.user.id,
            name: socket.user.name,
            avatar_url: socket.user.avatar_url,
          });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to join note' });
      }
    });

    socket.on('leave-note', ({ noteId }) => {
      socket.leave(`note:${noteId}`);
      removeFromNoteRoom(noteId, socket.id);
      const remaining = noteRooms.get(noteId);
      const stillInRoom = remaining && Array.from(remaining).some((u) => u.userId === socket.user.id);
      if (!stillInRoom) {
        socket.to(`note:${noteId}`).emit('user-left', {
          userId: socket.user.id,
          name: socket.user.name,
        });
      }
    });


    socket.on('note-update', async ({ noteId, content, title }) => {
      if (!isInNoteRoom(noteId, socket.id)) {
        return socket.emit('error', { message: 'Not in this note room' });
      }

      socket.to(`note:${noteId}`).emit('note-updated', {
        content,
        title,
        userId: socket.user.id,
        userName: socket.user.name,
      });

      debouncedSave(noteId, title, content, socket.user.id);
    });

    socket.on('cursor-move', ({ noteId, cursor }) => {
      if (!isInNoteRoom(noteId, socket.id)) return;

      socket.to(`note:${noteId}`).emit('cursor-update', {
        userId: socket.user.id,
        name: socket.user.name,
        cursor,
      });
    });

    socket.on('typing', ({ noteId }) => {
      if (!isInNoteRoom(noteId, socket.id)) return;

      socket.to(`note:${noteId}`).emit('user-typing', {
        userId: socket.user.id,
        name: socket.user.name,
      });
    });

    socket.on('stop-typing', ({ noteId }) => {
      if (!isInNoteRoom(noteId, socket.id)) return;

      socket.to(`note:${noteId}`).emit('user-stop-typing', {
        userId: socket.user.id,
      });
    });

    socket.on('comment-add', async ({ noteId, content }) => {
      if (!isInNoteRoom(noteId, socket.id)) {
        return socket.emit('error', { message: 'Not in this note room' });
      }
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return socket.emit('error', { message: 'Comment content is required' });
      }

      try {
        const result = await pool.query(
          `INSERT INTO comments (note_id, user_id, content) VALUES ($1, $2, $3)
           RETURNING *, (SELECT name FROM users WHERE id = $2) as user_name,
           (SELECT avatar_url FROM users WHERE id = $2) as user_avatar_url`,
          [noteId, socket.user.id, content.trim().slice(0, 5000)]
        );
        io.to(`note:${noteId}`).emit('comment-added', result.rows[0]);
      } catch (err) {
        socket.emit('error', { message: 'Failed to add comment' });
      }
    });

    socket.on('comment-resolve', async ({ noteId, commentId }) => {
      if (!isInNoteRoom(noteId, socket.id)) {
        return socket.emit('error', { message: 'Not in this note room' });
      }

      try {
        const result = await pool.query(
          'UPDATE comments SET resolved = NOT resolved WHERE id = $1 AND note_id = $2 RETURNING *',
          [commentId, noteId]
        );
        if (result.rows[0]) {
          io.to(`note:${noteId}`).emit('comment-resolved', {
            commentId,
            resolved: result.rows[0].resolved,
            userId: socket.user.id,
            userName: socket.user.name,
          });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to resolve comment' });
      }
    });

    socket.on('comment-delete', async ({ noteId, commentId }) => {
      if (!isInNoteRoom(noteId, socket.id)) {
        return socket.emit('error', { message: 'Not in this note room' });
      }

      try {
        const result = await pool.query(
          'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
          [commentId, socket.user.id]
        );
        if (result.rows[0]) {
          io.to(`note:${noteId}`).emit('comment-deleted', {
            commentId,
            userId: socket.user.id,
            userName: socket.user.name,
          });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to delete comment' });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      broadcastOnlineUsers(io);

      for (const [noteId, users] of noteRooms.entries()) {
        const before = users.size;
        removeFromNoteRoom(noteId, socket.id);
        if (users.size < before) {
          const stillInRoom = Array.from(users).some((u) => u.userId === socket.user.id);
          if (!stillInRoom) {
            io.to(`note:${noteId}`).emit('user-left', {
              userId: socket.user.id,
              name: socket.user.name,
            });
          }
        }
      }
    });
  });
}

function broadcastOnlineUsers(io) {
  const users = Array.from(onlineUsers.values());
  const unique = [...new Map(users.map((u) => [u.userId, u])).values()];
  io.emit('online-users', unique);
}

function isInNoteRoom(noteId, socketId) {
  const room = noteRooms.get(noteId);
  if (!room) return false;
  for (const user of room) {
    if (user.socketId === socketId) return true;
  }
  return false;
}

function removeFromNoteRoom(noteId, socketId) {
  const room = noteRooms.get(noteId);
  if (!room) return;
  for (const user of room) {
    if (user.socketId === socketId) {
      room.delete(user);
      break;
    }
  }
  if (room.size === 0) {
    noteRooms.delete(noteId);
  }
}

function debouncedSave(noteId, title, content, userId) {
  if (saveTimers.has(noteId)) clearTimeout(saveTimers.get(noteId));

  saveTimers.set(
    noteId,
    setTimeout(async () => {
      try {
        await pool.query(
          'UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE id = $3',
          [title, content, noteId]
        );

        const lastVersion = versionTimers.get(noteId) || 0;
        if (Date.now() - lastVersion > 5 * 60 * 1000) {
          await pool.query(
            'INSERT INTO note_versions (note_id, title, content, saved_by) VALUES ($1, $2, $3, $4)',
            [noteId, title, content, userId]
          );
          await pool.query(
            `DELETE FROM note_versions WHERE note_id = $1 AND id NOT IN (
              SELECT id FROM note_versions WHERE note_id = $1 ORDER BY created_at DESC LIMIT 5
            )`,
            [noteId]
          );
          versionTimers.set(noteId, Date.now());
        }
      } catch (err) {
        console.error('Auto-save error:', err);
      }
      saveTimers.delete(noteId);
    }, 500)
  );
}

module.exports = initSocket;
