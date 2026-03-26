import { useState, useRef, useCallback } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [highlightTarget, setHighlightTarget] = useState(null);
  const highlightTimerRef = useRef(null);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        time: new Date(),
        ...notif,
      },
    ]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleNotificationClick = useCallback((notification, setShowComments) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

    if (
      notification.targetType === 'comment' ||
      notification.targetType === 'comment-resolve'
    ) {
      setShowComments(true);
      setHighlightTarget({ type: 'comment', id: notification.targetId });
    } else if (notification.targetType === 'file') {
      setShowComments(true);
      setHighlightTarget({ type: 'file', id: notification.targetId });
    }

    highlightTimerRef.current = setTimeout(() => setHighlightTarget(null), 3000);
  }, []);

  return {
    notifications,
    highlightTarget,
    addNotification,
    clearNotifications,
    handleNotificationClick,
  };
}
