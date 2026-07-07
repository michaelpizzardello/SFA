'use client'

import { deleteExhibitionAction } from '@/lib/actions/exhibitions'

// Destructive: confirm before firing, and render in danger (not a neutral button).
export default function DeleteExhibitionButton({ id }) {
  return (
    <form
      action={deleteExhibitionAction}
      className="dash-delete"
      onSubmit={(e) => {
        if (!window.confirm('Delete this exhibition? This cannot be undone.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn btn--danger-text" type="submit">
        Delete exhibition
      </button>
    </form>
  )
}
