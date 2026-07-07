// Chromeless routes render their own chrome — no public header/footer/tabbar.
// Single source of truth, consumed by SiteNav AND SiteFooter (was duplicated in both).
export const CHROMELESS_ROUTE_RE = /^\/(dashboard|login|forgot-password|reset-password|console)/

export function isChromelessRoute(pathname) {
  return CHROMELESS_ROUTE_RE.test(pathname || '')
}
