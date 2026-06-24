'use client'

import { useSaved } from '@/lib/utils/saved'
import StarIcon from './icons/StarIcon'

// Card save toggle. Sits as a sibling of the card Link (not inside it) so it isn't a button-in-anchor;
// stops propagation so clicking it never follows the card link.
export default function SaveButton({ kind, slug, label = '', className = 'card-save' }) {
  const { toggle, isSaved } = useSaved(kind)
  const saved = isSaved(slug)
  return (
    <button
      type="button"
      className={`${className}${saved ? ' is-saved' : ''}`}
      aria-pressed={saved}
      aria-label={`${saved ? 'Saved' : 'Save'}${label ? ` — ${label}` : ''}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(slug)
      }}
    >
      <StarIcon filled={saved} />
    </button>
  )
}
