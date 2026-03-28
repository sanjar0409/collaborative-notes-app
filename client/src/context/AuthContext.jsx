import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../lib/api';
import { disconnectSocket } from '../lib/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.data.user);
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            setUser(null);
          } else {
            console.error('Session check failed:', err.message);
            setUser(null);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const res = await api.post('/auth/google', { credential });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const githubLogin = useCallback(async (code) => {
    const res = await api.post('/auth/github', { code });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const updateAvatar = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setUser((prev) => prev ? { ...prev, avatar_url: res.data.avatar_url } : prev);
    return res.data.avatar_url;
  }, []);

  const logout = useCallback(async () => {
    disconnectSocket();
    localStorage.removeItem('token');
    try {
      await api.post('/auth/logout');
    } catch {
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, googleLogin, githubLogin, updateAvatar, logout }),
    [user, loading, login, signup, googleLogin, githubLogin, updateAvatar, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
