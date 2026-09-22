const SUPABASE_FUNCTION_URL =
  import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
  'https://tzzzltezvwxrqgthglsu.supabase.co/functions/v1'

const AUTH_SESSION_URL = `${SUPABASE_FUNCTION_URL.replace(/\/$/, '')}/auth-session`
const STORAGE_KEY = 'badam-reserve.auth-session'

export interface Customer {
  id: string
  phone: string
  name: string | null
  email: string | null
  phone_verification_status: 'UNVERIFIED' | 'VERIFIED'
}

export interface AppSession {
  token: string
  expires_at: string
}

export interface AuthState {
  authenticated: boolean
  customer: Customer | null
  expires_at: string | null
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function getStoredSession(): AppSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as AppSession : null
  } catch {
    return null
  }
}

function saveSession(session: AppSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

async function api(path: string, init: RequestInit = {}) {
  return fetch(`${AUTH_SESSION_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

export async function completeMsg91Login(
  accessToken: string,
  phone: string,
): Promise<{ session: AppSession; customer: Customer }> {
  const response = await api('/login', {
    method: 'POST',
    body: JSON.stringify({
      accessToken,
      phone: normalizePhone(phone),
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.error || 'Authentication failed. Please try again.')
  }

  if (!body.session?.token || !body.customer?.id) {
    throw new Error('Authentication server returned an invalid session.')
  }

  saveSession(body.session)
  return { session: body.session, customer: body.customer }
}

export async function getCurrentSession(): Promise<AuthState> {
  const session = getStoredSession()
  if (!session?.token) {
    return { authenticated: false, customer: null, expires_at: null }
  }

  const response = await api('/session', {
    headers: { Authorization: `Bearer ${session.token}` },
  })

  if (!response.ok) {
    clearSession()
    return { authenticated: false, customer: null, expires_at: null }
  }

  const body = await response.json()
  return {
    authenticated: true,
    customer: body.customer,
    expires_at: body.expires_at,
  }
}

export async function logout(): Promise<void> {
  const session = getStoredSession()
  try {
    if (session?.token) {
      await api('/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      })
    }
  } finally {
    clearSession()
  }
}

export function getAuthToken(): string | null {
  return getStoredSession()?.token ?? null
}
