import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './ui/Avatar';
import { IconButton } from './ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-content-border px-6 h-header flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <Menu className="w-6 h-6 text-content-primary" />
        <span className="text-app-title text-content-primary hidden sm:block">
          Real-time Collaborative Notes App
        </span>
      </Link>

      <div className="flex items-center gap-3">
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
