import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, GraduationCap, BookOpen,
  Zap, ArrowRight, CheckCircle2, Shield, BarChart3, Building2,
  X, ExternalLink
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth }  from '../context/AuthContext'
import { Sun, Moon } from 'lucide-react'
import AuthLeftPanel from '../components/AuthLeftPanel'
import { redirectToGoogle, redirectToMicrosoft } from '../utils/oauth'

const STEPS = ['Basic Info', 'Education', 'Skills', 'Contact & Links', 'Privacy', 'Review']

/* ── Mini passport preview card (left panel) ─────────────── */
function PassportPreview({ form, step }) {
  const initials = form.name
    ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <div className="relative w-72 mx-auto" style={{ perspective: '800px' }}>
      {/* Glow */}
      <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30 bg-gradient-to-br from-orange-500 to-amber-500 scale-90"/>

      <div
        className="relative rounded-3xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-white/10 p-6 shadow-2xl animate-float"
        style={{ transform: 'rotateX(4deg) rotateY(-4deg)' }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Zap size={12} className="text-white"/>
            </div>
            <span className="text-white font-bold text-xs">SkillPassport</span>
          </div>
          <span className="text-orange-400 text-xs font-mono">SP-2026</span>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 flex items-center justify-center shrink-0">
            <span className="text-orange-300 font-black text-base">{initials}</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              {form.name || 'Your Name'}
            </p>
            <p className="text-gray-400 text-xs">
              {form.course && form.branch
                ? `${form.course} · ${form.branch}`
                : form.college || 'Your College'}
            </p>
          </div>
        </div>

        {/* Step progress */}
        <div className="space-y-1.5 mb-4">
          {[
            { label: 'Basic Info',     done: step >= 0 },
            { label: 'Education',      done: step >= 1 },
            { label: 'Create Account', done: step >= 2 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={[
                'w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all',
                s.done ? 'bg-orange-500' : 'bg-white/10 border border-white/20',
              ].join(' ')}>
                {s.done && <CheckCircle2 size={10} className="text-white"/>}
              </div>
              <span className={`text-xs ${s.done ? 'text-white font-medium' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Benefits footer */}
        <div className="border-t border-white/8 pt-3 space-y-1.5">
          {[
            'Prove your skills with real evidence',
            'Share your verified passport',
            'Stand out to recruiters',
            'Own your professional identity',
          ].map((b, i) => (
            <p key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
              <CheckCircle2 size={10} className="text-orange-400 shrink-0"/> {b}
            </p>
          ))}
        </div>
      </div>

      {/* Floating dots */}
      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-orange-400/60 blur-sm animate-pulse"/>
      <div className="absolute -bottom-3 -left-3 w-5 h-5 rounded-full bg-amber-400/40 blur-sm animate-pulse" style={{ animationDelay: '0.8s' }}/>
    </div>
  )
}

/* ── Social buttons ───────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}
function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21">
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  )
}

/* ── OAuth not-configured modal (same as Login) ───────────── */
function OAuthModal({ provider, onClose }) {
  const cfg = {
    Google: {
      color: '#4285F4',
      docsUrl: 'https://developers.google.com/identity/protocols/oauth2',
      steps: [
        'Create a project in Google Cloud Console',
        'Enable the Google OAuth 2.0 API',
        'Create OAuth credentials (Web application)',
        'Add your domain to Authorised JavaScript origins',
        'Add /auth/google/callback to Authorised redirect URIs',
        'Add VITE_GOOGLE_CLIENT_ID to your .env file',
        'Implement the server-side token exchange endpoint',
      ],
    },
    Microsoft: {
      color: '#00a4ef',
      docsUrl: 'https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app',
      steps: [
        'Register an application in Microsoft Entra (Azure AD)',
        'Add a Web platform with your redirect URI',
        'Enable openid, email, profile scopes',
        'Copy the Application (client) ID',
        'Add VITE_MICROSOFT_CLIENT_ID to your .env file',
        'Implement the MSAL token acquisition flow',
        'Add the server-side /auth/microsoft/callback endpoint',
      ],
    },
  }
  const c = cfg[provider]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#1e293b] border border-white/8 rounded-2xl shadow-2xl p-7 max-h-[90vh] overflow-y-auto"
        style={{ animation: 'slideUp 0.25s ease both' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-bold text-white text-base">{provider} Sign-In</p>
            <p className="text-xs text-red-400 font-semibold mt-0.5">Integration not configured</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={16}/>
          </button>
        </div>
        <div className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 mb-5">
          <p className="text-sm text-red-300 leading-relaxed">
            {provider} OAuth is <strong>not yet configured</strong>. A developer must complete the steps below.
            SkillPassport will <strong>not create a fake account</strong> without real authentication.
          </p>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Configuration steps</p>
        <ol className="mb-5 pl-5 space-y-1.5">
          {c.steps.map((s, i) => <li key={i} className="text-sm text-gray-300">{s}</li>)}
        </ol>
        <a href={c.docsUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 transition-opacity hover:opacity-80"
          style={{ color: c.color }}>
          <ExternalLink size={13}/> View {provider} OAuth docs
        </a>
        <button onClick={onClose}
          className="block w-full mt-3 py-3 rounded-xl bg-white/5 border border-white/8 text-gray-400 text-sm font-semibold hover:bg-white/9 transition-all">
          Close — use email signup instead
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── */
export default function Signup() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const { loginStudent } = useAuth()

  const [step, setStep] = useState(0)
  const [show, setShow] = useState(false)
  const [oauthProvider, setOauthProvider] = useState(null)
  const [oauthLoading, setOauthLoading] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    college: '', course: '', branch: '', year: '', gradYear: '', discipline: '',
    password: '', confirm: '',
  })

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const next = e => {
    e.preventDefault()
    if (step < 2) { setStep(s => s + 1); return }
    loginStudent(form.email, form.name || 'Student')
    navigate('/app')
  }

  const handleOAuth = async (provider) => {
    setOauthLoading(provider)
    try {
      const fn = provider === 'Google' ? redirectToGoogle : redirectToMicrosoft
      const result = await fn('student') // signup defaults to student role
      if (!result.isConfigured) {
        setOauthLoading(null)
        // Show inline — no fake account creation
        alert(
          `${provider} OAuth is not yet configured.\n\n` +
          `Add VITE_${provider.toUpperCase()}_CLIENT_ID to your .env file.`
        )
      }
    } catch {
      setOauthLoading(null)
    }
  }

  const pwStrength = (() => {
    const p = form.password
    if (!p) return 0
    if (p.length >= 12 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^a-zA-Z0-9]/.test(p)) return 4
    if (p.length >= 10) return 3
    if (p.length >= 8)  return 2
    return 1
  })()

  const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-amber-400', 'bg-orange-400', 'bg-green-500']

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-[#0d0f14]' : 'bg-gray-50'}`}>
      {/* OAuth modal */}
      {/* ══ LEFT — shared visual (same as Login page) ══════ */}
      <AuthLeftPanel/>

      {/* ══ RIGHT — form panel ═══════════════════════════════ */}
      <div className={`flex-1 flex flex-col ${dark ? 'bg-[#0d0f14]' : 'bg-white'}`}>
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Zap size={15} className="text-white"/>
            </div>
            <span className={`font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>SkillPassport</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost p-2">
              {dark ? <Sun size={17} className="text-orange-400"/> : <Moon size={17} className="text-orange-600"/>}
            </button>
            <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Have an account?</span>
            <Link to="/login" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              Sign In →
            </Link>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md animate-slide-up">

            {/* Step indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className={`text-3xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {step === 0 && 'Create Your Passport'}
                  {step === 1 && 'Education Details'}
                  {step === 2 && 'Set Password'}
                </h1>
                <span className="text-xs text-gray-500 font-medium">
                  Step {step + 1} / 3
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                {step === 0 && "Let's start with the basics."}
                {step === 1 && 'Tell us about your academic background.'}
                {step === 2 && 'Secure your account with a strong password.'}
              </p>
              {/* Progress bar */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i}
                    className={[
                      'h-1 rounded-full transition-all duration-400',
                      i < step  ? 'flex-1 bg-orange-500' :
                      i === step ? 'flex-1 bg-orange-500' :
                                   'w-6 bg-white/10',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={next} className="space-y-4">

              {/* ── Step 0: Personal ── */}
              {step === 0 && (
                <>
                  <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                      <input name="name" required placeholder="Arjun Verma"
                        value={form.name} onChange={handle}
                        className="input pl-10"/>
                    </div>
                  </div>

                  <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                      <input name="email" type="email" required placeholder="you@college.edu"
                        value={form.email} onChange={handle}
                        className="input pl-10"/>
                    </div>
                  </div>

                  <div>
                    <label className="label">Phone Number</label>
                    <input name="phone" type="tel" placeholder="+91 98765 43210"
                      value={form.phone} onChange={handle}
                      className="input"/>
                  </div>

                  {/* Why this matters callout */}
                  <div className="p-3.5 rounded-2xl bg-orange-500/8 border border-orange-500/20">
                    <p className="text-xs font-semibold text-orange-400 mb-1.5">Why this matters?</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your basic information helps build your professional identity and makes
                      your SkillPassport credible to recruiters and colleges.
                    </p>
                  </div>
                </>
              )}

              {/* ── Step 1: Academic ── */}
              {step === 1 && (
                <>
                  <div>
                    <label className="label">College / University</label>
                    <div className="relative">
                      <GraduationCap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                      <input name="college" required placeholder="Greenfield Institute of Technology"
                        value={form.college} onChange={handle}
                        className="input pl-10"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Course</label>
                      <select name="course" required value={form.course} onChange={handle}
                        className="input">
                        <option value="">Select</option>
                        {['B.Tech','B.Sc','BCA','M.Tech','MCA','MBA','MBBS','BDS','B.Pharm'].map(c =>
                          <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label text-gray-400">Branch</label>
                      <input name="branch" required placeholder="CSE / IT / ECE"
                        value={form.branch} onChange={handle}
                        className="input bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-gray-400">Current Year</label>
                      <select name="year" required value={form.year} onChange={handle}
                        className="input bg-white/5 border-white/10 text-white focus:border-orange-500 [&>option]:bg-gray-900">
                        <option value="">Select</option>
                        {['1st Year','2nd Year','3rd Year','4th Year','5th Year'].map(y =>
                          <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label text-gray-400">Grad Year</label>
                      <select name="gradYear" required value={form.gradYear} onChange={handle}
                        className="input bg-white/5 border-white/10 text-white focus:border-orange-500 [&>option]:bg-gray-900">
                        <option value="">Select</option>
                        {[2025,2026,2027,2028,2029].map(y =>
                          <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label text-gray-400">Discipline</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {['IT / CS','Medical','Healthcare-Tech'].map(d => (
                        <label key={d}
                          className={[
                            'flex flex-col items-center gap-1.5 border rounded-xl py-3 text-xs font-semibold cursor-pointer transition-all',
                            form.discipline === d
                              ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                              : 'border-white/10 bg-white/3 text-gray-500 hover:border-orange-500/40 hover:text-gray-300',
                          ].join(' ')}>
                          <input type="radio" name="discipline" value={d} className="sr-only" onChange={handle}/>
                          <BookOpen size={14}/>
                          {d}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 2: Password ── */}
              {step === 2 && (
                <>
                  <div>
                    <label className="label text-gray-400">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                      <input name="password" type={show ? 'text' : 'password'} required
                        placeholder="Min 8 characters"
                        value={form.password} onChange={handle}
                        className="input pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500"/>
                      <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400 transition-colors">
                        {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {form.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i}
                              className={[
                                'h-1 flex-1 rounded-full transition-all duration-300',
                                i <= pwStrength ? STRENGTH_COLORS[pwStrength] : 'bg-white/10',
                              ].join(' ')}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Strength: <span className={
                            pwStrength >= 3 ? 'text-green-400' :
                            pwStrength === 2 ? 'text-orange-400' : 'text-red-400'
                          }>{STRENGTH_LABELS[pwStrength]}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label text-gray-400">Confirm Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                      <input name="confirm" type={show ? 'text' : 'password'} required
                        placeholder="Repeat password"
                        value={form.confirm} onChange={handle}
                        className="input pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-orange-500"/>
                    </div>
                    {form.confirm && form.confirm !== form.password && (
                      <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 text-sm text-gray-400 cursor-pointer select-none">
                    <input type="checkbox" required className="accent-orange-500 mt-0.5 shrink-0"/>
                    <span>I agree to the{' '}
                      <a href="#" className="text-orange-400 hover:underline">Terms</a> and{' '}
                      <a href="#" className="text-orange-400 hover:underline">Privacy Policy</a>
                    </span>
                  </label>

                  {/* Already have account */}
                  <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/4 border border-white/8 text-sm text-gray-400">
                    <Shield size={14} className="text-orange-400 shrink-0"/>
                    Already have an account?{' '}
                    <Link to="/login" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
                      Sign in →
                    </Link>
                  </div>
                </>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="flex-1 py-3.5 rounded-2xl border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/5 transition-all">
                    ← Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={step === 2 && form.confirm !== form.password}
                  className="btn-primary flex-1 justify-center py-3.5 text-base glow-orange disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step < 2 ? 'Continue' : 'Create Passport'} <ArrowRight size={17}/>
                </button>
              </div>
            </form>

            {/* Social sign-up — right panel, real OAuth redirect */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-px ${dark ? 'bg-white/8' : 'bg-gray-200'}`}/>
                <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>OR</span>
                <div className={`flex-1 h-px ${dark ? 'bg-white/8' : 'bg-gray-200'}`}/>
              </div>
              {[
                { icon: <GoogleIcon/>,    label: 'Continue with Google',    provider: 'Google'    },
                { icon: <MicrosoftIcon/>, label: 'Continue with Microsoft',  provider: 'Microsoft' },
              ].map(({ icon, label, provider }) => (
                <button
                  key={provider}
                  onClick={() => handleOAuth(provider)}
                  disabled={!!oauthLoading}
                  className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    dark
                      ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/8 hover:border-white/20'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                  } ${oauthLoading === provider ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {oauthLoading === provider
                    ? <span className="text-xs">Redirecting to {provider}…</span>
                    : <>{icon} {label}</>
                  }
                </button>
              ))}
            </div>

            <p className={`text-center text-sm mt-5 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
              Already registered?{' '}
              <Link to="/login" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
