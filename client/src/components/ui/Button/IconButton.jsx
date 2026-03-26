import { forwardRef } from 'react'
import { cn } from '../../../utils/cn'

const sizeMap = {
  xs: 'w-7 h-7 [&_svg]:w-3.5 [&_svg]:h-3.5',
  sm: 'w-8 h-8 [&_svg]:w-4 [&_svg]:h-4',
  md: 'w-9 h-9 [&_svg]:w-[18px] [&_svg]:h-[18px]',
  lg: 'w-10 h-10 [&_svg]:w-5 [&_svg]:h-5',
}

export const IconButton = forwardRef(
  (
    {
      icon,
      size = 'md',
      active = false,
      badge,
      tooltip,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-pressed={active || undefined}
        title={tooltip}
        className={cn(
          'relative inline-flex items-center justify-center',
          'rounded-btn transition-all duration-180 ease-out',
          'select-none',
          sizeMap[size],
          'min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0',
          !active && 'text-content-secondary',
          !active && 'hover:bg-primary-light hover:text-primary',
          !active && 'active:bg-primary/[0.12]',
          active && 'bg-primary-light text-primary',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'disabled:text-content-border-muted disabled:cursor-not-allowed',
          'disabled:hover:bg-transparent',
          className,
        )}
        {...props}
      >
        {icon}

        {badge && (
          <span
            className={cn(
              'absolute top-1 right-1 rounded-full bg-danger',
              typeof badge === 'number'
                ? 'min-w-4 h-4 px-1 text-[10px] font-bold text-white flex items-center justify-center'
                : 'w-2 h-2',
            )}
            aria-hidden="true"
          >
            {typeof badge === 'number' ? badge : null}
          </span>
        )}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
