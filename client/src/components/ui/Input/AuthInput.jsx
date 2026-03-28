import { forwardRef } from 'react'
import { cn } from '../../../utils/cn'

export const AuthInput = forwardRef(
  (
    {
      label,
      error,
      rightElement,
      rightLabel,
      size = 'default',
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className={cn('w-full', className)}>
        {(label || rightLabel) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <label
                htmlFor={inputId}
                className="text-body font-medium text-content-primary"
              >
                {label}
              </label>
            )}
            {rightLabel}
          </div>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'w-full rounded-input px-4 text-body text-content-primary',
              'border-[1.5px] transition-all duration-180 ease-out',
              'placeholder:text-content-secondary',
              'bg-surface-main',
              size === 'default' ? 'h-12' : 'h-[52px]',
              !error && 'border-content-border',
              !error && 'focus:border-primary focus:shadow-focus-ring',
              error && 'border-auth-error',
              error && 'focus:border-auth-error focus:shadow-focus-ring-danger',
              'outline-none',
              'disabled:bg-surface-secondary disabled:cursor-not-allowed',
              rightElement && 'pr-12',
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>

        {error && error.trim() && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-[13px] text-auth-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'
