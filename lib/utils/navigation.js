export function addReturnContext(href, returnHref, returnLabel) {
  if (!returnHref || !returnLabel) {
    return href
  }

  const params = new URLSearchParams()
  params.set('returnTo', returnHref)
  params.set('returnLabel', returnLabel)
  return `${href}?${params.toString()}`
}
