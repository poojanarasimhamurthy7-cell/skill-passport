import Sidebar from '../components/Sidebar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Users, Building2, GraduationCap, Globe, Bell } from 'lucide-react'

const DEMAND_DATA = [
  { skill: 'Python',          demand: 340, students: 290, gap: 50   },
  { skill: 'Machine Learning',demand: 280, students: 134, gap: 146  },
  { skill: 'Cloud',           demand: 220, students: 49,  gap: 171  },
  { skill: 'OpenCV',          demand: 180, students: 63,  gap: 117  },
  { skill: 'SQL',             demand: 310, students: 265, gap: 45   },
  { skill: 'React',           demand: 195, students: 110, gap: 85   },
  { skill: 'NLP',             demand: 145, students: 29,  gap: 116  },
  { skill: 'Docker',          demand: 130, students: 22,  gap: 108  },
]

const TREND_DATA = [
  { month: 'Jan', Cloud: 30,  AI_Health: 20, ComputerVision: 45 },
  { month: 'Feb', Cloud: 38,  AI_Health: 28, ComputerVision: 50 },
  { month: 'Mar', Cloud: 45,  AI_Health: 35, ComputerVision: 52 },
  { month: 'Apr', Cloud: 55,  AI_Health: 42, ComputerVision: 60 },
  { month: 'May', Cloud: 65,  AI_Health: 52, ComputerVision: 65 },
  { month: 'Jun', Cloud: 80,  AI_Health: 68, ComputerVision: 72 },
  { month: 'Jul', Cloud: 95,  AI_Health: 80, ComputerVision: 78 },
  { month: 'Aug', Cloud: 115, AI_Health: 95, ComputerVision: 88 },
]

const COLLEGE_DATA = [
  { name: 'Python',     score: 85 },
  { name: 'SQL',        score: 80 },
  { name: 'ML',         score: 48 },
  { name: 'React',      score: 42 },
  { name: 'Cloud',      score: 22 },
  { name: 'OpenCV',     score: 35 },
  { name: 'Docker',     score: 18 },
  { name: 'NLP',        score: 20 },
]

const ALERTS = [
  { skill: 'Cloud Deployment',    trend: 'up',   demand: 115, students: 49,  urgency: 'critical' },
  { skill: 'AI in Healthcare',    trend: 'up',   demand: 95,  students: 22,  urgency: 'critical' },
  { skill: 'Computer Vision',     trend: 'up',   demand: 88,  students: 63,  urgency: 'high'     },
  { skill: 'Natural Language Processing', trend: 'up', demand: 60, students: 29, urgency: 'medium' },
]

const CustomTooltipDark = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 text-white text-xs rounded-xl px-4 py-3 shadow-xl border border-gray-700 space-y-1">
        <p className="font-bold text-orange-400 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    )
  }
  return null
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="card flex items-center gap-4 py-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs font-semibold text-orange-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Ministry() {
  return (
    <div className="flex h-screen bg-orange-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar role="ministry" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-orange-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Ministry Skill Intelligence</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">National Skill Gap Dashboard · Live</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Data
            </div>
            <button className="relative btn-ghost p-2">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Building2}    label="Companies Tracked"   value="340+"  sub="↑ 12 this week"  color="text-orange-500" bg="bg-orange-100 dark:bg-orange-900/30" />
            <StatCard icon={Users}        label="Students Verified"   value="12.4K" sub="↑ 340 this week"  color="text-blue-500"   bg="bg-blue-100 dark:bg-blue-900/30"   />
            <StatCard icon={GraduationCap}label="Colleges Connected"  value="180"   sub="Pan-India"        color="text-green-500"  bg="bg-green-100 dark:bg-green-900/30"  />
            <StatCard icon={AlertTriangle}label="Critical Skill Gaps" value="4"     sub="Immediate action" color="text-red-500"    bg="bg-red-100 dark:bg-red-900/30"     />
          </div>

          {/* Early Warning Alerts */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-orange-500" />
              <h2 className="section-title text-base">Future Skill Early-Warning System</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {ALERTS.map(a => (
                <div key={a.skill} className={`p-4 rounded-xl border-2 flex items-start gap-3 
                  ${a.urgency === 'critical' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    : a.urgency === 'high'   ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
                    :                         'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'}`}>
                  <TrendingUp size={20} className={a.urgency === 'critical' ? 'text-red-500 shrink-0' : 'text-orange-500 shrink-0'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{a.skill}</h3>
                      <span className={`badge text-xs ${a.urgency === 'critical' ? 'badge-red' : a.urgency === 'high' ? 'badge-orange' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                        {a.urgency.charAt(0).toUpperCase() + a.urgency.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <span>📈 Industry Demand: <strong className="text-gray-900 dark:text-white">{a.demand}</strong> companies</span>
                      <span>🎓 Students: <strong className="text-gray-900 dark:text-white">{a.students}</strong></span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${(a.students / a.demand) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{Math.round((a.students / a.demand) * 100)}% student coverage · Gap: {a.demand - a.students} students needed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Industry demand vs student availability */}
            <div className="card">
              <h2 className="section-title text-base mb-1">Industry Demand vs Student Availability</h2>
              <p className="section-sub text-xs mb-4">Top 8 skills — companies searching vs students with proven skills</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEMAND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
                    <XAxis dataKey="skill" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={0} angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip content={<CustomTooltipDark />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="demand" fill="#f97316" name="Industry Demand" radius={[4,4,0,0]} />
                    <Bar dataKey="students" fill="#fdba74" name="Students Available" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Emerging skill trends */}
            <div className="card">
              <h2 className="section-title text-base mb-1">Emerging Skill Demand Trends</h2>
              <p className="section-sub text-xs mb-4">8-month demand growth for top emerging skills</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gCloud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gCV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fdba74" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fdba74" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip content={<CustomTooltipDark />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="Cloud"          stroke="#f97316" fill="url(#gCloud)" strokeWidth={2} name="Cloud" />
                    <Area type="monotone" dataKey="AI_Health"      stroke="#fb923c" fill="url(#gHealth)" strokeWidth={2} name="AI in Healthcare" />
                    <Area type="monotone" dataKey="ComputerVision" stroke="#fdba74" fill="url(#gCV)" strokeWidth={2} name="Computer Vision" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Academia skill gap */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title text-base">Academia Skill Proficiency</h2>
                <p className="section-sub text-xs">Average across 180 connected colleges</p>
              </div>
              <span className="badge-orange">National Average</span>
            </div>
            <div className="space-y-3">
              {COLLEGE_DATA.map(s => (
                <div key={s.name} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{s.name}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full skill-bar-fill ${s.score >= 70 ? 'bg-green-500' : s.score >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ '--bar-width': `${s.score}%`, width: `${s.score}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 w-16 shrink-0">
                    <span className={`text-sm font-bold ${s.score >= 70 ? 'text-green-600 dark:text-green-400' : s.score >= 40 ? 'text-orange-500' : 'text-red-500'}`}>{s.score}%</span>
                    {s.score < 40 && <span className="text-red-500">🔴</span>}
                    {s.score >= 40 && s.score < 70 && <span>🟠</span>}
                    {s.score >= 70 && <span className="text-green-500">🟢</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">📋 Policy Recommendation</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed">
                <strong>Cloud Deployment (22%)</strong> and <strong>Docker (18%)</strong> have critically low student coverage against rapidly rising industry demand.
                Recommend immediate integration of Cloud practicals in B.Tech CSE/IT curriculum across 180 colleges.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
