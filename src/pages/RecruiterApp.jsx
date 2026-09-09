import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../context/NotificationContext'
import {
  Search, BarChart3, Calendar, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Bell, Zap, Shield, Building2,
  CheckCircle2, AlertTriangle, GitBranch, FileText, Trophy,
  Star, MapPin, GraduationCap, Filter, ChevronDown, ChevronUp,
  Mail, Clock, Users, TrendingUp, X, BarChart2
} from 'lucide-react'
import {

  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts'
import AIAssistant from '../components/AIAssistant'

// ─────────────────────────────────────────────
// DATA — static display layer (merged with live AuthContext candidates)
// ─────────────────────────────────────────────
const STATIC_CANDIDATES = [
  {
    id:'s1', name:'Priya Sharma',  college:'IIT Delhi',     branch:'CSE', year:'3rd Year', score:94, avatar:'PS', location:'Delhi',
    skills:[
      { name:'Python',    proven:true,  how:'GitHub Project (Face-Detect)',      evidence:'github'    },
      { name:'ML',        proven:true,  how:'Practical Challenge — Score 84/100',evidence:'challenge' },
      { name:'OpenCV',    proven:true,  how:'GitHub + Coursera Certificate',     evidence:'both'      },
      { name:'Cloud',     proven:false, how:'No evidence found',                 evidence:'none'      },
    ],
  },
  {
    id:'s2', name:'Arjun Mehta',   college:'NIT Trichy',    branch:'IT',  year:'4th Year', score:87, avatar:'AM', location:'Chennai',
    skills:[
      { name:'Python',    proven:true,  how:'3 GitHub repos verified',           evidence:'github'    },
      { name:'ML',        proven:true,  how:'NPTEL Certificate (AI/ML)',         evidence:'cert'      },
      { name:'OpenCV',    proven:false, how:'Claimed but no evidence',           evidence:'none'      },
      { name:'Cloud',     proven:true,  how:'AWS Cloud Practitioner Certificate',evidence:'cert'      },
    ],
  },
  {
    id:'s3', name:'Riya Patel',    college:'VIT Vellore',   branch:'CSE', year:'3rd Year', score:79, avatar:'RP', location:'Vellore',
    skills:[
      { name:'Python',    proven:true,  how:'GitHub + Certificate',              evidence:'both'      },
      { name:'ML',        proven:false, how:'Skill Bridge in progress',          evidence:'bridge'    },
      { name:'OpenCV',    proven:true,  how:'Project Challenge completed',       evidence:'challenge' },
      { name:'Cloud',     proven:false, how:'No evidence found',                 evidence:'none'      },
    ],
  },
]

/** Convert a live AuthContext candidate to display shape */
function adaptLiveCandidate(c) {
  return {
    id: c.id,
    name: c.name,
    college: c.college,
    branch: c.branch,
    year: c.year + ' Year',
    score: c.readiness,
    avatar: c.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
    location: 'On file',
    skills: (c.skills || []).map(skill => ({
      name:   skill,
      proven: true,
      how:    'Verified — see Passport',
      evidence: 'both',
    })),
  }
}

const DEMAND_DATA = [
  { skill:'Python', demand:340, available:290 },
  { skill:'ML',     demand:280, available:134 },
  { skill:'Cloud',  demand:220, available:49  },
  { skill:'OpenCV', demand:180, available:63  },
  { skill:'SQL',    demand:310, available:265 },
  { skill:'React',  demand:195, available:110 },
]

const TREND_DATA = [
  { month:'Jan', Cloud:30, ML:60, CV:45 },
  { month:'Feb', Cloud:38, ML:72, CV:50 },
  { month:'Mar', Cloud:45, ML:80, CV:52 },
  { month:'Apr', Cloud:55, ML:90, CV:60 },
  { month:'May', Cloud:65, ML:98, CV:65 },
  { month:'Jun', Cloud:80, ML:105,CV:72 },
]

const EVIDENCE_ICONS = {
  github:    { icon:GitBranch, color:'text-gray-700 dark:text-gray-300', bg:'bg-gray-100 dark:bg-gray-800'         },
  cert:      { icon:FileText,  color:'text-orange-600',                  bg:'bg-orange-100 dark:bg-orange-900/30'  },
  challenge: { icon:Trophy,    color:'text-amber-600',                   bg:'bg-amber-100 dark:bg-amber-900/30'    },
  both:      { icon:Star,      color:'text-orange-500',                  bg:'bg-orange-100 dark:bg-orange-900/30'  },
  bridge:    { icon:Zap,       color:'text-blue-500',                    bg:'bg-blue-100 dark:bg-blue-900/30'      },
  none:      { icon:AlertTriangle,color:'text-red-500',                  bg:'bg-red-100 dark:bg-red-900/30'        },
}

const ChartTip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="bg-gray-900 text-white text-xs rounded-xl px-4 py-3 shadow-xl border border-gray-700 space-y-1">
    <p className="font-bold text-orange-400 mb-1">{label}</p>
    {payload.map(p => <p key={p.name} style={{ color:p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
  </div>
) : null

// ─────────────────────────────────────────────
// MODULE: SMART SEARCH
// ─────────────────────────────────────────────
function CandidateCard({ c, onShortlist, isShortlisted }) {
  const [expanded,  setExpanded]  = useState(false)
  const [scheduled, setScheduled] = useState(!!isShortlisted)

  const handleSchedule = () => {
    setScheduled(true)
    if (onShortlist) onShortlist(c)
  }

  return (
    <div className="card hover:border-orange-300 dark:hover:border-orange-700 transition-all">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
            {c.avatar}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="flex items-center gap-1"><GraduationCap size={11}/> {c.college}</span>
              <span>{c.branch} · {c.year}</span>
              <span className="flex items-center gap-1"><MapPin size={11}/> {c.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-center">
            <div className="text-2xl font-black gradient-text">{c.score}%</div>
            <div className="text-xs text-gray-400">Match</div>
          </div>
          <div className="flex gap-2">
            {scheduled ? (
              <span className="badge-green py-1.5 px-3 flex items-center gap-1"><CheckCircle2 size={12}/> Shortlisted</span>
            ) : (
              <button onClick={handleSchedule} className="btn-primary text-xs py-2">
                <Calendar size={13}/> Shortlist
              </button>
            )}
            <button className="btn-ghost p-2"><Mail size={16}/></button>
          </div>
        </div>
      </div>

      {/* Skill chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {c.skills.map(s => {
          const { icon:Icon, color, bg } = EVIDENCE_ICONS[s.evidence]
          return (
            <div key={s.name} className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 ${bg}`}>
              <Icon size={12} className={color}/>
              <span className={`font-semibold ${s.proven ? 'text-gray-800 dark:text-gray-200' : 'text-red-600 dark:text-red-400'}`}>{s.name}</span>
              <span className={s.proven ? 'text-green-500' : 'text-red-500'}>{s.proven ? '✓' : '✗'}</span>
            </div>
          )
        })}
      </div>

      <button onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 mt-3">
        {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        {expanded ? 'Hide' : 'View'} Explainable AI Breakdown
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 animate-fade-in">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Why this candidate matched</p>
          {c.skills.map(s => {
            const { icon:Icon, color, bg } = EVIDENCE_ICONS[s.evidence]
            return (
              <div key={s.name} className={`flex items-center gap-3 p-2.5 rounded-xl border
                ${s.proven ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'}`}>
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={13} className={color}/>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{s.how}</span>
                </div>
                <span className={`text-xs font-bold shrink-0 ${s.proven ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {s.proven ? 'PROVEN ✓' : 'MISSING ✗'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ModuleSearch({ shortlist, onShortlist }) {
  const { candidates: liveCandidates } = useAuth()
  const [query,    setQuery]    = useState('')
  const [searched, setSearched] = useState(false)
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(false)

  const SUGGESTIONS = [
    'find intern who knows machine learning and image processing',
    'Python + SQL + Data Analysis students',
    'OpenCV computer vision intern',
  ]

  // Merge live candidates (adapted) with static ones, de-dup by id
  const liveAdapted = (liveCandidates || [])
    .filter(c => !c.flagged)
    .map(adaptLiveCandidate)

  const allCandidates = [
    ...liveAdapted,
    ...STATIC_CANDIDATES.filter(s => !liveAdapted.find(l => l.name === s.name)),
  ].sort((a, b) => b.score - a.score)

  // Simple keyword filter on query
  const filtered = searched
    ? allCandidates.filter(c => {
        if (filter === 'proven') return c.skills.every(s => s.proven)
        return true
      })
    : []

  const handleSearch = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    setSearched(true)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="card">
        <h2 className="section-title text-base mb-1">Natural Language Search</h2>
        <p className="section-sub text-xs mb-4">Type what you need in plain English — the AI understands skills, domains and experience.</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleSearch()}
              placeholder='"find intern who knows machine learning and image processing"'
              className="input pl-12 py-3.5 text-base"/>
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary px-6 text-base glow-orange shrink-0">
            {loading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Search'}
          </button>
        </div>
        {!searched && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center">Try:</span>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); handleSearch() }}
                className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-full px-3 py-1.5 hover:bg-orange-100 transition-colors">
                "{s}"
              </button>
            ))}
          </div>
        )}
      </div>

      {searched && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-gray-400"/>
            {[['all','All'],['proven','All Skills Proven'],['available','Available Now']].map(([key,label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all
                  ${filter===key ? 'bg-orange-500 text-white' : 'bg-orange-100 dark:bg-gray-800 text-orange-700 dark:text-orange-300'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <Zap size={16} className="text-orange-500 shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">AI Understood Your Query</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                Detected: <strong>Python · Machine Learning · Image Processing / OpenCV</strong>. Ranked by verified evidence.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title text-base">Ranked Match Results</h2>
                <p className="section-sub text-xs">{filtered.length} candidates ranked by proven skill evidence</p>
              </div>
              <span className="badge-orange">{filtered.length} Found</span>
            </div>
            {filtered.map((c,i) => (
              <div key={c.id} className="relative">
                {i===0 && <div className="absolute -top-2 left-4 z-10"><span className="badge bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md py-0.5 px-2.5 flex items-center gap-1"><Star size={10}/> Top Match</span></div>}
                <CandidateCard
                  c={c}
                  onShortlist={onShortlist}
                  isShortlisted={shortlist.some(s => s.id === c.id)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {!searched && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-orange-400"/>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Search for Talent</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Type a natural language query to find candidates with AI-verified skills.</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// SCHEDULE MODAL
// ─────────────────────────────────────────────
function ScheduleModal({ candidate, onConfirm, onClose }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')

  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card max-w-sm w-full animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Schedule Interview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Scheduling interview with <strong className="text-orange-500">{candidate.name}</strong></p>
        <div className="space-y-3">
          <div>
            <label className="label">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input"/>
          </div>
          <div>
            <label className="label">Time</label>
            <select value={time} onChange={e => setTime(e.target.value)} className="input">
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button
            disabled={!date}
            onClick={() => onConfirm(date, time)}
            className="btn-primary flex-1 justify-center glow-orange disabled:opacity-40"
          >
            <Calendar size={15}/> Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MODULE: SHORTLIST
// ─────────────────────────────────────────────
function ModuleShortlist({ shortlist, onRemove }) {
  const [scheduleModal, setScheduleModal] = useState(null)
  const [scheduled, setScheduled] = useState({})  // id -> {date, time}

  const handleConfirmSchedule = (id, date, time) => {
    setScheduled(prev => ({ ...prev, [id]: { date, time } }))
    setScheduleModal(null)
  }
  const scheduledCount = Object.keys(scheduled).length
  const interviewCount = shortlist.filter(c => scheduled[c.id]).length

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label:'Shortlisted',    value: shortlist.length,  icon:Users,    color:'text-orange-500', bg:'bg-orange-100 dark:bg-orange-900/30' },
          { label:'Interviews',     value: interviewCount,    icon:Calendar, color:'text-green-500',  bg:'bg-green-100 dark:bg-green-900/30'   },
          { label:'Pending Review', value: shortlist.length - interviewCount, icon:Clock, color:'text-amber-500', bg:'bg-amber-100 dark:bg-amber-900/30' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3 py-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={20} className={s.color}/>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shortlist table */}
      <div className="card">
        <h2 className="section-title text-base mb-4">Shortlisted Candidates</h2>
        <div className="space-y-3">
          {shortlist.map(c => {
            const sched = scheduled[c.id]
            return (
              <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 flex-wrap animate-slide-up">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {c.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{c.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span>Match: <strong className="text-orange-500">{c.score}%</strong></span>
                    {sched && <span className="flex items-center gap-1"><Calendar size={10}/> {sched.date} · {sched.time}</span>}
                  </div>
                </div>
                <span className={`badge text-xs ${sched ? 'badge-green' : 'badge-orange'}`}>
                  {sched ? 'Interview Scheduled' : 'Under Review'}
                </span>
                {!sched && (
                  <button
                    onClick={() => setScheduleModal(c)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <Calendar size={12}/> Schedule
                  </button>
                )}
                <button onClick={() => onRemove(c.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={16}/>
                </button>
              </div>
            )
          })}
        </div>
        {shortlist.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No candidates shortlisted yet. Use Smart Search to find and shortlist talent.
          </p>
        )}
      </div>

      {/* Upcoming interviews */}
      <div className="card">
        <h2 className="section-title text-base mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-orange-500"/> Upcoming Interviews
        </h2>
        <div className="space-y-3">
          {shortlist.filter(c => scheduled[c.id]).map(c => {
            const sched = scheduled[c.id]
            const dateParts = sched.date.split('-')
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            const month = monthNames[parseInt(dateParts[1]) - 1] || 'TBD'
            const day   = dateParts[2] || '?'
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-slide-up">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex flex-col items-center justify-center text-green-700 dark:text-green-300 shrink-0">
                  <span className="text-xs font-bold leading-none">{month.toUpperCase()}</span>
                  <span className="text-base font-black leading-none">{day}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock size={10}/> {sched.time} · Video Interview
                  </p>
                </div>
                <span className="badge-green text-xs">Confirmed</span>
              </div>
            )
          })}
          {shortlist.filter(c => scheduled[c.id]).length === 0 && (
            <p className="text-sm text-gray-400">No interviews scheduled yet. Shortlist candidates and schedule interviews.</p>
          )}
        </div>
      </div>

      {/* Schedule modal */}
      {scheduleModal && (
        <ScheduleModal
          candidate={scheduleModal}
          onConfirm={(date, time) => handleConfirmSchedule(scheduleModal.id, date, time)}
          onClose={() => setScheduleModal(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// MODULE: SKILL ANALYTICS
// ─────────────────────────────────────────────
function ModuleAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title text-base mb-1">Industry Demand vs Availability</h2>
          <p className="section-sub text-xs mb-4">Top skills — company demand vs students with proven evidence</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMAND_DATA} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)"/>
                <XAxis dataKey="skill" tick={{ fontSize:11, fill:'#9ca3af' }}/>
                <YAxis tick={{ fontSize:10, fill:'#9ca3af' }}/>
                <Tooltip content={<ChartTip/>}/>
                <Legend wrapperStyle={{ fontSize:'11px' }}/>
                <Bar dataKey="demand"    fill="#f97316" name="Demand"    radius={[4,4,0,0]}/>
                <Bar dataKey="available" fill="#fdba74" name="Available" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2 className="section-title text-base mb-1">Skill Demand Trends</h2>
          <p className="section-sub text-xs mb-4">6-month growth for top emerging skills</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fb923c" stopOpacity={0.3}/><stop offset="95%" stopColor="#fb923c" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fdba74" stopOpacity={0.3}/><stop offset="95%" stopColor="#fdba74" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)"/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9ca3af' }}/>
                <YAxis tick={{ fontSize:10, fill:'#9ca3af' }}/>
                <Tooltip content={<ChartTip/>}/>
                <Legend wrapperStyle={{ fontSize:'11px' }}/>
                <Area type="monotone" dataKey="Cloud" stroke="#f97316" fill="url(#gC)" strokeWidth={2} name="Cloud"/>
                <Area type="monotone" dataKey="ML"    stroke="#fb923c" fill="url(#gM)" strokeWidth={2} name="ML"/>
                <Area type="monotone" dataKey="CV"    stroke="#fdba74" fill="url(#gV)" strokeWidth={2} name="Computer Vision"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-orange-500"/>
          <h2 className="section-title text-base">Skill Gap Alerts</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { skill:'Cloud Deployment', demand:115, students:49,  urgency:'critical' },
            { skill:'AI in Healthcare', demand:95,  students:22,  urgency:'critical' },
            { skill:'Computer Vision',  demand:88,  students:63,  urgency:'high'     },
            { skill:'NLP',             demand:60,  students:29,  urgency:'medium'   },
          ].map(a => (
            <div key={a.skill} className={`p-4 rounded-xl border-2 flex items-start gap-3
              ${a.urgency==='critical' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : a.urgency==='high' ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10' : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'}`}>
              <TrendingUp size={20} className={a.urgency==='critical' ? 'text-red-500 shrink-0' : 'text-orange-500 shrink-0'}/>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{a.skill}</h3>
                  <span className={`badge text-xs ${a.urgency==='critical' ? 'badge-red' : a.urgency==='high' ? 'badge-orange' : 'bg-amber-100 text-amber-700'}`}>{a.urgency}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {a.demand} companies need it · Only {a.students} students have proof
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div className="h-1.5 rounded-full bg-red-400" style={{ width:`${(a.students/a.demand)*100}%` }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SIDEBAR NAV
// ─────────────────────────────────────────────
const NAV = [
  { key:'search',    label:'Smart Search',    icon:Search    },
  { key:'shortlist', label:'Shortlist',        icon:BarChart3 },
  { key:'analytics', label:'Skill Analytics',  icon:BarChart2 },
]

// ─────────────────────────────────────────────
// MAIN RECRUITER APP
// ─────────────────────────────────────────────
export default function RecruiterApp() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { notify, addNotification } = useNotifications()
  const navigate = useNavigate()
  const [module,    setModule]    = useState('search')
  const [collapsed, setCollapsed] = useState(false)
  const [shortlist, setShortlist] = useState([])

  const doLogout = () => { logout(); navigate('/login') }

  const handleShortlist = useCallback((candidate) => {
    setShortlist(prev => {
      if (prev.find(c => c.id === candidate.id)) return prev
      addNotification('recruiter',
        'Candidate shortlisted',
        `${candidate.name} has been added to your shortlist.`)
      return [...prev, candidate]
    })
  }, [addNotification])

  const handleRemove = useCallback((id) => {
    setShortlist(prev => prev.filter(c => c.id !== id))
  }, [])

  const MODULE_TITLES = {
    search:    'Smart Talent Search',
    shortlist: 'Shortlist & Interviews',
    analytics: 'Skill Analytics',
  }

  return (
    <div className="flex h-screen bg-orange-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`relative flex flex-col h-screen sticky top-0 border-r border-orange-200/40 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="flex items-center gap-2 px-4 h-16 border-b border-orange-200/30 dark:border-gray-800 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <Zap size={16} className="text-white"/>
          </div>
          {!collapsed && <span className="font-extrabold text-base gradient-text">SkillPassport</span>}
        </div>

        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md z-10 hover:bg-orange-600 transition-colors">
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>

        {!collapsed && (
          <div className="px-4 pt-4 pb-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">Recruiter</span>
              <span className="badge-green text-xs flex items-center gap-1"><Shield size={9}/> Verified</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        )}

        <nav className="flex-1 px-2 pt-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ key, label, icon:Icon }) => (
            <button key={key} onClick={() => setModule(key)}
              className={`sidebar-link ${module===key ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''} w-full text-left`}
              title={collapsed ? label : undefined}>
              <Icon size={18} className="shrink-0"/>
              {!collapsed && <span>{label}</span>}
              {!collapsed && key === 'shortlist' && shortlist.length > 0 && (
                <span className="ml-auto text-xs font-bold bg-orange-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {shortlist.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-2 pb-4 flex flex-col gap-0.5 border-t border-orange-200/30 dark:border-gray-800 pt-3">
          <button onClick={toggle} className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''} w-full`}>
            {dark ? <Sun size={18} className="text-orange-400 shrink-0"/> : <Moon size={18} className="text-orange-600 shrink-0"/>}
            {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={doLogout} className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''} w-full`}>
            <LogOut size={18} className="shrink-0"/>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-orange-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">{MODULE_TITLES[module]}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email} · Verified Recruiter Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex badge-green py-1 px-3 text-sm font-semibold items-center gap-1.5">
              <Building2 size={12}/> Verified Company
            </div>
            <button className="relative btn-ghost p-2">
              <Bell size={18}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"/>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name?.[0] || 'R'}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {module === 'search'    && <ModuleSearch shortlist={shortlist} onShortlist={handleShortlist}/>}
          {module === 'shortlist' && <ModuleShortlist shortlist={shortlist} onRemove={handleRemove}/>}
          {module === 'analytics' && <ModuleAnalytics/>}
        </div>      <AIAssistant role="recruiter" module={module}/>

      </main>
    </div>
  )
}
