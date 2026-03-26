import { cn } from '../../../utils/cn'
import { Avatar } from './Avatar'

export function AvatarStack({
  users,
  max = 3,
  size = 'sm',
  className,
}) {
  const visible = users.slice(0, max)
  const overflow = users.length - max

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex -space-x-2">
        {visible.map((user, i) => (
          <Avatar
            key={user.name + i}
            src={user.src}
            name={user.name}
            size={size}
            className="ring-2 ring-white"
          />
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-1.5 text-caption text-content-secondary font-medium">
          +{overflow}
        </span>
      )}
    </div>
  )
}
