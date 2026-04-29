function formatSheetShortDate(value) {
  if (!value) {
    return ''
  }

  const [year, month, day] = String(value).split('-')

  if (!year || !month || !day) {
    return ''
  }

  return `${day}/${month}`
}

function formatSheetFullDate(value) {
  if (!value) {
    return ''
  }

  const [year, month, day] = String(value).split('-')

  if (!year || !month || !day) {
    return ''
  }

  return `${Number(month)}/${Number(day)}/${year}`
}

function escapeCsvValue(value) {
  const normalized = String(value ?? '')

  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }

  return normalized
}

export function buildFeaturedExportRow(record) {
  const row = new Array(28).fill('')

  row[1] = record.galleryName || ''
  row[2] = record.location || ''
  row[3] = record.exhibitionName || ''
  row[4] = formatSheetShortDate(record.startDate)
  row[5] = formatSheetShortDate(record.endDate)
  row[6] = record.openingInformation || ''
  row[8] = record.featured ? 'TRUE' : 'FALSE'
  row[9] = record.ongoing ? 'TRUE' : 'FALSE'
  row[10] = formatSheetFullDate(record.startDate)
  row[11] = formatSheetFullDate(record.endDate)

  return row
}

export function buildFeaturedExportCsv(records) {
  return records.map((record) => buildFeaturedExportRow(record).map(escapeCsvValue).join(',')).join('\r\n')
}
