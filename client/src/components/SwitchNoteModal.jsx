import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';

export default function SwitchNoteModal({ noteTitle, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Switch note confirmation"
    >
      <div
        className="bg-surface-main rounded-card-lg p-6 w-full max-w-sm shadow-context"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-task-label font-semibold text-content-primary mb-3">
          Switch Note
        </h3>
        <p className="text-body text-content-secondary mb-5">
          Do you want to switch to <span className="font-semibold">"{noteTitle}"</span>?
        </p>
        <div className="flex justify-end gap-2">
          <Button ref={cancelRef} variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm}>
            Yes, switch
          </Button>
        </div>
      </div>
    </div>
  );
}
