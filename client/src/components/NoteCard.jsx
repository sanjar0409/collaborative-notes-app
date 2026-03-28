import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function NoteCard({ note, onDelete }) {
  const isOwner = note.role === 'owner';

  const plainText = useMemo(
    () => (note.content ? note.content.replace(/<[^>]*>/g, '').slice(0, 100) : 'Empty note'),
    [note.content]
  );

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/notes/${note.id}`}
        className="block bg-surface-main rounded-card border border-content-border p-5 shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-180 group"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold font-serif text-content-primary group-hover:text-primary transition truncate pr-2">
            {note.title || 'Untitled'}
          </h3>
          {isOwner && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Delete this note?')) onDelete(note.id);
              }}
              className="text-content-disabled hover:text-danger transition shrink-0"
              aria-label={`Delete ${note.title || 'Untitled'}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-body text-content-secondary line-clamp-2 mb-3 min-h-[2.5rem]">
          {plainText}
        </p>

        <div className="flex items-center justify-between">
          <span
            className={`text-btn-label-xs px-2.5 py-0.5 rounded-full font-medium ${
              isOwner ? 'bg-primary-light text-primary' : 'bg-highlight-green text-success'
            }`}
          >
            {isOwner ? 'Owner' : 'Shared'}
          </span>
          <span className="text-caption text-content-secondary">
            {new Date(note.updated_at).toLocaleDateString()}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
