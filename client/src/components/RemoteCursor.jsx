import { cn } from '../utils/cn'

export function RemoteCursor({ name, color, top, left }) {
  return (
    <div
      className="absolute pointer-events-none z-10 transition-all duration-150"
      style={{ top, left }}
      aria-label={`${name}'s cursor`}
      aria-hidden="true"
    >
      <div
        className="w-0.5 h-5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div
        className={cn(
          'absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap',
          'shadow-sm'
        )}
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}
