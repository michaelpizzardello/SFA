'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getWindowLabel, isTimeWindow } from '../lib/utils/windows'

// The exhibition leaf is a thin action stub: its back-link returns the user to the WINDOW they
// came from (← This Weekend), else UP to the parent gallery — never dead-ending on a sparse record.
export default function ExhibitionBackLink({ galleryName, galleryHref }) {
  const fallbackLabel = galleryName || "What's On"
  const fallbackHref = galleryHref || '/whats-on'
  const [label, setLabel] = useState(fallbackLabel)
  const [href, setHref] = useState(fallbackHref)

  useEffect(() => {
    try {
      const ref = document.referrer
      if (!ref) return
      const url = new URL(ref)
      if (url.origin !== window.location.origin) return

      if (url.pathname === '/whats-on') {
        const when = url.searchParams.get('when')
        setLabel(isTimeWindow(when) ? getWindowLabel(when) : "What's On")
        setHref(`${url.pathname}${url.search}`)
      } else if (url.pathname === '/map') {
        setLabel('Map')
        setHref(`${url.pathname}${url.search}`)
      } else if (url.pathname.startsWith('/gallery/') || url.pathname === '/galleries') {
        // came from a gallery context — keep the UP-to-gallery fallback
      }
    } catch {
      /* referrer unavailable — keep the fallback */
    }
  }, [])

  return (
    <Link className="back-link" href={href}>
      ← {label}
    </Link>
  )
}
