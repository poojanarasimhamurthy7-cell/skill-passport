import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  BarChart3, Users, TrendingUp, BookOpen, Zap,
  Sun, Moon, LogOut, Bell, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2, GraduationCap, Calendar, Plus
} from 'lucide-react'
import {

  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'
import AIAssistant from '../components/AIAssistant'

const PROFICIENCY = [
  { skill: 'Python',           avg: 85, target: 90, gap: 5  },
  { skill: 'SQL',              avg: 80, target: 85, gap: 5  },
  { skill: 'Machine Learning', avg: 48, target: 75, gap: 27 },
  { skill: 'React.js',         avg: 42, target: 70, gap: 28 },
  { skill: 'Cloud',            avg: 22, target: 80, gap: 58 },
  { skill: 'OpenCV',           avg: 35, target: 65, gap: 30 },
  { skill: 'Docker',           avg: 18, target: 60, gap: 42 },
  { skill: 'NLP',              avg: 20, target: 55, gap: 35 },
]

const RADAR_DATA = PROFICIENCY.slice(0, 6).map(p => ({ skill: p.skill, avg: p.avg, target: p.target }))

const WORKSHOPS = [
  { title: 'Cloud & DevOps Bootcamp',   skill: 'Cloud + Docker',   date: 'Sep 15, 2026', seats: 60,  priority: 'Critical',  by: 'AWS India'       },
  { title: 'Applied ML Workshop',       skill: 'Machine Learning', date: 'Sep 22, 2026', seats: 45,  priority: 'High',      by: 'Google Developers'},
  { title: 'Computer Vision Lab',       skill: 'OpenCV',           date: 'Oct 5, 2026',  seats: 30,  priority: 'High',      by: 'Wipro AI Labs'   },
  { title: 'NLP & Text Analytics',      skill: 'NLP',              date: 'Oct 18, 2026', seats: 25,  priority: 'Medium',    by: 'IIT Collaboration'},
]

const ChartTip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-gray-700 space-y-1">
    <p className="font-bold text-orange-400">{label}</p>
    {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}%</strong></p>)}
  </div>
) : null

// ── MODULE: SKILL OVERVIEW ──────────────────────────────
function ModuleOverview() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Students Enrolled', value: '1,240', icon: Users,         color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
          { label: 'Skills Tracked',    value: '18',    icon: BarChart3,     color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30'    },
          { label: 'Critical Gaps',     value: '3',     icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30'      },
          { label: 'Placed This Year',  value: '342',   icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30'  },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4 py-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}><s.icon size={20} className={s.color} /></div>
            <div><p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title text-base mb-1">Student Proficiency vs Industry Target</h2>
          <p className="section-sub text-xs mb-4">Average proven skill level across all students</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROFICIENCY} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
                <XAxis dataKey="skill" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={0} angle={-20} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} domain={[0, 100]} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="avg"    fill="#f97316" name="Student Avg" radius={[4,4,0,0]} />
                <Bar dataKey="target" fill="#fdba74" name="Industry Target" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title text-base mb-1">Skill Coverage Radar</h2>
          <p className="section-sub text-xs mb-4">Top 6 skills — student average vs industry expectation</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(249,115,22,0.2)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#f97316' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                <Radar name="Student Avg" dataKey="avg" stroke="#f97316" fill="#f97316" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Industry Target" dataKey="target" stroke="#fdba74" fill="#fdba74" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2" />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skill gap table */}
      <div className="card">
        <h2 className="section-title text-base mb-4">Skill Gap Analysis</h2>
        <div className="space-y-3">
          {PROFICIENCY.map(p => (
            <div key={p.skill} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{p.skill}</span>
              <div className="flex-1 relative">
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-orange-500 skill-bar-fill" style={{ '--bar-width': `${p.avg}%`, width: `${p.avg}%` }} />
                </div>
                <div className="absolute top-0 h-2.5 w-0.5 bg-amber-400 rounded-full" style={{ left: `${p.target}%` }} />
              </div>
              <div className="flex items-center gap-2 shrink-0 w-24 justify-end">
                <span className="text-xs text-orange-500 font-bold">{p.avg}%</span>
                <span className={`badge text-xs ${p.gap >= 40 ? 'badge-red' : p.gap >= 20 ? 'badge-orange' : 'badge-green'}`}>-{p.gap}%</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-amber-400 rounded" /> = Industry target</p>
      </div>
    </div>
  )
}

// ── MODULE: WORKSHOPS ───────────────────────────────────
function ModuleWorkshops() {
  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
        <Zap size={16} className="text-orange-500 shrink-0" />
        <p className="text-sm text-orange-700 dark:text-orange-300">
          <strong>AI Recommendation:</strong> These workshops are auto-suggested based on live industry demand data vs your students' current skill gaps.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {WORKSHOPS.map((w, i) => (
          <div key={i} className="card hover:border-orange-300 dark:hover:border-orange-700 transition-all">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{w.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">By {w.by}</p>
              </div>
              <span className={`badge text-xs shrink-0 ${w.priority === 'Critical' ? 'badge-red' : w.priority === 'High' ? 'badge-orange' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                {w.priority}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-orange text-xs">{w.skill}</span>
              <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs flex items-center gap-1"><Calendar size={10} /> {w.date}</span>
              <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs flex items-center gap-1"><Users size={10} /> {w.seats} seats</span>
            </div>
            <button className="btn-primary w-full justify-center text-sm py-2">Schedule Workshop</button>
          </div>
        ))}
      </div>
      <button className="btn-secondary w-full justify-center py-3"><Plus size={16} /> Add Custom Workshop</button>
    </div>
  )
}

// ── MODULE: STUDENT LIST ────────────────────────────────
function ModuleStudents() {
  const STUDENTS = [
    { name: 'Priya Sharma',  branch: 'CSE', year: '3rd', readiness: 78, gaps: 2, challenges: 1, status: 'active' },
    { name: 'Arjun Mehta',   branch: 'IT',  year: '4th', readiness: 87, gaps: 1, challenges: 3, status: 'active' },
    { name: 'Riya Patel',    branch: 'CSE', year: '3rd', readiness: 65, gaps: 3, challenges: 0, status: 'bridge' },
    { name: 'Kiran Raj',     branch: 'ECE', year: '2nd', readiness: 42, gaps: 5, challenges: 0, status: 'at-risk' },
  ]
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        {[['Active', 3, 'badge-green'], ['Skill Bridge', 1, 'badge-orange'], ['At Risk', 1, 'badge-red']].map(([l,v,b]) => (
          <div key={l} className="card text-center py-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{v}</p>
            <span className={`${b} text-xs mt-1`}>{l}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="section-title text-base mb-4">Student Progress</h2>
        <div className="space-y-3">
          {STUDENTS.map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {s.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.name}</p>
                <p className="text-xs text-gray-400">{s.branch} · {s.year} Year</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span>Ready: <strong className="text-orange-500">{s.readiness}%</strong></span>
                <span>Gaps: <strong className="text-red-500">{s.gaps}</strong></span>
              </div>
              <span className={`badge text-xs ${s.status === 'active' ? 'badge-green' : s.status === 'bridge' ? 'badge-orange' : 'badge-red'}`}>
                {s.status === 'active' ? 'Active' : s.status === 'bridge' ? 'Skill Bridge' : 'At Risk'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const NAV = [
  { key: 'overview',  label: 'Skill Overview', icon: BarChart3  },
  { key: 'workshops', label: 'Workshops',       icon: BookOpen   },
  { key: 'students',  label: 'Students',        icon: GraduationCap },
]

export default function CollegeApp() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [module, setModule] = useState('overview')
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
            <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">College</span>
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
              {module === 'overview' ? 'College Skill Dashboard' : module === 'workshops' ? 'Workshop Recommendations' : 'Student Tracker'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">IIT Delhi · Training & Placement Cell</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex badge bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-1 px-3 text-sm font-semibold items-center gap-1.5">
              <GraduationCap size={12} /> College Portal
            </div>
            <button className="relative btn-ghost p-2"><Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" /></button>
          </div>
        </header>
        <div className="p-6 max-w-7xl mx-auto">
          {module === 'overview'  && <ModuleOverview />}
          {module === 'workshops' && <ModuleWorkshops />}
          {module === 'students'  && <ModuleStudents />}
        </div>      <AIAssistant role="college" module={module}/>

      </main>
    </div>
  )
}
