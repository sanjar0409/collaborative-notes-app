import { useState } from 'react'
import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

export function CollapsiblePanel({
  title,
  defaultExpanded = true,
  children,
  className,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div
      className={cn(
        'border border-content-border rounded-card shadow-lg overflow-hidden',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'text-[16px] font-semibold text-content-primary',
          'hover:bg-surface-secondary transition-colors duration-180',
        )}
        aria-expanded={expanded}
      >
        {title}
        <ChevronDown
          className={cn(
            'w-5 h-5 text-content-secondary transition-transform duration-300',
            expanded && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
