import { cn } from '../../../utils/cn'

const sizeMap = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', dot: 'w-1.5 h-1.5' },
  sm: { container: 'w-7 h-7', text: 'text-[11px]', dot: 'w-2 h-2' },
  md: { container: 'w-9 h-9', text: 'text-[13px]', dot: 'w-2.5 h-2.5' },
  lg: { container: 'w-11 h-11', text: 'text-[16px]', dot: 'w-3 h-3' },
}

export function Avatar({
  src,
  name,
  size = 'md',
  badge,
  statusDot,
  statusPulse,
  className,
}) {
  const initials = name?.charAt(0)?.toUpperCase() || '?'
  const s = sizeMap[size]

  return (
    <div className={cn('relative inline-flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'relative shrink-0 rounded-full border-2 border-white shadow-sm',
          'flex items-center justify-center overflow-hidden',
          'bg-primary-light text-primary font-semibold',
          s.container, s.text,
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}

        {statusDot && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full bg-success border-2 border-white',
              s.dot,
              statusPulse && 'animate-pulse-dot',
            )}
            aria-label="Online"
          />
        )}
      </div>

      {badge && (
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5',
            'rounded-full text-caption font-semibold text-content-primary',
          )}
          style={{ backgroundColor: badge.color }}
        >
          {badge.label}
        </span>
      )}
    </div>
  )
}
