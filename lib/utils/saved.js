'use client'

import { useCallback, useEffect, useState } from 'react'

// Anonymous saved/favourites, stored in localStorage (no login). Two lists: exhibitions + galleries,
// each an array of slugs. A custom 'saf:saved' event keeps every mounted card in sync within the tab;
// the native 'storage' event syncs across tabs.
const KEYS = { exhibition: 'saf:saved:exhibitions', gallery: 'saf:saved:galleries' }

function read(key) {
  if (typeof window === 'undefined') return []
  try {
    const v = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function useSaved(kind) {
  const key = KEYS[kind] || KEYS.exhibition
  const [items, setItems] = useState([])

  useEffect(() => {
    const sync = () => setItems(read(key))
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('saf:saved', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('saf:saved', sync)
    }
  }, [key])

  const toggle = useCallback(
    (slug) => {
      const cur = read(key)
      const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]
      window.localStorage.setItem(key, JSON.stringify(next))
      window.dispatchEvent(new Event('saf:saved'))
      setItems(next)
    },
    [key]
  )

  return { items, toggle, isSaved: (slug) => items.includes(slug) }
}
