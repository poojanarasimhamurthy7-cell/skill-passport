import {
  LayoutDashboard, User, FileText, Search, Trophy, BarChart3,
  BookOpen, Zap, LogOut, ChevronLeft, ChevronRight, Bell
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth }  from '../context/AuthContext'
import { Sun, Moon } from 'lucide-react'

const STUDENT_LINKS = [
  { label: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Skill Passport',  icon: FileText,        path: '/passport' },
  { label: 'Profile Setup',   icon: User,            path: '/profile-setup' },
  { label: 'Challenges',      icon: Trophy,          path: '/challenges' },
  { label: 'Skill Bridge',    icon: BookOpen,        path: '/skill-bridge' },
]

const RECRUITER_LINKS = [
  { label: 'Smart Search',    icon: Search,          path: '/recruiter-search' },
  { label: 'Shortlist',       icon: BarChart3,       path: '/shortlist' },
]

const MINISTRY_LINKS = [
  { label: 'Skill Intel',     icon: BarChart3,       path: '/ministry' },
]

export default function Sidebar({ role = 'student' }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const links = role === 'recruiter' ? RECRUITER_LINKS
              : role === 'ministry'  ? MINISTRY_LINKS
              : STUDENT_LINKS

  return (
    <aside className={`
      relative flex flex-col h-screen sticky top-0 border-r
      border-orange-200/40 dark:border-gray-800
      bg-white dark:bg-gray-950
      transition-all duration-300
      ${collapsed ? 'w-16' : 'w-60'}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-orange-200/30 dark:border-gray-800 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && <span className="font-extrabold text-base gradient-text">SkillPassport</span>}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md z-10 hover:bg-orange-600 transition-colors"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <span className="badge-orange capitalize">{role}</span>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-2 pt-2 flex flex-col gap-0.5 overflow-y-auto">
        {links.map(({ label, icon: Icon, path }) => (
          <Link
            key={path}
            to={path}
            className={`sidebar-link ${pathname === path ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 flex flex-col gap-0.5 border-t border-orange-200/30 dark:border-gray-800 pt-3">
        <button
          onClick={toggle}
          className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''}`}
          title="Toggle theme"
        >
          {dark ? <Sun size={18} className="text-orange-400 shrink-0" /> : <Moon size={18} className="text-orange-600 shrink-0" />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={() => { logout(); navigate('/') }}
          className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''}`}
          title="Logout"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
