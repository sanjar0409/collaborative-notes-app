import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../lib/api';
import InvitationToast from '../components/InvitationToast';
import SwitchNoteModal from '../components/SwitchNoteModal';

const InvitationContext = createContext(null);

export function InvitationProvider({ children }) {
  const { user } = useAuth();
  const { socketRef, connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [invitations, setInvitations] = useState([]);
  const [switchModal, setSwitchModal] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchPending = async () => {
      try {
        const res = await api.get('/notes/invitations/pending');
        setInvitations(res.data);
      } catch (err) {
        console.error('Failed to fetch pending invitations:', err);
      }
    };

    fetchPending();
  }, [user]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !connected) return;

    const handleInvitation = (invitation) => {
      setInvitations((prev) => {
        if (prev.some((inv) => inv.id === invitation.id)) return prev;
        return [...prev, invitation];
      });
    };

    socket.on('invitation-received', handleInvitation);
    return () => {
      socket.off('invitation-received', handleInvitation);
    };
  }, [socketRef, connected]);

  const acceptInvitation = useCallback(async (invitation) => {
    try {
      await api.post(`/notes/invitations/${invitation.id}/accept`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));

      const currentNoteMatch = location.pathname.match(/^\/notes\/(\d+)/);
      const currentNoteId = currentNoteMatch ? parseInt(currentNoteMatch[1]) : null;

      if (!currentNoteId) {
        navigate(`/notes/${invitation.noteId}`);
      } else if (currentNoteId === invitation.noteId) {
      } else {
        setSwitchModal({ noteId: invitation.noteId, noteTitle: invitation.noteTitle });
      }
    } catch (err) {
      console.error('Failed to accept invitation:', err);
    }
  }, [location.pathname, navigate]);

  const declineInvitation = useCallback(async (invitation) => {
    try {
      await api.post(`/notes/invitations/${invitation.id}/decline`);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
    } catch (err) {
      console.error('Failed to decline invitation:', err);
    }
  }, []);

  const handleSwitchConfirm = useCallback(() => {
    if (switchModal) {
      navigate(`/notes/${switchModal.noteId}`);
      setSwitchModal(null);
    }
  }, [switchModal, navigate]);

  const handleSwitchCancel = useCallback(() => {
    setSwitchModal(null);
  }, []);

  return (
    <InvitationContext.Provider value={{ invitations }}>
      {children}
      <InvitationToast
        invitations={invitations}
        onAccept={acceptInvitation}
        onDecline={declineInvitation}
      />
      {switchModal && (
        <SwitchNoteModal
          noteTitle={switchModal.noteTitle}
          onConfirm={handleSwitchConfirm}
          onCancel={handleSwitchCancel}
        />
      )}
    </InvitationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInvitations() {
  return useContext(InvitationContext);
}
