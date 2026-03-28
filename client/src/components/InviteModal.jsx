import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { Button, IconButton } from './ui/Button';

export default function InviteModal({ noteId, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post(`/notes/${noteId}/collaborators`, { email });
      setEmail('');
      setSuccess('Invitation sent!');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share note"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="bg-surface-main rounded-card-lg p-6 w-full max-w-md shadow-context"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-task-label font-semibold font-serif text-content-primary">Share Note</h3>
          <IconButton
            icon={<X />}
            size="sm"
            aria-label="Close"
            onClick={onClose}
          />
        </div>

        <form onSubmit={handleInvite}>
          {error && (
            <div className="bg-danger-light/30 text-danger px-3 py-2 rounded-btn text-body mb-3">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 px-3 py-2 rounded-btn text-body mb-3">
              {success}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 border-[1.5px] border-content-border rounded-input text-body focus:outline-none focus:border-primary focus:shadow-focus-ring transition-all duration-180"
              required
            />
            <Button
              variant="primary"
              size="md"
              htmlType="submit"
              loading={loading}
            >
              Invite
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
