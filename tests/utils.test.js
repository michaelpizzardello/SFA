import { describe, expect, it } from 'vitest'
import { addDaysISO, compareISO, formatDateRange } from '../lib/utils/date'
import {
  dedupeExhibitions,
  getCanonicalExhibitionSlug,
  getExhibitionStatus
} from '../lib/utils/exhibitions'
import { filterExhibitions, filterGalleries } from '../lib/utils/filters'
import { addReturnContext } from '../lib/utils/navigation'
import { foldSearchText } from '../lib/utils/text'

const galleries = [
  {
    id: 'g1',
    slug: 'alpha',
    name: 'Alpha Gallery',
    precinct: 'Surry Hills',
    suburb: 'Surry Hills',
    address: '1 Test St',
    latitude: -33.88,
    longitude: 151.2
  },
  {
    id: 'g2',
    slug: 'beta',
    name: 'Beta Projects',
    precinct: 'Paddington',
    suburb: 'Paddington',
    address: '2 Test St',
    latitude: -33.89,
    longitude: 151.22
  }
]

const exhibitions = [
  {
    id: 'e1',
    gallerySlug: 'alpha',
    title: 'Current Show',
    artist: 'A',
    summary: 'Now open',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    openingDate: '2026-02-01'
  },
  {
    id: 'e2',
    gallerySlug: 'alpha',
    title: 'Upcoming Show',
    artist: 'B',
    summary: 'Next up',
    startDate: '2026-03-10',
    endDate: '2026-04-01',
    openingDate: '2026-03-10'
  },
  {
    id: 'e3',
    gallerySlug: 'beta',
    title: 'Past Show',
    artist: 'C',
    summary: 'Closed',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    openingDate: '2025-12-01'
  }
]

describe('date utilities', () => {
  it('compares ISO strings correctly', () => {
    expect(compareISO('2026-02-01', '2026-02-01')).toBe(0)
    expect(compareISO('2026-02-01', '2026-02-02')).toBe(-1)
    expect(compareISO('2026-02-03', '2026-02-02')).toBe(1)
  })

  it('adds days in ISO format', () => {
    expect(addDaysISO('2026-02-13', 7)).toBe('2026-02-20')
  })

  it('formats ranges with both dates', () => {
    expect(formatDateRange('2026-02-01', '2026-02-28')).toContain('2026')
  })
})

describe('exhibition status', () => {
  it('returns current, upcoming, and past status from explicit dates', () => {
    expect(getExhibitionStatus(exhibitions[0], '2026-02-13')).toBe('current')
    expect(getExhibitionStatus(exhibitions[1], '2026-02-13')).toBe('upcoming')
    expect(getExhibitionStatus(exhibitions[2], '2026-02-13')).toBe('past')
  })

  it('does not keep old open-ended exhibitions current forever', () => {
    expect(
      getExhibitionStatus(
        {
          id: 'open-ended',
          startDate: '2026-02-05',
          openingDate: '2026-02-05'
        },
        '2026-04-29'
      )
    ).toBe('past')
  })
})

describe('exhibition duplicate handling', () => {
  it('collapses equivalent prefixed titles and keeps the richer record', () => {
    const duplicatePair = [
      {
        id: 'legacy',
        slug: 'gallery-lily-mortensen-boundless',
        gallerySlug: 'gallery',
        artist: '',
        title: 'Lily Mortensen: Grænseløs (Boundless)',
        startDate: '2026-04-17',
        endDate: '2026-05-16'
      },
      {
        id: 'canonical',
        slug: 'gallery-boundless',
        gallerySlug: 'gallery',
        artist: 'Lily Mortensen',
        title: 'Grænseløs (Boundless)',
        startDate: '2026-04-17',
        endDate: '2026-05-16',
        imageUrl: '/boundless.webp'
      }
    ]

    expect(dedupeExhibitions(duplicatePair).map((exhibition) => exhibition.id)).toEqual([
      'canonical'
    ])
  })

  it('redirects the known Lily Mortensen legacy slug', () => {
    expect(
      getCanonicalExhibitionSlug(
        'gallery-144-formerly-outsider-lily-mortensen-gr-nsel-s-boundless'
      )
    ).toBe('gallery-144-formerly-outsider-gr-nsel-s-boundless')
  })
})

describe('gallery and exhibition filtering', () => {
  it('filters galleries by search and precinct', () => {
    expect(
      filterGalleries(galleries, {
        search: 'alpha',
        precinct: 'all',
        sort: 'alphabetical'
      }).map((gallery) => gallery.slug)
    ).toEqual(['alpha'])

    expect(
      filterGalleries(galleries, {
        search: '',
        precinct: 'Paddington',
        sort: 'alphabetical'
      }).map((gallery) => gallery.slug)
    ).toEqual(['beta'])
  })

  it('filters to current and upcoming via status multiselect', () => {
    expect(
      filterExhibitions(galleries, exhibitions, {
        search: '',
        precinct: 'all',
        statuses: ['current', 'upcoming'],
        today: '2026-02-13'
      }).map((exhibition) => exhibition.id)
    ).toEqual(['e1', 'e2'])
  })

  it('excludes past exhibitions by default', () => {
    expect(
      filterExhibitions(galleries, exhibitions, {
        search: '',
        precinct: 'all',
        today: '2026-02-13'
      }).map((exhibition) => exhibition.id)
    ).toEqual(['e1', 'e2'])
  })

  it('orders exhibitions by opening date closest to today', () => {
    const orderedExhibitions = [
      {
        id: 'old-current',
        gallerySlug: 'alpha',
        title: 'Old Current',
        startDate: '2026-04-01',
        endDate: '2026-05-30',
        openingDate: '2026-04-01'
      },
      {
        id: 'tomorrow',
        gallerySlug: 'alpha',
        title: 'Tomorrow',
        startDate: '2026-04-30',
        endDate: '2026-05-30',
        openingDate: '2026-04-30'
      },
      {
        id: 'today',
        gallerySlug: 'alpha',
        title: 'Today',
        startDate: '2026-04-29',
        endDate: '2026-05-30',
        openingDate: '2026-04-29'
      },
      {
        id: 'yesterday',
        gallerySlug: 'alpha',
        title: 'Yesterday',
        startDate: '2026-04-28',
        endDate: '2026-05-30',
        openingDate: '2026-04-28'
      }
    ]

    expect(
      filterExhibitions(galleries, orderedExhibitions, {
        search: '',
        precinct: 'all',
        today: '2026-04-29'
      }).map((exhibition) => exhibition.id)
    ).toEqual(['today', 'yesterday', 'tomorrow', 'old-current'])
  })

  it('filters by opening tonight', () => {
    expect(
      filterExhibitions(galleries, exhibitions, {
        search: '',
        precinct: 'all',
        openingWindow: 'tonight',
        today: '2026-03-10'
      }).map((exhibition) => exhibition.id)
    ).toEqual(['e2'])
  })

  it('supports multiselect status and opening filters', () => {
    expect(
      filterExhibitions(galleries, exhibitions, {
        search: '',
        precinct: 'all',
        statuses: ['upcoming'],
        openingWindows: ['week'],
        today: '2026-03-08'
      }).map((exhibition) => exhibition.id)
    ).toEqual(['e2'])
  })
})

describe('return navigation', () => {
  it('encodes a filtered return path and label', () => {
    expect(
      addReturnContext(
        '/exhibition/example',
        '/whats-on?when=opening-this-week&search=Gallery 144',
        'Opening This Week'
      )
    ).toBe(
      '/exhibition/example?returnTo=%2Fwhats-on%3Fwhen%3Dopening-this-week%26search%3DGallery+144&returnLabel=Opening+This+Week'
    )
  })

  it('leaves links unchanged without complete return context', () => {
    expect(addReturnContext('/exhibition/example', '', '')).toBe('/exhibition/example')
  })
})

describe('search text folding', () => {
  it('matches catalogue diacritics and non-decomposing letters', () => {
    expect(foldSearchText('Trésor')).toBe('tresor')
    expect(foldSearchText('Féth Fíada')).toBe('feth fiada')
    expect(foldSearchText('Grænseløs')).toBe('graenselos')
    expect(foldSearchText('Munuŋgurr')).toBe('mununggurr')
  })
})
