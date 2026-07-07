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

  it('leaves a plain title alone when artist is empty (never splits unknown "X: Y")', () => {
    expect(splitTitle('', 'Body Language: Ten Years')).toEqual({
      artist: '',
      title: 'Body Language: Ten Years'
    })
    expect(splitTitle(undefined, 'Quiet Rooms')).toEqual({
      artist: '',
      title: 'Quiet Rooms'
    })
  })

  it('keeps the full title when the prefix does not match the artist', () => {
    expect(splitTitle('Jane Doe', 'John Smith: Elsewhere')).toEqual({
      artist: 'Jane Doe',
      title: 'John Smith: Elsewhere'
    })
  })
})
