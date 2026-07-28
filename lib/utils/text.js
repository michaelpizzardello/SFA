const SEARCH_FOLD_REPLACEMENTS = [
  [/[æǽǣ]/g, 'ae'],
  [/œ/g, 'oe'],
  [/[øö]/g, 'o'],
  [/ß/g, 'ss'],
  [/ł/g, 'l'],
  [/[đð]/g, 'd'],
  [/þ/g, 'th'],
  [/ŋ/g, 'ng'],
  [/ı/g, 'i']
]

export function foldSearchText(value = '') {
  let folded = String(value).normalize('NFKD').toLowerCase()

  SEARCH_FOLD_REPLACEMENTS.forEach(([pattern, replacement]) => {
    folded = folded.replace(pattern, replacement)
  })

  return folded.replace(/\p{Diacritic}/gu, '')
}
