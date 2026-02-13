import './style.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { loadSiteData } from './data/loadData'
import {
  addDaysISO,
  compareISO,
  formatDate,
  formatDateRange,
  isWithinRange,
  todayISOInSydney
} from './utils/date'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const appElement = document.querySelector('#app')

const state = {
  galleries: [],
  exhibitions: [],
  dataSource: 'sample',
  galleryFilters: {
    search: '',
    precinct: 'all',
    sort: 'alphabetical',
    mapEnabled: true
  },
  whatsOnFilters: {
    search: '',
    status: 'current-upcoming',
    openingWindow: 'all',
    precinct: 'all',
    selectedGalleries: new Set()
  }
}

const galleryMapState = {
  map: null,
  markers: null
}

const statusLabels = {
  current: 'Current',
  upcoming: 'Upcoming',
  past: 'Past'
}

init()

async function init() {
  renderLoadingShell()

  const data = await loadSiteData()
  state.galleries = data.galleries
  state.exhibitions = data.exhibitions
  state.dataSource = data.source

  if (!window.location.hash) {
    window.location.hash = '#/'
  }

  window.addEventListener('hashchange', renderRoute)
  renderRoute()
}

function renderLoadingShell() {
  appElement.innerHTML = `
    <div class="background-glow" aria-hidden="true"></div>
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="#/">Sydney Art Finder</a>
      </header>
      <main class="site-main">
        <section class="panel loading-state">
          <p>Loading Sydney Art Finder...</p>
        </section>
      </main>
    </div>
  `
}

function getRoute() {
  const path = (window.location.hash || '#/').slice(1)
  const segments = path.split('/').filter(Boolean)

  if (!segments.length) {
    return { name: 'home' }
  }

  if (segments[0] === 'galleries') {
    return { name: 'galleries' }
  }

  if (segments[0] === 'whats-on') {
    return { name: 'whats-on' }
  }

  if (segments[0] === 'gallery' && segments[1]) {
    return { name: 'gallery-profile', slug: decodeURIComponent(segments[1]) }
  }

  return { name: 'not-found' }
}

function renderRoute() {
  const route = getRoute()

  if (route.name !== 'galleries') {
    destroyGalleryMap()
  }

  renderShell(route.name)

  const viewElement = document.querySelector('#view')

  if (route.name === 'home') {
    renderHomePage(viewElement)
    return
  }

  if (route.name === 'galleries') {
    renderGalleriesPage(viewElement)
    return
  }

  if (route.name === 'whats-on') {
    renderWhatsOnPage(viewElement)
    return
  }

  if (route.name === 'gallery-profile') {
    renderGalleryProfilePage(viewElement, route.slug)
    return
  }

  renderNotFoundPage(viewElement)
}

function renderShell(activeRoute) {
  const usingLiveData = state.dataSource === 'google-sheets'

  appElement.innerHTML = `
    <div class="background-glow" aria-hidden="true"></div>
    <div class="site-shell">
      <header class="site-header">
        <div>
          <a class="brand" href="#/">Sydney Art Finder</a>
          <p class="tagline">Your guide to the Sydney art scene</p>
        </div>
        <nav class="main-nav" aria-label="Main navigation">
          ${renderNavLink('#/', 'Home', activeRoute === 'home')}
          ${renderNavLink('#/galleries', 'Galleries', activeRoute === 'galleries' || activeRoute === 'gallery-profile')}
          ${renderNavLink('#/whats-on', "What's On", activeRoute === 'whats-on')}
        </nav>
      </header>

      <div class="data-badge ${usingLiveData ? 'data-badge-live' : ''}">
        ${usingLiveData ? 'Live from Google Sheets' : 'Sample dataset loaded. Add sheet CSV URLs in .env to go live.'}
      </div>

      <main class="site-main" id="view"></main>

      <nav class="mobile-nav" aria-label="Mobile navigation">
        ${renderNavLink('#/', 'Home', activeRoute === 'home')}
        ${renderNavLink('#/galleries', 'Galleries', activeRoute === 'galleries' || activeRoute === 'gallery-profile')}
        ${renderNavLink('#/whats-on', "What's On", activeRoute === 'whats-on')}
      </nav>
    </div>
  `
}

function renderNavLink(href, label, isActive) {
  return `<a href="${href}" class="nav-link ${isActive ? 'is-active' : ''}">${label}</a>`
}

function renderHomePage(viewElement) {
  const today = todayISOInSydney()
  const weekEnd = addDaysISO(today, 7)
  const galleryCount = state.galleries.length
  const exhibitionCount = state.exhibitions.length
  const currentCount = state.exhibitions.filter(
    (exhibition) => getExhibitionStatus(exhibition, today) === 'current'
  ).length
  const upcomingCount = state.exhibitions.filter(
    (exhibition) => getExhibitionStatus(exhibition, today) === 'upcoming'
  ).length

  const tonightOpenings = state.exhibitions
    .filter((exhibition) => exhibition.openingDate && compareISO(exhibition.openingDate, today) === 0)
    .slice(0, 4)

  const weekOpenings = state.exhibitions
    .filter(
      (exhibition) =>
        exhibition.openingDate &&
        compareISO(exhibition.openingDate, today) >= 0 &&
        compareISO(exhibition.openingDate, weekEnd) <= 0
    )
    .sort((first, second) => compareISO(first.openingDate, second.openingDate))
    .slice(0, 6)

  viewElement.innerHTML = `
    <section class="hero panel">
      <p class="eyebrow">Sydney Art Finder</p>
      <h1>Your guide to the Sydney art scene</h1>
      <p class="hero-copy">
        Explore galleries, track openings, and browse what is on right now across Sydney precincts.
      </p>
      <div class="hero-actions">
        <a class="button button-primary" href="#/whats-on">Explore What's On</a>
        <a class="button button-secondary" href="#/galleries">Browse Galleries</a>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card panel">
        <p class="stat-label">Galleries</p>
        <p class="stat-value">${galleryCount}</p>
      </article>
      <article class="stat-card panel">
        <p class="stat-label">Exhibitions indexed</p>
        <p class="stat-value">${exhibitionCount}</p>
      </article>
      <article class="stat-card panel">
        <p class="stat-label">Current exhibitions</p>
        <p class="stat-value">${currentCount}</p>
      </article>
      <article class="stat-card panel">
        <p class="stat-label">Upcoming exhibitions</p>
        <p class="stat-value">${upcomingCount}</p>
      </article>
    </section>

    <section class="panel section-block">
      <div class="section-head">
        <h2>Opening tonight</h2>
        <a href="#/whats-on">View all</a>
      </div>
      ${
        tonightOpenings.length
          ? `<div class="event-list">${tonightOpenings
              .map((exhibition) => renderHomeEventRow(exhibition))
              .join('')}</div>`
          : '<p class="empty-copy">No openings listed for tonight.</p>'
      }
    </section>

    <section class="panel section-block">
      <div class="section-head">
        <h2>Opening this week</h2>
        <a href="#/whats-on">Filter by week</a>
      </div>
      ${
        weekOpenings.length
          ? `<div class="event-list">${weekOpenings
              .map((exhibition) => renderHomeEventRow(exhibition))
              .join('')}</div>`
          : '<p class="empty-copy">No openings listed in the next 7 days.</p>'
      }
    </section>

    <section class="panel section-block">
      <div class="section-head">
        <h2>Browse by precinct</h2>
      </div>
      <div class="precinct-pills">
        ${getPrecincts()
          .map(
            (precinct) =>
              `<a class="pill" href="#/galleries" data-precinct-link="${escapeHtml(precinct)}">${escapeHtml(precinct)}</a>`
          )
          .join('')}
      </div>
    </section>
  `

  viewElement.querySelectorAll('[data-precinct-link]').forEach((element) => {
    element.addEventListener('click', () => {
      state.galleryFilters.precinct = element.dataset.precinctLink
    })
  })
}

function renderHomeEventRow(exhibition) {
  const gallery = getGalleryBySlug(exhibition.gallerySlug)

  return `
    <article class="event-row">
      <div>
        <p class="event-title">${escapeHtml(exhibition.title)}</p>
        <p class="event-meta">${escapeHtml(gallery?.name || 'Unknown gallery')} | ${escapeHtml(
    gallery?.precinct || 'Unspecified precinct'
  )}</p>
      </div>
      <div class="event-date">
        <p>${formatDate(exhibition.openingDate || exhibition.startDate)}</p>
        ${exhibition.openingTime ? `<p>${escapeHtml(exhibition.openingTime)}</p>` : ''}
      </div>
    </article>
  `
}

function renderGalleriesPage(viewElement) {
  const precinctOptions = getPrecincts()
    .map(
      (precinct) =>
        `<option value="${escapeHtml(precinct)}" ${
          state.galleryFilters.precinct === precinct ? 'selected' : ''
        }>${escapeHtml(precinct)}</option>`
    )
    .join('')

  viewElement.innerHTML = `
    <section class="panel section-block">
      <div class="section-head">
        <h1>Gallery Directory</h1>
      </div>
      <p class="section-copy">
        Navigate all galleries by map, precinct, or A-Z listing.
      </p>

      <div class="filter-grid">
        <label>
          <span>Search</span>
          <input id="gallery-search" type="search" placeholder="Gallery name, suburb, precinct" value="${escapeHtml(
            state.galleryFilters.search
          )}" />
        </label>

        <label>
          <span>Precinct</span>
          <select id="gallery-precinct">
            <option value="all">All precincts</option>
            ${precinctOptions}
          </select>
        </label>

        <label>
          <span>Sort</span>
          <select id="gallery-sort">
            <option value="alphabetical" ${
              state.galleryFilters.sort === 'alphabetical' ? 'selected' : ''
            }>A-Z</option>
            <option value="precinct" ${
              state.galleryFilters.sort === 'precinct' ? 'selected' : ''
            }>By precinct</option>
          </select>
        </label>

        <label class="toggle-wrap">
          <input id="gallery-map-enabled" type="checkbox" ${
            state.galleryFilters.mapEnabled ? 'checked' : ''
          } />
          <span>Show map</span>
        </label>
      </div>

      <div id="gallery-map-panel" class="map-panel ${
        state.galleryFilters.mapEnabled ? '' : 'is-hidden'
      }">
        <div id="gallery-map" class="gallery-map" role="region" aria-label="Gallery map"></div>
      </div>

      <p id="gallery-results-meta" class="results-meta"></p>
      <div id="gallery-results" class="gallery-grid"></div>
    </section>
  `

  const searchInput = viewElement.querySelector('#gallery-search')
  const precinctSelect = viewElement.querySelector('#gallery-precinct')
  const sortSelect = viewElement.querySelector('#gallery-sort')
  const mapToggle = viewElement.querySelector('#gallery-map-enabled')

  searchInput.addEventListener('input', (event) => {
    state.galleryFilters.search = event.target.value
    renderGalleryResults(viewElement)
  })

  precinctSelect.addEventListener('change', (event) => {
    state.galleryFilters.precinct = event.target.value
    renderGalleryResults(viewElement)
  })

  sortSelect.addEventListener('change', (event) => {
    state.galleryFilters.sort = event.target.value
    renderGalleryResults(viewElement)
  })

  mapToggle.addEventListener('change', (event) => {
    state.galleryFilters.mapEnabled = event.target.checked
    renderGalleryResults(viewElement)
  })

  renderGalleryResults(viewElement)
}

function renderGalleryResults(viewElement) {
  const filteredGalleries = getFilteredGalleries()
  const resultsMeta = viewElement.querySelector('#gallery-results-meta')
  const resultsElement = viewElement.querySelector('#gallery-results')
  const mapPanel = viewElement.querySelector('#gallery-map-panel')

  resultsMeta.textContent = `${filteredGalleries.length} ${
    filteredGalleries.length === 1 ? 'gallery' : 'galleries'
  } found`

  if (!filteredGalleries.length) {
    resultsElement.innerHTML = '<p class="empty-copy">No galleries match these filters.</p>'
  } else {
    resultsElement.innerHTML = filteredGalleries
      .map((gallery) => {
        const summary = getGalleryExhibitionSummary(gallery.slug)

        return `
          <article class="panel gallery-card">
            <p class="gallery-precinct">${escapeHtml(gallery.precinct)}</p>
            <h3>${escapeHtml(gallery.name)}</h3>
            <p class="gallery-address">${escapeHtml(gallery.address)}</p>
            <p class="gallery-counts">${summary.current} current | ${summary.upcoming} upcoming</p>
            <a class="text-link" href="#/gallery/${encodeURIComponent(gallery.slug)}">View profile</a>
          </article>
        `
      })
      .join('')
  }

  if (state.galleryFilters.mapEnabled) {
    mapPanel.classList.remove('is-hidden')
    updateGalleryMap(filteredGalleries)
  } else {
    mapPanel.classList.add('is-hidden')
    destroyGalleryMap()
  }
}

function renderGalleryProfilePage(viewElement, slug) {
  const gallery = getGalleryBySlug(slug)

  if (!gallery) {
    renderNotFoundPage(viewElement)
    return
  }

  const exhibitions = getExhibitionsByGallery(slug)
  const today = todayISOInSydney()

  const grouped = {
    current: exhibitions.filter((exhibition) => getExhibitionStatus(exhibition, today) === 'current'),
    upcoming: exhibitions.filter((exhibition) => getExhibitionStatus(exhibition, today) === 'upcoming'),
    past: exhibitions.filter((exhibition) => getExhibitionStatus(exhibition, today) === 'past')
  }

  viewElement.innerHTML = `
    <section class="panel section-block">
      <a class="text-link" href="#/galleries"><- Back to galleries</a>
      <h1>${escapeHtml(gallery.name)}</h1>
      <p class="gallery-precinct">${escapeHtml(gallery.precinct)}</p>

      <div class="profile-grid">
        <article>
          <h2>Details</h2>
          <p>${escapeHtml(gallery.about || 'Gallery details coming soon.')}</p>
          <ul class="detail-list">
            <li>${escapeHtml(gallery.address)}</li>
            ${gallery.phone ? `<li><a href="tel:${sanitizePhone(gallery.phone)}">${escapeHtml(gallery.phone)}</a></li>` : ''}
            ${gallery.email ? `<li><a href="mailto:${escapeHtml(gallery.email)}">${escapeHtml(gallery.email)}</a></li>` : ''}
            ${gallery.website ? `<li><a href="${escapeHtml(gallery.website)}" target="_blank" rel="noreferrer">Website</a></li>` : ''}
            ${gallery.instagram ? `<li><a href="${escapeHtml(gallery.instagram)}" target="_blank" rel="noreferrer">Instagram</a></li>` : ''}
          </ul>
        </article>

        <article>
          <h2>Opening hours</h2>
          <ul class="detail-list">
            ${(gallery.openingHours || []).length
              ? gallery.openingHours.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')
              : '<li>Hours not listed</li>'}
          </ul>
          <a
            class="text-link"
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gallery.address)}"
            target="_blank"
            rel="noreferrer"
          >Open in Maps</a>
        </article>
      </div>
    </section>

    <section class="panel section-block">
      <div class="section-head">
        <h2>Current exhibitions</h2>
      </div>
      ${renderProfileExhibitionList(grouped.current)}
    </section>

    <section class="panel section-block">
      <div class="section-head">
        <h2>Upcoming exhibitions</h2>
      </div>
      ${renderProfileExhibitionList(grouped.upcoming)}
    </section>

    <section class="panel section-block">
      <div class="section-head">
        <h2>Past exhibitions</h2>
      </div>
      ${renderProfileExhibitionList(grouped.past)}
    </section>
  `
}

function renderProfileExhibitionList(exhibitions) {
  if (!exhibitions.length) {
    return '<p class="empty-copy">No exhibitions listed.</p>'
  }

  return `<div class="exhibition-list">${exhibitions
    .map(
      (exhibition) => `
        <article class="exhibition-card">
          <div class="card-row">
            <h3>${escapeHtml(exhibition.title)}</h3>
            <span class="status-pill status-${getExhibitionStatus(exhibition)}">${statusLabels[
        getExhibitionStatus(exhibition)
      ]}</span>
          </div>
          <p class="card-subtitle">${escapeHtml(exhibition.artist)}</p>
          <p class="card-copy">${escapeHtml(exhibition.summary || 'Details coming soon.')}</p>
          <p class="card-meta">${formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
          ${
            exhibition.openingDate
              ? `<p class="card-meta">Opening: ${formatDate(exhibition.openingDate)}${
                  exhibition.openingTime ? ` | ${escapeHtml(exhibition.openingTime)}` : ''
                }</p>`
              : ''
          }
        </article>
      `
    )
    .join('')}</div>`
}

function renderWhatsOnPage(viewElement) {
  const precinctOptions = getPrecincts()
    .map(
      (precinct) =>
        `<option value="${escapeHtml(precinct)}" ${
          state.whatsOnFilters.precinct === precinct ? 'selected' : ''
        }>${escapeHtml(precinct)}</option>`
    )
    .join('')

  const galleryChecklist = [...state.galleries]
    .sort((first, second) => first.name.localeCompare(second.name))
    .map((gallery) => {
      const isChecked = state.whatsOnFilters.selectedGalleries.has(gallery.slug)

      return `
        <label class="gallery-check-option">
          <input type="checkbox" value="${escapeHtml(gallery.slug)}" ${isChecked ? 'checked' : ''} />
          <span>${escapeHtml(gallery.name)}</span>
        </label>
      `
    })
    .join('')

  viewElement.innerHTML = `
    <section class="panel section-block">
      <div class="section-head">
        <h1>What's On</h1>
      </div>
      <p class="section-copy">
        Find current and upcoming exhibitions, then filter by opening windows, precincts, or specific galleries.
      </p>

      <div class="filter-grid">
        <label>
          <span>Search</span>
          <input id="whats-on-search" type="search" placeholder="Exhibition, artist, gallery" value="${escapeHtml(
            state.whatsOnFilters.search
          )}" />
        </label>

        <label>
          <span>Precinct</span>
          <select id="whats-on-precinct">
            <option value="all">All precincts</option>
            ${precinctOptions}
          </select>
        </label>
      </div>

      <div class="chip-groups">
        <div class="chip-group" data-chip-group="status">
          ${renderChip('status', 'current-upcoming', 'Current + Upcoming')}
          ${renderChip('status', 'current', 'Current')}
          ${renderChip('status', 'upcoming', 'Upcoming')}
          ${renderChip('status', 'past', 'Past')}
          ${renderChip('status', 'all', 'All')}
        </div>

        <div class="chip-group" data-chip-group="opening-window">
          ${renderChip('openingWindow', 'all', 'Any opening date')}
          ${renderChip('openingWindow', 'tonight', 'Opening tonight')}
          ${renderChip('openingWindow', 'week', 'Opening this week')}
        </div>
      </div>

      <details class="gallery-checklist-wrap">
        <summary>Filter specific galleries (${state.whatsOnFilters.selectedGalleries.size} selected)</summary>
        <div id="gallery-checklist" class="gallery-checklist">${galleryChecklist}</div>
      </details>

      <div class="filter-actions">
        <button id="whats-on-reset" class="button button-secondary" type="button">Reset filters</button>
      </div>

      <p id="whats-on-meta" class="results-meta"></p>
      <div id="whats-on-results" class="exhibition-list"></div>
    </section>
  `

  const searchInput = viewElement.querySelector('#whats-on-search')
  const precinctSelect = viewElement.querySelector('#whats-on-precinct')
  const resetButton = viewElement.querySelector('#whats-on-reset')
  const checklist = viewElement.querySelector('#gallery-checklist')

  searchInput.addEventListener('input', (event) => {
    state.whatsOnFilters.search = event.target.value
    renderWhatsOnResults(viewElement)
  })

  precinctSelect.addEventListener('change', (event) => {
    state.whatsOnFilters.precinct = event.target.value
    renderWhatsOnResults(viewElement)
  })

  viewElement.querySelectorAll('[data-chip]').forEach((chipButton) => {
    chipButton.addEventListener('click', () => {
      const filterKey = chipButton.dataset.filter
      const value = chipButton.dataset.value

      state.whatsOnFilters[filterKey] = value
      renderWhatsOnResults(viewElement)
    })
  })

  checklist.addEventListener('change', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement)) {
      return
    }

    if (target.checked) {
      state.whatsOnFilters.selectedGalleries.add(target.value)
    } else {
      state.whatsOnFilters.selectedGalleries.delete(target.value)
    }

    renderWhatsOnResults(viewElement)
  })

  resetButton.addEventListener('click', () => {
    state.whatsOnFilters.search = ''
    state.whatsOnFilters.status = 'current-upcoming'
    state.whatsOnFilters.openingWindow = 'all'
    state.whatsOnFilters.precinct = 'all'
    state.whatsOnFilters.selectedGalleries = new Set()
    renderWhatsOnPage(viewElement)
  })

  renderWhatsOnResults(viewElement)
}

function renderChip(filter, value, label) {
  const activeValue = state.whatsOnFilters[filter]

  return `
    <button
      type="button"
      class="chip ${activeValue === value ? 'is-active' : ''}"
      data-chip
      data-filter="${filter}"
      data-value="${value}"
    >
      ${label}
    </button>
  `
}

function renderWhatsOnResults(viewElement) {
  const filteredExhibitions = getFilteredExhibitions()
  const resultsElement = viewElement.querySelector('#whats-on-results')
  const metaElement = viewElement.querySelector('#whats-on-meta')

  syncWhatsOnControlState(viewElement)

  metaElement.textContent = `${filteredExhibitions.length} ${
    filteredExhibitions.length === 1 ? 'exhibition' : 'exhibitions'
  } shown`

  if (!filteredExhibitions.length) {
    resultsElement.innerHTML = '<p class="empty-copy">No exhibitions match these filters.</p>'
    return
  }

  resultsElement.innerHTML = filteredExhibitions
    .map((exhibition) => {
      const gallery = getGalleryBySlug(exhibition.gallerySlug)
      const exhibitionStatus = getExhibitionStatus(exhibition)
      const openingSoon = isOpeningSoon(exhibition)

      return `
        <article class="exhibition-card panel">
          <div class="card-row">
            <h3>${escapeHtml(exhibition.title)}</h3>
            <span class="status-pill status-${exhibitionStatus}">${statusLabels[exhibitionStatus]}</span>
          </div>
          <p class="card-subtitle">${escapeHtml(exhibition.artist)}</p>
          <p class="card-meta">
            ${escapeHtml(gallery?.name || 'Unknown gallery')} | ${escapeHtml(
        gallery?.precinct || 'Unspecified precinct'
      )}
          </p>
          <p class="card-copy">${escapeHtml(exhibition.summary || 'Details coming soon.')}</p>
          <p class="card-meta">${formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
          ${
            exhibition.openingDate
              ? `<p class="card-meta">Opening: ${formatDate(exhibition.openingDate)}${
                  exhibition.openingTime ? ` | ${escapeHtml(exhibition.openingTime)}` : ''
                }</p>`
              : ''
          }
          <p class="card-footer">
            ${openingSoon ? '<span class="pill pill-highlight">Opening soon</span>' : ''}
            <a class="text-link" href="#/gallery/${encodeURIComponent(exhibition.gallerySlug)}">Gallery profile</a>
          </p>
        </article>
      `
    })
    .join('')
}

function syncWhatsOnControlState(viewElement) {
  viewElement.querySelectorAll('[data-chip]').forEach((chipButton) => {
    const filterKey = chipButton.dataset.filter
    const chipValue = chipButton.dataset.value

    chipButton.classList.toggle('is-active', state.whatsOnFilters[filterKey] === chipValue)
  })

  const summaryElement = viewElement.querySelector('.gallery-checklist-wrap summary')
  if (summaryElement) {
    summaryElement.textContent = `Filter specific galleries (${state.whatsOnFilters.selectedGalleries.size} selected)`
  }
}

function renderNotFoundPage(viewElement) {
  viewElement.innerHTML = `
    <section class="panel section-block">
      <h1>Page not found</h1>
      <p class="section-copy">The page you requested does not exist.</p>
      <a class="button button-primary" href="#/">Back home</a>
    </section>
  `
}

function getFilteredGalleries() {
  let filteredGalleries = [...state.galleries]

  const searchTerm = state.galleryFilters.search.trim().toLowerCase()
  if (searchTerm) {
    filteredGalleries = filteredGalleries.filter((gallery) => {
      const haystack = [gallery.name, gallery.precinct, gallery.suburb, gallery.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchTerm)
    })
  }

  if (state.galleryFilters.precinct !== 'all') {
    filteredGalleries = filteredGalleries.filter(
      (gallery) => gallery.precinct === state.galleryFilters.precinct
    )
  }

  if (state.galleryFilters.sort === 'precinct') {
    filteredGalleries.sort((first, second) => {
      const precinctCompare = first.precinct.localeCompare(second.precinct)
      if (precinctCompare !== 0) {
        return precinctCompare
      }

      return first.name.localeCompare(second.name)
    })
  } else {
    filteredGalleries.sort((first, second) => first.name.localeCompare(second.name))
  }

  return filteredGalleries
}

function getFilteredExhibitions() {
  let filteredExhibitions = [...state.exhibitions]
  const today = todayISOInSydney()
  const weekEnd = addDaysISO(today, 7)

  const searchTerm = state.whatsOnFilters.search.trim().toLowerCase()
  if (searchTerm) {
    filteredExhibitions = filteredExhibitions.filter((exhibition) => {
      const gallery = getGalleryBySlug(exhibition.gallerySlug)
      const haystack = [
        exhibition.title,
        exhibition.artist,
        exhibition.summary,
        gallery?.name,
        gallery?.precinct
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchTerm)
    })
  }

  if (state.whatsOnFilters.precinct !== 'all') {
    filteredExhibitions = filteredExhibitions.filter((exhibition) => {
      const gallery = getGalleryBySlug(exhibition.gallerySlug)
      return gallery?.precinct === state.whatsOnFilters.precinct
    })
  }

  if (state.whatsOnFilters.selectedGalleries.size > 0) {
    filteredExhibitions = filteredExhibitions.filter((exhibition) =>
      state.whatsOnFilters.selectedGalleries.has(exhibition.gallerySlug)
    )
  }

  if (state.whatsOnFilters.status !== 'all') {
    filteredExhibitions = filteredExhibitions.filter((exhibition) => {
      const status = getExhibitionStatus(exhibition, today)

      if (state.whatsOnFilters.status === 'current-upcoming') {
        return status === 'current' || status === 'upcoming'
      }

      return status === state.whatsOnFilters.status
    })
  }

  if (state.whatsOnFilters.openingWindow === 'tonight') {
    filteredExhibitions = filteredExhibitions.filter(
      (exhibition) => exhibition.openingDate && compareISO(exhibition.openingDate, today) === 0
    )
  }

  if (state.whatsOnFilters.openingWindow === 'week') {
    filteredExhibitions = filteredExhibitions.filter(
      (exhibition) =>
        exhibition.openingDate && isWithinRange(exhibition.openingDate, today, weekEnd)
    )
  }

  const statusOrder = {
    current: 0,
    upcoming: 1,
    past: 2
  }

  filteredExhibitions.sort((first, second) => {
    const firstStatus = getExhibitionStatus(first, today)
    const secondStatus = getExhibitionStatus(second, today)

    if (statusOrder[firstStatus] !== statusOrder[secondStatus]) {
      return statusOrder[firstStatus] - statusOrder[secondStatus]
    }

    if (firstStatus === 'past') {
      return compareISO(second.endDate || second.startDate, first.endDate || first.startDate)
    }

    const firstDate = first.openingDate || first.startDate
    const secondDate = second.openingDate || second.startDate

    return compareISO(firstDate, secondDate)
  })

  return filteredExhibitions
}

function getExhibitionStatus(exhibition, today = todayISOInSydney()) {
  const startDate = exhibition.startDate || exhibition.openingDate
  const endDate = exhibition.endDate

  if (endDate && compareISO(today, endDate) > 0) {
    return 'past'
  }

  if (startDate && compareISO(today, startDate) < 0) {
    return 'upcoming'
  }

  return 'current'
}

function isOpeningSoon(exhibition) {
  const today = todayISOInSydney()
  const weekEnd = addDaysISO(today, 7)

  if (!exhibition.openingDate) {
    return false
  }

  return isWithinRange(exhibition.openingDate, today, weekEnd)
}

function getPrecincts() {
  return [...new Set(state.galleries.map((gallery) => gallery.precinct).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
}

function getGalleryExhibitionSummary(gallerySlug) {
  const today = todayISOInSydney()

  return state.exhibitions
    .filter((exhibition) => exhibition.gallerySlug === gallerySlug)
    .reduce(
      (summary, exhibition) => {
        const status = getExhibitionStatus(exhibition, today)
        summary[status] += 1
        return summary
      },
      { current: 0, upcoming: 0, past: 0 }
    )
}

function getExhibitionsByGallery(gallerySlug) {
  return state.exhibitions
    .filter((exhibition) => exhibition.gallerySlug === gallerySlug)
    .sort((first, second) => compareISO(second.startDate || second.openingDate, first.startDate || first.openingDate))
}

function getGalleryBySlug(slug) {
  return state.galleries.find((gallery) => gallery.slug === slug)
}

function updateGalleryMap(galleries) {
  const mapElement = document.querySelector('#gallery-map')

  if (!mapElement) {
    return
  }

  const mappableGalleries = galleries.filter(
    (gallery) => Number.isFinite(gallery.latitude) && Number.isFinite(gallery.longitude)
  )

  if (!galleryMapState.map) {
    galleryMapState.map = L.map(mapElement, {
      zoomControl: true,
      scrollWheelZoom: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(galleryMapState.map)

    galleryMapState.markers = L.layerGroup().addTo(galleryMapState.map)
  }

  galleryMapState.markers.clearLayers()

  mappableGalleries.forEach((gallery) => {
    const marker = L.marker([gallery.latitude, gallery.longitude])
    marker.bindPopup(`
      <strong>${escapeHtml(gallery.name)}</strong><br />
      ${escapeHtml(gallery.precinct)}<br />
      <a href="#/gallery/${encodeURIComponent(gallery.slug)}">Open profile</a>
    `)
    galleryMapState.markers.addLayer(marker)
  })

  if (!mappableGalleries.length) {
    galleryMapState.map.setView([-33.8688, 151.2093], 11)
  } else if (mappableGalleries.length === 1) {
    galleryMapState.map.setView([mappableGalleries[0].latitude, mappableGalleries[0].longitude], 14)
  } else {
    const bounds = L.latLngBounds(mappableGalleries.map((gallery) => [gallery.latitude, gallery.longitude]))
    galleryMapState.map.fitBounds(bounds.pad(0.2))
  }

  requestAnimationFrame(() => {
    galleryMapState.map?.invalidateSize()
  })
}

function destroyGalleryMap() {
  if (galleryMapState.map) {
    galleryMapState.map.remove()
    galleryMapState.map = null
    galleryMapState.markers = null
  }
}

function sanitizePhone(phoneNumber) {
  return phoneNumber.replace(/[^\d+]/g, '')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
