'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import BackLinkButton from './BackLinkButton'
import { filterMapGalleries, getPrecinctOptions } from '../lib/utils/filters'
import { serializeBounds, SYDNEY_CENTER, SYDNEY_DEFAULT_ZOOM } from '../lib/utils/map'

const LIST_SCROLL_STORAGE_KEY = 'saf_map_list_scroll'
const DETENT_ORDER = ['collapsed', 'half', 'full']

function normalizeDetent(value) {
  return DETENT_ORDER.includes(value) ? value : 'collapsed'
}

function toBoundsObject(bounds) {
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth()
  }
}

function createPopupContent(gallery) {
  const root = document.createElement('div')

  const title = document.createElement('strong')
  title.textContent = gallery.name
  root.append(title)

  root.append(document.createElement('br'))
  root.append(document.createTextNode(gallery.precinct || 'Unspecified precinct'))
  root.append(document.createElement('br'))

  const link = document.createElement('a')
  link.href = `/gallery/${encodeURIComponent(gallery.slug)}`
  link.textContent = 'View gallery'
  root.append(link)

  return root
}

function createMarkerIcon(L, selected = false) {
  const size = selected ? 12 : 10

  return L.divIcon({
    className: `map-dot-marker${selected ? ' is-selected' : ''}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -8]
  })
}

function getNextDetent(currentDetent, direction) {
  const currentIndex = DETENT_ORDER.indexOf(currentDetent)
  if (currentIndex < 0) {
    return 'collapsed'
  }

  const nextIndex = Math.max(0, Math.min(DETENT_ORDER.length - 1, currentIndex + direction))
  return DETENT_ORDER[nextIndex]
}

export default function MapPageClient({ galleries, initialFilters }) {
  const [search, setSearch] = useState(initialFilters.search)
  const [precinct, setPrecinct] = useState(initialFilters.precinct)
  const [areaEnabled, setAreaEnabled] = useState(initialFilters.areaEnabled)
  const [viewportBounds, setViewportBounds] = useState(initialFilters.viewportBounds)
  const [mapView, setMapView] = useState(initialFilters.mapView)
  const [mapMoved, setMapMoved] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState(initialFilters.selectedSlug || null)
  const [mapError, setMapError] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sheetDetent, setSheetDetent] = useState(normalizeDetent(initialFilters.sheetDetent))

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const clusterRef = useRef(null)
  const markerBySlugRef = useRef(new Map())
  const leafletRef = useRef(null)
  const resultsScrollRef = useRef(null)
  const moveDebounceRef = useRef(null)
  const initialMoveHandledRef = useRef(false)
  const sheetDragStartRef = useRef(null)
  const listTouchStartRef = useRef(null)

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])

  const baseFilteredGalleries = useMemo(
    () =>
      filterMapGalleries(galleries, {
        search,
        precinct,
        areaEnabled: false,
        viewportBounds: null
      }),
    [galleries, precinct, search]
  )

  const filteredGalleriesInViewport = useMemo(
    () =>
      filterMapGalleries(galleries, {
        search,
        precinct,
        areaEnabled,
        viewportBounds
      }),
    [areaEnabled, galleries, precinct, search, viewportBounds]
  )

  const resultGalleries = areaEnabled ? filteredGalleriesInViewport : baseFilteredGalleries

  const selectedGallery = useMemo(
    () => resultGalleries.find((gallery) => gallery.slug === selectedSlug) || null,
    [resultGalleries, selectedSlug]
  )

  const activeFilters = useMemo(() => {
    const filters = []

    if (search.trim()) {
      filters.push({
        key: 'search',
        label: `Search: ${search.trim()}`,
        removable: true
      })
    }

    if (precinct !== 'all') {
      filters.push({
        key: 'precinct',
        label: `Precinct: ${precinct}`,
        removable: true
      })
    }

    if (areaEnabled) {
      filters.push({
        key: 'area',
        label: 'Area: Current map bounds',
        removable: true
      })
    }

    if (!filters.length) {
      filters.push({
        key: 'all',
        label: 'All galleries',
        removable: false
      })
    }

    return filters
  }, [areaEnabled, precinct, search])

  const resultsLabel = `${resultGalleries.length} ${resultGalleries.length === 1 ? 'gallery' : 'galleries'} ${
    areaEnabled ? 'in this area' : 'matching filters'
  }`

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    if (precinct !== 'all') {
      params.set('precinct', precinct)
    } else {
      params.delete('precinct')
    }

    if (areaEnabled && viewportBounds) {
      params.set('area', '1')
      params.set('bounds', serializeBounds(viewportBounds))
    } else {
      params.delete('area')
      params.delete('bounds')
    }

    if (selectedSlug) {
      params.set('selected', selectedSlug)
    } else {
      params.delete('selected')
    }

    params.set('lat', mapView.lat.toFixed(5))
    params.set('lng', mapView.lng.toFixed(5))
    params.set('zoom', String(Math.round(mapView.zoom)))

    if (sheetDetent !== 'collapsed') {
      params.set('sheet', sheetDetent)
    } else {
      params.delete('sheet')
    }

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false })
    }
  }, [
    areaEnabled,
    mapView,
    pathname,
    precinct,
    router,
    search,
    searchParams,
    selectedSlug,
    sheetDetent,
    viewportBounds
  ])

  useEffect(() => {
    const scrollNode = resultsScrollRef.current
    if (!scrollNode) {
      return
    }

    try {
      const savedScroll = window.sessionStorage.getItem(LIST_SCROLL_STORAGE_KEY)
      if (savedScroll) {
        scrollNode.scrollTop = Number.parseInt(savedScroll, 10)
      }
    } catch (error) {
      console.error('Unable to restore map results scroll state.', error)
    }
  }, [])

  useEffect(() => {
    let canceled = false

    async function initializeMap() {
      try {
        const leafletModule = await import('leaflet')
        await import('leaflet.markercluster')

        if (!mapContainerRef.current || canceled || mapRef.current) {
          return
        }

        const L = leafletModule.default
        leafletRef.current = L

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: false
        }).setView([mapView.lat, mapView.lng], mapView.zoom)

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map)

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          pane: 'overlayPane'
        }).addTo(map)

        const clusterLayer = L.markerClusterGroup({
          showCoverageOnHover: false,
          removeOutsideVisibleBounds: true,
          maxClusterRadius: 40
        })

        map.addLayer(clusterLayer)

        map.on('moveend', () => {
          if (moveDebounceRef.current) {
            clearTimeout(moveDebounceRef.current)
          }

          moveDebounceRef.current = setTimeout(() => {
            const center = map.getCenter()
            const zoom = map.getZoom()

            setMapView({ lat: center.lat, lng: center.lng, zoom })

            if (!initialMoveHandledRef.current) {
              initialMoveHandledRef.current = true
              return
            }

            setMapMoved(true)
          }, 300)
        })

        mapRef.current = map
        clusterRef.current = clusterLayer
        setMapError(false)

        requestAnimationFrame(() => {
          map.invalidateSize()
        })
      } catch (error) {
        console.error('Map failed to initialize.', error)
        setMapError(true)
      }
    }

    initializeMap()

    return () => {
      canceled = true
    }
  }, [mapView.lat, mapView.lng, mapView.zoom])

  useEffect(() => {
    const L = leafletRef.current
    if (!L || !clusterRef.current) {
      return
    }

    clusterRef.current.clearLayers()
    markerBySlugRef.current.clear()

    resultGalleries.forEach((gallery) => {
      const marker = L.marker([gallery.latitude, gallery.longitude], {
        icon: createMarkerIcon(L, gallery.slug === selectedSlug)
      })

      marker.on('click', () => {
        setSelectedSlug(gallery.slug)
      })

      marker.bindPopup(createPopupContent(gallery))
      clusterRef.current.addLayer(marker)
      markerBySlugRef.current.set(gallery.slug, marker)
    })

    if (selectedSlug && !markerBySlugRef.current.has(selectedSlug)) {
      setSelectedSlug(null)
    }
  }, [resultGalleries, selectedSlug])

  useEffect(() => {
    const L = leafletRef.current
    if (!L) {
      return
    }

    markerBySlugRef.current.forEach((marker, slug) => {
      marker.setIcon(createMarkerIcon(L, slug === selectedSlug))
    })
  }, [selectedSlug])

  useEffect(() => {
    return () => {
      if (moveDebounceRef.current) {
        clearTimeout(moveDebounceRef.current)
      }

      if (mapRef.current) {
        mapRef.current.remove()
      }

      const scrollNode = resultsScrollRef.current
      if (scrollNode) {
        persistResultsScroll(scrollNode.scrollTop)
      }

      mapRef.current = null
      clusterRef.current = null
      markerBySlugRef.current.clear()
      leafletRef.current = null
      initialMoveHandledRef.current = false
    }
  }, [])

  function persistResultsScroll(scrollTopValue) {
    try {
      window.sessionStorage.setItem(LIST_SCROLL_STORAGE_KEY, String(scrollTopValue))
    } catch (error) {
      console.error('Unable to persist map results scroll state.', error)
    }
  }

  function applyCurrentViewport() {
    if (!mapRef.current) {
      return
    }

    setViewportBounds(toBoundsObject(mapRef.current.getBounds()))
    setAreaEnabled(true)
    setMapMoved(false)
  }

  function clearAreaFilter() {
    setAreaEnabled(false)
    setViewportBounds(null)
    setMapMoved(false)
  }

  function clearFilter(filterKey) {
    if (filterKey === 'search') {
      setSearch('')
      return
    }

    if (filterKey === 'precinct') {
      setPrecinct('all')
      return
    }

    if (filterKey === 'area') {
      clearAreaFilter()
    }
  }

  function resetView() {
    if (!mapRef.current) {
      return
    }

    mapRef.current.setView([SYDNEY_CENTER.lat, SYDNEY_CENTER.lng], SYDNEY_DEFAULT_ZOOM)
    setMapView({ lat: SYDNEY_CENTER.lat, lng: SYDNEY_CENTER.lng, zoom: SYDNEY_DEFAULT_ZOOM })
    setAreaEnabled(false)
    setViewportBounds(null)
    setMapMoved(false)
    setSelectedSlug(null)
  }

  function focusGallery(gallerySlug) {
    const marker = markerBySlugRef.current.get(gallerySlug)
    if (!marker || !mapRef.current) {
      return
    }

    setSelectedSlug(gallerySlug)

    const latLng = marker.getLatLng()
    mapRef.current.setView(latLng, Math.max(mapRef.current.getZoom(), 13), { animate: true })
    marker.openPopup()
  }

  function nudgeSheetDetent(direction) {
    setSheetDetent((currentDetent) => getNextDetent(currentDetent, direction))
  }

  function handleSheetPointerDown(event) {
    sheetDragStartRef.current = event.clientY
  }

  function handleSheetPointerUp(event) {
    if (sheetDragStartRef.current === null) {
      return
    }

    const delta = event.clientY - sheetDragStartRef.current

    if (delta < -40) {
      nudgeSheetDetent(1)
    }

    if (delta > 40) {
      nudgeSheetDetent(-1)
    }

    sheetDragStartRef.current = null
  }

  function handleSheetPointerCancel() {
    sheetDragStartRef.current = null
  }

  function handleListTouchStart(event) {
    listTouchStartRef.current = event.touches[0]?.clientY ?? null
  }

  function handleListTouchMove(event) {
    if (listTouchStartRef.current === null) {
      return
    }

    const scrollNode = event.currentTarget
    const nextY = event.touches[0]?.clientY ?? listTouchStartRef.current
    const delta = nextY - listTouchStartRef.current

    if (delta > 48 && scrollNode.scrollTop === 0) {
      if (sheetDetent === 'full') {
        setSheetDetent('half')
      } else if (sheetDetent === 'half') {
        setSheetDetent('collapsed')
      }

      listTouchStartRef.current = nextY
    }
  }

  function handleListTouchEnd() {
    listTouchStartRef.current = null
  }

  if (mapError) {
    return (
      <section className="page-block">
        <h1>Map unavailable</h1>
        <p className="section-copy">The map failed to load right now.</p>
        <Link className="text-link" href="/galleries">
          Open gallery list view
        </Link>
      </section>
    )
  }

  return (
    <section className="map-page map-fullscreen" aria-label="Sydney gallery map">
      <div className="map-top-overlay">
        <BackLinkButton fallbackHref="/galleries" label="Back" />
        <label className="field map-search-field">
          <span className="visually-hidden">Search map</span>
          <input
            type="search"
            placeholder="Search galleries"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button type="button" className="button button-secondary map-filter-trigger" onClick={() => setFiltersOpen(true)}>
          Filters
        </button>
      </div>

      {filtersOpen ? (
        <div className="filter-sheet-overlay" role="presentation" onClick={() => setFiltersOpen(false)}>
          <section
            className="filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Map filters"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="filter-sheet-head">
              <h2>Map filters</h2>
              <button type="button" className="text-link text-link-button" onClick={() => setFiltersOpen(false)}>
                Close
              </button>
            </div>
            <div className="filter-sheet-body">
              <label className="field">
                <span>Precinct</span>
                <select value={precinct} onChange={(event) => setPrecinct(event.target.value)}>
                  <option value="all">All precincts</option>
                  {precinctOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="map-secondary-actions">
                {areaEnabled ? (
                  <button type="button" className="text-link text-link-button" onClick={clearAreaFilter}>
                    Clear area filter
                  </button>
                ) : null}
                <button type="button" className="text-link text-link-button" onClick={resetView}>
                  Reset map view
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <div className="map-canvas map-canvas-full" ref={mapContainerRef} role="region" aria-label="Sydney gallery map" />

      {mapMoved ? (
        <button type="button" className="button button-primary map-search-area-cta" onClick={applyCurrentViewport}>
          {areaEnabled ? 'Update this area' : 'Search this area'}
        </button>
      ) : null}

      {selectedGallery ? (
        <article className="map-selection-card map-selection-floating" aria-live="polite">
          <h2 className="item-title">{selectedGallery.name}</h2>
          <p className="item-meta">
            {selectedGallery.precinct}
            {selectedGallery.suburb ? ` | ${selectedGallery.suburb}` : ''}
          </p>
          <p className="item-meta">{selectedGallery.address}</p>
          <Link className="button button-primary" href={`/gallery/${encodeURIComponent(selectedGallery.slug)}`}>
            View gallery
          </Link>
        </article>
      ) : null}

      <section className={`map-bottom-sheet detent-${sheetDetent}`} aria-label="Map results">
        <button
          type="button"
          className="map-sheet-handle"
          onPointerDown={handleSheetPointerDown}
          onPointerUp={handleSheetPointerUp}
          onPointerCancel={handleSheetPointerCancel}
          onClick={() => {
            if (sheetDetent === 'collapsed') {
              setSheetDetent('half')
              return
            }

            if (sheetDetent === 'half') {
              setSheetDetent('full')
              return
            }

            setSheetDetent('half')
          }}
        >
          <span className="map-sheet-grab" aria-hidden="true" />
          <span className="map-sheet-label">{resultsLabel}</span>
        </button>

        <div
          className="map-sheet-content"
          ref={resultsScrollRef}
          onScroll={(event) => persistResultsScroll(event.currentTarget.scrollTop)}
          onTouchStart={handleListTouchStart}
          onTouchMove={handleListTouchMove}
          onTouchEnd={handleListTouchEnd}
        >
          <div className="active-filters" aria-label="Applied filters">
            {activeFilters.map((filter) =>
              filter.removable ? (
                <button
                  key={filter.key}
                  type="button"
                  className="filter-pill is-removable"
                  onClick={() => clearFilter(filter.key)}
                >
                  {filter.label} ×
                </button>
              ) : (
                <span className="filter-pill" key={filter.key}>
                  {filter.label}
                </span>
              )
            )}
          </div>

          {resultGalleries.length ? (
            <ul className="directory-list map-results-list">
              {resultGalleries.map((gallery) => (
                <li key={gallery.id} className={`directory-item ${selectedSlug === gallery.slug ? 'is-selected' : ''}`}>
                  <button type="button" className="map-result-button" onClick={() => focusGallery(gallery.slug)}>
                    <div>
                      <p className="item-kicker">{gallery.precinct}</p>
                      <h2 className="item-title">{gallery.name}</h2>
                      <p className="item-meta">{gallery.address}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="map-empty-state">
              <p className="empty-copy">No galleries in this area.</p>
              <p className="results-meta">Try zooming out or clearing filters.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
