import { cn } from '../../../utils/cn'

const styles = [
  { value: 'p', label: 'Normal Text' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
]

export function TextStyleDropdown({ value = 'p', onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        'h-8 px-2 text-btn-label-sm text-content-primary',
        'bg-transparent border-none outline-none cursor-pointer',
        'rounded-btn hover:bg-primary-light transition-colors duration-180',
        'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
      )}
      aria-label="Text style"
    >
      {styles.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
