'use client'

import { useState } from 'react'

// Native share with a copy-link fallback. Small client atom used on detail pages.
export default function ShareButton({ title, className = 'btn btn--ghost' }) {
  const [copied, setCopied] = useState(false)

  function share() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title, url }).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        },
        () => {}
      )
    }
  }

  return (
    <button type="button" className={className} onClick={share}>
      {copied ? 'Link copied' : 'Share'}
    </button>
  )
}
