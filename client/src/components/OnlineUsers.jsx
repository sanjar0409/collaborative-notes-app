import { AvatarStack } from './ui/Avatar';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function OnlineUsers({ users }) {
  if (!users || users.length === 0) return null;

  const avatarUsers = users.map((u) => ({
    name: u.name,
    src: u.avatar_url
      ? u.avatar_url.startsWith('http') ? u.avatar_url : `${API_BASE}${u.avatar_url}`
      : undefined,
  }));

  return <AvatarStack users={avatarUsers} max={5} size="sm" />;
}
