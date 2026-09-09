import { Sun, Moon, Zap, Menu, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// Navigation links intentionally left empty — landing page uses hero CTAs only
const NAV_LINKS = []

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoSpark, setLogoSpark] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const sparkTimer = useRef(null)

  /* ── Scroll listener — intensify glass after 20px ──────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Logo sparkle on mount, then every ~8 s ────────────── */
  useEffect(() => {
    const fire = () => {
      setLogoSpark(true)
      sparkTimer.current = setTimeout(() => setLogoSpark(false), 700)
    }
    const id = setTimeout(() => {
      fire()
      const interval = setInterval(fire, 8000)
      return () => clearInterval(interval)
    }, 1200)
    return () => { clearTimeout(id); clearTimeout(sparkTimer.current) }
  }, [])

  /* ── Close mobile menu on route change ─────────────────── */
  useEffect(() => { setOpen(false) }, [location.pathname])

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav
      className={[
        'sticky top-0 z-50 w-full topbar-glass animate-slide-down',
        scrolled ? 'navbar-scrolled' : '',
      ].join(' ')}
      style={{
        transition: 'background-color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* ── Logo ─────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className={[
              'relative w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600',
              'flex items-center justify-center shadow-md shadow-orange-500/30 logo-icon',
              logoSpark ? 'logo-sparkling' : '',
            ].join(' ')}
            aria-hidden="true"
          >
            <Zap size={16} className="text-white relative z-10" />

            {/* Sparkle rings — rendered when logoSpark is true */}
            {logoSpark && (
              <>
                <span className="absolute inset-0 rounded-xl animate-ping bg-orange-400/40" style={{ animationDuration: '0.6s' }} />
                <span className="absolute -inset-1 rounded-2xl border border-orange-400/30 animate-ping" style={{ animationDuration: '0.7s', animationDelay: '0.05s' }} />
              </>
            )}
          </div>

          <span className="font-extrabold text-lg tracking-tight gradient-text">
            SkillPassport
          </span>
        </Link>

        {/* ── Desktop links ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(([label, path]) => (
            <Link
              key={label}
              to={path}
              className={[
                'btn-ghost text-sm relative',
                isActive(path)
                  ? 'text-orange-600 dark:text-orange-400 font-semibold'
                  : '',
              ].join(' ')}
            >
              {label}
              {/* Active underline */}
              {isActive(path) && (
                <span
                  className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                  style={{ animation: 'underlineGrow 0.3s cubic-bezier(0.22,1,0.36,1) forwards' }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* ── Right actions ─────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="btn-ghost p-2 icon-lift"
            aria-label="Toggle theme"
          >
            {dark
              ? <Sun  size={18} className="text-orange-400" />
              : <Moon size={18} className="text-orange-600" />}
          </button>

          {/* CTA */}
          <button
            onClick={() => navigate('/login')}
            className="hidden md:inline-flex btn-primary btn-primary-shine text-sm"
          >
            Get Started
          </button>

          {/* Hamburger */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span
              style={{
                display: 'inline-flex',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
                transform: open ? 'rotate(90deg) scale(1.1)' : 'rotate(0deg) scale(1)',
              }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────── */}
      <div
        style={{
          maxHeight: open ? '400px' : '0px',
          opacity:   open ? 1 : 0,
          overflow:  'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease',
        }}
        aria-hidden={!open}
      >
        <div className="md:hidden border-t border-orange-200/30 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(([label, path], i) => (
            <Link
              key={label}
              to={path}
              className={[
                'sidebar-link',
                isActive(path) ? 'active' : '',
              ].join(' ')}
              style={{
                transitionDelay: open ? `${i * 40}ms` : '0ms',
                transform: open ? 'translateX(0)' : 'translateX(-8px)',
                opacity:   open ? 1 : 0,
                transition: 'transform 0.3s ease, opacity 0.3s ease, background-color 0.18s',
              }}
            >
              {isActive(path) && <span className="nav-dot" />}
              {label}
            </Link>
          ))}

          <button
            onClick={() => navigate('/login')}
            className="btn-primary mt-2 w-full justify-center"
            style={{
              transitionDelay: open ? `${NAV_LINKS.length * 40}ms` : '0ms',
              transform: open ? 'translateY(0)' : 'translateY(6px)',
              opacity:   open ? 1 : 0,
              transition: 'transform 0.3s ease, opacity 0.3s ease',
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
