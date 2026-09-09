/**
 * OAuthCallback — handles the redirect back from Google / Microsoft.
 * Route: /auth/callback
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleOAuthCallback } from '../utils/oauth'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function OAuthCallback() {
  const navigate  = useNavigate()
  const { loginRole } = useAuth()
  const { dark }  = useTheme()
  const [status, setStatus] = useState('processing')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    const result = handleOAuthCallback()
    if (!result.success) {
      setStatus('error')
      setErrMsg(
        result.errorDescription ||
        (result.error === 'state_mismatch' ? 'Security check failed. Please try again.' :
         result.error === 'no_code'        ? 'No authorization code received.' :
         `Authentication error: ${result.error}`)
      )
      return
    }
    // Production: exchange result.code on backend
    setStatus('needs_backend')
  }, [])

  const bg    = dark ? '#0f172a' : '#f8fafc'
  const card  = dark ? '#1e293b' : '#ffffff'
  const bdr   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const title = dark ? '#f8fafc' : '#0f172a'
  const sub   = dark ? '#94a3b8' : '#64748b'

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${dark ? 'bg-[#0f172a]' : 'bg-gray-50'}`}
      style={{ fontFamily: 'Inter,sans-serif' }}>
      <div style={{
        width:'100%', maxWidth:460, textAlign:'center',
        background: card, borderRadius:20,
        border:`1px solid ${bdr}`,
        boxShadow: dark ? '0 32px 80px rgba(0,0,0,0.6)' : '0 8px 40px rgba(0,0,0,0.1)',
        padding:'40px 32px',
        transition:'background 0.2s, border-color 0.2s',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:28 }}>
          <div style={{
            width:40, height:40, borderRadius:11,
            background:'linear-gradient(135deg,#f97316,#ea580c)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 16px rgba(249,115,22,0.4)',
          }}>
            <Zap size={18} color="white"/>
          </div>
          <span style={{ fontSize:20, fontWeight:900, color:title }}>
            Skill<span style={{ color:'#f97316' }}>Passport</span>
          </span>
        </div>

        {status === 'processing' && (
          <>
            <div style={{
              width:48, height:48, borderRadius:'50%', margin:'0 auto 20px',
              border:'3px solid rgba(249,115,22,0.2)', borderTopColor:'#f97316',
              animation:'spin 0.8s linear infinite',
            }}/>
            <p style={{ fontSize:16, fontWeight:700, color:title, margin:'0 0 6px' }}>Completing sign-in…</p>
            <p style={{ fontSize:13, color:sub, margin:0 }}>Please wait while we verify your account.</p>
          </>
        )}

        {status === 'needs_backend' && (
          <>
            <div style={{
              width:52, height:52, borderRadius:'50%', margin:'0 auto 20px',
              background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <CheckCircle2 size={24} color="#f97316"/>
            </div>
            <p style={{ fontSize:16, fontWeight:700, color:title, margin:'0 0 8px' }}>
              Authorization code received ✓
            </p>
            <div style={{
              padding:'12px 14px', borderRadius:10, margin:'16px 0',
              background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.25)',
            }}>
              <p style={{ margin:0, fontSize:13, color: dark ? '#93c5fd' : '#1d4ed8', lineHeight:1.6 }}>
                <strong>Backend required</strong> — exchange the authorization code at{' '}
                <code style={{ fontSize:12 }}>/api/auth/callback</code> to complete sign-in.
              </p>
            </div>
            <button onClick={() => navigate('/login')}
              className="btn-primary w-full justify-center mt-2 py-3.5 text-sm">
              Back to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width:52, height:52, borderRadius:'50%', margin:'0 auto 20px',
              background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <AlertTriangle size={24} color="#ef4444"/>
            </div>
            <p style={{ fontSize:16, fontWeight:700, color:title, margin:'0 0 8px' }}>Sign-in failed</p>
            <div style={{
              padding:'12px 14px', borderRadius:10, margin:'12px 0 20px',
              background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)',
            }}>
              <p style={{ margin:0, fontSize:13, color: dark ? '#fca5a5' : '#b91c1c', lineHeight:1.6 }}>{errMsg}</p>
            </div>
            <button onClick={() => navigate('/login')}
              className="btn-primary w-full justify-center py-3.5 text-sm">
              Back to Login
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  )
}
