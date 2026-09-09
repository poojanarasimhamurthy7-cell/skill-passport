/**
 * oauth.js — Real OAuth 2.0 PKCE redirect helpers for Google and Microsoft.
 *
 * HOW IT WORKS:
 *   1. generatePKCE()   — creates a cryptographic code_verifier + code_challenge
 *   2. redirectToGoogle / redirectToMicrosoft — redirects the browser to the real
 *      provider authorization endpoint. The user sees the REAL Google/Microsoft
 *      account chooser, selects their account, authenticates, and is redirected
 *      back to /auth/callback with a code.
 *   3. exchangeCode()   — exchanges the code for tokens via your backend.
 *
 * CONFIGURATION REQUIRED (add to .env):
 *   VITE_GOOGLE_CLIENT_ID      = your-google-client-id.apps.googleusercontent.com
 *   VITE_MICROSOFT_CLIENT_ID   = your-azure-app-client-id
 *   VITE_OAUTH_REDIRECT_URI    = http://localhost:5173/auth/callback  (or production URL)
 *
 * Until these are configured, the helpers return isConfigured: false so the UI
 * can show a clear "needs setup" state instead of pretending to authenticate.
 */

/* ── PKCE helpers ─────────────────────────────────────────────── */
function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function generatePKCE() {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32))
  const verifier = base64urlEncode(verifierBytes)
  const challengeBytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  )
  const challenge = base64urlEncode(challengeBytes)
  return { verifier, challenge }
}

function randomState() {
  return base64urlEncode(crypto.getRandomValues(new Uint8Array(16)))
}

/* ── Configuration check ──────────────────────────────────────── */
export function googleIsConfigured() {
  return !!(import.meta.env.VITE_GOOGLE_CLIENT_ID)
}

export function microsoftIsConfigured() {
  return !!(import.meta.env.VITE_MICROSOFT_CLIENT_ID)
}

const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/auth/callback`

/* ── Google OAuth 2.0 PKCE redirect ──────────────────────────── */
/**
 * Redirects the browser to Google's real account-selection and sign-in screen.
 * prompt=select_account forces the Google account chooser even when one account
 * is already signed in, so the user can pick the account they want.
 *
 * @param {string} role  — the SkillPassport role selected (student|recruiter|college|ministry)
 *                         Stored in sessionStorage so the callback can route correctly.
 */
export async function redirectToGoogle(role) {
  if (!googleIsConfigured()) return { isConfigured: false }

  const { verifier, challenge } = await generatePKCE()
  const state = randomState()

  // Persist PKCE verifier + role so the callback page can use them
  sessionStorage.setItem('sp_pkce_verifier', verifier)
  sessionStorage.setItem('sp_oauth_state',   state)
  sessionStorage.setItem('sp_oauth_role',    role)
  sessionStorage.setItem('sp_oauth_provider','google')

  const params = new URLSearchParams({
    client_id:             import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri:          REDIRECT_URI,
    response_type:         'code',
    scope:                 'openid email profile',
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    state,
    prompt:                'select_account',  // forces real Google account chooser
    access_type:           'online',
  })

  // This redirects the browser — the user sees the REAL Google account selector
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return { isConfigured: true }
}

/* ── Microsoft OAuth 2.0 PKCE redirect ───────────────────────── */
/**
 * Redirects to Microsoft's real account-selection and sign-in experience.
 * Uses the /common endpoint so any Microsoft account (personal or work/school)
 * can sign in. prompt=select_account shows the account picker.
 */
export async function redirectToMicrosoft(role) {
  if (!microsoftIsConfigured()) return { isConfigured: false }

  const { verifier, challenge } = await generatePKCE()
  const state = randomState()

  sessionStorage.setItem('sp_pkce_verifier', verifier)
  sessionStorage.setItem('sp_oauth_state',   state)
  sessionStorage.setItem('sp_oauth_role',    role)
  sessionStorage.setItem('sp_oauth_provider','microsoft')

  const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'

  const params = new URLSearchParams({
    client_id:             import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    redirect_uri:          REDIRECT_URI,
    response_type:         'code',
    scope:                 'openid email profile User.Read',
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    state,
    prompt:                'select_account',  // forces real Microsoft account picker
    response_mode:         'query',
  })

  // This redirects the browser — the user sees the REAL Microsoft account selector
  window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`
  return { isConfigured: true }
}

/* ── OAuth callback handler ───────────────────────────────────── */
/**
 * Call this on the /auth/callback route to complete the OAuth flow.
 * Returns { success, role, provider, code, error }
 */
export function handleOAuthCallback() {
  const params   = new URLSearchParams(window.location.search)
  const code     = params.get('code')
  const state    = params.get('state')
  const error    = params.get('error')
  const errDesc  = params.get('error_description')

  const savedState    = sessionStorage.getItem('sp_oauth_state')
  const role          = sessionStorage.getItem('sp_oauth_role')
  const provider      = sessionStorage.getItem('sp_oauth_provider')

  // Clean up sessionStorage
  sessionStorage.removeItem('sp_pkce_verifier')
  sessionStorage.removeItem('sp_oauth_state')
  sessionStorage.removeItem('sp_oauth_role')
  sessionStorage.removeItem('sp_oauth_provider')

  if (error) return { success: false, error, errorDescription: errDesc }
  if (state !== savedState) return { success: false, error: 'state_mismatch' }
  if (!code) return { success: false, error: 'no_code' }

  // NOTE: The code must be exchanged for tokens on your backend (never in the browser)
  // to keep the client_secret secure. Wire up /api/auth/callback on your server.
  return { success: true, code, role, provider }
}
