import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail, Lock, ArrowRight, Eye, EyeOff,
  GraduationCap, Building2, BarChart3, Shield,
  AlertTriangle, CheckCircle2, RefreshCw, Sun, Moon
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import AuthLeftPanel from '../components/AuthLeftPanel'
import { redirectToGoogle, redirectToMicrosoft } from '../utils/oauth'

/* ════════════════════════════════════════════════════════════════
   BRAND CONSTANTS — never change, both themes
════════════════════════════════════════════════════════════════ */
const ORANGE   = '#f97316'
const ORANGE_H = '#ea580c'
const BLOCKED  = ['gmail','yahoo','hotmail','outlook','rediff','icloud']

/* ════════════════════════════════════════════════════════════════
   ROLE TABS
════════════════════════════════════════════════════════════════ */
const ROLES = [
  { key: 'student',   Icon: GraduationCap, label: 'Student'   },
  { key: 'recruiter', Icon: Building2,     label: 'Recruiter' },
  { key: 'college',   Icon: BarChart3,     label: 'College'   },
  { key: 'ministry',  Icon: Shield,        label: 'Ministry'  },
]

/* ════════════════════════════════════════════════════════════════
   SOCIAL ICONS
════════════════════════════════════════════════════════════════ */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style={{flexShrink:0}}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}
function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true" style={{flexShrink:0}}>
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════
   MINI SPINNER
════════════════════════════════════════════════════════════════ */
function Spinner({ dark }) {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
      border: `2px solid ${dark ? 'rgba(255,255,255,0.25)' : 'rgba(249,115,22,0.25)'}`,
      borderTopColor: dark ? '#fff' : ORANGE,
      animation: 'sp-spin 0.7s linear infinite',
      flexShrink: 0,
    }}/>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAGIC TOKEN STEP
════════════════════════════════════════════════════════════════ */
function MagicStep({ email, onBack, T }) {
  const { requestMagicToken, verifyMagicToken, loginStudent } = useAuth()
  const navigate = useNavigate()

  const [phase,    setPhase]    = useState('idle')
  const [token,    setToken]    = useState('')
  const [devToken, setDevToken] = useState('')
  const [err,      setErr]      = useState('')
  const [resendCd, setResendCd] = useState(0)

  useEffect(() => {
    if (resendCd <= 0) return
    const id = setTimeout(() => setResendCd(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [resendCd])

  const send = useCallback(async () => {
    setPhase('sending'); setErr('')
    await new Promise(r => setTimeout(r, 700))
    const t = requestMagicToken(email)
    setDevToken(t); setPhase('sent'); setResendCd(30)
  }, [email, requestMagicToken])

  useEffect(() => { send() }, []) // eslint-disable-line

  const verify = async () => {
    setPhase('verifying'); setErr('')
    await new Promise(r => setTimeout(r, 600))
    if (verifyMagicToken(email, token.trim().toUpperCase())) {
      const name = email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, c => c.toUpperCase())
      loginStudent(email, name)
      navigate('/app')
    } else {
      setPhase('error')
      setErr('Incorrect token. Please check and try again.')
    }
  }

  return (
    <div style={{ animation: 'sp-up 0.35s ease both' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 600, color: T.sub,
        display: 'flex', alignItems: 'center', gap: 5,
        marginBottom: 18, padding: '4px 0',
      }}>
        ← Back to login
      </button>

      <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: T.text }}>
        Check your email
      </h2>
      <p style={{ margin: '0 0 22px', fontSize: 13, color: T.sub }}>
        {phase === 'sending'
          ? 'Sending verification token…'
          : <>We sent a one-time token to <strong style={{ color: ORANGE }}>{email}</strong></>}
      </p>

      {phase === 'sending' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `3px solid ${T.inpBorder}`,
            borderTopColor: ORANGE,
            animation: 'sp-spin 0.8s linear infinite',
          }}/>
        </div>
      )}

      {(phase === 'sent' || phase === 'verifying' || phase === 'error') && (
        <>
          {/* Dev token display */}
          <div style={{
            padding: '12px 14px', borderRadius: 11, marginBottom: 18,
            background: T.devBg, border: `1px solid ${T.devBorder}`,
          }}>
            <p style={{ margin: '0 0 5px', fontSize: 11, fontWeight: 700, color: T.devLabel,
              display: 'flex', alignItems: 'center', gap: 5 }}>
              <Shield size={11}/> Dev mode — token shown here (emailed in production)
            </p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: T.devToken, letterSpacing: '0.3em' }}>
              {devToken}
            </p>
          </div>

          <label style={T.lbl}>Enter verification token</label>
          <input
            value={token}
            onChange={e => { setToken(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')); setErr('') }}
            placeholder="A3X9KP2M"
            maxLength={8}
            autoComplete="one-time-code"
            inputMode="text"
            style={{
              ...T.inp,
              textAlign: 'center', fontSize: 20, fontWeight: 900, letterSpacing: '0.3em',
              borderColor: phase === 'error' ? '#ef4444' : T.inpBorder,
            }}
            onFocus={e => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)' }}
            onBlur={e  => { e.target.style.borderColor = phase==='error'?'#ef4444':T.inpBorder; e.target.style.boxShadow = 'none' }}
          />

          {err && (
            <p style={{ color: '#ef4444', fontSize: 12, marginTop: -10, marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={11}/> {err}
            </p>
          )}

          <button
            onClick={verify}
            disabled={token.length < 6 || phase === 'verifying'}
            className="sp-cta"
            style={{
              ...T.primary,
              opacity: token.length < 6 || phase === 'verifying' ? 0.5 : 1,
              cursor:  token.length < 6 || phase === 'verifying' ? 'not-allowed' : 'pointer',
              marginBottom: 0,
            }}
          >
            {phase === 'verifying'
              ? <><Spinner dark/> Verifying…</>
              : <><CheckCircle2 size={15}/> Verify &amp; Sign In</>}
          </button>

          <button
            onClick={send}
            disabled={resendCd > 0 || phase === 'sending'}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '10px', marginTop: 8,
              background: 'none', border: 'none', cursor: resendCd > 0 ? 'default' : 'pointer',
              fontSize: 13, fontWeight: 500,
              color: resendCd > 0 ? T.muted : ORANGE,
              transition: 'color 0.15s',
            }}
          >
            <RefreshCw size={13}/>
            {resendCd > 0 ? `Resend token in ${resendCd}s` : 'Resend token'}
          </button>
        </>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
════════════════════════════════════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate()
  const { loginRecruiter, loginRole, loginStudent } = useAuth()
  const { dark, toggle } = useTheme()

  /* ── Fully theme-reactive token object T ── */
  const T = {
    /* Page backgrounds — SAME gradient used by both left and right */
    pageBg: dark
      ? 'radial-gradient(ellipse at 60% 0%, rgba(249,115,22,0.16) 0%, #090d1a 40%, #060910 100%)'
      : 'radial-gradient(ellipse at 60% 0%, rgba(249,115,22,0.20) 0%, #fff7ed 38%, #fef3e2 70%, #fdfaf5 100%)',

    /* Card */
    card:       dark ? '#111827'              : '#ffffff',
    cardBorder: dark ? 'rgba(249,115,22,0.14)': 'rgba(249,115,22,0.18)',
    cardShadow: dark
      ? '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(249,115,22,0.08)'
      : '0 8px 40px rgba(249,115,22,0.10), 0 2px 12px rgba(0,0,0,0.06)',

    /* Typography */
    text:  dark ? '#f8fafc' : '#111827',
    sub:   dark ? '#94a3b8' : '#6b7280',
    muted: dark ? '#4b5563' : '#9ca3af',

    /* Inputs */
    inp: {
      width: '100%', boxSizing: 'border-box',
      padding: '13px 14px 13px 42px', borderRadius: 12,
      fontSize: 14, outline: 'none',
      fontFamily: 'Inter,system-ui,sans-serif',
      marginBottom: 14,
      transition: 'border-color 0.2s, box-shadow 0.2s',
      background: dark ? 'rgba(255,255,255,0.04)' : '#fdf6ee',
      color:      dark ? '#f8fafc'                : '#111827',
      border:     `1.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(249,115,22,0.20)'}`,
    },
    inpBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(249,115,22,0.20)',
    lbl: {
      display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7,
      color: dark ? '#cbd5e1' : '#374151',
    },

    /* Primary button */
    primary: {
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 9, padding: '15px 20px', borderRadius: 12,
      background: `linear-gradient(135deg,${ORANGE},${ORANGE_H})`,
      boxShadow: '0 6px 24px rgba(249,115,22,0.38)',
      color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
      transition: 'transform 0.15s, box-shadow 0.15s',
    },

    /* Social buttons */
    socialBg:     dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    socialBorder: dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.10)',
    socialText:   dark ? '#f1f5f9'                : '#111827',

    /* Tabs */
    tabBg:    dark ? 'rgba(255,255,255,0.03)' : 'rgba(249,115,22,0.06)',
    tabMuted: dark ? '#475569'                : '#9ca3af',

    /* OR divider */
    divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(249,115,22,0.18)',

    /* Passwordless info box */
    infoBoxBg:     dark ? 'rgba(249,115,22,0.07)' : 'rgba(249,115,22,0.06)',
    infoBoxBorder: 'rgba(249,115,22,0.22)',
    infoBoxText:   dark ? '#cbd5e1'               : '#374151',

    /* Error box */
    errBg:     dark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',
    errBorder: 'rgba(239,68,68,0.22)',
    errText:   dark ? '#f87171'              : '#dc2626',

    /* Dev token box (MagicStep) */
    devBg:     dark ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.06)',
    devBorder: dark ? 'rgba(249,115,22,0.2)'  : 'rgba(249,115,22,0.25)',
    devLabel:  dark ? '#fb923c'               : '#c2410c',
    devToken:  dark ? '#fdba74'               : '#ea580c',

    /* Theme toggle button */
    toggleBg:     dark ? 'rgba(255,255,255,0.06)' : 'rgba(249,115,22,0.08)',
    toggleBorder: dark ? 'rgba(255,255,255,0.1)'  : 'rgba(249,115,22,0.2)',
    toggleColor:  dark ? ORANGE                   : ORANGE_H,

    /* Ambient glow */
    ambientGlow: dark
      ? 'radial-gradient(circle,rgba(249,115,22,0.06) 0%,transparent 70%)'
      : 'radial-gradient(circle,rgba(249,115,22,0.10) 0%,transparent 70%)',
  }

  const [role,         setRole]         = useState('student')
  const [step,         setStep]         = useState('form')
  const [email,        setEmail]        = useState('')
  const [pw,           setPw]           = useState('')
  const [show,         setShow]         = useState(false)
  const [err,          setErr]          = useState('')
  const [vis,          setVis]          = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const [submitting,   setSubmitting]   = useState(false)

  useEffect(() => { const t = setTimeout(() => setVis(true), 40); return () => clearTimeout(t) }, [])

  const blocked = role === 'recruiter' && BLOCKED.some(d => email.toLowerCase().includes(`@${d}.`))

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (role === 'student') {
      if (!email.includes('@')) { setErr('Please enter a valid email address.'); return }
      setStep('magic'); return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 500))
    setSubmitting(false)
    if (role === 'recruiter') {
      if (blocked) { setErr('Personal email domains are not allowed.'); return }
      if (loginRecruiter(email, email.split('@')[0])) { navigate('/app'); return }
      setErr('Could not sign in. Please check your details.'); return
    }
    loginRole(role, role[0].toUpperCase() + role.slice(1) + ' User', email)
    navigate('/app')
  }

  const handleOAuth = async (provider) => {
    setOauthLoading(provider)
    try {
      const fn = provider === 'Google' ? redirectToGoogle : redirectToMicrosoft
      const result = await fn(role)
      if (!result.isConfigured) {
        setErr(
          `${provider} OAuth is not yet configured. ` +
          `Add VITE_${provider.toUpperCase()}_CLIENT_ID to your .env file ` +
          `and set up the redirect URI at ${window.location.origin}/auth/callback.`
        )
        setOauthLoading(null)
      }
    } catch {
      setErr(`Could not start ${provider} sign-in. Please try again.`)
      setOauthLoading(null)
    }
  }

  return (
    <>
      <style>{`
        @keyframes sp-spin  { to { transform: rotate(360deg); } }
        @keyframes sp-up    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sp-modal { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .sp-cta:hover   { transform:translateY(-2px) !important; box-shadow:0 10px 32px rgba(249,115,22,0.52) !important; }
        .sp-cta:active  { transform:scale(0.97) !important; }
        .sp-social:hover  { transform:translateY(-2px); }
        .sp-social:active { transform:scale(0.97); }
        .sp-tab:hover { opacity:1 !important; }
      `}</style>

      {/* ── Full-page wrapper — ONE unified background ── */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        background: T.pageBg,
        fontFamily: 'Inter,system-ui,sans-serif',
        overflow: 'hidden',
        transition: 'background 0.3s ease',
      }}>

        {/* ════ LEFT PANEL — role-specific cinematic SVG scene ════ */}
        {/* AuthLeftPanel manages its own bg internally, matching the same orange family */}
        <AuthLeftPanel role={role} vis={vis}/>

        {/* ════ RIGHT PANEL — authentication ════ */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 24px',
          position: 'relative',
          /* transparent — lets pageBg show through so the right side matches the left */
          background: 'transparent',
        }}>

          {/* Subtle ambient orb top-right */}
          <div style={{
            position: 'absolute', top: '10%', right: '8%',
            width: 340, height: 340, borderRadius: '50%',
            background: T.ambientGlow,
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}/>

          {/* Subtle ambient orb bottom-left */}
          <div style={{
            position: 'absolute', bottom: '8%', left: '4%',
            width: 220, height: 220, borderRadius: '50%',
            background: T.ambientGlow,
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}/>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle light/dark theme"
            style={{
              position: 'absolute', top: 18, right: 20, zIndex: 10,
              width: 38, height: 38, borderRadius: 11,
              background: T.toggleBg,
              border: `1px solid ${T.toggleBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: T.toggleColor,
              transition: 'background 0.2s',
            }}
          >
            {dark ? <Sun size={16}/> : <Moon size={16}/>}
          </button>

          {/* ── Authentication card ── */}
          <div style={{
            width: '100%', maxWidth: 460,
            position: 'relative', zIndex: 1,
            background: T.card,
            borderRadius: 22,
            border: `1px solid ${T.cardBorder}`,
            boxShadow: T.cardShadow,
            padding: '32px 30px 28px',
            animation: vis ? 'sp-up 0.45s 0.1s ease both' : 'none',
            opacity: vis ? undefined : 0,
            transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
          }}>

            {step === 'magic' ? (
              <MagicStep email={email} onBack={() => setStep('form')} T={T}/>
            ) : (
              <div style={{ animation: 'sp-up 0.3s ease both' }}>

                {/* Role tabs */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                  borderRadius: 14, overflow: 'hidden', marginBottom: 26,
                  background: T.tabBg,
                  border: `1px solid ${T.cardBorder}`,
                }}>
                  {ROLES.map(({ key, Icon, label }) => (
                    <button key={key}
                      onClick={() => { setRole(key); setErr('') }}
                      className="sp-tab"
                      style={{
                        position: 'relative',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 5,
                        padding: '13px 4px 11px',
                        fontSize: 12, fontWeight: 600,
                        color: role === key ? ORANGE : T.tabMuted,
                        background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'color 0.2s',
                        opacity: role === key ? 1 : 0.75,
                      }}
                    >
                      <Icon size={17}/>
                      <span>{label}</span>
                      {role === key && (
                        <span style={{
                          position: 'absolute', bottom: 0, left: '12%', right: '12%',
                          height: 2.5, borderRadius: 9999,
                          background: `linear-gradient(90deg,${ORANGE},${ORANGE_H})`,
                          animation: 'sp-up 0.18s ease both',
                        }}/>
                      )}
                    </button>
                  ))}
                </div>

                {/* Heading */}
                <h1 style={{ margin: '0 0 5px', fontSize: 26, fontWeight: 900, color: T.text,
                  transition: 'color 0.3s' }}>
                  Welcome back
                </h1>
                <p style={{ margin: '0 0 22px', fontSize: 13.5, color: T.sub,
                  transition: 'color 0.3s' }}>
                  Sign in to your SkillPassport portal
                </p>

                <form onSubmit={submit}>
                  {/* Email */}
                  <label style={T.lbl}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{
                      position: 'absolute', left: 13, top: '50%',
                      transform: 'translateY(-50%)',
                      color: T.muted, pointerEvents: 'none',
                    }}/>
                    <input
                      type="email" required
                      placeholder={role === 'recruiter' ? 'hr@company.com' : 'you@college.edu'}
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErr('') }}
                      style={{
                        ...T.inp,
                        borderColor: blocked ? '#ef4444' : T.inpBorder,
                        paddingLeft: 42,
                      }}
                      onFocus={e => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.14)' }}
                      onBlur={e  => { e.target.style.borderColor = blocked ? '#ef4444' : T.inpBorder; e.target.style.boxShadow = 'none' }}
                    />
                  </div>

                  {blocked && (
                    <p style={{ color: '#ef4444', fontSize: 12, marginTop: -10, marginBottom: 12,
                      display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={11}/> Personal email domains are not allowed for recruiter accounts.
                    </p>
                  )}

                  {/* Password — non-student */}
                  {role !== 'student' && (
                    <>
                      <label style={T.lbl}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} style={{
                          position: 'absolute', left: 13, top: '50%',
                          transform: 'translateY(-50%)',
                          color: T.muted, pointerEvents: 'none',
                        }}/>
                        <input
                          type={show ? 'text' : 'password'} required
                          placeholder="••••••••"
                          value={pw}
                          onChange={e => setPw(e.target.value)}
                          style={{ ...T.inp, paddingLeft: 42, paddingRight: 44 }}
                          onFocus={e => { e.target.style.borderColor = ORANGE; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.14)' }}
                          onBlur={e  => { e.target.style.borderColor = T.inpBorder; e.target.style.boxShadow = 'none' }}
                        />
                        <button type="button" onClick={() => setShow(s => !s)}
                          style={{
                            position: 'absolute', right: 13, top: '50%',
                            transform: 'translateY(-50%)',
                            color: T.muted, background: 'none', border: 'none',
                            cursor: 'pointer', padding: 0,
                          }}>
                          {show
                            ? <EyeOff size={15}/>
                            : <Eye size={15}/>}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Passwordless info — student */}
                  {role === 'student' && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 11,
                      padding: '12px 15px', borderRadius: 12, marginBottom: 16,
                      background: T.infoBoxBg,
                      border: `1px solid ${T.infoBoxBorder}`,
                    }}>
                      <Lock size={14} style={{ color: ORANGE, marginTop: 2, flexShrink: 0 }}/>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: T.infoBoxText }}>
                        <strong style={{ color: ORANGE }}>Passwordless login:</strong>{' '}
                        A one-time token will be sent to your email to verify your identity.
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {err && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      padding: '11px 13px', borderRadius: 11, marginBottom: 14,
                      fontSize: 13, lineHeight: 1.5,
                      background: T.errBg,
                      border: `1px solid ${T.errBorder}`,
                      color: T.errText,
                    }}>
                      <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }}/> {err}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={blocked || submitting}
                    className="sp-cta"
                    style={{
                      ...T.primary,
                      opacity: blocked || submitting ? 0.45 : 1,
                      cursor:  blocked || submitting ? 'not-allowed' : 'pointer',
                      marginBottom: 0,
                    }}
                  >
                    {submitting
                      ? <><Spinner dark/> Signing in…</>
                      : <>Continue with Email <ArrowRight size={17}/></>}
                  </button>
                </form>

                {/* OR divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                  <div style={{ flex: 1, height: 1, background: T.divider }}/>
                  <span style={{ fontSize: 12, color: T.sub, fontWeight: 500 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: T.divider }}/>
                </div>

                {/* Social buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { provider: 'Google',    Icon: GoogleIcon    },
                    { provider: 'Microsoft', Icon: MicrosoftIcon },
                  ].map(({ provider, Icon }) => (
                    <button
                      key={provider}
                      onClick={() => handleOAuth(provider)}
                      disabled={!!oauthLoading}
                      className="sp-social"
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 11, padding: '13px 18px', borderRadius: 12,
                        background: T.socialBg,
                        border: `1.5px solid ${T.socialBorder}`,
                        color: T.socialText,
                        fontWeight: 600, fontSize: 14,
                        cursor: oauthLoading ? 'wait' : 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s, background 0.2s',
                        opacity: oauthLoading === provider ? 0.65 : 1,
                        boxShadow: dark
                          ? '0 2px 8px rgba(0,0,0,0.25)'
                          : '0 1px 4px rgba(0,0,0,0.06)',
                      }}
                    >
                      {oauthLoading === provider
                        ? <><Spinner dark={dark}/> <span>Redirecting…</span></>
                        : <><Icon/> Continue with {provider}</>}
                    </button>
                  ))}
                </div>

                {/* Sign up link */}
                <p style={{ textAlign: 'center', margin: '20px 0 0', fontSize: 13, color: T.sub }}>
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    style={{ color: ORANGE, fontWeight: 600, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = ORANGE_H}
                    onMouseLeave={e => e.currentTarget.style.color = ORANGE}
                  >
                    Create Passport →
                  </Link>
                </p>

              </div>
            )}
          </div>
          {/* end card */}

        </div>
        {/* end right panel */}

      </div>
      {/* end page */}
    </>
  )
}
