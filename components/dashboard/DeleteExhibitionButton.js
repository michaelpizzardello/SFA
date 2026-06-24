'use client'

import { deleteExhibitionAction } from '@/lib/actions/exhibitions'

// Destructive: confirm before firing, and render in danger (not a neutral button).
export default function DeleteExhibitionButton({ id }) {
  return (
    <form
      action={deleteExhibitionAction}
      className="dashboard-delete"
      onSubmit={(e) => {
        if (!window.confirm('Delete this exhibition? This cannot be undone.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-link-button text-link-danger" type="submit">
        Delete exhibition
      </button>
    </form>
  )
}
