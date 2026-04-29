import fs from 'node:fs'

function parseEnvValue(text, key) {
  const match = text.match(new RegExp(`${key}="([^"]+)"`))
  return match ? match[1] : ''
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCsv(csvText) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index]

    if (char === '"') {
      const nextChar = csvText[index + 1]

      if (inQuotes && nextChar === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }

      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell.trim())
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[index + 1] === '\n') {
        index += 1
      }

      row.push(cell.trim())
      cell = ''

      if (row.some((entry) => entry.length > 0)) {
        rows.push(row)
      }

      row = []
      continue
    }

    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim())
    if (row.some((entry) => entry.length > 0)) {
      rows.push(row)
    }
  }

  return rows
}

const envText = fs.readFileSync('.env.local', 'utf8')
const sheetUrl = parseEnvValue(envText, 'NEXT_PUBLIC_GALLERIES_SHEET_URL')
const supabaseUrl = parseEnvValue(envText, 'NEXT_PUBLIC_SUPABASE_URL')
const serviceRoleKey = parseEnvValue(envText, 'SUPABASE_SERVICE_ROLE_KEY')

if (!sheetUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing required environment values.')
}

const csvText = await fetch(sheetUrl).then((response) => {
  if (!response.ok) {
    throw new Error(`Failed to fetch gallery sheet (${response.status})`)
  }

  return response.text()
})

const rows = parseCsv(csvText).slice(1)

const payload = rows
  .map((row) => {
    const name = row[0] || ''
    const location = row[1] || ''
    const website = row[2] || ''
    const slug = slugify(name)

    return {
      name,
      location,
      slug,
      precinct: location,
      suburb: location,
      website
    }
  })
  .filter((row) => row.name && row.slug)

const response = await fetch(`${supabaseUrl}/rest/v1/galleries?on_conflict=slug`, {
  method: 'POST',
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=representation'
  },
  body: JSON.stringify(payload)
})

if (!response.ok) {
  const errorText = await response.text()
  throw new Error(`Supabase sync failed (${response.status}): ${errorText}`)
}

const result = await response.json()
console.log(`Synced ${result.length} galleries to Supabase.`)
