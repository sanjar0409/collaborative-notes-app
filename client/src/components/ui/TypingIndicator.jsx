export function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-1 py-2">
      <span className="text-body italic text-content-secondary">
        {name} typing
      </span>
      <span className="inline-flex gap-0.5 ml-0.5">
        {[0, 0.2, 0.4].map((delay) => (
          <span
            key={delay}
            className="w-1 h-1 rounded-full bg-content-secondary"
            style={{ animation: `typing-dots 1.4s ease-in-out ${delay}s infinite` }}
          />
        ))}
      </span>
    </div>
  )
}
