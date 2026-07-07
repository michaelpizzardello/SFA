'use client'

import { useRouter } from 'next/navigation'

export default function BackLinkButton({ fallbackHref, label }) {
  const router = useRouter()

  function handleClick() {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      className="back-btn"
      aria-label={label}
      onClick={handleClick}
    >
      <span aria-hidden="true">←</span>
      <span className="back-btn__label">{label}</span>
    </button>
  )
}
