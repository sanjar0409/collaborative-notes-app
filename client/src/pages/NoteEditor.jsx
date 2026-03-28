import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { UserPlus, MessageSquare, Clock, ArrowLeft, Bell, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useNoteData } from '../hooks/useNoteData';
import { useNoteCollaboration } from '../hooks/useNoteCollaboration';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../hooks/useTheme';
import Toolbar from '../components/Toolbar';
import Editor from '../components/Editor';
import OnlineUsers from '../components/OnlineUsers';
import InviteModal from '../components/InviteModal';
import CommentSidebar from '../components/CommentSidebar';
import VersionHistory from '../components/VersionHistory';
import FileSharingPanel from '../components/FileSharingPanel';
import SharedNotes from '../components/SharedNotes';
import AvatarUploadModal from '../components/AvatarUploadModal';
import { Button, IconButton } from '../components/ui/Button';
import { ButtonSpinner } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { StatusBar } from '../components/ui/StatusBar';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const MemoizedEditor = memo(Editor);
const MemoizedCommentSidebar = memo(CommentSidebar);
const MemoizedFileSharingPanel = memo(FileSharingPanel);
const MemoizedSharedNotes = memo(SharedNotes);

export default function NoteEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socketRef: globalSocketRef } = useSocket();
  const { theme, toggleTheme } = useTheme();

  const [showInvite, setShowInvite] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [viewedCount, setViewedCount] = useState(0);

  const socketRef = globalSocketRef || { current: null };
  const isRemoteUpdateRef = useRef(false);
  const debounceRef = useRef(null);
  const handleContentChangeRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Start typing your note...' }),
    ],
    content: '',
    onUpdate: ({ editor: ed }) => {
      if (isRemoteUpdateRef.current) return;
      const html = ed.getHTML();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        handleContentChangeRef.current?.(html);
      }, 500);
    },
  });

  const {
    notifications, highlightTarget, addNotification,
    handleNotificationClick,
  } = useNotifications();

  const {
    note, title, setTitle, content, setContent,
    comments, setComments, loading,
  } = useNoteData(id);

  const {
    noteUsers, typingUsers, remoteCursors,
    emitContentChange, emitTitleChange, emitCursorMove,
    emitAddComment, emitResolveComment, emitDeleteComment, emitRestore,
  } = useNoteCollaboration({
    noteId: id, user, socketRef,
    setContent, setTitle, setComments, addNotification,
  });

  useDocumentTitle(title || 'Note Editor');

  const isOwner = note?.user_id === user?.id;
  const canEdit = isOwner || note?.isCollaborator;

  const handleContentChange = useCallback(
    (newContent) => {
      setContent(newContent);
      setSaved(false);
      setSaving(true);
      emitContentChange(newContent, title);
      setTimeout(() => { setSaving(false); setSaved(true); }, 800);
    },
    [title, emitContentChange, setContent]
  );

  useEffect(() => {
    handleContentChangeRef.current = handleContentChange;
  }, [handleContentChange]);

  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      const currentHTML = editor.getHTML();
      if (currentHTML === '<p></p>' || currentHTML === '') {
        editor.commands.setContent(content, false);
      }
    }
  }, [editor, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!editor || editor.isDestroyed || content === undefined) return;
    const currentHTML = editor.getHTML();
    if (currentHTML !== content) {
      isRemoteUpdateRef.current = true;
      editor.commands.setContent(content, false);
      isRemoteUpdateRef.current = false;
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(canEdit ?? false);
    }
  }, [editor, canEdit]);

  const handleTitleChange = useCallback(
    (e) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      setSaved(false);
      emitTitleChange(newTitle, content);
      setTimeout(() => setSaved(true), 600);
    },
    [content, emitTitleChange, setTitle]
  );

  const handleRestore = useCallback(
    (restoredNote) => {
      setTitle(restoredNote.title);
      setContent(restoredNote.content);
      if (editor && !editor.isDestroyed) {
        isRemoteUpdateRef.current = true;
        editor.commands.setContent(restoredNote.content, false);
        isRemoteUpdateRef.current = false;
      }
      emitRestore(restoredNote);
    },
    [editor, emitRestore, setTitle, setContent]
  );

  const onNotificationClick = useCallback(
    (n) => {
      handleNotificationClick(n, setShowComments);
      setShowNotifications(false);
    },
    [handleNotificationClick]
  );

  const avatarSrc = user?.avatar_url
    ? user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `${API_BASE}${user.avatar_url}`
    : undefined;

  const unreadCount = notifications.length - viewedCount;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auth-bg" role="status" aria-label="Loading note">
        <ButtonSpinner size={32} className="text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-auth-bg flex flex-col">
      <header aria-label="Note editor header">
        <nav className="bg-surface-main border-b border-content-border px-4 h-header flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <IconButton icon={<ArrowLeft />} size="sm" aria-label="Back to dashboard" />
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-serif font-bold">N</span>
              </div>
              <span className="text-app-title font-serif text-content-primary hidden sm:block">
                CollabNotes
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowInvite(true)}>
              Share
            </Button>
            <Button variant={showComments ? 'primary' : 'outline'} size="sm" icon={<MessageSquare className="w-4 h-4" />} onClick={() => setShowComments((prev) => !prev)}>
              Comments
            </Button>
            <Button variant="outline" size="sm" icon={<Clock className="w-4 h-4" />} onClick={() => setShowHistory(true)}>
              History
            </Button>

            <div className="relative">
              <IconButton
                icon={<Bell />}
                size="sm"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                onClick={() => {
                  setShowNotifications((prev) => {
                    if (!prev) setViewedCount(notifications.length);
                    return !prev;
                  });
                }}
                badge={unreadCount > 0 ? unreadCount : undefined}
              />
              {showNotifications && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-surface-main border border-content-border rounded-card shadow-lg z-50 overflow-hidden" role="menu" aria-label="Notifications">
                  <div className="px-3 py-2 border-b border-content-border">
                    <span className="text-body font-semibold text-content-primary">Notifications</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-caption text-content-secondary text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          role="menuitem"
                          className="w-full text-left px-3 py-2.5 hover:bg-surface-secondary text-body text-content-primary border-b border-content-border/50 last:border-0 cursor-pointer transition-colors"
                          onClick={() => onNotificationClick(n)}
                        >
                          <span className="font-medium">{n.text}</span>
                          <span className="text-caption text-content-secondary ml-2">
                            {n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <IconButton
              icon={theme === 'dark' ? <Sun /> : <Moon />}
              size="sm"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
            />

            <OnlineUsers users={noteUsers.filter((u) => u.userId !== user?.id)} />

            <button
              onClick={() => setShowAvatarUpload(true)}
              className="rounded-full focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 cursor-pointer"
              aria-label="Update avatar"
            >
              <Avatar name={user?.name || '?'} size="sm" src={avatarSrc} statusDot />
            </button>
          </div>
        </nav>
      </header>

      <main aria-label="Note editor content" className="flex flex-1 overflow-hidden gap-5">
        <div className="flex-1 flex flex-col overflow-x-auto gap-5">
          <section aria-label="Note editor" className="flex-1 flex flex-col bg-surface-main overflow-hidden">
            {canEdit && <Toolbar editor={editor} />}
            <div className="p-5">
              <label htmlFor="note-title" className="sr-only">Note title</label>
              <input
                id="note-title"
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="w-full text-page-heading font-bold font-serif text-content-primary focus:outline-none border-none bg-transparent"
                placeholder="Note Title"
                readOnly={!canEdit}
              />
              <div className="h-px bg-content-border mt-3" />
            </div>
            <MemoizedEditor
              editor={editor}
              typingUsers={typingUsers}
              remoteCursors={remoteCursors}
              onCursorMove={emitCursorMove}
            />
          </section>

          <section aria-label="Shared notes">
            <MemoizedSharedNotes currentNoteId={id} />
          </section>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              aria-label="Comments and file sharing"
              className="w-sidebar grid bg-surface-main border-l border-content-border gap-5 overflow-hidden"
              style={{ gridTemplateRows: '2.5fr 0.7fr' }}
            >
              <div className="overflow-hidden min-h-0">
                <MemoizedCommentSidebar
                  comments={comments}
                  onAddComment={emitAddComment}
                  onResolve={emitResolveComment}
                  onDelete={emitDeleteComment}
                  currentUserId={user?.id}
                  highlightId={
                    highlightTarget?.type === 'comment' || highlightTarget?.type === 'comment-resolve'
                      ? highlightTarget.id
                      : null
                  }
                />
              </div>
              <div className="overflow-hidden min-h-0">
                <MemoizedFileSharingPanel
                  noteId={id}
                  socketRef={socketRef}
                  currentUserId={user?.id}
                  highlightId={highlightTarget?.type === 'file' ? highlightTarget.id : null}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      <footer aria-label="Editor status">
        <StatusBar usersOnline={noteUsers.length > 1 ? noteUsers.length : 0} saved={!saving && saved} />
      </footer>

      {showInvite && <InviteModal noteId={id} onClose={() => setShowInvite(false)} />}
      <VersionHistory noteId={id} isOpen={showHistory} onClose={() => setShowHistory(false)} onRestore={handleRestore} />
      {showAvatarUpload && <AvatarUploadModal onClose={() => setShowAvatarUpload(false)} />}
    </div>
  );
}
