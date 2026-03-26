import { cn } from '../../../utils/cn'

export function ColorPicker({ colors, onSelect }) {
  return (
    <div className="flex items-center gap-0.5">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onSelect?.(color.value)}
          title={color.name}
          aria-label={`Highlight ${color.name}`}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-btn',
            'transition-all duration-180',
            'hover:scale-110 hover:shadow-sm',
            'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
            'min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0',
          )}
        >
          <span
            className="w-4 h-4 rounded-sm border border-content-border"
            style={{ backgroundColor: color.value }}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  )
}
