// Display-only "Artist: Title" parse (DESIGN_SPEC §4.6). Never mutates data.
// - artist present → line 1 = artist; a leading "{artist}:" / "{artist} —" prefix is
//   stripped from the title case-insensitively (kills the double-print).
// - artist empty AND title matches "Group Exhibition: X" → line 1 = "Group Exhibition"
//   (uppercased by CSS), line 2 = the remainder (EXHIBITION_ENTRY_RULES convention).
// - otherwise → no artist line; the full title stands. An unknown "X: Y" is NEVER split —
//   honesty over symmetry.
const GROUP_RE = /^group exhibition:\s*(.+)$/i

export function splitTitle(artist, title) {
  const rawArtist = String(artist || '').trim()
  const rawTitle = String(title || '').trim()

  if (rawArtist) {
    if (rawTitle.toLowerCase().startsWith(rawArtist.toLowerCase())) {
      const rest = rawTitle.slice(rawArtist.length).match(/^\s*[:—]\s*(.+)$/)
      if (rest) return { artist: rawArtist, title: rest[1] }
    }
    return { artist: rawArtist, title: rawTitle }
  }

  const group = rawTitle.match(GROUP_RE)
  if (group) return { artist: 'Group Exhibition', title: group[1] }

  return { artist: '', title: rawTitle }
}
