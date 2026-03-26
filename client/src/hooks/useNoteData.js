import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export function useNoteData(noteId) {
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [noteRes, collabRes, commentsRes] = await Promise.all([
          api.get(`/notes/${noteId}`),
          api.get(`/notes/${noteId}/collaborators`),
          api.get(`/notes/${noteId}/comments`),
        ]);

        if (cancelled) return;

        setNote(noteRes.data);
        setTitle(noteRes.data.title);
        setContent(noteRes.data.content);
        setCollaborators(collabRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch note:', err);
          navigate('/');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [noteId, navigate]);

  return {
    note,
    title,
    setTitle,
    content,
    setContent,
    collaborators,
    comments,
    setComments,
    loading,
  };
}
