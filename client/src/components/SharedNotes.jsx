import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../lib/api';

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, '') : '';
}

export default function SharedNotes({ currentNoteId }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchNotes = async () => {
      try {
        const res = await api.get('/notes');
        if (!cancelled) {
          setNotes(res.data.filter((n) => String(n.id) !== String(currentNoteId)));
        }
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      }
    };
    fetchNotes();
    return () => { cancelled = true; };
  }, [currentNoteId]);

  const displayNotes = useMemo(() => notes.slice(0, 5), [notes]);

  if (displayNotes.length === 0) return null;

  return (
    <div className="p-5 border-t border-content-border bg-surface-main">
      <h3 className="text-body font-semibold text-content-primary mb-2">Shared Notes</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {displayNotes.map((note) => (
          <Link
            key={note.id}
            to={`/notes/${note.id}`}
            className={cn(
              'flex-shrink-0 w-56 p-3 rounded-card border border-content-border bg-surface-main',
              'hover:shadow-md hover:border-primary/30 transition-all duration-180',
              'group'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-body font-semibold text-content-primary truncate group-hover:text-primary transition-colors">
                {note.title || 'Untitled'}
              </h4>
              <FileText className="w-4 h-4 text-content-secondary shrink-0" />
            </div>
            {note.content && (
              <p className="text-caption text-content-secondary line-clamp-2 mb-2">
                {stripHtml(note.content).slice(0, 80)}
              </p>
            )}
            {note.role && (
              <span className="text-[10px] text-content-secondary bg-surface-secondary px-1.5 py-0.5 rounded">
                {note.role === 'owner' ? 'Owner' : 'Collaborator'}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
