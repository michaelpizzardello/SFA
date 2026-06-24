'use client'

import { useEffect, useRef, useState } from 'react'

// Fades an image in over its --placeholder slot. Handles cached images (which fire onLoad before
// hydration) by checking img.complete on mount.
export default function CardImage({ src, className, alt = '' }) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [])

  return (
    <img
      ref={ref}
      className={`${className}${loaded ? ' loaded' : ''}`}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
    />
  )
}
