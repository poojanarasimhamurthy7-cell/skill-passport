import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  BarChart3, Globe, Bell, Zap, AlertTriangle, TrendingUp,
  Sun, Moon, LogOut, ChevronLeft, ChevronRight, Users,
  Building2, GraduationCap, Shield, Info
} from 'lucide-react'
import {

  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import AIAssistant from '../components/AIAssistant'

// ── DATA ─────────────────────────────────────────────────
const DEMAND_DATA = [
  { skill: 'Python', demand: 340, students: 290, gap: 50  },
  { skill: 'ML',     demand: 280, students: 134, gap: 146 },
  { skill: 'Cloud',  demand: 220, students: 49,  gap: 171 },
  { skill: 'OpenCV', demand: 180, students: 63,  gap: 117 },
  { skill: 'SQL',    demand: 310, students: 265, gap: 45  },
  { skill: 'NLP',    demand: 145, students: 29,  gap: 116 },
  { skill: 'Docker', demand: 130, students: 22,  gap: 108 },
]

const TREND_DATA = [
  { month: 'Jan 26', Cloud: 30,  AI_Health: 20, CV: 45, NLP: 18 },
  { month: 'Feb 26', Cloud: 38,  AI_Health: 28, CV: 50, NLP: 22 },
  { month: 'Mar 26', Cloud: 45,  AI_Health: 35, CV: 52, NLP: 28 },
  { month: 'Apr 26', Cloud: 55,  AI_Health: 42, CV: 60, NLP: 33 },
  { month: 'May 26', Cloud: 65,  AI_Health: 52, CV: 65, NLP: 40 },
  { month: 'Jun 26', Cloud: 80,  AI_Health: 68, CV: 72, NLP: 48 },
  { month: 'Jul 26', Cloud: 95,  AI_Health: 80, CV: 78, NLP: 58 },
  { month: 'Aug 26', Cloud: 115, AI_Health: 95, CV: 88, NLP: 70 },
]

const COLLEGE_PROFICIENCY = [
  { skill: 'Python',           avg: 85 },
  { skill: 'SQL',              avg: 80 },
  { skill: 'ML',               avg: 48 },
  { skill: 'React',            avg: 42 },
  { skill: 'Cloud',            avg: 22 },
  { skill: 'OpenCV',           avg: 35 },
  { skill: 'Docker',           avg: 18 },
  { skill: 'NLP',              avg: 20 },
]

const EARLY_WARNINGS = [
  { skill: 'Cloud Deployment',    trend: '+283%', companies: 115, students: 49,  urgency: 'critical', action: 'Mandate cloud labs in B.Tech CSE/IT curriculum across all 180 colleges'     },
  { skill: 'AI in Healthcare',    trend: '+375%', companies: 95,  students: 22,  urgency: 'critical', action: 'Launch AI-Health elective course — Ministry of Health collaboration needed' },
  { skill: 'Computer Vision',     trend: '+96%',  companies: 88,  students: 63,  urgency: 'high',     action: 'Add OpenCV lab sessions in final year CSE programs'                        },
  { skill: 'NLP / GenAI',         trend: '+289%', companies: 70,  students: 29,  urgency: 'high',     action: 'Fast-track NLP module across tier-1 and tier-2 colleges'                   },
]

const ChartTip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-gray-700 space-y-1">
    <p className="font-bold text-orange-400">{label}</p>
    {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
  </div>
) : null

// ── MODULE: SKILL INTELLIGENCE ──────────────────────────
function ModuleIntelligence() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Companies Tracked',  value: '340+', icon: Building2,    color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
          { label: 'Students Verified',  value: '12.4K',icon: Users,        color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30'    },
          { label: 'Colleges Connected', value: '180',  icon: GraduationCap,color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30'  },
          { label: 'Critical Gaps',      value: '4',    icon: AlertTriangle,color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30'      },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4 py-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}><s.icon size={20} className={s.color} /></div>
            <div><p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title text-base mb-1">Industry Demand vs Student Availability</h2>
          <p className="section-sub text-xs mb-4">Company searches vs students with verified evidence</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMAND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
                <XAxis dataKey="skill" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="demand"   fill="#f97316" name="Industry Demand"   radius={[4,4,0,0]} />
                <Bar dataKey="students" fill="#fdba74" name="Students Available" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title text-base mb-1">National Student Proficiency</h2>
          <p className="section-sub text-xs mb-4">Avg across 180 colleges — verified skill evidence</p>
          <div className="space-y-2.5">
            {COLLEGE_PROFICIENCY.map(s => (
              <div key={s.skill} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-gray-700 dark:text-gray-300 shrink-0">{s.skill}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full skill-bar-fill ${s.avg >= 70 ? 'bg-green-500' : s.avg >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                    style={{ '--bar-width': `${s.avg}%`, width: `${s.avg}%` }} />
                </div>
                <span className={`text-xs font-bold w-10 text-right shrink-0 ${s.avg >= 70 ? 'text-green-600 dark:text-green-400' : s.avg >= 40 ? 'text-orange-500' : 'text-red-500'}`}>{s.avg}%</span>
                {s.avg < 40 && <span className="text-sm">🔴</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4 bg-gradient-to-r from-orange-500 to-orange-700 border-0">
        <p className="text-sm font-bold text-white mb-2">📋 Privacy Note</p>
        <p className="text-xs text-orange-100 leading-relaxed">
          All data shown here is <strong>aggregated and anonymised</strong>. No individual student names, marks, or personal details are visible to the Ministry.
          Only skill-demand trends, gap percentages and college-level averages are shared.
        </p>
      </div>
    </div>
  )
}

// ── MODULE: EARLY WARNING ───────────────────────────────
function ModuleEarlyWarning() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card border-2 border-orange-400 dark:border-orange-600">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <h2 className="section-title text-lg">Future Skill Early-Warning System</h2>
            <p className="section-sub text-xs">Time-series demand analysis · Auto-alerts when skill shortage threshold is crossed</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
          </div>
        </div>
        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-300">
          <strong>How it works:</strong> System tracks skill keywords from recruiter searches over time. When demand crosses the shortage threshold (demand:availability ratio &gt; 3:1), an early-warning alert is auto-generated.
        </div>
      </div>

      {/* Trend chart */}
      <div className="card">
        <h2 className="section-title text-base mb-1">8-Month Demand Growth Trends</h2>
        <p className="section-sub text-xs mb-4">Number of companies actively searching for each skill</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                {[['gC','#f97316'], ['gA','#fb923c'], ['gV','#fdba74'], ['gN','#fcd34d']].map(([id, col]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={col} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={col} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="Cloud"     stroke="#f97316" fill="url(#gC)" strokeWidth={2.5} name="Cloud" />
              <Area type="monotone" dataKey="AI_Health" stroke="#fb923c" fill="url(#gA)" strokeWidth={2}   name="AI in Healthcare" />
              <Area type="monotone" dataKey="CV"        stroke="#fdba74" fill="url(#gV)" strokeWidth={2}   name="Computer Vision" />
              <Area type="monotone" dataKey="NLP"       stroke="#fcd34d" fill="url(#gN)" strokeWidth={2}   name="NLP / GenAI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Warning cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {EARLY_WARNINGS.map((w, i) => (
          <div key={i} className={`card border-2 ${w.urgency === 'critical' ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' : 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${w.urgency === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                <TrendingUp size={18} className={w.urgency === 'critical' ? 'text-red-500' : 'text-orange-500'} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{w.skill}</h3>
                  <span className={`badge text-xs ${w.urgency === 'critical' ? 'badge-red' : 'badge-orange'}`}>{w.urgency}</span>
                  <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs">{w.trend} in 8 months</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs mb-3">
              <span className="text-gray-600 dark:text-gray-400">📈 Companies: <strong className="text-gray-900 dark:text-white">{w.companies}</strong></span>
              <span className="text-gray-600 dark:text-gray-400">🎓 Students: <strong className="text-gray-900 dark:text-white">{w.students}</strong></span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
              <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${(w.students / w.companies) * 100}%` }} />
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <Shield size={12} className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 dark:text-gray-400"><strong className="text-gray-900 dark:text-white">Recommendation:</strong> {w.action}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title text-base mb-4">Policy Action Log</h2>
        <div className="space-y-3">
          {[
            { action: 'Cloud Deployment added to B.Tech CSE elective list', date: 'Aug 2026', status: 'In Progress' },
            { action: 'AI in Healthcare — AICTE working group formed', date: 'Jul 2026', status: 'Approved'     },
            { action: 'Docker added to final year project requirements', date: 'Jun 2026', status: 'Implemented'  },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === 'Implemented' ? 'bg-green-500' : a.status === 'Approved' ? 'bg-orange-500' : 'bg-amber-400'}`} />
              <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{a.action}</p>
              <span className="text-xs text-gray-400 shrink-0">{a.date}</span>
              <span className={`badge text-xs shrink-0 ${a.status === 'Implemented' ? 'badge-green' : a.status === 'Approved' ? 'badge-orange' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const NAV = [
  { key: 'intelligence', label: 'Skill Intelligence',    icon: BarChart3  },
  { key: 'warning',      label: 'Early Warning System',  icon: Zap        },
]

export default function MinistryApp() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [module, setModule] = useState('intelligence')
  const [collapsed, setCollapsed] = useState(false)

  const doLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-orange-50 dark:bg-gray-950 overflow-hidden">
      <aside className={`relative flex flex-col h-screen sticky top-0 border-r border-orange-200/40 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="flex items-center gap-2 px-4 h-16 border-b border-orange-200/30 dark:border-gray-800 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shrink-0"><Zap size={16} className="text-white" /></div>
          {!collapsed && <span className="font-extrabold text-base gradient-text">SkillPassport</span>}
        </div>
        <button onClick={() => setCollapsed(c => !c)} className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md z-10 hover:bg-orange-600">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
        {!collapsed && (
          <div className="px-4 pt-4 pb-1 space-y-1">
            <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">Ministry</span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
          </div>
        )}
        <nav className="flex-1 px-2 pt-2 flex flex-col gap-0.5">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setModule(key)}
              className={`sidebar-link ${module === key ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''} w-full text-left`}>
              <Icon size={18} className="shrink-0" />{!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-2 pb-4 flex flex-col gap-0.5 border-t border-orange-200/30 dark:border-gray-800 pt-3">
          <button onClick={toggle} className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''} w-full`}>
            {dark ? <Sun size={18} className="text-orange-400 shrink-0" /> : <Moon size={18} className="text-orange-600 shrink-0" />}
            {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={doLogout} className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''} w-full`}>
            <LogOut size={18} className="shrink-0" />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-orange-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">
              {module === 'intelligence' ? 'Ministry Skill Intelligence' : 'Future Skill Early-Warning'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">National Skill Gap Dashboard · Live</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Data
            </div>
            <button className="relative btn-ghost p-2"><Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" /></button>
          </div>
        </header>
        <div className="p-6 max-w-7xl mx-auto">
          {module === 'intelligence' && <ModuleIntelligence />}
          {module === 'warning'      && <ModuleEarlyWarning />}
        </div>      <AIAssistant role="ministry" module={module}/>

      </main>
    </div>
  )
}
