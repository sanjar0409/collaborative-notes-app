import { Check, X } from 'lucide-react';

export default function InvitationToast({ invitations, onAccept, onDecline }) {
  if (invitations.length === 0) return null;

  const btnBase = {
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm"
      role="region"
      aria-label="Invitations"
      aria-live="polite"
    >
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="bg-white rounded-card shadow-context border border-content-border p-4 animate-fade-in"
          role="alert"
        >
          <p className="text-body text-content-primary mb-3">
            <span className="font-semibold">{inv.inviterName}</span>
            {' '}invited you to collaborate on{' '}
            <span className="font-semibold">"{inv.noteTitle}"</span>
          </p>
          <div className="flex gap-2">
            <button
              style={{ ...btnBase, backgroundColor: 'var(--color-primary)' }}
              onClick={() => onAccept(inv)}
            >
              <Check size={14} />
              Accept
            </button>
            <button
              style={{ ...btnBase, backgroundColor: 'var(--color-danger)' }}
              onClick={() => onDecline(inv)}
            >
              <X size={14} />
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
