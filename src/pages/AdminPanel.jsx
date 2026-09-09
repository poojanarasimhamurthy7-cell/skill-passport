import { useState, useCallback } from 'react'
import {
  ShieldAlert, Users, AlertTriangle, CheckCircle2, XCircle,
  Eye, EyeOff, Lock, Unlock, Filter, Search, RefreshCw,
  BarChart3, TrendingUp, Download, Bell, Zap, Building2,
  FileText, GitBranch, ChevronDown, ChevronUp, Edit2,
  Save, X, Clock, Star, Database, Activity, Globe
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// ── MOCK TELEMETRY DATA ───────────────────────────────────────────
const TELEMETRY_TREND = [
  { date:'Sep 1',  logins:12, assessments:8,  flags:1, matches:3  },
  { date:'Sep 2',  logins:18, assessments:14, flags:2, matches:5  },
  { date:'Sep 3',  logins:24, assessments:19, flags:0, matches:8  },
  { date:'Sep 4',  logins:15, assessments:11, flags:3, matches:4  },
  { date:'Sep 5',  logins:30, assessments:25, flags:1, matches:11 },
  { date:'Sep 6',  logins:22, assessments:17, flags:2, matches:7  },
  { date:'Sep 7',  logins:28, assessments:23, flags:0, matches:9  },
]

const SCORE_DIST = [
  { range:'0–20%',  count:2  },
  { range:'21–40%', count:5  },
  { range:'41–59%', count:8  },
  { range:'60–70%', count:14 },
  { range:'71–80%', count:22 },
  { range:'81–90%', count:18 },
  { range:'91–100%',count:9  },
]

const FLAGGED_DOCS = [
  {
    id:'FD001', candidate:'Ravi Kumar',    srn:'GIT2023ME003',
    doc:'ML_Certificate_Unknown.jpg', reason:'Pixel artefacts near name field + no QR code',
    severity:'high', timestamp:'Sep 6, 2026 · 14:32', status:'pending',
  },
  {
    id:'FD002', candidate:'Unknown User',  srn:'UNKNOWN',
    doc:'Resume_Modified.pdf',        reason:'Metadata stripped · Font inconsistency detected',
    severity:'critical', timestamp:'Sep 5, 2026 · 09:14', status:'blocked',
  },
  {
    id:'FD003', candidate:'Kiran Mehta',   srn:'GIT2023IT008',
    doc:'Internship_Letter.pdf',      reason:'No QR code — queued for manual review',
    severity:'low', timestamp:'Sep 4, 2026 · 16:45', status:'reviewing',
  },
]

const ACTIVITY_LOG = [
  { time:'09:14', event:'Admin login — Overseer Alpha', type:'auth'    },
  { time:'09:31', event:'Company CloudNine Ventures blocked — bg check failed', type:'block' },
  { time:'10:02', event:'Candidate STU003 flagged — fake document detected',    type:'flag'  },
  { time:'11:15', event:'Retake token issued to STU003',                         type:'token' },
  { time:'13:44', event:'NovaMed Solutions approved after full vetting',         type:'approve'},
  { time:'14:32', event:'New flagged document FD001 added to review queue',     type:'flag'  },
  { time:'15:10', event:'Interview scheduled — Arjun Verma × NovaMed',          type:'interview'},
]

const LOG_COLORS = {
  auth:      'text-blue-500  bg-blue-100 dark:bg-blue-900/30',
  block:     'text-red-500   bg-red-100 dark:bg-red-900/30',
  flag:      'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
  token:     'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  approve:   'text-green-500 bg-green-100 dark:bg-green-900/30',
  interview: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
}

const ChartTip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-gray-700 space-y-1">
      <p className="font-bold text-orange-400">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color:p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  ) : null

// ── IMMUTABLE FIELD GUARD ─────────────────────────────────────────
function CandidateRecord({ candidate, onUpdate, IMMUTABLE_FIELDS }) {
  const [editing, setEditing]   = useState(false)
  const [draft,   setDraft]     = useState({ ...candidate })
  const [saved,   setSaved]     = useState(false)
  const [showAll, setShowAll]   = useState(false)

  const FIELDS = [
    { key:'name',          label:'Full Name',       immutable: false },
    { key:'email',         label:'Email',           immutable: false },
    { key:'srn',           label:'SRN',             immutable: true  },
    { key:'college',       label:'College',         immutable: true  },
    { key:'branch',        label:'Branch',          immutable: true  },
    { key:'enrollmentYear',label:'Enrollment Year', immutable: true  },
    { key:'year',          label:'Current Year',    immutable: false },
    { key:'cgpa',          label:'CGPA',            immutable: false },
  ]

  const visibleFields = showAll ? FIELDS : FIELDS.slice(0, 4)

  const save = () => {
    onUpdate(candidate.id, draft)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const SEV_COLOR = {
    active: 'badge-green', review: 'badge-orange', blocked: 'badge-red'
  }

  return (
    <div className={`border-2 rounded-xl overflow-hidden
      ${candidate.flagged ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-700'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {candidate.name.split(' ').map(w=>w[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm text-gray-900 dark:text-white">{candidate.name}</p>
            <span className={`${SEV_COLOR[candidate.status] || 'badge-orange'} badge text-xs`}>{candidate.status}</span>
            {candidate.flagged && <span className="badge-red text-xs flex items-center gap-1"><AlertTriangle size={10}/> Flagged</span>}
          </div>
          <p className="text-xs text-gray-500 font-mono">{candidate.srn} · {candidate.college}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-black text-orange-500">{candidate.assessmentScore}%</span>
          <span className="text-xs text-gray-400">score</span>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-ghost p-1.5 text-orange-500">
              <Edit2 size={14}/>
            </button>
          ) : (
            <div className="flex gap-1">
              <button onClick={save} className="btn-ghost p-1.5 text-green-500"><Save size={14}/></button>
              <button onClick={() => { setEditing(false); setDraft({...candidate}) }} className="btn-ghost p-1.5 text-red-400"><X size={14}/></button>
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="px-4 py-3 space-y-2">
        {visibleFields.map(f => {
          const isImmutable = IMMUTABLE_FIELDS.includes(f.key)
          const val = draft[f.key] ?? '—'
          return (
            <div key={f.key} className="flex items-center gap-3">
              <span className="w-32 text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0 flex items-center gap-1">
                {isImmutable && <Lock size={10} className="text-orange-400 shrink-0"/>}
                {f.label}
              </span>
              {editing && !isImmutable ? (
                <input value={draft[f.key] || ''} onChange={e => setDraft(d => ({...d,[f.key]:e.target.value}))}
                  className="input py-1.5 text-xs flex-1"/>
              ) : (
                <span className={`text-xs flex-1 ${isImmutable ? 'text-orange-500 dark:text-orange-400 font-mono font-semibold' : 'text-gray-800 dark:text-gray-200'}`}>
                  {val}
                  {isImmutable && <span className="ml-1.5 text-xs text-gray-400 italic">(immutable)</span>}
                </span>
              )}
            </div>
          )
        })}
        <button onClick={() => setShowAll(s=>!s)} className="text-xs text-orange-500 hover:underline mt-1">
          {showAll ? '▲ Show less' : '▼ Show all fields'}
        </button>
      </div>

      {/* OSINT bar */}
      {candidate.osint && (
        <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
          <span>LeetCode: <strong className="text-orange-400">{candidate.osint.leetcode}</strong></span>
          <span>GFG: <strong className="text-green-400">{candidate.osint.gfg}</strong></span>
          <span>GitHub: <strong className="text-gray-300">{candidate.osint.github} repos</strong></span>
          <span>LinkedIn: <strong className={candidate.osint.linkedin?'text-blue-400':'text-red-400'}>{candidate.osint.linkedin?'Active':'Missing'}</strong></span>
        </div>
      )}

      {saved && (
        <div className="mx-4 mb-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300 flex items-center gap-1 animate-fade-in">
          <CheckCircle2 size={12}/> Changes saved. Immutable fields were not modified.
        </div>
      )}
    </div>
  )
}

// ── FLAGGED DOCUMENTS QUEUE ───────────────────────────────────────
function FlaggedQueue({ flaggedDocs }) {
  const [statuses, setStatuses] = useState(
    Object.fromEntries(flaggedDocs.map(d => [d.id, d.status]))
  )

  const resolve = (id, action) => setStatuses(s => ({ ...s, [id]: action }))

  const SEV = {
    critical: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10',
    high:     'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10',
    low:      'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10',
  }
  const SEV_BADGE = {
    critical: 'badge-red', high: 'badge text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    low: 'badge-blue'
  }

  return (
    <div className="space-y-3">
      {FLAGGED_DOCS.map(doc => {
        const status = statuses[doc.id]
        return (
          <div key={doc.id} className={`rounded-xl border-2 p-4 space-y-3 ${SEV[doc.severity]}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{doc.candidate}</p>
                  <span className={`${SEV_BADGE[doc.severity]} text-xs`}>{doc.severity}</span>
                  <span className={`badge text-xs ${status==='blocked'?'badge-red':status==='cleared'?'badge-green':'badge-orange'}`}>{status}</span>
                </div>
                <p className="text-xs text-gray-500 font-mono">{doc.srn}</p>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                <Clock size={11}/> {doc.timestamp}
              </p>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <FileText size={14} className="text-orange-500 shrink-0 mt-0.5"/>
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{doc.doc}</p>
                <p className="text-xs text-gray-500 mt-0.5">{doc.reason}</p>
              </div>
            </div>

            {status !== 'blocked' && status !== 'cleared' && (
              <div className="flex gap-2">
                <button onClick={() => resolve(doc.id,'blocked')}
                  className="btn-ghost text-xs text-red-500 border border-red-200 dark:border-red-800 rounded-xl px-3 py-1.5 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <XCircle size={13}/> Block Application
                </button>
                <button onClick={() => resolve(doc.id,'cleared')}
                  className="btn-ghost text-xs text-green-600 border border-green-200 dark:border-green-800 rounded-xl px-3 py-1.5 flex items-center gap-1 hover:bg-green-50 dark:hover:bg-green-900/20">
                  <CheckCircle2 size={13}/> Clear — Manual Review OK
                </button>
              </div>
            )}

            {status === 'blocked' && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <XCircle size={12}/> Application blocked. Candidate removed from recruiter visibility.
              </p>
            )}
            {status === 'cleared' && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 size={12}/> Cleared by manual review. Candidate restored to active pool.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── MAIN ADMIN PANEL ──────────────────────────────────────────────
export default function AdminPanel() {
  const { user, candidates, updateCandidate, flaggedDocs, IMMUTABLE_FIELDS } = useAuth()
  const navigate  = useNavigate()
  const [tab,     setTab]     = useState('telemetry')
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  // Guard — redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <ShieldAlert size={48} className="text-red-500 mx-auto"/>
          <h2 className="text-2xl font-black text-white">Access Denied</h2>
          <p className="text-gray-400">This panel is restricted to registered admin overseers only.</p>
          <button onClick={() => navigate('/x-overseer-9a4f')} className="btn-primary mx-auto">
            Go to Admin Login
          </button>
        </div>
      </div>
    )
  }

  const filteredCandidates = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.srn.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all'     ? true :
                        filter === 'flagged' ? c.flagged :
                        filter === 'review'  ? c.status === 'review' :
                        filter === 'active'  ? c.status === 'active' : true
    return matchSearch && matchFilter
  })

  const stats = {
    total:   candidates.length,
    active:  candidates.filter(c=>c.status==='active').length,
    review:  candidates.filter(c=>c.status==='review').length,
    flagged: candidates.filter(c=>c.flagged).length,
    passed:  candidates.filter(c=>c.assessmentScore>=60).length,
    avgScore:Math.round(candidates.reduce((s,c)=>s+c.assessmentScore,0)/candidates.length),
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Admin topbar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-6 py-4 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-md">
          <ShieldAlert size={18} className="text-white"/>
        </div>
        <div>
          <h1 className="text-base font-black text-white">Admin Overseer Panel</h1>
          <p className="text-xs text-gray-500">{user.name} · {user.email} · Master Access</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-900/30 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>Live
          </div>
          <div className="relative">
            <Bell size={18} className="text-gray-400"/>
            {flaggedDocs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                {flaggedDocs.length}
              </span>
            )}
          </div>
          <span className="badge text-xs bg-red-900/40 text-red-400 border border-red-800">
            RESTRICTED — Admin Only
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label:'Total Students', value:stats.total,   color:'text-white',       bg:'bg-gray-800'         },
            { label:'Active',         value:stats.active,  color:'text-green-400',   bg:'bg-green-900/20'     },
            { label:'In Review',      value:stats.review,  color:'text-amber-400',   bg:'bg-amber-900/20'     },
            { label:'Flagged',        value:stats.flagged, color:'text-red-400',      bg:'bg-red-900/20'       },
            { label:'Passed (≥60%)',  value:stats.passed,  color:'text-orange-400',  bg:'bg-orange-900/20'    },
            { label:'Avg Score',      value:`${stats.avgScore}%`,color:'text-blue-400',bg:'bg-blue-900/20'    },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-gray-800`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl w-fit flex-wrap border border-gray-800">
          {[
            ['telemetry','Live Telemetry'],
            ['candidates','Candidate DB'],
            ['flagged','Flagged Queue'],
            ['activity','Activity Log'],
          ].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${tab===key ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-400 hover:text-orange-400'}`}>
              {label}
              {key==='flagged' && flaggedDocs.length>0 && (
                <span className="ml-1.5 w-4 h-4 bg-red-500 rounded-full text-xs inline-flex items-center justify-center">
                  {FLAGGED_DOCS.filter(d=>d.status==='pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TELEMETRY TAB ── */}
        {tab === 'telemetry' && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Activity trend */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="font-bold text-sm text-white mb-1">7-Day Platform Activity</h2>
                <p className="text-xs text-gray-500 mb-4">Logins · Assessments · Flags · Matches</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TELEMETRY_TREND} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="date" tick={{ fontSize:10, fill:'#6b7280' }}/>
                      <YAxis tick={{ fontSize:10, fill:'#6b7280' }}/>
                      <Tooltip content={<ChartTip/>}/>
                      <Legend wrapperStyle={{ fontSize:'11px' }}/>
                      <Line type="monotone" dataKey="logins"      stroke="#f97316" strokeWidth={2} dot={false} name="Logins"/>
                      <Line type="monotone" dataKey="assessments" stroke="#22c55e" strokeWidth={2} dot={false} name="Assessments"/>
                      <Line type="monotone" dataKey="flags"       stroke="#ef4444" strokeWidth={2} dot={false} name="Flags"/>
                      <Line type="monotone" dataKey="matches"     stroke="#60a5fa" strokeWidth={2} dot={false} name="Matches"/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Score distribution */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="font-bold text-sm text-white mb-1">Assessment Score Distribution</h2>
                <p className="text-xs text-gray-500 mb-4">Number of students per score range</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SCORE_DIST} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="range" tick={{ fontSize:9, fill:'#6b7280' }}/>
                      <YAxis tick={{ fontSize:10, fill:'#6b7280' }}/>
                      <Tooltip content={<ChartTip/>}/>
                      <Bar dataKey="count" name="Students" radius={[4,4,0,0]}
                        fill="#f97316"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Live metrics grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label:'Total Logins Today',      value:'28',  icon:Activity,   color:'text-orange-400', trend:'+12%' },
                { label:'Assessments Completed',   value:'23',  icon:BarChart3,  color:'text-green-400',  trend:'+8%'  },
                { label:'Fraud Flags Triggered',   value:'3',   icon:AlertTriangle,color:'text-red-400',  trend:'-1'   },
                { label:'Successful Matches',      value:'9',   icon:Star,       color:'text-blue-400',   trend:'+3'   },
              ].map(m => (
                <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <m.icon size={18} className={m.color}/>
                    <span className="text-xs text-gray-500">{m.trend}</span>
                  </div>
                  <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CANDIDATE DB TAB ── */}
        {tab === 'candidates' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or SRN..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-orange-600 transition-all"/>
              </div>
              {/* Filter */}
              <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl">
                {[['all','All'],['active','Active'],['review','Review'],['flagged','Flagged']].map(([key,label]) => (
                  <button key={key} onClick={() => setFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                      ${filter===key ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-orange-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">{filteredCandidates.length} records</span>
            </div>

            {/* Immutable fields notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-950/40 border border-orange-900 text-xs text-orange-400">
              <Lock size={14} className="shrink-0 mt-0.5 text-orange-500"/>
              <p>
                <strong>Database Partitioning Active:</strong> Fields marked with 🔒 (SRN, College, Branch, Enrollment Year)
                are <strong>immutable</strong> once set and cannot be edited from any interface.
                All other fields are editable by admin only. Candidate-facing fields follow privacy settings.
              </p>
            </div>

            <div className="space-y-3">
              {filteredCandidates.length > 0 ? filteredCandidates.map(c => (
                <CandidateRecord key={c.id} candidate={c} onUpdate={updateCandidate} IMMUTABLE_FIELDS={IMMUTABLE_FIELDS}/>
              )) : (
                <div className="text-center py-12 text-gray-600">
                  <Database size={32} className="mx-auto mb-2"/>
                  <p>No candidates match your filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FLAGGED QUEUE TAB ── */}
        {tab === 'flagged' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/30 border border-red-900">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5"/>
              <div>
                <p className="font-bold text-sm text-red-400">Fraud Detection Queue</p>
                <p className="text-xs text-red-500/80 mt-0.5">
                  {FLAGGED_DOCS.filter(d=>d.status==='pending').length} documents pending manual review.
                  Blocked applications are invisible to all recruiters.
                  Admin review is required before clearing any flagged submission.
                </p>
              </div>
            </div>
            <FlaggedQueue flaggedDocs={FLAGGED_DOCS}/>
          </div>
        )}

        {/* ── ACTIVITY LOG TAB ── */}
        {tab === 'activity' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm text-white">System Activity Log</h2>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
                  Live · Sep 7, 2026
                </div>
              </div>
              <div className="space-y-2">
                {ACTIVITY_LOG.map((log, i) => {
                  const cls = LOG_COLORS[log.type] || 'text-gray-400 bg-gray-800'
                  const [textCls, bgCls] = cls.split('  ')
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-800/60">
                      <span className="font-mono text-xs text-gray-500 shrink-0 w-12">{log.time}</span>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${bgCls}`}/>
                      <p className="text-xs text-gray-300 flex-1">{log.event}</p>
                      <span className={`badge text-xs ${bgCls} ${textCls} shrink-0 capitalize`}>{log.type}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-600">
                All admin actions, access attempts, fraud flags, and system events are recorded here.
                Log export available in production via backend integration.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
