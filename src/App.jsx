import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { StudentDataProvider } from './context/StudentDataContext'
import { NotificationProvider } from './context/NotificationContext'
import Landing        from './pages/Landing'
import Login          from './pages/Login'
import Signup         from './pages/Signup'
import StudentApp     from './pages/StudentApp'
import RecruiterApp   from './pages/RecruiterApp'
import RecruiterLogin from './pages/RecruiterLogin'
import CollegeApp     from './pages/CollegeApp'
import MinistryApp    from './pages/MinistryApp'
import Ministry       from './pages/Ministry'
import Challenges     from './pages/Challenges'
import AdminLogin     from './pages/AdminLogin'
import AdminPanel     from './pages/AdminPanel'
import OAuthCallback  from './pages/OAuthCallback'

/* ── Route guard — redirects to login if not authenticated ── */
function AppRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace/>
  if (user.role === 'admin') return <Navigate to="/admin" replace/>

  // Student — wrap with live data + notification contexts keyed to their email
  if (user.role === 'student') {
    return (
      <StudentDataProvider userEmail={user.email} userName={user.name}>
        <NotificationProvider userEmail={user.email}>
          <StudentApp/>
        </NotificationProvider>
      </StudentDataProvider>
    )
  }

  // Recruiter — notification context only
  if (user.role === 'recruiter') {
    return (
      <NotificationProvider userEmail={user.email}>
        <RecruiterApp/>
      </NotificationProvider>
    )
  }

  if (user.role === 'college')  return <CollegeApp/>
  if (user.role === 'ministry') return <MinistryApp/>
  return <Navigate to="/login" replace/>
}

/* ── Admin route guard ───────────────────────────────────────── */
function AdminRoute() {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/x-overseer-9a4f" replace/>
  return <AdminPanel/>
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────── */}
      <Route path="/"                element={<Landing/>}        />
      <Route path="/login"           element={<Login/>}          />
      <Route path="/signup"          element={<Signup/>}         />

      {/* ── Previously unrouted pages ────────────────────── */}
      <Route path="/recruiter-login" element={<RecruiterLogin/>} />
      <Route path="/challenges"      element={<Challenges/>}     />
      <Route path="/ministry"        element={<Ministry/>}       />

      {/* ── Protected app shell (role-based) ─────────────── */}
      <Route path="/app"  element={<AppRoute/>}  />

      {/* ── OAuth callback ───────────────────────────────── */}
      <Route path="/auth/callback"   element={<OAuthCallback/>} />

      {/* ── Hidden admin routes ──────────────────────────── */}
      <Route path="/x-overseer-9a4f" element={<AdminLogin/>}  />
      <Route path="/admin"           element={<AdminRoute/>}  />

      {/* ── Catch-all ───────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  )
}
