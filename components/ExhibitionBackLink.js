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
      const currentUrl = new URL(window.location.href)
      const requestedHref = currentUrl.searchParams.get('returnTo')
      const requestedLabel = currentUrl.searchParams.get('returnLabel')
      if (requestedHref && requestedLabel && requestedHref.startsWith('/') && !requestedHref.startsWith('//')) {
        const target = new URL(requestedHref, window.location.origin)
        const allowedPath =
          target.pathname === '/whats-on' ||
          target.pathname === '/map' ||
          target.pathname === '/galleries' ||
          target.pathname === '/saved' ||
          target.pathname.startsWith('/gallery/')
        if (target.origin === window.location.origin && allowedPath) {
          setLabel(requestedLabel.slice(0, 60))
          setHref(`${target.pathname}${target.search}${target.hash}`)
          return
        }
      }

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
    <Link className="exl-back" href={href}>
      ← {label}
    </Link>
  )
}
