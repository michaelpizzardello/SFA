'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { filterMapGalleries, getPrecinctOptions } from '../lib/utils/filters'
import { serializeBounds } from '../lib/utils/map'

function getImagePath(asset) {
  return typeof asset === 'string' ? asset : asset.src
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
  link.textContent = 'Open profile'
  root.append(link)

  return root
}

export default function MapPageClient({ galleries, initialFilters }) {
  const [search, setSearch] = useState(initialFilters.search)
  const [precinct, setPrecinct] = useState(initialFilters.precinct)
  const [areaEnabled, setAreaEnabled] = useState(initialFilters.areaEnabled)
  const [viewportBounds, setViewportBounds] = useState(initialFilters.viewportBounds)
  const [mapView, setMapView] = useState(initialFilters.mapView)
  const [mapMoved, setMapMoved] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const clusterRef = useRef(null)
  const leafletRef = useRef(null)
  const initialMoveHandledRef = useRef(false)

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])

  const galleriesInFilters = useMemo(
    () =>
      filterMapGalleries(galleries, {
        search,
        precinct,
        areaEnabled: false,
        viewportBounds: null
      }),
    [galleries, precinct, search]
  )

  const galleriesInView = useMemo(
    () =>
      filterMapGalleries(galleries, {
        search,
        precinct,
        areaEnabled,
        viewportBounds
      }),
    [areaEnabled, galleries, precinct, search, viewportBounds]
  )

  const resultGalleries = areaEnabled ? galleriesInView : galleriesInFilters

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

    params.set('lat', mapView.lat.toFixed(5))
    params.set('lng', mapView.lng.toFixed(5))
    params.set('zoom', String(Math.round(mapView.zoom)))

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false })
    }
  }, [areaEnabled, mapView, pathname, precinct, router, search, searchParams, viewportBounds])

  useEffect(() => {
    let canceled = false

    async function initializeMap() {
      const leaflet = await import('leaflet')
      await import('leaflet.markercluster')

      if (!mapContainerRef.current || canceled || mapRef.current) {
        return
      }

      const L = leaflet.default
      leafletRef.current = L

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: getImagePath(markerIcon2x),
        iconUrl: getImagePath(markerIcon),
        shadowUrl: getImagePath(markerShadow)
      })

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      const clusterLayer = L.markerClusterGroup({
        showCoverageOnHover: false,
        removeOutsideVisibleBounds: true,
        maxClusterRadius: 42
      })

      map.addLayer(clusterLayer)
      map.setView([mapView.lat, mapView.lng], mapView.zoom)

      map.on('moveend', () => {
        const center = map.getCenter()
        const zoom = map.getZoom()

        setMapView({ lat: center.lat, lng: center.lng, zoom })

        if (!initialMoveHandledRef.current) {
          initialMoveHandledRef.current = true
          return
        }

        setMapMoved(true)
      })

      mapRef.current = map
      clusterRef.current = clusterLayer

      requestAnimationFrame(() => {
        map.invalidateSize()
      })
    }

    initializeMap()

    return () => {
      canceled = true
    }
  }, [mapView.lat, mapView.lng, mapView.zoom])

  useEffect(() => {
    if (!leafletRef.current || !mapRef.current || !clusterRef.current) {
      return
    }

    const L = leafletRef.current

    clusterRef.current.clearLayers()

    resultGalleries.forEach((gallery) => {
      const marker = L.marker([gallery.latitude, gallery.longitude])
      marker.bindPopup(createPopupContent(gallery))
      clusterRef.current.addLayer(marker)
    })
  }, [resultGalleries])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        clusterRef.current = null
        leafletRef.current = null
        initialMoveHandledRef.current = false
      }
    }
  }, [])

  function handleSearchArea() {
    if (!mapRef.current) {
      return
    }

    const bounds = mapRef.current.getBounds()
    setViewportBounds(toBoundsObject(bounds))
    setAreaEnabled(true)
    setMapMoved(false)
  }

  function clearAreaFilter() {
    setAreaEnabled(false)
    setViewportBounds(null)
    setMapMoved(false)
  }

  return (
    <section className="page-block map-page">
      <div className="section-head">
        <h1>Map</h1>
      </div>
      <p className="section-copy">Map-first discovery for Sydney galleries with synced results.</p>

      <div className="filter-bar filter-bar-two" role="group" aria-label="Map filters">
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Gallery, suburb, precinct"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

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
      </div>

      <div className="map-toolbar">
        <button type="button" className="button button-primary" onClick={handleSearchArea}>
          {areaEnabled ? 'Update this area' : 'Search this area'}
        </button>
        {areaEnabled ? (
          <button type="button" className="button button-secondary" onClick={clearAreaFilter}>
            Clear area
          </button>
        ) : null}
        <p className="results-meta">
          {resultGalleries.length} {resultGalleries.length === 1 ? 'gallery' : 'galleries'} in view
          {mapMoved ? ' (map moved)' : ''}
        </p>
      </div>

      <div className="map-canvas" ref={mapContainerRef} role="region" aria-label="Sydney gallery map" />

      {resultGalleries.length ? (
        <ul className="directory-list map-results-list">
          {resultGalleries.map((gallery) => (
            <li key={gallery.id} className="directory-item">
              <div>
                <p className="item-kicker">{gallery.precinct}</p>
                <h2 className="item-title">{gallery.name}</h2>
                <p className="item-meta">{gallery.address}</p>
              </div>
              <Link className="text-link" href={`/gallery/${encodeURIComponent(gallery.slug)}`}>
                View profile
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-copy">No galleries match this map view.</p>
      )}
    </section>
  )
}
