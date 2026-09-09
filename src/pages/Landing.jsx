import {
  ArrowRight, Shield, Zap, BarChart3, Users, BookOpen,
  Globe, ChevronRight, TrendingUp, CheckCircle2,
  Building2, FileText, Trophy
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import AIAssistant from '../components/AIAssistant'

const FEATURES = [
  { icon: Shield,    color: 'from-orange-400 to-orange-600', title: 'AI Security Scan',       desc: 'Every document is scanned for QR authenticity and pixel-level fraud detection before your profile is built.'    },
  { icon: Zap,       color: 'from-amber-400 to-orange-500',  title: 'Digital Skill Passport',  desc: 'Every claimed skill is backed by GitHub projects, internship letters, certificates and practical challenge results.' },
  { icon: BarChart3, color: 'from-orange-500 to-red-500',    title: 'Proof-of-Skill Graph',    desc: 'Python â†’ GitHub âœ…  ML â†’ Challenge âœ…  Cloud â†’ âš . Recruiters see evidence, not just claims.'                   },
  { icon: BookOpen,  color: 'from-yellow-400 to-orange-500', title: 'Skill Bridge',            desc: 'Almost qualified? We identify your exact gap, assign a targeted challenge and update your passport instantly.'   },
  { icon: Users,     color: 'from-orange-400 to-amber-600',  title: 'Explainable Matching',    desc: 'Recruiters type natural phrases. AI returns ranked candidates with line-by-line evidence for every skill.'       },
  { icon: Globe,     color: 'from-orange-600 to-red-600',    title: 'Skill Intelligence',      desc: 'Live dashboard showing industry demand spikes, skill gaps and emerging skill early-warnings by region.'       },
]

const STEPS = [
  { num: '01', title: 'Sign Up & Upload',      desc: 'Add GitHub links, PDF certificates, internship letters and marksheets.',    color: 'bg-orange-500' },
  { num: '02', title: 'AI Verification',        desc: 'System scans QR codes and pixel data to confirm every document is real.',   color: 'bg-amber-500'  },
  { num: '03', title: 'Skill Passport Built',   desc: 'Your interactive visual profile with radar chart and animated skill bars.',  color: 'bg-orange-600' },
  { num: '04', title: 'Prove Skills',           desc: 'Take industry-designed mini-challenges to add practical evidence.',          color: 'bg-red-500'    },
  { num: '05', title: 'Get Matched',            desc: 'Recruiters find you through natural search. AI explains why you matched.',   color: 'bg-orange-500' },
  { num: '06', title: 'Bridge Any Gap',         desc: 'Missing one skill? Complete a targeted challenge and unlock more roles.',    color: 'bg-amber-500'  },
]

const STATS = [
  { label: 'Students Verified', value: '12,400+', num: 12400 },
  { label: 'Recruiters Active', value: '340+',    num: 340   },
  { label: 'Skill Gaps Bridged',value: '8,900+',  num: 8900  },
  { label: 'Colleges Connected',value: '180+',    num: 180   },
]

/* â”€â”€ Animated counter hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

/* â”€â”€ Intersection observer hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

/* â”€â”€ Stat card with live counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StatCard({ stat, delay, inView }) {
  const count = useCountUp(stat.num, 1600, inView)
  const suffix = stat.value.replace(/[\d,]/g, '')
  const display = inView
    ? count.toLocaleString() + suffix
    : '0' + suffix

  return (
    <div
      className="card card-shimmer card-tilt text-center py-5 animate-border-glow"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      <p className={`stat-num animate-count-pop`} style={{ animationDelay: `${delay + 0.1}s` }}>
        {display}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">{stat.label}</p>
    </div>
  )
}

/* â”€â”€ Floating particles in hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function Landing() {
  const navigate = useNavigate()
  const [statsRef, statsInView] = useInView(0.3)
  const [stepsRef, stepsInView] = useInView(0.15)
  const [featuresRef, featuresInView] = useInView(0.15)

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#080b14] text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <Navbar />

      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-24 pb-32 max-w-7xl mx-auto">

        {/* Ambient orbs */}
        <div className="orb orb-orange w-[520px] h-[520px] -top-40 -left-40 opacity-70"/>
        <div className="orb orb-amber  w-[400px] h-[400px] -bottom-20 right-0 opacity-60"/>
        <div className="orb orb-orange w-[280px] h-[280px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"/>

        <div className="relative z-10 flex flex-col items-center text-center gap-7">

          {/* SkillPassport identity mark — refined, premium, no professions */}
          <div
            className="animate-slide-up"
            style={{ animationDelay: '0.05s', animationFillMode: 'both' }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.35rem 1rem 0.35rem 0.5rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.06))',
              border: '1px solid rgba(249,115,22,0.25)',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
              }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M6 1L7.5 4.5H11L8.5 6.8L9.5 10.5L6 8.5L2.5 10.5L3.5 6.8L1 4.5H4.5L6 1Z" fill="white"/>
                </svg>
              </span>
              <span className="text-[#c2410c] dark:text-[#fb923c]" style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}>
                SkillPassport · Verified Digital Credentials
              </span>
            </div>
          </div>

          {/* Headline â€” each line reveals with clip-path */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight max-w-4xl">
            <span className="block animate-text-reveal" style={{ animationDelay: '0.12s' }}>
              Don't just claim skills â€”
            </span>
            <span
              className="block animate-text-reveal animate-spotlight"
              style={{ animationDelay: '0.22s' }}
            >
              Prove them.
            </span>
          </h1>

          {/* Sub */}
          <p
            className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg leading-relaxed animate-slide-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            India's first AI-powered{' '}
            <strong className="text-orange-500 font-semibold">Digital Skill Passport</strong>{' '}
            connecting industry demand with student proof, bridging skill gaps and delivering
            evidence-based intelligence to colleges and recruiters.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center gap-3 mt-1 animate-slide-up"
            style={{ animationDelay: '0.38s', animationFillMode: 'both' }}
          >
            <button onClick={() => navigate('/signup')}
              className="btn-primary btn-primary-shine px-8 py-3.5 text-base glow-orange group"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-200"/>
            </button>
            <button onClick={() => navigate('/login')}
              className="btn-secondary px-8 py-3.5 text-base">
              Sign In
            </button>
          </div>

          {/* Stats â€” count up on scroll into view */}
          <div ref={statsRef} className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
            {STATS.map((s, i) => (
              <StatCard key={s.label} stat={s} delay={i * 0.07} inView={statsInView} />
            ))}
          </div>

          {/* Feature pills */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 mt-2 animate-slide-up"
            style={{ animationDelay: '0.44s', animationFillMode: 'both' }}
          >
            {[
              { label: 'AI Fraud Detection',     color: 'from-red-500 to-orange-600'   },
              { label: 'Proctored Assessment',   color: 'from-orange-400 to-orange-600'},
              { label: 'Skill Analytics',        color: 'from-blue-500 to-blue-700'    },
              { label: 'Corporate Matching',     color: 'from-green-500 to-green-700'  },
            ].map((p, i) => (
              <div key={p.label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-white/5 border border-orange-100 dark:border-orange-900/30 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${p.color}`}/>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="relative bg-white dark:bg-[#0d1117] py-24 px-4 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#fafaf8] dark:from-[#080b14] to-transparent pointer-events-none"/>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="phase-pill mb-3 inline-flex animate-badge-bounce">How it works</p>            <h2 className="text-3xl sm:text-4xl font-black mb-3 section-title section-enter">
              Six steps from sign-up to{' '}
              <span className="gradient-text underline-grow">verified placement</span>
            </h2>
          </div>

          <div ref={stepsRef} className="relative grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="absolute top-8 inset-x-8 h-px bg-gradient-to-r from-transparent via-orange-200 dark:via-orange-900/40 to-transparent hidden lg:block pointer-events-none"/>

            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className={`card card-shimmer card-tilt group relative ${stepsInView ? `tilt-${i + 1}` : 'opacity-0'}`}
              >
                <div className={`w-10 h-10 rounded-full ${s.color} text-white flex items-center justify-center font-black text-sm mb-4 shadow-md animate-spin-in`}
                  style={{ animationDelay: `${i * 0.07}s` }}>
                  {s.num}
                </div>
                <h3 className="text-sm font-bold mb-1.5 text-gray-900 dark:text-white">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ FEATURES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-24 px-4 sm:px-6 bg-[#fafaf8] dark:bg-[#080b14]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="phase-pill mb-3 inline-flex animate-badge-bounce">What makes us different</p>
            <h2 className="text-3xl sm:text-4xl font-black section-title mb-3 section-enter">
              Not a resume builder.<br className="hidden sm:block"/> A{' '}
              <span className="gradient-text underline-grow">skill intelligence</span> ecosystem.
            </h2>
          </div>

          <div ref={featuresRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`card card-shimmer card-tilt group ${featuresInView ? `tilt-${i + 1}` : 'opacity-0'}`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg shadow-orange-500/15 icon-lift animate-spin-in`}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <f.icon size={22} className="text-white"/>
                </div>
                <h3 className="font-bold text-sm mb-2 text-gray-900 dark:text-white leading-snug">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ SKILL BRIDGE CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600"/>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize:'120px 120px' }}/>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-6 animate-badge-bounce">
            <Zap size={14}/> Our Unique Feature
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight tracking-tight animate-text-reveal" style={{ animationDelay: '0.1s' }}>
            REJECT â†’ IDENTIFY GAP<br className="hidden sm:block"/>
            â†’ BRIDGE â†’ PROVE â†’ MATCH
          </h2>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            Instead of silently rejecting candidates, we find the exact missing skill,
            assign a targeted challenge and update the Skill Passport the moment it's proven.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.28s', animationFillMode: 'both' }}>
            <button onClick={() => navigate('/signup')}
              className="bg-white text-orange-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-orange-50 shadow-2xl shadow-orange-900/30 hover:shadow-orange-900/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200">
              Get Started
            </button>
            <button onClick={() => navigate('/login')}
              className="border-2 border-white/50 text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all duration-200 group">
              Sign In <ChevronRight size={16} className="inline group-hover:translate-x-1 transition-transform duration-200"/>
            </button>
          </div>
        </div>
      </section>

      {/* â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="bg-white dark:bg-[#0d1117] border-t border-orange-100/60 dark:border-orange-900/20 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm logo-icon">
              <Zap size={13} className="text-white"/>
            </div>
            <span className="font-bold gradient-text">SkillPassport</span>
          </div>
          <p className="text-sm text-gray-400">Â© 2026 SkillPassport. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-400">
            {['Privacy','Terms','Contact'].map(l => (
              <a key={l} href="#" className="hover:text-orange-500 transition-colors duration-200">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* AI Assistant — visible on Landing, hidden on Login/Signup */}
      <AIAssistant role="landing" module="landing"/>
    </div>
  )
}
