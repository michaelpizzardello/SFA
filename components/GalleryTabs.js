'use client'

import { useEffect, useState } from 'react'

// Sticky section tabs (the Ocula/Artsy wayfinding strip). Anchor links that smooth-scroll,
// with the active tab tracked to whichever section is crossing the viewport's middle band.
export default function GalleryTabs({ tabs }) {
  const [active, setActive] = useState(tabs[0]?.id)

  useEffect(() => {
    const els = tabs.map((t) => document.getElementById(t.id)).filter(Boolean)
    if (!els.length) return undefined
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [tabs])

  return (
    <nav className="gallery-tabs" aria-label="Sections">
      {tabs.map((t) => (
        <a
          key={t.id}
          href={`#${t.id}`}
          className={`gallery-tabs__tab${active === t.id ? ' is-active' : ''}`}
          aria-current={active === t.id ? 'true' : undefined}
        >
          {t.label}
        </a>
      ))}
    </nav>
  )
}
