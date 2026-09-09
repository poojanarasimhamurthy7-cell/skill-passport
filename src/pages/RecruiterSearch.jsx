import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  Search, Filter, CheckCircle2, AlertTriangle, GitBranch,
  FileText, Trophy, Calendar, Mail, ChevronDown, ChevronUp,
  Star, MapPin, GraduationCap, Zap, Building2, Bell
} from 'lucide-react'

const CANDIDATES = [
  {
    id: 1,
    name: 'Priya Sharma',
    college: 'IIT Delhi',
    branch: 'CSE',
    year: '3rd Year',
    score: 94,
    avatar: 'PS',
    location: 'Delhi',
    skills: [
      { name: 'Python',    proven: true,  how: 'GitHub Project (Face-Detect)',     evidence: 'github'    },
      { name: 'ML',        proven: true,  how: 'Practical Challenge Score: 84/100', evidence: 'challenge' },
      { name: 'OpenCV',    proven: true,  how: 'GitHub + Coursera Certificate',     evidence: 'both'      },
      { name: 'Cloud',     proven: false, how: 'No evidence found',                 evidence: 'none'      },
    ],
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    college: 'NIT Trichy',
    branch: 'IT',
    year: '4th Year',
    score: 87,
    avatar: 'AM',
    location: 'Chennai',
    skills: [
      { name: 'Python',    proven: true,  how: '3 GitBranch repos verified',           evidence: 'github'    },
      { name: 'ML',        proven: true,  how: 'NPTEL Certificate (AI/ML)',          evidence: 'cert'      },
      { name: 'OpenCV',    proven: false, how: 'Claimed but no evidence',            evidence: 'none'      },
      { name: 'Cloud',     proven: true,  how: 'AWS Cloud Practitioner Certificate', evidence: 'cert'      },
    ],
  },
  {
    id: 3,
    name: 'Riya Patel',
    college: 'VIT Vellore',
    branch: 'CSE (AI)',
    year: '3rd Year',
    score: 79,
    avatar: 'RP',
    location: 'Vellore',
    skills: [
      { name: 'Python',    proven: true,  how: 'GitHub + Certificate',              evidence: 'both'      },
      { name: 'ML',        proven: false, how: 'Skill Bridge in progress',          evidence: 'bridge'    },
      { name: 'OpenCV',    proven: true,  how: 'Project Challenge completed',       evidence: 'challenge' },
      { name: 'Cloud',     proven: false, how: 'No evidence found',                 evidence: 'none'      },
    ],
  },
]

const EVIDENCE_ICONS = {
  GitBranch:    { icon: GitBranch,      color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800' },
  cert:      { icon: FileText,    color: 'text-orange-600',                  bg: 'bg-orange-100 dark:bg-orange-900/30' },
  challenge: { icon: Trophy,      color: 'text-amber-600',                   bg: 'bg-amber-100 dark:bg-amber-900/30' },
  both:      { icon: Star,        color: 'text-orange-500',                  bg: 'bg-orange-100 dark:bg-orange-900/30' },
  bridge:    { icon: Zap,         color: 'text-blue-500',                    bg: 'bg-blue-100 dark:bg-blue-900/30' },
  none:      { icon: AlertTriangle, color: 'text-red-500',                   bg: 'bg-red-100 dark:bg-red-900/30' },
}

function CandidateCard({ c }) {
  const [expanded, setExpanded] = useState(false)
  const [scheduled, setScheduled] = useState(false)

  return (
    <div className="card hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Avatar + info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
            {c.avatar}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="flex items-center gap-1"><GraduationCap size={11} /> {c.college}</span>
              <span>{c.branch} · {c.year}</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> {c.location}</span>
            </div>
          </div>
        </div>

        {/* Score + actions */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-center">
            <div className="text-2xl font-black gradient-text">{c.score}%</div>
            <div className="text-xs text-gray-400">Match</div>
          </div>
          <div className="flex gap-2">
            {scheduled ? (
              <span className="badge-green py-1.5 px-3 flex items-center gap-1"><CheckCircle2 size={12} /> Interview Scheduled</span>
            ) : (
              <button onClick={() => setScheduled(true)} className="btn-primary text-xs py-2 flex items-center gap-1.5">
                <Calendar size={13} /> Schedule
              </button>
            )}
            <button className="btn-ghost p-2"><Mail size={16} /></button>
          </div>
        </div>
      </div>

      {/* Skill proof chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {c.skills.map(s => {
          const { icon: Icon, color, bg } = EVIDENCE_ICONS[s.evidence]
          return (
            <div key={s.name} className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 ${bg}`}>
              <Icon size={12} className={color} />
              <span className={`font-semibold ${s.proven ? 'text-gray-800 dark:text-gray-200' : 'text-red-600 dark:text-red-400'}`}>{s.name}</span>
              <span className={s.proven ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                {s.proven ? '✓' : '✗'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Expand explainable AI */}
      <button onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 mt-3 transition-colors">
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide' : 'View'} Explainable AI Breakdown
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 animate-fade-in">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Why this candidate matched</p>
          {c.skills.map(s => {
            const { icon: Icon, color, bg } = EVIDENCE_ICONS[s.evidence]
            return (
              <div key={s.name} className={`flex items-center gap-3 p-2.5 rounded-xl border ${s.proven ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'}`}>
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={13} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{s.how}</span>
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

export default function RecruiterSearch() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [filter, setFilter] = useState('all')

  const SUGGESTIONS = [
    'find intern who knows machine learning and image processing',
    'Python + SQL + Data Analysis students',
    'OpenCV computer vision intern',
  ]

  return (
    <div className="flex h-screen bg-orange-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar role="recruiter" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-orange-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Smart Talent Search</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">hr@dabur.com · Dabur India Ltd</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex badge-green py-1.5 px-3 text-sm font-semibold items-center gap-1.5">
              <Building2 size={12} /> Verified Company
            </div>
            <button className="relative btn-ghost p-2">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Natural language search */}
          <div className="card">
            <h2 className="section-title text-base mb-1">Natural Language Search</h2>
            <p className="section-sub text-xs mb-4">Type what you need in plain English — the AI understands skills, domains and experience.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setSearched(true)}
                  placeholder='e.g. "find intern who knows machine learning and image processing"'
                  className="input pl-12 py-3.5 text-base"
                />
              </div>
              <button onClick={() => setSearched(true)} className="btn-primary px-6 text-base glow-orange shrink-0">
                Search
              </button>
            </div>
            {/* Suggestions */}
            {!searched && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 self-center">Try:</span>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => { setQuery(s); setSearched(true) }}
                    className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-full px-3 py-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                    "{s}"
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          {searched && (
            <div className="flex items-center gap-2 flex-wrap animate-fade-in">
              <Filter size={15} className="text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
              {[['all','All Candidates'], ['proven','All Skills Proven'], ['available','Available Now']].map(([key, label]) => (
                <button key={key} onClick={() => setFilter(key)}
                  className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all ${filter === key ? 'bg-orange-500 text-white' : 'bg-orange-100 dark:bg-gray-800 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {searched && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="section-title text-base">Ranked Match Results</h2>
                  <p className="section-sub text-xs">AI ranked {CANDIDATES.length} candidates by verified skill evidence</p>
                </div>
                <span className="badge-orange">{CANDIDATES.length} Candidates Found</span>
              </div>

              {/* AI interpretation */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <Zap size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">AI Understood Your Query</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                    Detected skills: <strong>Python · Machine Learning · Image Processing / OpenCV</strong>. Searching candidates with verified evidence for all three.
                  </p>
                </div>
              </div>

              {CANDIDATES.map((c, i) => (
                <div key={c.id} className="relative">
                  {i === 0 && (
                    <div className="absolute -top-2 left-4 z-10">
                      <span className="badge bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md py-0.5 px-2.5 flex items-center gap-1">
                        <Star size={10} /> Top Match
                      </span>
                    </div>
                  )}
                  <CandidateCard c={c} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!searched && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Search for Talent</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Type a natural language query above to find candidates with AI-verified skills that match your requirements.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
