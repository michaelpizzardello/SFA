import { describe, expect, it } from 'vitest'
import { splitTitle } from '../lib/utils/splitTitle'

describe('splitTitle', () => {
  it('strips a leading "{artist}:" / "{artist} —" prefix from the title', () => {
    expect(splitTitle('Jane Doe', 'Jane Doe: New Works')).toEqual({
      artist: 'Jane Doe',
      title: 'New Works'
    })
    expect(splitTitle('Jane Doe', 'Jane Doe — New Works')).toEqual({
      artist: 'Jane Doe',
      title: 'New Works'
    })
    // case-insensitive prefix match
    expect(splitTitle('Jane Doe', 'JANE DOE: New Works')).toEqual({
      artist: 'Jane Doe',
      title: 'New Works'
    })
  })

  it('parses "Group Exhibition: X" when artist is empty', () => {
    expect(splitTitle('', 'Group Exhibition: Winter Salon')).toEqual({
      artist: 'Group Exhibition',
      title: 'Winter Salon'
    })
  })

  it('parses the solo "Artist: Title" convention when artist is empty (first colon wins)', () => {
    expect(splitTitle('', 'Billy Bain: By the River')).toEqual({
      artist: 'Billy Bain',
      title: 'By the River'
    })
    expect(splitTitle('', 'Edward Woodley: Onsite Group Exhibition: Beyond Nature')).toEqual({
      artist: 'Edward Woodley',
      title: 'Onsite Group Exhibition: Beyond Nature'
    })
  })

  it('treats a pipe-separated title with no colon as a two-artist line without subtitle', () => {
    expect(splitTitle('', 'Brett McMahon | Anton Forde')).toEqual({
      artist: 'Brett McMahon | Anton Forde',
      title: ''
    })
    expect(splitTitle('', 'Jordan Gogos | Kalisolaite ʻUhila | Tina Stefanou')).toEqual({
      artist: 'Jordan Gogos | Kalisolaite ʻUhila | Tina Stefanou',
      title: ''
    })
  })

  it('leaves titles without the documented separators alone', () => {
    expect(splitTitle('', 'Quiet Rooms')).toEqual({ artist: '', title: 'Quiet Rooms' })
    expect(splitTitle('', 'ILLUMINATE / Studio ARTES')).toEqual({
      artist: '',
      title: 'ILLUMINATE / Studio ARTES'
    })
    expect(splitTitle(undefined, 'Archibald, Wynne and Sulman Prizes 2026')).toEqual({
      artist: '',
      title: 'Archibald, Wynne and Sulman Prizes 2026'
    })
  })

  it('normalizes embedded newlines before parsing', () => {
    expect(splitTitle('', 'Edward Woodley: Onsite\nGroup Exhibition: Beyond Nature')).toEqual({
      artist: 'Edward Woodley',
      title: 'Onsite Group Exhibition: Beyond Nature'
    })
  })

  it('keeps the full title when the prefix does not match the artist', () => {
    expect(splitTitle('Jane Doe', 'John Smith: Elsewhere')).toEqual({
      artist: 'Jane Doe',
      title: 'John Smith: Elsewhere'
    })
  })
})
