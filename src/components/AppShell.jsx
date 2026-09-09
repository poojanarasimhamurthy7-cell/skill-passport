/**
 * AppShell — shared premium sidebar + topbar wrapper
 * Used by RecruiterApp, CollegeApp, MinistryApp, AdminPanel
 *
 * Props:
 *   role        string  — 'recruiter' | 'college' | 'ministry' | 'admin'
 *   nav         array   — [{ key, label, icon, group? }]
 *   groups      array   — [{ key, label }]  (optional; if absent, nav renders flat)
 *   module      string  — active module key
 *   setModule   fn      — setter
 *   user        object  — { name, email }
 *   onLogout    fn
 *   topRight    node    — extra elements for topbar right side (optional)
 *   title       string  — current module title shown in topbar
 *   children    node    — module content
 */

import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  Zap, Sun, Moon, LogOut, ChevronLeft, ChevronRight, Bell
} from 'lucide-react'

const ROLE_META = {
  recruiter: { accent: '#f97316', label: 'Recruiter',  dot: 'bg-blue-500'   },
  college:   { accent: '#3b82f6', label: 'College',    dot: 'bg-blue-500'   },
  ministry:  { accent: '#a855f7', label: 'Ministry',   dot: 'bg-purple-500' },
  admin:     { accent: '#ef4444', label: 'Overseer',   dot: 'bg-red-500'    },
}

export default function AppShell({
  role = 'recruiter',
  nav = [],
  groups = [],
  module,
  setModule,
  user,
  onLogout,
  topRight,
  title,
  subtitle,
  children,
}) {
  const { dark, toggle } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const meta = ROLE_META[role] || ROLE_META.recruiter

  const flatNav = groups.length === 0

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: dark ? '#080b14' : '#fafaf8' }}>
      <style>{`
        @keyframes sidebarIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes topbarIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes moduleSwap {
          from { opacity: 0; transform: translateY(10px) scale(0.995); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .shell-sidebar-enter { animation: sidebarIn 0.38s cubic-bezier(0.34,1.1,0.64,1) both; }
        .shell-topbar-enter  { animation: topbarIn  0.3s ease both; }
        .shell-module-enter  { animation: moduleSwap 0.32s cubic-bezier(0.34,1.1,0.64,1) both; }

        .shell-sidebar {
          background: linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,248,237,0.96) 100%);
          border-right: 1px solid rgba(249,115,22,0.1);
        }
        .dark .shell-sidebar {
          background: linear-gradient(180deg, rgba(10,14,26,0.98) 0%, rgba(8,11,20,0.99) 100%);
          border-right: 1px solid rgba(249,115,22,0.07);
        }
        .admin-role .shell-sidebar,
        .admin-role.dark .shell-sidebar {
          background: linear-gradient(180deg, #0d1117 0%, #080b14 100%);
          border-right: 1px solid rgba(239,68,68,0.12);
        }

        .shell-collapse-btn {
          box-shadow: 0 3px 10px rgba(249,115,22,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .shell-collapse-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 4px 14px rgba(249,115,22,0.55);
        }

        .shell-nav-group {
          font-size: 9.5px; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 12px 10px 4px;
          color: rgba(156,163,175,0.7);
        }
        .dark .shell-nav-group { color: rgba(100,116,139,0.7); }

        .shell-topbar {
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          background: rgba(255,255,255,0.82);
          border-bottom: 1px solid rgba(249,115,22,0.08);
          box-shadow: 0 1px 12px rgba(249,115,22,0.05);
        }
        .dark .shell-topbar {
          background: rgba(8,11,20,0.88);
          border-bottom-color: rgba(249,115,22,0.06);
          box-shadow: 0 1px 12px rgba(0,0,0,0.35);
        }
        .admin-role .shell-topbar {
          background: rgba(13,17,23,0.95);
          border-bottom-color: rgba(239,68,68,0.1);
          box-shadow: 0 1px 12px rgba(0,0,0,0.5);
        }

        .shell-avatar {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .shell-avatar:hover { transform: scale(1.06); }

        .shell-logo-icon {
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .shell-logo-icon:hover { transform: rotate(-8deg) scale(1.08); }

        .sidebar-link.active {
          background: linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.07) 100%) !important;
          color: #ea580c !important; font-weight: 600 !important;
        }
        .dark .sidebar-link.active {
          background: linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(234,88,12,0.06) 100%) !important;
          color: #fb923c !important;
        }
      `}</style>

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside className={[
        'shell-sidebar shell-sidebar-enter relative flex flex-col h-screen sticky top-0 transition-all duration-300 hidden md:flex',
        collapsed ? 'w-16' : 'w-60',
        role === 'admin' ? 'admin-role' : '',
      ].join(' ')}>

        {/* Logo row */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-orange-100/50 dark:border-orange-900/15 shrink-0">
          <div className={`shell-logo-icon w-8 h-8 rounded-xl flex items-center justify-center shadow-md shrink-0
            ${role === 'admin'
              ? 'bg-gradient-to-br from-orange-600 to-red-700 shadow-red-900/40'
              : 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/30'}`}>
            <Zap size={16} className="text-white"/>
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="font-extrabold text-sm gradient-text leading-none truncate">SkillPassport</p>
              <p className="text-[9px] text-gray-400 font-semibold tracking-widest uppercase leading-none mt-0.5">SIH26044</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="shell-collapse-btn absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center z-10 text-white"
          style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)` }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>

        {/* User info */}
        {!collapsed && user && (
          <div className="px-4 pt-4 pb-2 animate-fade-in border-b border-orange-100/40 dark:border-orange-900/15 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
                style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}bb)` }}>
                {user.name?.[0] || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate leading-tight">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${meta.dot} flex-shrink-0`}
                style={{ boxShadow: `0 0 5px ${meta.accent}88` }}/>
              <span className="text-[10px] font-semibold" style={{ color: meta.accent }}>
                {meta.label} · Active
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 pt-1 flex flex-col overflow-y-auto">
          {flatNav
            ? nav.map(({ key, label, icon: Icon }, ni) => (
                <button key={key} onClick={() => setModule(key)}
                  className={`sidebar-link ${module === key ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''} w-full text-left mb-0.5`}
                  title={collapsed ? label : undefined}
                  style={{ animationDelay: `${ni * 40}ms` }}>
                  <Icon size={16} className="shrink-0"/>
                  {!collapsed && <span className="text-xs font-medium">{label}</span>}
                  {module === key && !collapsed && <span className="nav-dot ml-auto"/>}
                </button>
              ))
            : groups.map((g, gi) => (
                <div key={g.key}>
                  {!collapsed && <p className="shell-nav-group">{g.label}</p>}
                  {nav.filter(n => n.group === g.key).map(({ key, label, icon: Icon }, ni) => (
                    <button key={key} onClick={() => setModule(key)}
                      className={`sidebar-link ${module === key ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''} w-full text-left mb-0.5`}
                      title={collapsed ? label : undefined}
                      style={{ animationDelay: `${(gi * 4 + ni) * 35}ms` }}>
                      <Icon size={16} className="shrink-0"/>
                      {!collapsed && <span className="text-xs font-medium">{label}</span>}
                      {module === key && !collapsed && <span className="nav-dot ml-auto"/>}
                    </button>
                  ))}
                </div>
              ))
          }
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-4 pt-3 border-t border-orange-100/40 dark:border-orange-900/15">
          <button onClick={toggle}
            className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''} w-full mb-0.5`}>
            {dark
              ? <Sun  size={16} className="text-orange-400 shrink-0"/>
              : <Moon size={16} className="text-orange-600 shrink-0"/>}
            {!collapsed && <span className="text-xs">{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={onLogout}
            className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''} w-full`}>
            <LogOut size={16} className="shrink-0"/>
            {!collapsed && <span className="text-xs">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto flex flex-col">

        {/* Topbar */}
        <header className="shell-topbar shell-topbar-enter sticky top-0 z-30 flex items-center justify-between px-6 py-4 shrink-0">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"/>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {topRight}
          </div>
        </header>

        {/* Module area — key forces re-animation on switch */}
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full shell-module-enter" key={module}>
          {children}
        </div>
      </main>
    </div>
  )
}
