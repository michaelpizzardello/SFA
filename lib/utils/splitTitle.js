// Display-only "Artist: Title" parse (DESIGN_SPEC §4.6). Never mutates data.
// Encodes the EXHIBITION_ENTRY_RULES naming convention in full:
//   "Artist: Title" (solo) · "Artist One | Artist Two" (two-artist, no subtitle) ·
//   "Group Exhibition: Title" (group shows).
// - artist present → line 1 = artist; a leading "{artist}:" / "{artist} —" prefix is
//   stripped from the title case-insensitively (kills the double-print).
// - artist empty AND title matches "Group Exhibition: X" → line 1 = "Group Exhibition"
//   (uppercased by CSS), line 2 = the remainder.
// - artist empty AND title is pipe-separated names with no colon → the whole title is
//   the artist line, no subtitle (Ocula renders two-artist shows the same way).
// - artist empty AND title is "X: Y" with a name-length prefix → X is the artist,
//   Y the title (the documented solo convention; first colon wins so
//   "A: B: C" → artist A, title "B: C"). Prefixes longer than 60 chars stay untouched.
const GROUP_RE = /^group exhibition:\s*(.+)$/i
const PIPE_RE = /^[^:|]+(\s*\|\s*[^:|]+)+$/
const SOLO_RE = /^([^:]{2,60}):\s+(.+)$/

export function splitTitle(artist, title) {
  // Collapse internal whitespace (raw titles can carry embedded newlines)
  const rawArtist = String(artist || '').replace(/\s+/g, ' ').trim()
  const rawTitle = String(title || '').replace(/\s+/g, ' ').trim()

  if (rawArtist) {
    if (rawTitle.toLowerCase().startsWith(rawArtist.toLowerCase())) {
      const rest = rawTitle.slice(rawArtist.length).match(/^\s*[:—]\s*(.+)$/)
      if (rest) return { artist: rawArtist, title: rest[1] }
    }
    return { artist: rawArtist, title: rawTitle }
  }

  const group = rawTitle.match(GROUP_RE)
  if (group) return { artist: 'Group Exhibition', title: group[1] }

  if (PIPE_RE.test(rawTitle)) return { artist: rawTitle, title: '' }

  const solo = rawTitle.match(SOLO_RE)
  if (solo) return { artist: solo[1], title: solo[2] }

  return { artist: '', title: rawTitle }
}
