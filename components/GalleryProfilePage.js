import Link from 'next/link'
import { formatDateRange } from '../lib/utils/date'
import { getExhibitionSlug } from '../lib/utils/exhibitions'
import { splitTitle } from '../lib/utils/splitTitle'
import CardImage from './CardImage'
import ExhibitionCard from './ExhibitionCard'
import FollowButton from './FollowButton'
import GalleryTabs from './GalleryTabs'
import ShareButton from './ShareButton'

function sanitizePhone(phoneNumber) {
  return phoneNumber.replace(/[^\d+]/g, '')
}

function instagramHandle(value) {
  const handle = value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/+$/, '')
    .replace(/^@/, '')
  return handle ? `@${handle}` : 'Instagram'
}

function ExGrid({ exhibitions, gallery }) {
  return (
    <div className="gxp-grid">
      {exhibitions.map((exhibition) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} gallery={gallery} />
      ))}
    </div>
  )
}

// Past shows are reference data — ledger rows, not cards (§5.4)
function PastRows({ exhibitions }) {
  return (
    <ul className="gxp-past">
      {exhibitions.map((exhibition) => {
        const { artist, title } = splitTitle(exhibition.artist, exhibition.title)
        return (
          <li key={exhibition.id}>
            <Link className="gxp-past-row" href={`/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`}>
              <span className="gxp-past-row__main">
                {artist ? <span className="gxp-past-row__artist">{artist}</span> : null}
                <span className="gxp-past-row__title">{title}</span>
              </span>
              <span className="gxp-past-row__dates">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function GalleryProfilePage({ gallery, groupedExhibitions }) {
  const mapsQuery = encodeURIComponent(gallery.address || gallery.name)
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
  const sub = [gallery.precinct, gallery.suburb].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ')

  const contact = [
    gallery.address && { label: 'Address', value: gallery.address },
    gallery.phone && { label: 'Phone', value: <a href={`tel:${sanitizePhone(gallery.phone)}`}>{gallery.phone}</a> },
    gallery.email && { label: 'Email', value: <a href={`mailto:${gallery.email}`}>{gallery.email}</a> },
    gallery.website && {
      label: 'Website',
      value: (
        <a href={gallery.website} target="_blank" rel="noreferrer">
          {gallery.website.replace(/^https?:\/\//, '')}
        </a>
      )
    },
    gallery.instagram && {
      label: 'Instagram',
      value: (
        <a href={gallery.instagram} target="_blank" rel="noreferrer">
          {instagramHandle(gallery.instagram)}
        </a>
      )
    }
  ].filter(Boolean)

  const cover = gallery.coverUrl
  const { current, upcoming, past } = groupedExhibitions
  const hasExhibitions = current.length || upcoming.length || past.length
  const locationLine = sub || gallery.suburb || ''
  const hasVisit = contact.length || gallery.openingHours?.length

  // Tab sub-nav (the wayfinding element Ocula + Artsy both lead with). Only sections
  // that actually have content become tabs, so a sparse gallery doesn't get a hollow bar.
  const tabs = [
    hasExhibitions && { id: 'exhibitions', label: 'Exhibitions' },
    gallery.about && { id: 'about', label: 'About' },
    hasVisit && { id: 'visit', label: 'Visit' }
  ].filter(Boolean)

  return (
    <div className="gxp">
      <div className="container">
        <Link className="gxp-back" href="/galleries">
          ← Galleries
        </Link>

        {cover ? (
          <div className="gxp-cover">
            <CardImage className="gxp-cover__img" src={cover} />
          </div>
        ) : null}

        <header className="gxp-lockup">
          <div className="gxp-lockup__id">
            <h1 className="gxp-name">{gallery.name}</h1>
            {locationLine ? <p className="gxp-loc">{locationLine}</p> : null}
          </div>
          <div className="gxp-lockup__actions">
            <FollowButton slug={gallery.slug} label={gallery.name} />
            <ShareButton title={gallery.name} className="btn btn--text" />
          </div>
        </header>

        {tabs.length >= 2 ? <GalleryTabs tabs={tabs} /> : null}

        {current.length ? (
          <section id="exhibitions" className="gxp-section">
            <header className="section-head">
              <h2>On now</h2>
            </header>
            <ExGrid exhibitions={current} gallery={gallery} />
          </section>
        ) : null}

        {upcoming.length ? (
          <section className="gxp-section" id={current.length ? undefined : 'exhibitions'}>
            <header className="section-head">
              <h2>Opening soon</h2>
            </header>
            <ExGrid exhibitions={upcoming} gallery={gallery} />
          </section>
        ) : null}

        {past.length ? (
          <section className="gxp-section" id={current.length || upcoming.length ? undefined : 'exhibitions'}>
            <header className="section-head">
              <h2>Past</h2>
            </header>
            <PastRows exhibitions={past} />
          </section>
        ) : null}

        {gallery.about ? (
          <section id="about" className="gxp-section gxp-about">
            <header className="section-head">
              <h2>About</h2>
            </header>
            <p className="u-serif">{gallery.about}</p>
          </section>
        ) : null}

        {!hasExhibitions ? (
          <section className="gxp-section">
            <p className="text-muted">No exhibitions listed yet.</p>
          </section>
        ) : null}
      </div>

      {hasVisit ? (
        <section id="visit" className="band gxp-visit">
          <div className="container">
            <header className="section-head">
              <h2>Visit</h2>
            </header>
            <div className="gxp-visit-cols">
              {gallery.openingHours?.length ? (
                <div className="gxp-hours">
                  <p className="u-eyebrow">Hours</p>
                  {gallery.openingHours.map((h) => (
                    <p key={h} className="gxp-hour">{h}</p>
                  ))}
                </div>
              ) : null}
              {contact.length ? (
                <dl className="gxp-def">
                  {contact.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            {gallery.address ? (
              <a className="btn btn--outline gxp-directions" href={directionsHref} target="_blank" rel="noreferrer">
                Get directions
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}
