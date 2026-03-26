import { cn } from '../../../utils/cn'

export function ToolbarButton({
  icon,
  active,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      aria-pressed={active ?? undefined}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-btn',
        'transition-all duration-180 [&_svg]:w-4 [&_svg]:h-4',
        'min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0',
        !active && 'text-content-secondary hover:bg-primary-light hover:text-primary',
        !active && 'active:bg-primary/[0.12]',
        active && 'bg-primary-light text-primary',
        'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
