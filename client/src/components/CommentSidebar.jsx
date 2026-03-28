import { useState, useRef } from 'react';
import { Send, Check, Reply, MessageSquare, ChevronDown } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { IconButton } from './ui/Button';
import { relativeTime } from '../utils/relativeTime';
import { getCursorColorRgba } from '../utils/cursorColors';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CommentSidebar({ comments, onAddComment, onResolve, onDelete, currentUserId, highlightId }) {
  const [newComment, setNewComment] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReply = (userName) => {
    setNewComment(`@${userName} `);
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const getAvatarSrc = (comment) => {
    if (!comment.user_avatar_url) return undefined;
    if (comment.user_avatar_url.startsWith('http')) return comment.user_avatar_url;
    return `${API_BASE}${comment.user_avatar_url}`;
  };

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-content-border">
        <MessageSquare className="w-4 h-4 text-content-secondary" />
        <h3 className="font-semibold font-serif text-content-primary">Comments</h3>
        <ChevronDown className="w-4 h-4 text-content-secondary ml-auto" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            data-comment-id={comment.id}
            className={`rounded-card border border-content-border p-4 shadow-sm transition-all duration-180 hover:shadow-md ${comment.resolved ? 'opacity-50' : ''} ${highlightId === comment.id ? 'animate-highlight-flash' : ''}`}
            style={{ backgroundColor: getCursorColorRgba(comment.user_id) }}
            ref={highlightId === comment.id ? (el) => el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) : undefined}
          >
            <div className="flex items-center gap-2">
              <Avatar
                name={comment.user_name || '?'}
                size="sm"
                src={getAvatarSrc(comment)}
              />
              <div className="flex-1 min-w-0">
                <span className="text-body font-bold text-content-primary">{comment.user_name}</span>
                <span className="text-caption text-content-secondary ml-2">
                  - {relativeTime(comment.created_at)}
                </span>
              </div>
            </div>
            <p className="text-body text-content-primary mt-2">{comment.content}</p>
            <div className="flex gap-2 mt-3">
              <Button
                variant="secondary"
                size="xs"
                icon={<Reply className="w-3 h-3" />}
                onClick={() => handleReply(comment.user_name)}
              >
                Reply
              </Button>
              <Button
                variant={comment.resolved ? 'primary' : 'outline'}
                size="xs"
                icon={<Check className="w-3 h-3" />}
                onClick={() => onResolve(comment.id)}
              >
                {comment.resolved ? 'Unresolve' : 'Resolve'}
              </Button>
              {comment.user_id === currentUserId && (
                <Button variant="ghost" size="xs" className="text-danger" onClick={() => onDelete(comment.id)}>
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-body text-content-secondary text-center py-8">No comments yet</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-content-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border-[1.5px] border-content-border rounded-input text-body focus:outline-none focus:border-primary focus:shadow-focus-ring transition-all duration-180"
          />
          <IconButton
            icon={<Send />}
            size="sm"
            aria-label="Send comment"
            onClick={handleSubmit}
          />
        </div>
      </form>
    </div>
  );
}
