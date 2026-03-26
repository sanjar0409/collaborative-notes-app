const COLORS = [
  '#E91E63',
  '#9C27B0',
  '#2196F3',
  '#009688',
  '#FF9800',
  '#795548',
  '#607D8B',
  '#4CAF50',
]

export function getCursorColor(userId) {
  return COLORS[userId % COLORS.length]
}

export function getCursorColorRgba(userId, opacity = 0.3) {
  const hex = getCursorColor(userId)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
