import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'
import {
  Trophy, TrendingUp, BookOpen, CheckCircle2, AlertTriangle,
  GitBranch, FileText, Briefcase, Star, Bell, ArrowRight,
  Shield, Zap, Clock, Award
} from 'lucide-react'

const RADAR_DATA = [
  { skill: 'Python',        score: 88 },
  { skill: 'ML',            score: 72 },
  { skill: 'OpenCV',        score: 65 },
  { skill: 'SQL',           score: 80 },
  { skill: 'Cloud',         score: 30 },
  { skill: 'React',         score: 55 },
]

const SKILL_BARS = [
  { name: 'Python',           pct: 88, color: 'bg-orange-500',  proof: 'GitHub + Certificate' },
  { name: 'Machine Learning', pct: 72, color: 'bg-amber-500',   proof: 'Project + Challenge' },
  { name: 'OpenCV',           pct: 65, color: 'bg-orange-400',  proof: 'Project' },
  { name: 'SQL',              pct: 80, color: 'bg-orange-600',  proof: 'Certificate' },
  { name: 'Cloud Deploy',     pct: 30, color: 'bg-red-400',     proof: '⚠ No evidence yet' },
  { name: 'React.js',         pct: 55, color: 'bg-amber-400',   proof: 'Project' },
]

const ACTIVITY = [
  { icon: GitBranch,      color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800', text: 'GitHub project "Face-Detect" linked & verified', time: '2h ago' },
  { icon: FileText,    color: 'text-orange-600',                   bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'Certificate "Python for AI" passed QR scan', time: '1d ago' },
  { icon: Trophy,      color: 'text-amber-600',                    bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'Completed ML Challenge — Score 84/100', time: '3d ago' },
  { icon: Briefcase,   color: 'text-green-600',                    bg: 'bg-green-100 dark:bg-green-900/30', text: 'Interview request from Wipro HR', time: '5d ago' },
]

const PROOF_MAP = [
  { skill: 'Python',    items: ['github', 'cert'],  status: 'proven'  },
  { skill: 'ML',        items: ['github', 'challenge'], status: 'proven' },
  { skill: 'OpenCV',    items: ['github'],           status: 'proven'  },
  { skill: 'Cloud',     items: [],                   status: 'gap'     },
]

function AnimatedBar({ pct, color }) {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-2.5 rounded-full ${color} skill-bar-fill`}
        style={{ '--bar-width': `${pct}%`, width: `${pct}%` }}
      />
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
        <p className="font-bold">{payload[0].payload.skill}</p>
        <p className="text-orange-400">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [tab, setTab] = useState('passport')

  return (
    <div className="flex h-screen bg-orange-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar role="student" />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-orange-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Student Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Welcome back, Priya · B.Tech CSE · 3rd Year</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="badge-orange py-1 px-3 font-bold text-sm flex items-center gap-1.5">
              <Shield size={13} /> Industry Readiness: 78%
            </div>
            <button className="relative btn-ghost p-2">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">P</div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Skills Proven',    value: '8',    icon: CheckCircle2, color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30'  },
              { label: 'Skill Gaps',       value: '2',    icon: AlertTriangle,color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30'      },
              { label: 'Challenges Done',  value: '5',    icon: Trophy,       color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-900/30'  },
              { label: 'Interview Calls',  value: '3',    icon: Briefcase,    color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30'},
            ].map(s => (
              <div key={s.label} className="card flex items-center gap-4 py-4">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-orange-100 dark:bg-gray-800 rounded-xl w-fit">
            {[['passport','Skill Passport'], ['proof','Proof Map'], ['activity','Activity']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB: SKILL PASSPORT ── */}
          {tab === 'passport' && (
            <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Radar chart */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="section-title text-lg">Skill Radar</h2>
                    <p className="section-sub text-xs">Interactive skill coverage map</p>
                  </div>
                  <span className="badge-orange">6 Skills Mapped</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <PolarGrid stroke="rgba(249,115,22,0.2)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#f97316' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                      <Radar
                        name="Skills" dataKey="score"
                        stroke="#f97316" fill="#f97316" fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skill progress bars */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="section-title text-lg">Skill Strength</h2>
                    <p className="section-sub text-xs">Backed by verified evidence</p>
                  </div>
                  <span className="badge-green">AI Verified</span>
                </div>
                <div className="space-y-4">
                  {SKILL_BARS.map(s => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{s.proof}</span>
                          <span className="text-sm font-bold text-orange-500">{s.pct}%</span>
                        </div>
                      </div>
                      <AnimatedBar pct={s.pct} color={s.color} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry Readiness ring */}
              <div className="card lg:col-span-2">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-36 h-36 shrink-0">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="12" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f97316" strokeWidth="12"
                        strokeDasharray={`${2 * Math.PI * 50 * 0.78} ${2 * Math.PI * 50}`}
                        strokeLinecap="round" className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black gradient-text">78%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Ready</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="section-title text-lg mb-1">Industry Readiness Score</h2>
                    <p className="section-sub text-sm mb-3">Based on proven skills vs. top industry requirements</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge-green flex items-center gap-1"><CheckCircle2 size={11} /> Python Proven</span>
                      <span className="badge-green flex items-center gap-1"><CheckCircle2 size={11} /> ML Proven</span>
                      <span className="badge-green flex items-center gap-1"><CheckCircle2 size={11} /> OpenCV Proven</span>
                      <span className="badge-red flex items-center gap-1"><AlertTriangle size={11} /> Cloud Missing</span>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                        <Zap size={14} /> Skill Bridge Suggestion
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                        Complete "Cloud Deployment Basics" challenge to reach <strong>91% readiness</strong> and unlock 14 more job matches.
                      </p>
                      <button className="btn-primary mt-2 text-xs py-1.5 px-3">
                        Start Challenge <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: PROOF MAP ── */}
          {tab === 'proof' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              {PROOF_MAP.map(p => (
                <div key={p.skill} className={`card border-2 ${p.status === 'proven' ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white">{p.skill}</h3>
                    {p.status === 'proven'
                      ? <span className="badge-green"><CheckCircle2 size={11} /> Proven</span>
                      : <span className="badge-red"><AlertTriangle size={11} /> Gap</span>
                    }
                  </div>
                  {p.items.length > 0 ? (
                    <div className="space-y-2">
                      {p.items.includes('github') && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <GitBranch size={13} className="text-gray-700 dark:text-gray-300" /> GitBranch Project ✅
                        </div>
                      )}
                      {p.items.includes('cert') && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                          <FileText size={13} className="text-orange-500" /> Certificate ✅
                        </div>
                      )}
                      {p.items.includes('challenge') && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                          <Trophy size={13} className="text-amber-500" /> Challenge ✅
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-xs text-gray-400 mb-2">No evidence yet</p>
                      <button className="btn-primary text-xs py-1.5 px-3">Bridge Gap</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: ACTIVITY ── */}
          {tab === 'activity' && (
            <div className="card animate-fade-in max-w-2xl">
              <h2 className="section-title text-lg mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
                      <a.icon size={16} className={a.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{a.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock size={10} /> {a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
