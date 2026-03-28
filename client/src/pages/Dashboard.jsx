import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import { Button } from '../components/ui/Button';
import { ButtonSpinner } from '../components/ui/Button';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const res = await api.post('/notes', { title: 'Untitled' });
      navigate(`/notes/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const myNotes = notes.filter((n) => n.role === 'owner');
  const sharedNotes = notes.filter((n) => n.role === 'collaborator');

  return (
    <div className="min-h-screen bg-auth-bg">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-page-heading font-bold font-serif text-content-primary">My Notes</h1>
            <p className="text-body text-content-secondary mt-1">Create and manage your collaborative notes</p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-5 h-5" />}
            onClick={createNote}
          >
            New Note
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <ButtonSpinner size={32} className="text-primary" />
          </div>
        ) : (
          <>
            {myNotes.length > 0 && (
              <div className="mb-10">
                <h2 className="text-caption font-semibold text-content-secondary uppercase tracking-wider mb-4">My Notes ({myNotes.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <NoteCard note={note} onDelete={deleteNote} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {sharedNotes.length > 0 && (
              <div className="mb-10">
                <h2 className="text-caption font-semibold text-content-secondary uppercase tracking-wider mb-4">Shared with me ({sharedNotes.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sharedNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (myNotes.length + index) * 0.05, duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <NoteCard note={note} onDelete={deleteNote} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {notes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 bg-primary-light rounded-card-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-task-label font-semibold font-serif text-content-primary mb-1">No notes yet</h3>
                <p className="text-body text-content-secondary mb-4">Create your first note to get started</p>
                <Button variant="primary" size="md" onClick={createNote}>
                  Create Note
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
