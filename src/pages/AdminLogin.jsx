import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, ShieldAlert, AlertTriangle, Fingerprint } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// This route is intentionally NOT linked from anywhere in the UI.
// Accessible only via direct URL: /x-overseer-9a4f
// Max 6 admin accounts as defined in AuthContext.

export default function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [error,    setError]    = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked,   setLocked]   = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    if (locked) return
    const ok = loginAdmin(email, password)
    if (ok) {
      navigate('/admin')
    } else {
      const next = attempts + 1
      setAttempts(next)
      if (next >= 3) {
        setLocked(true)
        setError('Too many failed attempts. Session locked.')
      } else {
        setError(`Invalid credentials. ${3 - next} attempt${3 - next === 1 ? '' : 's'} remaining.`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-200">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }}/>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-900/40">
            <ShieldAlert size={30} className="text-white"/>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Overseer Access</h1>
          <p className="text-gray-500 text-sm">Restricted — Authorised Personnel Only</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < attempts ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`}/>
            ))}
            <span className="text-gray-400 text-xs ml-1">{attempts}/3 attempts</span>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl">
          {locked ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <Lock size={24} className="text-red-500"/>
              </div>
              <p className="text-red-500 dark:text-red-400 font-semibold">Session Locked</p>
              <p className="text-gray-500 text-sm">Too many failed attempts. Contact the system administrator.</p>
              <p className="text-gray-400 text-xs">All access attempts are logged.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="email" required placeholder="overseer@skillpassport.admin"
                    value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Access Passphrase
                </label>
                <div className="relative">
                  <Fingerprint size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type={show ? 'text' : 'password'} required placeholder="••••••••••••"
                    value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"/>
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle size={14} className="shrink-0"/> {error}
                </div>
              )}

              <button type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white font-bold rounded-xl hover:from-orange-500 hover:to-red-600 transition-all shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2">
                <ShieldAlert size={16}/> Authenticate
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          All access attempts are logged and monitored. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  )
}
