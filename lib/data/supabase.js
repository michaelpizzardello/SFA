const ADMIN_IMAGE_BUCKET = 'exhibition-images'

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !serviceKey) {
    return null
  }

  return {
    url,
    serviceKey,
    anonKey: anonKey || ''
  }
}

function createHeaders(config, headers = {}, useAnonKey = false) {
  const key = useAnonKey && config.anonKey ? config.anonKey : config.serviceKey

  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...headers
  }
}

async function requestSupabase(path, options = {}) {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error('Supabase configuration is missing.')
  }

  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers: createHeaders(config, options.headers, options.useAnonKey),
    cache: 'no-store'
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${errorText}`)
  }

  return response
}

async function requestSupabaseJson(path, options = {}) {
  const response = await requestSupabase(path, options)

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function toNullableString(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function toNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function mapAdminRecordToRow(record) {
  return {
    id: record.id,
    slug: record.slug,
    week_start: record.weekStart,
    week_end: record.weekEnd,
    gallery_mode: record.galleryMode,
    gallery_slug: record.gallerySlug,
    gallery_name: record.galleryName,
    location: record.location || '',
    exhibition_name: record.exhibitionName,
    start_date: record.startDate,
    end_date: toNullableString(record.endDate),
    opening_information: record.openingInformation || '',
    image_url: record.imageUrl || '',
    rating: toNullableNumber(record.rating),
    featured: Boolean(record.featured),
    ongoing: Boolean(record.ongoing),
    artist: record.artist || '',
    summary: record.summary || '',
    cost: record.cost || 'Free',
    created_at: record.createdAt,
    updated_at: record.updatedAt
  }
}

function mapRowToAdminRecord(row) {
  return {
    id: row.id,
    slug: row.slug,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    galleryMode: row.gallery_mode,
    gallerySlug: row.gallery_slug,
    galleryName: row.gallery_name,
    location: row.location || '',
    exhibitionName: row.exhibition_name,
    startDate: row.start_date,
    endDate: row.end_date || '',
    openingInformation: row.opening_information || '',
    imageUrl: row.image_url || '',
    rating: row.rating,
    featured: Boolean(row.featured),
    ongoing: Boolean(row.ongoing),
    artist: row.artist || '',
    summary: row.summary || '',
    cost: row.cost || 'Free',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function encodePath(path) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function buildPublicStorageUrl(path) {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error('Supabase configuration is missing.')
  }

  return `${config.url}/storage/v1/object/public/${ADMIN_IMAGE_BUCKET}/${encodePath(path)}`
}

function getStoragePathFromPublicUrl(publicUrl) {
  const config = getSupabaseConfig()

  if (!config || !publicUrl) {
    return ''
  }

  const prefix = `${config.url}/storage/v1/object/public/${ADMIN_IMAGE_BUCKET}/`

  if (!publicUrl.startsWith(prefix)) {
    return ''
  }

  return decodeURIComponent(publicUrl.slice(prefix.length))
}

export async function loadSupabaseGalleries() {
  const rows = await requestSupabaseJson(
    '/rest/v1/galleries?select=id,slug,name,location,precinct,suburb,postcode,address,latitude,longitude,website,instagram,phone,email,opening_hours,about,logo_url,cover_url&hidden_by_admin=eq.false&order=name.asc'
  )

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    precinct: row.precinct || row.location || 'Unspecified',
    suburb: row.suburb || row.location || '',
    postcode: row.postcode || '',
    address: row.address || '',
    latitude: toNullableNumber(row.latitude),
    longitude: toNullableNumber(row.longitude),
    website: row.website || '',
    instagram: row.instagram || '',
    phone: row.phone || '',
    email: row.email || '',
    openingHours: Array.isArray(row.opening_hours) ? row.opening_hours : [],
    about: row.about || '',
    logoUrl: row.logo_url || '',
    coverUrl: row.cover_url || ''
  }))
}

export async function loadSupabaseAdminExhibitions() {
  const rows = await requestSupabaseJson(
    '/rest/v1/admin_exhibitions?select=*&order=week_start.desc,start_date.asc,created_at.desc'
  )

  return rows.map(mapRowToAdminRecord)
}

// Public site reads go through the public_exhibitions view, which enforces
// published AND NOT hidden_by_admin AND gallery not hidden. Drafts never leak.
export async function loadSupabasePublicExhibitions() {
  const rows = await requestSupabaseJson(
    '/rest/v1/public_exhibitions?select=*&order=start_date.asc'
  )

  return rows.map(mapRowToAdminRecord)
}

export async function loadSupabaseAdminExhibitionById(id) {
  const rows = await requestSupabaseJson(
    `/rest/v1/admin_exhibitions?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
  )

  if (!rows.length) {
    return null
  }

  return mapRowToAdminRecord(rows[0])
}

export async function insertSupabaseAdminExhibition(record) {
  const rows = await requestSupabaseJson('/rest/v1/admin_exhibitions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(mapAdminRecordToRow(record))
  })

  return mapRowToAdminRecord(rows[0])
}

export async function updateSupabaseAdminExhibition(id, record) {
  const rows = await requestSupabaseJson(`/rest/v1/admin_exhibitions?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(mapAdminRecordToRow(record))
  })

  if (!rows.length) {
    throw new Error('Exhibition not found.')
  }

  return mapRowToAdminRecord(rows[0])
}

export async function deleteSupabaseAdminExhibition(id) {
  await requestSupabase(`/rest/v1/admin_exhibitions?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal'
    }
  })
}

export async function uploadSupabaseAdminImage({ fileBuffer, contentType, filePath }) {
  await requestSupabase(`/storage/v1/object/${ADMIN_IMAGE_BUCKET}/${encodePath(filePath)}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'x-upsert': 'false'
    },
    body: fileBuffer
  })

  return buildPublicStorageUrl(filePath)
}

export async function deleteSupabaseAdminImage(publicUrl) {
  const filePath = getStoragePathFromPublicUrl(publicUrl)

  if (!filePath) {
    return
  }

  try {
    await requestSupabase(`/storage/v1/object/${ADMIN_IMAGE_BUCKET}/${encodePath(filePath)}`, {
      method: 'DELETE'
    })
  } catch (error) {
    if (String(error.message || '').includes('"Object not found"')) {
      return
    }

    throw error
  }
}
