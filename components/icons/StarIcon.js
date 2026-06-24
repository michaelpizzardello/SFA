export default function StarIcon({ filled = false, size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.9l-5.08 2.3.98-5.68L3.75 9.5l5.7-.83z" />
    </svg>
  )
}
