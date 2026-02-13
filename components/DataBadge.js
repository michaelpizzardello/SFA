export default function DataBadge({ source }) {
  const isLive = source === 'google-sheets'

  return (
    <p className={`data-badge ${isLive ? 'is-live' : ''}`}>
      {isLive
        ? 'Live from Google Sheets'
        : 'Sample dataset loaded. Add sheet CSV URLs in .env.local to go live.'}
    </p>
  )
}
