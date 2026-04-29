import { createHmac, timingSafeEqual } from 'node:crypto'

const ADMIN_COOKIE_NAME = 'saf-admin-session'

function toBuffer(value) {
  return Buffer.from(String(value || ''), 'utf8')
}

function getAdminPassword() {
  return process.env.SAF_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || ''
}

function getSessionSecret() {
  return process.env.SAF_ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || 'saf-admin-dev-session-secret'
}

function buildSessionToken() {
  return createHmac('sha256', getSessionSecret()).update(getAdminPassword()).digest('hex')
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME
}

export function isValidAdminPassword(password) {
  const configuredPassword = getAdminPassword()

  if (!configuredPassword || !password) {
    return false
  }

  const configuredBuffer = toBuffer(configuredPassword)
  const incomingBuffer = toBuffer(password)

  if (configuredBuffer.length !== incomingBuffer.length) {
    return false
  }

  return timingSafeEqual(configuredBuffer, incomingBuffer)
}

export function getAdminSessionValue() {
  return buildSessionToken()
}

export function isAdminAuthenticated(cookieStore) {
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value

  if (!token) {
    return false
  }

  const expectedToken = buildSessionToken()
  const tokenBuffer = toBuffer(token)
  const expectedBuffer = toBuffer(expectedToken)

  if (tokenBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(tokenBuffer, expectedBuffer)
}
