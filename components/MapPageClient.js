'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import BackLinkButton from './BackLinkButton'
import FilterSlidersIcon from './icons/FilterSlidersIcon'
import SearchField from './SearchField'
import { formatDateRange, todayISOInSydney } from '../lib/utils/date'
import { filterExhibitions, filterMapGalleries, getPrecinctOptions } from '../lib/utils/filters'
import { getExhibitionSlug, getExhibitionStatus, getGalleryBySlug } from '../lib/utils/exhibitions'
import { serializeBounds, SYDNEY_CENTER, SYDNEY_DEFAULT_ZOOM } from '../lib/utils/map'
import { TIME_WINDOWS, getWindowLabel, isTimeWindow } from '../lib/utils/windows'

const LIST_SCROLL_STORAGE_KEY = 'saf_map_list_scroll'
const DETENT_ORDER = ['collapsed', 'half', 'full']
const MOBILE_COLLAPSED_HEIGHT = 72
const MOBILE_HALF_HEIGHT_RATIO = 0.52
const DRAG_SNAP_VELOCITY = 0.45
const TOP_OVERLAY_FALLBACK_BOTTOM = 72
// The map is a lens over the same time spine as What's On: 'galleries' shows all space pins,
// any time window shows that window's shows. One query (?when+?precinct), two lenses.
const MAP_WINDOW_OPTIONS = [
  { slug: 'galleries', label: 'Galleries' },
  ...TIME_WINDOWS.map((w) => ({ slug: w.slug, label: w.short }))
]

function bringLayerToFront(layer) {
  if (typeof layer?.bringToFront === 'function') {
    layer.bringToFront()
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

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
  root.className = 'map-popup-callout'

  const title = document.createElement('p')
  title.className = 'map-popup-title'
  title.textContent = gallery.name
  root.append(title)

  const meta = document.createElement('p')
  meta.className = 'map-popup-meta'
  meta.textContent = gallery.precinct || 'Unspecified precinct'
  root.append(meta)

  const link = document.createElement('a')
  link.className = 'map-popup-link'
  link.href = `/gallery/${encodeURIComponent(gallery.slug)}`
  link.textContent = 'View gallery'
  root.append(link)

  return root
}

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function createMarkerIcon(L, galleryName = '', selected = false) {
  const size = selected ? 12 : 10

  return L.divIcon({
    className: `map-dot-marker${selected ? ' is-selected' : ''}`,
    html: `<span class="map-dot-label">${escapeHtml(galleryName)}</span><span class="map-dot-node" style="--dot-size:${size}px"></span>`,
    iconSize: [152, 62],
    iconAnchor: [76, 62],
    popupAnchor: [0, -42]
  })
}

function createUserLocationIcon(L) {
  return L.divIcon({
    className: 'user-location-marker',
    html: '<span class="user-location-dot" aria-hidden="true"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
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

function isDesktopMapLayout() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
}

function getViewportHeight() {
  if (typeof window === 'undefined') {
    return 844
  }

  return window.visualViewport?.height || window.innerHeight || 844
}

function createDetentHeights(viewportHeight, topOverlayBottom = TOP_OVERLAY_FALLBACK_BOTTOM) {
  const collapsed = MOBILE_COLLAPSED_HEIGHT
  const overlayBottom = clamp(
    Math.round(topOverlayBottom),
    0,
    Math.max(0, Math.round(viewportHeight - 40))
  )
  const full = clamp(
    Math.round(viewportHeight - overlayBottom + 1),
    collapsed + 280,
    Math.round(viewportHeight)
  )
  const rawHalf = Math.round(viewportHeight * MOBILE_HALF_HEIGHT_RATIO)
  const half = clamp(rawHalf, collapsed + 140, full - 120)

  return { collapsed, half, full }
}

function canStartSelectionDrag(target) {
  if (!(target instanceof Element)) {
    return true
  }

  return !target.closest('a, button, input, select, textarea')
}

export default function MapPageClient({ galleries, exhibitions, initialFilters }) {
  const [search, setSearch] = useState(initialFilters.search)
  const [precinct, setPrecinct] = useState(initialFilters.precinct)
  const [when, setWhen] = useState(() => (isTimeWindow(initialFilters.when) ? initialFilters.when : 'galleries'))
  const [areaEnabled, setAreaEnabled] = useState(initialFilters.areaEnabled)
  const [viewportBounds, setViewportBounds] = useState(initialFilters.viewportBounds)
  const [mapView, setMapView] = useState(initialFilters.mapView)
  const [mapMoved, setMapMoved] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState(initialFilters.selectedSlug || null)
  const [mapError, setMapError] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sheetDetent, setSheetDetent] = useState(normalizeDetent(initialFilters.sheetDetent))
  const [detentHeights, setDetentHeights] = useState(() => createDetentHeights(844))
  const [sheetDragHeight, setSheetDragHeight] = useState(null)
  const [sheetIsDragging, setSheetIsDragging] = useState(false)
  const [isLocatingUser, setIsLocatingUser] = useState(false)
  const [hasUserLocation, setHasUserLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [selectionDragOffset, setSelectionDragOffset] = useState(0)
  const [selectionIsDragging, setSelectionIsDragging] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const clusterRef = useRef(null)
  const markerBySlugRef = useRef(new Map())
  const userLocationMarkerRef = useRef(null)
  const leafletRef = useRef(null)
  const topOverlayRef = useRef(null)
  const resultsScrollRef = useRef(null)
  const moveDebounceRef = useRef(null)
  const suppressNextMoveendRef = useRef(false)
  const initialMoveHandledRef = useRef(false)
  const sheetDragStateRef = useRef(null)
  const sheetDragMovedRef = useRef(false)
  const listTouchStateRef = useRef(null)
  const handleTouchDragActiveRef = useRef(false)
  const selectionDragStateRef = useRef(null)
  const selectionTouchDragActiveRef = useRef(false)

  const precinctOptions = useMemo(() => getPrecinctOptions(galleries), [galleries])
  const exhibitionMode = isTimeWindow(when)

  const baseFilteredGalleries = useMemo(
    () =>
      filterMapGalleries(galleries, {
        search: exhibitionMode ? '' : search,
        precinct,
        areaEnabled: false,
        viewportBounds: null
      }),
    [exhibitionMode, galleries, precinct, search]
  )

  const filteredGalleriesInViewport = useMemo(
    () =>
      filterMapGalleries(galleries, {
        search: exhibitionMode ? '' : search,
        precinct,
        areaEnabled: true,
        viewportBounds
      }),
    [exhibitionMode, galleries, precinct, search, viewportBounds]
  )

  const candidateGalleries = viewportBounds ? filteredGalleriesInViewport : baseFilteredGalleries

  const filteredExhibitions = useMemo(
    () =>
      exhibitionMode
        ? filterExhibitions(galleries, exhibitions, { search, precinct, when })
        : [],
    [exhibitionMode, exhibitions, galleries, precinct, search, when]
  )

  const resultGalleries = useMemo(() => {
    if (!exhibitionMode) {
      return candidateGalleries
    }

    const matchingGallerySlugs = new Set(filteredExhibitions.map((exhibition) => exhibition.gallerySlug))
    return candidateGalleries.filter((gallery) => matchingGallerySlugs.has(gallery.slug))
  }, [candidateGalleries, exhibitionMode, filteredExhibitions])

  const resultGallerySlugs = useMemo(
    () => new Set(resultGalleries.map((gallery) => gallery.slug)),
    [resultGalleries]
  )

  const resultExhibitions = useMemo(
    () =>
      exhibitionMode
        ? filteredExhibitions.filter((exhibition) => resultGallerySlugs.has(exhibition.gallerySlug))
        : [],
    [exhibitionMode, filteredExhibitions, resultGallerySlugs]
  )

  const selectedGallery = useMemo(
    () => resultGalleries.find((gallery) => gallery.slug === selectedSlug) || null,
    [resultGalleries, selectedSlug]
  )

  // Current + upcoming exhibitions for the selected gallery (shown inline in the selection card).
  const selectedGalleryExhibitions = useMemo(() => {
    if (!selectedGallery) {
      return []
    }
    const today = todayISOInSydney()
    return exhibitions
      .filter((exhibition) => exhibition.gallerySlug === selectedGallery.slug)
      .map((exhibition) => ({ exhibition, status: getExhibitionStatus(exhibition, today) }))
      .filter((row) => row.status === 'current' || row.status === 'upcoming')
      .sort((a, b) => (a.status === b.status ? 0 : a.status === 'current' ? -1 : 1))
  }, [exhibitions, selectedGallery])

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
        label: exhibitionMode ? getWindowLabel(when) : 'All galleries',
        removable: false
      })
    }

    return filters
  }, [areaEnabled, exhibitionMode, precinct, search, when])

  const resultsLabel = exhibitionMode ? 'Exhibitions' : 'Galleries'
  const activeSheetHeight = Math.round(sheetDragHeight ?? detentHeights[sheetDetent] ?? detentHeights.collapsed)
  const sheetIsPeeking = sheetDetent === 'collapsed' && activeSheetHeight > detentHeights.collapsed + 14
  const sheetInlineStyle = useMemo(
    () => ({
      height: `${activeSheetHeight}px`
    }),
    [activeSheetHeight]
  )
  const selectionInlineStyle = useMemo(
    () => ({
      transform: `translateY(${Math.max(0, selectionDragOffset)}px)`
    }),
    [selectionDragOffset]
  )

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

    if (exhibitionMode) {
      params.set('when', when)
    } else {
      params.delete('when')
    }
    // retire legacy status/opening params
    params.delete('status')
    params.delete('opening')

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
    exhibitionMode,
    mapView,
    pathname,
    precinct,
    router,
    search,
    searchParams,
    selectedSlug,
    sheetDetent,
    viewportBounds,
    when
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
    function handleViewportResize() {
      const overlayBottom =
        topOverlayRef.current?.getBoundingClientRect().bottom ?? TOP_OVERLAY_FALLBACK_BOTTOM
      const nextHeights = createDetentHeights(getViewportHeight(), overlayBottom)
      setDetentHeights(nextHeights)
      setSheetDragHeight((currentHeight) =>
        currentHeight === null ? null : clamp(currentHeight, nextHeights.collapsed, nextHeights.full)
      )
    }

    handleViewportResize()

    window.addEventListener('resize', handleViewportResize)
    window.visualViewport?.addEventListener('resize', handleViewportResize)

    return () => {
      window.removeEventListener('resize', handleViewportResize)
      window.visualViewport?.removeEventListener('resize', handleViewportResize)
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
          zoomControl: window.matchMedia('(min-width: 768px)').matches,
          scrollWheelZoom: true,
          wheelDebounceTime: 30,
          wheelPxPerZoomLevel: 90
        }).setView([mapView.lat, mapView.lng], mapView.zoom)

        if (!map.getPane('user-location-pane')) {
          const userLocationPane = map.createPane('user-location-pane')
          userLocationPane.style.zIndex = '900'
        }

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
            setViewportBounds(toBoundsObject(map.getBounds()))

            if (!initialMoveHandledRef.current) {
              initialMoveHandledRef.current = true
              return
            }

            if (suppressNextMoveendRef.current) {
              suppressNextMoveendRef.current = false
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
        icon: createMarkerIcon(L, gallery.name, gallery.slug === selectedSlug)
      })
      marker.options.galleryName = gallery.name

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
      marker.setIcon(createMarkerIcon(L, marker.options.galleryName, slug === selectedSlug))
    })

    bringLayerToFront(userLocationMarkerRef.current)
  }, [selectedSlug])

  useEffect(() => {
    if (selectedGallery) {
      return
    }

    setSelectionDragOffset(0)
    setSelectionIsDragging(false)
    selectionDragStateRef.current = null
    selectionTouchDragActiveRef.current = false
  }, [selectedGallery])

  useEffect(() => {
    return () => {
      if (moveDebounceRef.current) {
        clearTimeout(moveDebounceRef.current)
      }

      if (userLocationMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userLocationMarkerRef.current)
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
      userLocationMarkerRef.current = null
      leafletRef.current = null
      initialMoveHandledRef.current = false
      setHasUserLocation(false)
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
      return
    }

  }

  function selectWindow(slug) {
    setWhen(slug)
    setSelectedSlug(null)
  }

  function resetView() {
    if (!mapRef.current) {
      return
    }

    suppressNextMoveendRef.current = true
    mapRef.current.setView([SYDNEY_CENTER.lat, SYDNEY_CENTER.lng], SYDNEY_DEFAULT_ZOOM)
    setMapView({ lat: SYDNEY_CENTER.lat, lng: SYDNEY_CENTER.lng, zoom: SYDNEY_DEFAULT_ZOOM })
    setAreaEnabled(false)
    setViewportBounds(null)
    setMapMoved(false)
    setSelectedSlug(null)
    setLocationError('')
    setWhen('galleries')
  }

  function clearSelectedGallery() {
    setSelectedSlug(null)
    setSelectionDragOffset(0)
    setSelectionIsDragging(false)
    selectionDragStateRef.current = null
    selectionTouchDragActiveRef.current = false

    if (mapRef.current) {
      mapRef.current.closePopup()
    }
  }

  function centerOnUserLocation() {
    if (isLocatingUser) {
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Current location is not available on this device.')
      return
    }

    if (!mapRef.current || !leafletRef.current) {
      setLocationError('Map is still loading. Try again in a moment.')
      return
    }

    setIsLocatingUser(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setLocationError('Could not determine your current location.')
          setIsLocatingUser(false)
          return
        }

        const L = leafletRef.current
        const map = mapRef.current
        if (!L || !map) {
          setLocationError('Map is unavailable right now.')
          setIsLocatingUser(false)
          return
        }

        suppressNextMoveendRef.current = true
        map.setView([latitude, longitude], Math.max(map.getZoom(), 13), { animate: true })

        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLatLng([latitude, longitude])
          bringLayerToFront(userLocationMarkerRef.current)
        } else {
          userLocationMarkerRef.current = L.marker([latitude, longitude], {
            pane: 'user-location-pane',
            icon: createUserLocationIcon(L),
            zIndexOffset: 2000
          }).addTo(map)
          bringLayerToFront(userLocationMarkerRef.current)
        }

        setHasUserLocation(true)
        setFiltersOpen(false)
        setIsLocatingUser(false)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access was denied. Enable it in browser settings.')
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. Try again.')
        } else {
          setLocationError('Unable to get your current location.')
        }
        setIsLocatingUser(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  function beginSelectionDrag(startY, pointerId) {
    if (!selectedGallery || isDesktopMapLayout()) {
      return false
    }

    selectionDragStateRef.current = {
      pointerId,
      startY,
      lastY: startY,
      lastTime: performance.now(),
      velocityY: 0,
      moved: false
    }

    setSelectionIsDragging(true)
    return true
  }

  function updateSelectionDrag(nextY) {
    const dragState = selectionDragStateRef.current
    if (!dragState) {
      return false
    }

    const now = performance.now()
    const deltaTime = Math.max(1, now - dragState.lastTime)
    const deltaY = nextY - dragState.lastY

    dragState.velocityY = deltaY / deltaTime
    dragState.lastY = nextY
    dragState.lastTime = now

    const offset = Math.max(0, nextY - dragState.startY)
    dragState.moved = offset > 4
    setSelectionDragOffset(offset)
    return true
  }

  function endSelectionDrag() {
    const dragState = selectionDragStateRef.current
    if (!dragState) {
      return
    }

    const shouldDismiss = selectionDragOffset > 84 || dragState.velocityY > 0.45

    if (shouldDismiss) {
      clearSelectedGallery()
      return
    }

    setSelectionDragOffset(0)
    setSelectionIsDragging(false)
    selectionDragStateRef.current = null
    selectionTouchDragActiveRef.current = false
  }

  function handleSelectionPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
      return
    }

    if (!canStartSelectionDrag(event.target)) {
      return
    }

    if (!beginSelectionDrag(event.clientY, event.pointerId)) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleSelectionPointerMove(event) {
    const dragState = selectionDragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    updateSelectionDrag(event.clientY)
  }

  function handleSelectionPointerUp(event) {
    const dragState = selectionDragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    updateSelectionDrag(event.clientY)
    endSelectionDrag()
  }

  function handleSelectionPointerCancel(event) {
    if (
      event?.currentTarget &&
      event.pointerId !== undefined &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (!selectionDragStateRef.current) {
      return
    }

    setSelectionDragOffset(0)
    setSelectionIsDragging(false)
    selectionDragStateRef.current = null
    selectionTouchDragActiveRef.current = false
  }

  function handleSelectionTouchStart(event) {
    const touch = event.touches[0]
    if (!touch) {
      return
    }

    if (!canStartSelectionDrag(event.target)) {
      return
    }

    if (!beginSelectionDrag(touch.clientY, null)) {
      return
    }

    selectionTouchDragActiveRef.current = true
  }

  function handleSelectionTouchMove(event) {
    if (!selectionTouchDragActiveRef.current) {
      return
    }

    const touch = event.touches[0]
    if (!touch) {
      return
    }

    if (updateSelectionDrag(touch.clientY)) {
      event.preventDefault()
    }
  }

  function handleSelectionTouchEnd() {
    if (!selectionTouchDragActiveRef.current) {
      return
    }

    endSelectionDrag()
  }

  function handleSelectionTouchCancel() {
    if (!selectionTouchDragActiveRef.current) {
      return
    }

    setSelectionDragOffset(0)
    setSelectionIsDragging(false)
    selectionDragStateRef.current = null
    selectionTouchDragActiveRef.current = false
  }

  function getNearestDetentFromHeight(height, velocityY = 0) {
    const projectedHeight = height - velocityY * 180
    let nearestDetent = 'collapsed'
    let nearestDelta = Infinity

    DETENT_ORDER.forEach((detentKey) => {
      const delta = Math.abs(detentHeights[detentKey] - projectedHeight)
      if (delta < nearestDelta) {
        nearestDelta = delta
        nearestDetent = detentKey
      }
    })

    return nearestDetent
  }

  function beginSheetDrag(startY, pointerId, source = 'handle') {
    if (isDesktopMapLayout()) {
      return false
    }

    const startingHeight = sheetDragHeight ?? detentHeights[sheetDetent] ?? detentHeights.collapsed

    sheetDragStateRef.current = {
      pointerId,
      source,
      startY,
      lastY: startY,
      lastTime: performance.now(),
      velocityY: 0,
      startHeight: startingHeight,
      startDetent: sheetDetent,
      moved: false
    }

    sheetDragMovedRef.current = false
    setSheetIsDragging(true)
    setSheetDragHeight(startingHeight)
    return true
  }

  function updateSheetDrag(nextY) {
    const dragState = sheetDragStateRef.current
    if (!dragState) {
      return false
    }

    const now = performance.now()
    const deltaTime = Math.max(1, now - dragState.lastTime)
    const deltaY = nextY - dragState.lastY

    dragState.velocityY = deltaY / deltaTime
    dragState.lastY = nextY
    dragState.lastTime = now

    const dragDelta = dragState.startY - nextY
    const nextHeight = clamp(
      dragState.startHeight + dragDelta,
      detentHeights.collapsed,
      detentHeights.full
    )

    if (Math.abs(dragDelta) > 4) {
      dragState.moved = true
      sheetDragMovedRef.current = true
    }

    setSheetDragHeight(nextHeight)
    return true
  }

  function endSheetDrag() {
    const dragState = sheetDragStateRef.current
    if (!dragState) {
      return false
    }

    const dragDistance = dragState.startY - dragState.lastY
    const finalHeight = clamp(
      dragState.startHeight + (dragState.startY - dragState.lastY),
      detentHeights.collapsed,
      detentHeights.full
    )

    let nextDetent = dragState.startDetent || sheetDetent

    if (dragState.startDetent === 'collapsed') {
      nextDetent = dragDistance > 8 ? 'half' : 'collapsed'
    } else if (dragState.startDetent === 'full' && dragDistance < -8) {
      nextDetent = 'collapsed'
    } else if (dragState.startDetent === 'half' && dragDistance < -8) {
      nextDetent = 'collapsed'
    } else {
      nextDetent = getNearestDetentFromHeight(finalHeight, dragState.velocityY)

      if (Math.abs(dragState.velocityY) >= DRAG_SNAP_VELOCITY) {
        const direction = dragState.velocityY < 0 ? 1 : -1
        nextDetent = getNextDetent(nextDetent, direction)
      }
    }

    setSheetDetent(nextDetent)
    setSheetDragHeight(null)
    setSheetIsDragging(false)
    sheetDragStateRef.current = null

    return dragState.moved
  }

  function handleSheetPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
      return
    }

    const dragStarted = beginSheetDrag(event.clientY, event.pointerId)
    if (!dragStarted) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleSheetTouchStart(event) {
    const touch = event.touches[0]
    if (!touch) {
      return
    }

    if (sheetDragStateRef.current && sheetDragStateRef.current.source !== 'list') {
      return
    }

    const dragStarted = beginSheetDrag(touch.clientY, null, 'handle-touch')
    if (!dragStarted) {
      return
    }

    handleTouchDragActiveRef.current = true
  }

  function handleSheetTouchMove(event) {
    if (!handleTouchDragActiveRef.current) {
      return
    }

    const touch = event.touches[0]
    if (!touch) {
      return
    }

    if (updateSheetDrag(touch.clientY)) {
      event.preventDefault()
    }
  }

  function handleSheetTouchEnd() {
    if (!handleTouchDragActiveRef.current) {
      return
    }

    sheetDragMovedRef.current = endSheetDrag()
    handleTouchDragActiveRef.current = false
  }

  function handleSheetTouchCancel() {
    if (!handleTouchDragActiveRef.current) {
      return
    }

    handleSheetPointerCancel()
    handleTouchDragActiveRef.current = false
  }

  function handleSheetPointerMove(event) {
    const dragState = sheetDragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    updateSheetDrag(event.clientY)
  }

  function handleSheetPointerUp(event) {
    const dragState = sheetDragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    updateSheetDrag(event.clientY)
    sheetDragMovedRef.current = endSheetDrag()
  }

  function handleSheetPointerCancel(event) {
    if (event?.currentTarget && event.pointerId !== undefined && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (!sheetDragStateRef.current) {
      return
    }

    setSheetDragHeight(null)
    setSheetIsDragging(false)
    sheetDragStateRef.current = null
    sheetDragMovedRef.current = false
    handleTouchDragActiveRef.current = false
  }

  function handleListTouchStart(event) {
    const touch = event.touches[0]
    if (!touch) {
      return
    }

    listTouchStateRef.current = {
      startY: touch.clientY,
      draggingSheet: false
    }
  }

  function handleListTouchMove(event) {
    const touch = event.touches[0]
    if (!touch) {
      return
    }

    const listTouchState = listTouchStateRef.current
    if (!listTouchState) {
      return
    }

    const scrollNode = event.currentTarget
    const delta = touch.clientY - listTouchState.startY

    if (sheetDetent === 'half' && delta < -8 && !sheetDragStateRef.current) {
      setSheetDetent('full')
      listTouchState.startY = touch.clientY
      event.preventDefault()
      return
    }

    const activeDrag = sheetDragStateRef.current
    const listDrivenDrag = activeDrag && activeDrag.source === 'list'

    if (!listDrivenDrag) {
      if (scrollNode.scrollTop > 0) {
        return
      }

      const draggingDown = delta > 14
      const draggingUp = delta < -14 && sheetDetent !== 'full'

      if (!draggingDown && !draggingUp) {
        return
      }

      const dragStarted = beginSheetDrag(touch.clientY, null, 'list')
      if (!dragStarted) {
        return
      }

      listTouchState.draggingSheet = true
    }

    if (updateSheetDrag(touch.clientY)) {
      event.preventDefault()
    }
  }

  function handleListTouchEnd() {
    if (sheetDragStateRef.current?.source === 'list') {
      sheetDragMovedRef.current = endSheetDrag()
    }

    listTouchStateRef.current = null
  }

  function handleResultsScroll(event) {
    const scrollTop = event.currentTarget.scrollTop
    persistResultsScroll(scrollTop)

    if (sheetDetent === 'half' && scrollTop > 0) {
      setSheetDetent('full')
    }
  }

  function handleResultsWheel(event) {
    if (sheetDetent === 'half' && event.deltaY > 0 && !sheetIsDragging) {
      setSheetDetent('full')
    }
  }

  function handleListTouchCancel() {
    if (sheetDragStateRef.current?.source === 'list') {
      handleSheetPointerCancel()
    }

    listTouchStateRef.current = null
  }

  if (mapError) {
    return (
      <section className="container section">
        <h1 className="u-page-title">Map unavailable</h1>
        <div className="empty-state">
          <p>The map failed to load right now.</p>
          <Link className="action-link" href="/galleries">
            Open gallery list view
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="map-page map-fullscreen" aria-label="Sydney gallery map">
      <div className="map-top-overlay" ref={topOverlayRef}>
        <div className="map-top-overlay__row">
          <span className="map-back">
            <BackLinkButton fallbackHref="/galleries" label="Back" />
          </span>
          <SearchField
            className="map-search-field"
            placeholder={exhibitionMode ? 'Search exhibitions' : 'Search galleries'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search map"
          />
          <button
            type="button"
            className="btn btn--icon map-filter-trigger"
            aria-label="Open filters"
            onClick={() => setFiltersOpen(true)}
          >
            <FilterSlidersIcon />
            <span className="visually-hidden">Filters</span>
          </button>
        </div>
        {/* Time spine, mirrored on the map: the same windows as What's On, as a lens over geography */}
        <nav className="map-window-bar" aria-label="Time window">
          {MAP_WINDOW_OPTIONS.map((option) => (
            <button
              key={option.slug}
              type="button"
              className={`text-tab${when === option.slug ? ' is-active' : ''}`}
              aria-pressed={when === option.slug}
              onClick={() => selectWindow(option.slug)}
            >
              {option.label}
            </button>
          ))}
        </nav>
      </div>

      {filtersOpen ? (
        <div className="scrim map-filter-scrim" role="presentation" onClick={() => setFiltersOpen(false)}>
          <section
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Map filters"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet__head">
              <h2>Map filters</h2>
              <button type="button" className="btn btn--text" onClick={() => setFiltersOpen(false)}>
                Close
              </button>
            </div>
            <div className="sheet__body">
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
                <button
                  type="button"
                  className="btn btn--text"
                  onClick={centerOnUserLocation}
                  disabled={isLocatingUser}
                >
                  {isLocatingUser ? 'Locating…' : 'Use current location'}
                </button>
                {areaEnabled ? (
                  <button type="button" className="btn btn--text" onClick={clearAreaFilter}>
                    Clear area filter
                  </button>
                ) : null}
                <button type="button" className="btn btn--text" onClick={resetView}>
                  Reset map view
                </button>
              </div>
              {locationError ? <p className="field-error">{locationError}</p> : null}
            </div>
          </section>
        </div>
      ) : null}

      <div className="map-canvas-full" ref={mapContainerRef} role="region" aria-label="Sydney gallery map" />

      <div className="map-locate-control">
        <button
          type="button"
          className={`map-locate-button${hasUserLocation ? ' is-active' : ''}`}
          aria-label="Use current location"
          onClick={centerOnUserLocation}
          disabled={isLocatingUser}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {mapMoved ? (
        <button
          type="button"
          className="map-search-area-button map-search-area-cta"
          onClick={applyCurrentViewport}
        >
          Search this area
        </button>
      ) : null}

      {selectedGallery ? (
        <article
          className={`map-selection-card map-selection-floating${selectionIsDragging ? ' is-dragging' : ''}`}
          style={selectionInlineStyle}
          aria-live="polite"
          onPointerDown={handleSelectionPointerDown}
          onPointerMove={handleSelectionPointerMove}
          onPointerUp={handleSelectionPointerUp}
          onPointerCancel={handleSelectionPointerCancel}
          onTouchStart={handleSelectionTouchStart}
          onTouchMove={handleSelectionTouchMove}
          onTouchEnd={handleSelectionTouchEnd}
          onTouchCancel={handleSelectionTouchCancel}
        >
          <div className="map-selection-grab-zone">
            <span className="map-selection-grab" aria-hidden="true" />
            <button
              type="button"
              className="map-selection-close"
              aria-label="Close gallery preview"
              onClick={clearSelectedGallery}
            >
              ×
            </button>
          </div>
          <h2 className="map-selection-name">{selectedGallery.name}</h2>
          <p className="map-selection-meta">
            {selectedGallery.precinct}
            {selectedGallery.suburb ? ` | ${selectedGallery.suburb}` : ''}
          </p>
          <p className="map-selection-meta">{selectedGallery.address}</p>

          {selectedGalleryExhibitions.length ? (
            <ul className="map-selection-shows">
              {selectedGalleryExhibitions.slice(0, 4).map(({ exhibition, status }) => (
                <li key={exhibition.id}>
                  <Link
                    className="map-selection-show"
                    href={`/exhibition/${encodeURIComponent(getExhibitionSlug(exhibition))}`}
                  >
                    <span className={`map-selection-show__status${status === 'current' ? ' is-current' : ''}`}>
                      {status === 'current' ? 'On now' : 'Opening soon'}
                    </span>
                    <span className="map-selection-show__title">{exhibition.title}</span>
                    <span className="map-selection-show__meta">
                      {formatDateRange(exhibition.startDate, exhibition.endDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="map-selection-empty">No current or upcoming exhibitions.</p>
          )}

          <Link className="btn btn--primary" href={`/gallery/${encodeURIComponent(selectedGallery.slug)}`}>
            View gallery
          </Link>
        </article>
      ) : null}

      <section
        className={`map-bottom-sheet detent-${sheetDetent}${sheetIsDragging ? ' is-dragging' : ''}${
          sheetIsPeeking ? ' is-peeking' : ''
        }`}
        style={sheetInlineStyle}
        aria-label="Map results"
      >
        <button
          type="button"
          className="map-sheet-handle"
          onPointerDown={handleSheetPointerDown}
          onPointerMove={handleSheetPointerMove}
          onPointerUp={handleSheetPointerUp}
          onPointerCancel={handleSheetPointerCancel}
          onTouchStart={handleSheetTouchStart}
          onTouchMove={handleSheetTouchMove}
          onTouchEnd={handleSheetTouchEnd}
          onTouchCancel={handleSheetTouchCancel}
          onClick={() => {
            if (sheetDragMovedRef.current) {
              sheetDragMovedRef.current = false
              return
            }

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
          onScroll={handleResultsScroll}
          onWheel={handleResultsWheel}
          onTouchStart={handleListTouchStart}
          onTouchMove={handleListTouchMove}
          onTouchEnd={handleListTouchEnd}
          onTouchCancel={handleListTouchCancel}
        >
          <div className="map-applied-row" aria-label="Applied filters">
            {activeFilters.map((filter) =>
              filter.removable ? (
                <button
                  key={filter.key}
                  type="button"
                  className="applied-token"
                  onClick={() => clearFilter(filter.key)}
                >
                  <span className="applied-token__label">{filter.label}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ) : (
                <span className="results-meta" key={filter.key}>
                  {filter.label}
                </span>
              )
            )}
          </div>

          {exhibitionMode && resultExhibitions.length ? (
            <ul className="map-sheet-list">
              {resultExhibitions.map((exhibition) => {
                const gallery = getGalleryBySlug(galleries, exhibition.gallerySlug)
                const galleryName = gallery?.name || exhibition.galleryName || 'Unknown gallery'
                const galleryLocation =
                  exhibition.location || gallery?.suburb || gallery?.precinct || 'Unspecified precinct'
                const exhibitionSlug = getExhibitionSlug(exhibition)

                return (
                  <li key={exhibition.id} className="map-sheet-item">
                    <Link
                      className="map-row"
                      href={`/exhibition/${encodeURIComponent(exhibitionSlug)}`}
                    >
                      <h2 className="map-row__title">{exhibition.title}</h2>
                      <p className="map-row__meta">{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
                      {exhibition.openingInformation ? (
                        <p className="map-row__meta">{exhibition.openingInformation}</p>
                      ) : null}
                      <p className="map-row__gallery">
                        <span>{galleryName}</span>
                        <span>{galleryLocation}</span>
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : !exhibitionMode && resultGalleries.length ? (
            <ul className="map-sheet-list">
              {resultGalleries.map((gallery) => (
                <li key={gallery.id} className={`map-sheet-item${selectedSlug === gallery.slug ? ' is-selected' : ''}`}>
                  <Link
                    className="map-row"
                    href={`/gallery/${encodeURIComponent(gallery.slug)}`}
                  >
                    <h2 className="map-row__name">{gallery.name}</h2>
                    <p className="map-row__meta">{gallery.precinct}</p>
                    <p className="map-row__meta">{gallery.address}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="map-empty-state">
              <p>
                {exhibitionMode ? 'No exhibitions match these filters.' : 'No galleries in this area.'}
              </p>
              <p className="results-meta">Try zooming out or clearing filters.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
