'use client'

import { useSaved } from '@/lib/utils/saved'
import {
  getExhibitionSlug,
  getExhibitionStatus,
  getGalleryBySlug,
  getGalleryExhibitionSummary
} from '@/lib/utils/exhibitions'
import ExhibitionCard from './ExhibitionCard'
import GalleryCard from './GalleryCard'

export default function SavedPageClient({ exhibitions, galleries }) {
  const savedEx = useSaved('exhibition')
  const savedGal = useSaved('gallery')
  const exItems = exhibitions.filter((e) => savedEx.isSaved(getExhibitionSlug(e)))
  const galItems = galleries.filter((g) => savedGal.isSaved(g.slug))
  const empty = exItems.length === 0 && galItems.length === 0

  return (
    <div className="container">
      <header className="whats-on-head">
        <p className="eyebrow">Your list</p>
        <h1>Saved</h1>
      </header>

      {empty ? (
        <p className="empty-state">
          Nothing saved yet. Tap the star on any exhibition or gallery to keep it here.
        </p>
      ) : (
        <>
          {exItems.length ? (
            <section className="section">
              <header className="section-head">
                <h2>Exhibitions</h2>
              </header>
              <div className="card-grid">
                {exItems.map((e) => (
                  <ExhibitionCard
                    key={e.id}
                    exhibition={e}
                    gallery={getGalleryBySlug(galleries, e.gallerySlug)}
                    status={getExhibitionStatus(e)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {galItems.length ? (
            <section className="section">
              <header className="section-head">
                <h2>Galleries</h2>
              </header>
              <div className="card-grid">
                {galItems.map((g) => (
                  <GalleryCard key={g.id} gallery={g} summary={getGalleryExhibitionSummary(exhibitions, g.slug)} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
