import { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { Button, IconButton, ButtonSpinner } from './ui/Button';

export default function VersionHistory({ noteId, onRestore, isOpen, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchVersions();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notes/${noteId}/versions`);
      setVersions(res.data);
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (vid) => {
    if (!confirm('Restore this version? Current content will be saved as a new version.')) return;
    try {
      const res = await api.post(`/notes/${noteId}/versions/${vid}/restore`);
      onRestore(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to restore:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-end z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Version history"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-surface-main h-full w-sidebar shadow-sidebar p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-task-label font-semibold font-serif text-content-primary">Version History</h3>
          <IconButton
            icon={<X />}
            size="sm"
            aria-label="Close"
            onClick={onClose}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <ButtonSpinner size={24} className="text-primary" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-body text-content-secondary text-center py-10">No versions saved yet</p>
        ) : (
          <div className="space-y-4">
            {versions.map((v) => (
              <div key={v.id} className="border border-content-border rounded-card p-4 hover:border-primary/30 hover:shadow-md transition-all duration-180">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body font-medium text-content-primary">{v.title || 'Untitled'}</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={<RotateCcw className="w-3 h-3" />}
                    onClick={() => handleRestore(v.id)}
                  >
                    Restore
                  </Button>
                </div>
                <div className="text-caption text-content-secondary">
                  <span>By {v.saved_by_name}</span>
                  <span className="mx-1">·</span>
                  <span>{new Date(v.created_at).toLocaleString()}</span>
                </div>
                <p className="text-caption text-content-secondary mt-2 line-clamp-2">
                  {v.content?.replace(/<[^>]*>/g, '').slice(0, 100) || 'Empty'}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
