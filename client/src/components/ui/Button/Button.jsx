import { forwardRef } from 'react'
import { cn } from '../../../utils/cn'
import { ButtonSpinner } from './ButtonSpinner'

const variantStyles = {
  primary: cn(
    'bg-primary text-[#fff] shadow-md',
    'hover:bg-primary-hover hover:shadow-primary-glow hover:-translate-y-px',
    'active:bg-primary-pressed active:shadow-none active:translate-y-0 active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
    'disabled:bg-content-disabled disabled:text-content-border disabled:shadow-none',
    'disabled:cursor-not-allowed disabled:hover:translate-y-0',
  ),
  gradient: cn(
    'btn-gradient text-white shadow-primary-glow',
    'hover:shadow-primary-glow-hover hover:-translate-y-px',
    'active:shadow-none active:translate-y-0 active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
    'disabled:bg-content-disabled disabled:text-content-border disabled:shadow-none',
    'disabled:cursor-not-allowed disabled:hover:translate-y-0',
  ),
  outline: cn(
    'bg-transparent text-primary border-[1.5px] border-primary',
    'hover:bg-primary-light',
    'active:bg-primary/[0.12]',
    'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
    'disabled:border-content-border-muted disabled:text-content-disabled',
    'disabled:cursor-not-allowed',
  ),
  ghost: cn(
    'bg-transparent text-primary',
    'hover:bg-primary-light',
    'active:bg-primary/[0.08]',
    'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
    'disabled:text-content-disabled disabled:cursor-not-allowed',
  ),
  secondary: cn(
    'bg-gray-200 text-content-primary shadow-sm border-[1.5px] border-content-border',
    'hover:bg-gray-300 hover:border-content-border-muted',
    'active:bg-gray-400',
    'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
    'disabled:text-content-disabled disabled:cursor-not-allowed',
  ),
  danger: cn(
    'bg-danger text-white shadow-md',
    'hover:bg-danger-hover hover:shadow-danger-glow hover:-translate-y-px',
    'active:bg-danger-pressed active:shadow-none active:translate-y-0 active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2',
    'disabled:bg-danger-light disabled:text-red-50 disabled:shadow-none',
    'disabled:cursor-not-allowed disabled:hover:translate-y-0',
  ),
}

const sizeStyles = {
  xs: 'h-7 min-w-7 px-1.5 text-btn-label-xs rounded-btn-sm gap-1.5',
  sm: 'h-8 min-w-16 px-2.5 text-btn-label-sm rounded-btn gap-2',
  md: 'h-10 min-w-20 px-4 text-btn-label rounded-btn-md gap-2.5',
  lg: 'h-12 min-w-[120px] px-5 text-btn-label rounded-btn-lg gap-2.5',
  xl: 'h-[52px] min-w-[120px] px-5 text-[15px] font-semibold rounded-btn-lg gap-2.5',
}

const spinnerSizes = { xs: 12, sm: 14, md: 16, lg: 16, xl: 18 }

export const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      htmlType = 'button',
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={htmlType}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold cursor-pointer',
          'transition-all duration-180 ease-out',
          'select-none whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          loading && 'pointer-events-none',
          className,
        )}
        {...props}
      >
        {loading ? (
          <ButtonSpinner
            size={spinnerSizes[size]}
            className={
              variant === 'outline' || variant === 'ghost' || variant === 'secondary'
                ? 'text-primary'
                : 'text-white'
            }
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="shrink-0" aria-hidden="true">{icon}</span>
            )}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && (
              <span className="shrink-0" aria-hidden="true">{icon}</span>
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
