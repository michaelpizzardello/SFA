'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'

// Modal contract for overlay sheets: focus move-in, focus trap, Escape to close,
// body scroll lock, and focus restore to the trigger on close.
export function useDialog(open, onClose) {
  const ref = useRef(null)
  const restoreRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    restoreRef.current = document.activeElement
    document.body.style.overflow = 'hidden'

    const node = ref.current
    const list = () => (node ? Array.from(node.querySelectorAll(FOCUSABLE)) : [])
    const first = list()[0]
    if (first) first.focus()

    function onKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === 'Tab') {
        const items = list()
        if (!items.length) return
        const a = items[0]
        const z = items[items.length - 1]
        if (event.shiftKey && document.activeElement === a) {
          event.preventDefault()
          z.focus()
        } else if (!event.shiftKey && document.activeElement === z) {
          event.preventDefault()
          a.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      const restore = restoreRef.current
      if (restore && typeof restore.focus === 'function') restore.focus()
    }
  }, [open, onClose])

  return ref
}
