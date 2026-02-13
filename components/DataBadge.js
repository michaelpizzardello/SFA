export default function DataBadge({ source }) {
  const isLive = source === 'google-sheets'

  if (!isLive) {
    return null
  }

  return (
    <p className="data-badge is-live">Live from Google Sheets</p>
  )
}
