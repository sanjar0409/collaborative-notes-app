import { cn } from '../../utils/cn'

export function StatusBar({
  usersOnline = 0,
  saved = true,
  className,
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4',
        'h-statusbar bg-surface-secondary border-t border-content-border',
        className,
      )}
    >
      {usersOnline > 0 && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse-dot" />
          <span className="text-caption text-content-primary">
            Editing with others
          </span>
        </div>
      )}

      <span className="text-caption text-content-secondary ml-auto">
        {saved ? 'All changes saved' : 'Saving...'}
      </span>
    </div>
  )
}
