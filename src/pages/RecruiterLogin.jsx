import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Shield, Building2, AlertTriangle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const COMPANIES = ['Dabur', 'Wipro', 'TCS', 'Infosys', 'Zomato', 'BYJU\'S', 'Practo', 'Apollo Hospitals']

export default function RecruiterLogin() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const blocked = ['gmail', 'yahoo', 'hotmail', 'outlook', 'rediff']
  const isBlocked = email && blocked.some(d => email.toLowerCase().includes(`@${d}`))

  const handleSubmit = e => {
    e.preventDefault()
    if (isBlocked) { setError('Personal email domains are not allowed. Please use your official company email.'); return }
    setError('')
    navigate('/recruiter-search')
  }

  return (
    <div className="min-h-screen flex bg-orange-50 dark:bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle at 30% 80%, #f97316 1px, transparent 1px)', backgroundSize:'50px 50px'}} />
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 backdrop-blur border border-orange-500/30 flex items-center justify-center">
            <Zap size={18} className="text-orange-400" />
          </div>
          <span className="font-extrabold text-white text-xl">SkillPassport</span>
        </Link>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-sm text-orange-300 font-semibold">
            <Building2 size={14} /> Recruiter Portal
          </div>
          <h2 className="text-4xl font-black text-white leading-tight">
            Find candidates<br/>by proven skills,<br/>not just claims.
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Search naturally. See verified evidence. Understand exactly why each candidate matches your requirements.
          </p>
          <div className="space-y-3">
            {['Only official company domains allowed','AI-verified candidate skill evidence','Natural language talent search','Explainable match rankings'].map(t => (
              <div key={t} className="flex items-center gap-2 text-gray-400 text-sm">
                <Shield size={14} className="text-orange-400 shrink-0" /> {t}
              </div>
            ))}
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-3">Trusted by</p>
            <div className="flex flex-wrap gap-2">
              {COMPANIES.map(c => (
                <span key={c} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-gray-300">{c}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-xs relative z-10">Your Skills. Your Proof. Your Future.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-extrabold gradient-text">SkillPassport</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost p-2">
              {dark ? <Sun size={17} className="text-orange-400" /> : <Moon size={17} className="text-orange-600" />}
            </button>
            <Link to="/login" className="btn-ghost text-sm">Student Login</Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md animate-slide-up">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                <Building2 size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1.5">Recruiter Sign In</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Use your official company email to access the talent portal</p>
            </div>

            {/* Domain warning banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6 text-sm">
              <Shield size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-300">Official domains only</p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                  Gmail, Yahoo, Hotmail and other personal domains are <strong>blocked</strong> to protect candidate data.
                  Use your company email (e.g. hr@company.com).
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Company Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required placeholder="hr@company.com" value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    className={`input pl-10 ${isBlocked ? 'border-red-400 dark:border-red-600 focus:ring-red-400/20' : ''}`} />
                  {isBlocked && <AlertTriangle size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500" />}
                </div>
                {isBlocked && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle size={11} /> Personal email domain blocked. Use your official company email.</p>}
                {email && !isBlocked && email.includes('@') && (
                  <p className="text-green-500 text-xs mt-1.5 flex items-center gap-1"><Shield size={11} /> Company domain verified</p>
                )}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={show ? 'text' : 'password'} required placeholder="••••••••"
                    className="input pl-10 pr-10" />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle size={15} className="shrink-0" /> {error}
                </div>
              )}
              <button type="submit" disabled={isBlocked} className={`btn-primary w-full justify-center py-3 text-base ${isBlocked ? 'opacity-50 cursor-not-allowed' : 'glow-orange'}`}>
                Access Talent Portal <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New to SkillPassport?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Contact your admin to register your company on the platform, or email <span className="text-orange-500">partners@skillpassport.in</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
