import { useState, useEffect, useRef, useCallback } from 'react';

export function useNoteCollaboration({
  noteId,
  user,
  socketRef,
  setContent,
  setTitle,
  setComments,
  addNotification,
}) {
  const [noteUsers, setNoteUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState([]);

  const typingTimeoutRef = useRef(null);
  const titleDebounceRef = useRef(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!user || !socket) return;

    socket.emit('join-note', { noteId, userId: user.id, name: user.name });

    const handlers = {
      'note-updated': ({ content: newContent, title: newTitle, userId, userName }) => {
        if (userId !== user.id) {
          if (newContent !== undefined) setContent(newContent);
          if (newTitle !== undefined) setTitle(newTitle);
          addNotification({
            text: `${userName} made changes`,
            targetType: 'edit',
            targetId: null,
          });
        }
      },

      'note-users': (users) => setNoteUsers(users),

      'user-joined': (u) => {
        setNoteUsers((prev) => {
          if (prev.find((p) => p.userId === u.userId)) return prev;
          return [...prev, u];
        });
        addNotification({ text: `${u.name} joined`, targetType: 'join', targetId: null });
      },

      'user-left': (u) => {
        setNoteUsers((prev) => prev.filter((p) => p.userId !== u.userId));
        setRemoteCursors((prev) => prev.filter((c) => c.userId !== u.userId));
      },

      'user-typing': (u) => {
        setTypingUsers((prev) => {
          if (prev.find((p) => p.userId === u.userId)) return prev;
          return [...prev, u];
        });
      },

      'user-stop-typing': ({ userId }) => {
        setTypingUsers((prev) => prev.filter((p) => p.userId !== userId));
      },

      'cursor-update': ({ userId, name, cursor }) => {
        setRemoteCursors((prev) => {
          const idx = prev.findIndex((c) => c.userId === userId);
          const entry = { userId, name, cursor };
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = entry;
            return next;
          }
          return [...prev, entry];
        });
      },

      'comment-added': (comment) => {
        setComments((prev) => [...prev, comment]);
        if (comment.user_id !== user.id) {
          addNotification({
            text: `${comment.user_name} added a comment`,
            targetType: 'comment',
            targetId: comment.id,
          });
        }
      },

      'comment-resolved': ({ commentId, resolved, userId, userName }) => {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, resolved } : c))
        );
        if (userId !== user.id) {
          addNotification({
            text: `${userName} ${resolved ? 'resolved' : 'unresolve'} a comment`,
            targetType: 'comment-resolve',
            targetId: commentId,
          });
        }
      },

      'comment-deleted': ({ commentId, userId, userName }) => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        if (userId !== user.id) {
          addNotification({
            text: `${userName} deleted a comment`,
            targetType: 'comment-delete',
            targetId: null,
          });
        }
      },

      'file-uploaded': (file) => {
        if (file.user_id !== user.id) {
          addNotification({
            text: `${file.uploaded_by || 'Someone'} shared a file`,
            targetType: 'file',
            targetId: file.id,
          });
        }
      },
    };

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    return () => {
      socket.emit('leave-note', { noteId });
      for (const event of Object.keys(handlers)) {
        socket.off(event);
      }
    };
  }, [noteId, user, socketRef, setContent, setTitle, setComments, addNotification]);

  const emitContentChange = useCallback(
    (newContent, currentTitle) => {
      const socket = socketRef.current;
      if (!socket) return;

      socket.emit('typing', { noteId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', { noteId });
      }, 1000);

      socket.emit('note-update', { noteId, content: newContent, title: currentTitle });
    },
    [noteId, socketRef]
  );

  const emitTitleChange = useCallback(
    (newTitle, currentContent) => {
      const socket = socketRef.current;
      if (!socket) return;

      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
      titleDebounceRef.current = setTimeout(() => {
        socket.emit('note-update', { noteId, content: currentContent, title: newTitle });
      }, 500);
    },
    [noteId, socketRef]
  );

  const emitCursorMove = useCallback(
    (cursor) => {
      socketRef.current?.emit('cursor-move', { noteId, cursor });
    },
    [noteId, socketRef]
  );

  const emitAddComment = useCallback(
    (content) => {
      socketRef.current?.emit('comment-add', { noteId, content });
    },
    [noteId, socketRef]
  );

  const emitResolveComment = useCallback(
    (commentId) => {
      socketRef.current?.emit('comment-resolve', { noteId, commentId });
    },
    [noteId, socketRef]
  );

  const emitDeleteComment = useCallback(
    (commentId) => {
      socketRef.current?.emit('comment-delete', { noteId, commentId });
    },
    [noteId, socketRef]
  );

  const emitRestore = useCallback(
    (restoredNote) => {
      socketRef.current?.emit('note-update', {
        noteId,
        content: restoredNote.content,
        title: restoredNote.title,
      });
    },
    [noteId, socketRef]
  );

  return {
    noteUsers,
    typingUsers,
    remoteCursors,
    emitContentChange,
    emitTitleChange,
    emitCursorMove,
    emitAddComment,
    emitResolveComment,
    emitDeleteComment,
    emitRestore,
  };
}
