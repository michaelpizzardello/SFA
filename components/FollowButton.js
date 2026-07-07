'use client'

import { useSaved } from '@/lib/utils/saved'

// Follow a gallery = the saved('gallery') list (the same list the card star writes), so following
// here and starring on the directory stay in sync. localStorage, no login.
export default function FollowButton({ slug, label = '' }) {
  const { toggle, isSaved } = useSaved('gallery')
  const following = isSaved(slug)
  return (
    <button
      type="button"
      className={`btn ${following ? 'btn--primary' : 'btn--outline'}`}
      aria-pressed={following}
      aria-label={`${following ? 'Following' : 'Follow'} ${label}`.trim()}
      onClick={() => toggle(slug)}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
