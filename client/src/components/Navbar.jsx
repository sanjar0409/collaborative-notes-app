import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Avatar } from './ui/Avatar';
import { IconButton } from './ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-surface-main border-b border-content-border px-6 h-header flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <Menu className="w-6 h-6 text-content-primary" />
        <span className="text-app-title font-serif text-content-primary hidden sm:block">
          CollabNotes
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <IconButton
          icon={theme === 'dark' ? <Sun /> : <Moon />}
          size="sm"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={toggleTheme}
        />
        <div className="flex items-center gap-2">
          <Avatar name={user?.name || '?'} size="sm" />
          <span className="text-body text-content-secondary hidden sm:block">{user?.name}</span>
        </div>
        <IconButton
          icon={<LogOut />}
          size="sm"
          aria-label="Logout"
          tooltip="Logout"
          onClick={handleLogout}
        />
      </div>
    </nav>
  );
}
