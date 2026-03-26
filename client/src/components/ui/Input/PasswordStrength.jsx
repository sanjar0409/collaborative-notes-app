import { useMemo } from 'react'
import { cn } from '../../../utils/cn'
import { Check, X } from 'lucide-react'

const requirements = [
  { label: '8+ characters', test: (pw) => pw.length >= 8 },
  { label: 'Uppercase & lowercase', test: (pw) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  { label: 'Number or symbol', test: (pw) => /[\d\W_]/.test(pw) },
]

const strengthColors = [
  'bg-red-500',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-success',
]

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']
const strengthTextColors = [
  'text-red-500',
  'text-orange-400',
  'text-yellow-500',
  'text-success',
]

export function PasswordStrength({ password, className }) {
  const metCount = useMemo(
    () => requirements.filter((r) => r.test(password)).length,
    [password],
  )

  if (!password) return null

  const strengthIndex = Math.max(0, metCount - 1)

  return (
    <div className={cn('mt-2', className)}>
      <div className="flex items-center gap-1">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                i <= strengthIndex
                  ? strengthColors[strengthIndex]
                  : 'bg-content-border',
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            'ml-2 text-[13px] font-medium',
            strengthTextColors[strengthIndex],
          )}
        >
          {strengthLabels[strengthIndex]}
        </span>
      </div>

      <ul className="mt-2 space-y-1">
        {requirements.map((req) => {
          const met = req.test(password)
          return (
            <li key={req.label} className="flex items-center gap-1.5 text-[13px]">
              {met ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <X className="w-3.5 h-3.5 text-auth-error" />
              )}
              <span className={met ? 'text-content-secondary' : 'text-content-primary'}>
                {req.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
