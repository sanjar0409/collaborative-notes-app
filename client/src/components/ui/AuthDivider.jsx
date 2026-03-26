import { cn } from '../../utils/cn'

export function AuthDivider({ className }) {
  return (
    <div className={cn('flex items-center gap-4 my-6', className)}>
      <div className="flex-1 h-px bg-auth-divider" />
      <span className="text-[13px] text-content-secondary select-none">or</span>
      <div className="flex-1 h-px bg-auth-divider" />
    </div>
  )
}
