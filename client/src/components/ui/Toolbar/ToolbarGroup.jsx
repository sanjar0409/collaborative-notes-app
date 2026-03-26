import { cn } from '../../../utils/cn'

export function ToolbarGroup({ children, noDivider }) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 px-1.5',
        !noDivider && 'border-r border-content-border',
      )}
      role="group"
    >
      {children}
    </div>
  )
}
