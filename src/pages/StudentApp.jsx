import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useStudentData } from '../context/StudentDataContext'
import { useNotifications, N_CONFIG } from '../context/NotificationContext'
import VerificationUI     from '../components/VerificationUI'
import SkillAssessment    from '../components/SkillAssessment'
import EvidenceCredibility from '../components/EvidenceCredibility'
import PrivacyCenter      from '../components/PrivacyCenter'
import FraudDetection     from './FraudDetection'
import Assessment         from './Assessment'
import AnalyticsDashboard from './AnalyticsDashboard'
import CorporateBridge    from './CorporateBridge'
import {
  LayoutDashboard, FileText, Trophy, User, BookOpen,
  Sun, Moon, LogOut, Bell, Zap, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, GitBranch, Briefcase, Star,
  Clock, Award, ArrowRight, Plus, X, Trash2,
  Shield, Code, Eye, Brain, Cloud, Database, Play,
  Users, TrendingUp, Filter, Lock, Scan, BarChart3, Building2
} from 'lucide-react'
import {

  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'
import AIAssistant from '../components/AIAssistant'

const SKILL_OPTIONS = ['Python','Machine Learning','OpenCV','React','Node.js','SQL','Cloud','Docker','TensorFlow','NLP']

/* ── Activity time formatter ──────────────────────────────────── */
function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = (Date.now() - new Date(isoStr)) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

/* ── Skill colour helper ──────────────────────────────────────── */
function skillColor(score) {
  if (score >= 75) return 'bg-orange-500'
  if (score >= 50) return 'bg-amber-500'
  if (score >= 30) return 'bg-orange-400'
  return 'bg-red-400'
}

// ── NAV ───────────────────────────────────────────────────────────
const NAV = [
  { key:'dashboard',   label:'Dashboard',          icon:LayoutDashboard, group:'main'  },
  { key:'passport',    label:'Skill Passport',      icon:FileText,        group:'main'  },
  { key:'fraud',       label:'Phase 1 · Fraud Scan',icon:Scan,            group:'phase' },
  { key:'assessment',  label:'Phase 2 · Assessment',icon:Brain,           group:'phase' },
  { key:'analytics',   label:'Phase 3 · Analytics', icon:BarChart3,       group:'phase' },
  { key:'corporate',   label:'Phase 4 · Corporate', icon:Building2,       group:'phase' },
  { key:'challenges',  label:'Challenges',          icon:Trophy,          group:'tools' },
  { key:'assessment2', label:'Skill Assessment',    icon:Brain,           group:'tools' },
  { key:'profile',     label:'Profile Setup',       icon:User,            group:'tools' },
  { key:'evidence',    label:'Evidence Score',      icon:Star,            group:'tools' },
  { key:'bridge',      label:'Skill Bridge',        icon:BookOpen,        group:'tools' },
  { key:'privacy',     label:'Privacy Centre',      icon:Lock,            group:'tools' },
]

const GROUPS = [
  { key:'main',  label:'MAIN'       },
  { key:'phase', label:'PHASES' },
  { key:'tools', label:'TOOLS'      },
]

const MODULE_TITLES = {
  dashboard:   'Student Dashboard',
  passport:    'Skill Passport',
  fraud:       'Phase 1 — Fraud Detection Engine',
  assessment:  'Phase 2 — Proctored Assessment',
  analytics:   'Phase 3 — Skill Analytics',
  corporate:   'Phase 4 — Corporate Bridge',
  challenges:  'Industry Challenges',
  assessment2: 'Skill Assessment Quiz',
  profile:     'Profile Setup',
  evidence:    'Evidence Credibility Score',
  bridge:      'Skill Bridge',
  privacy:     'Privacy Centre',
}

// ── SMALL SHARED COMPONENTS ───────────────────────────────────────
function AnimatedBar({ pct, color }) {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
      <div className={`h-2.5 rounded-full ${color} skill-bar-fill`}
        style={{ '--bar-width':`${pct}%`, width:`${pct}%` }}/>
    </div>
  )
}
const RadarTip = ({ active, payload }) => active && payload?.length ? (
  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
    <p className="font-bold">{payload[0].payload.skill}</p>
    <p className="text-orange-400">{payload[0].value}%</p>
  </div>
) : null

// ── MODULE: DASHBOARD ─────────────────────────────────────────────
function ModuleDashboard({ setModule }) {
  const {
    skills, readiness, gapCount, evidenceCount, doneCount,
    activity, phases,
  } = useStudentData()
  const { notify } = useNotifications()
  const [tab, setTab] = useState('passport')

  // Skill bars from live context
  const skillBars = skills.map(s => ({
    name:  s.name,
    pct:   s.score,
    proof: s.evidence.length > 0 ? s.evidence.join(' + ') : '⚠ No evidence yet',
    color: skillColor(s.score),
  }))

  // Radar data from live context
  const radarData = skills.slice(0,6).map(s => ({ skill: s.name, score: s.score }))

  // Proof map from live context
  const proofMap = skills.slice(0,4).map(s => ({
    skill:  s.name,
    items:  s.evidence,
    status: s.proofScore >= 30 ? 'proven' : 'gap',
  }))

  // Gap skills for readiness card
  const gapSkills = skills.filter(s => s.gap)
  const provenSkills = skills.filter(s => !s.gap)

  // Skill bridge suggestion — first gap skill
  const bridgeSkill = gapSkills[0]

  // Estimated readiness after bridging
  const estAfterBridge = bridgeSkill
    ? Math.min(100, readiness + Math.round(12 / skills.length))
    : readiness

  // Activity icons
  const ACTIVITY_ICON_MAP = {
    evidence:   { icon: FileText,  bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600'                 },
    github:     { icon: GitBranch, bg: 'bg-gray-100 dark:bg-gray-800',        color: 'text-gray-700 dark:text-gray-300' },
    challenge:  { icon: Trophy,    bg: 'bg-amber-100 dark:bg-amber-900/30',   color: 'text-amber-600'                  },
    assessment: { icon: Brain,     bg: 'bg-blue-100 dark:bg-blue-900/30',     color: 'text-blue-600'                   },
    profile:    { icon: User,      bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600'                 },
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat row — live values */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Skills Proven',   value: provenSkills.length,  icon:CheckCircle2, color:'text-green-500',  bg:'bg-green-100 dark:bg-green-900/30'   },
          { label:'Skill Gaps',      value: gapCount,             icon:AlertTriangle,color:'text-red-500',    bg:'bg-red-100 dark:bg-red-900/30'       },
          { label:'Challenges Done', value: doneCount,            icon:Trophy,       color:'text-amber-500',  bg:'bg-amber-100 dark:bg-amber-900/30'   },
          { label:'Evidence Items',  value: evidenceCount,        icon:FileText,     color:'text-orange-500', bg:'bg-orange-100 dark:bg-orange-900/30' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4 py-4 animate-slide-up">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={20} className={s.color}/>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Phase journey — live completion state */}
      <div className="card">
        <h2 className="section-title text-base mb-3">Complete Your Journey</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          {[
            { key:'fraud',      label:'Phase 1',  sub:'Fraud Detection',     icon:Scan,      color:'from-red-500 to-orange-600'    },
            { key:'assessment', label:'Phase 2',  sub:'Proctored Assessment', icon:Brain,     color:'from-orange-400 to-orange-600' },
            { key:'analytics',  label:'Phase 3',  sub:'Analytics Dashboard',  icon:BarChart3, color:'from-blue-500 to-blue-700'    },
            { key:'corporate',  label:'Phase 4',  sub:'Corporate Bridge',     icon:Building2, color:'from-green-500 to-green-700'  },
          ].map(p => {
            const done = phases[p.key]?.done
            return (
              <button key={p.key} onClick={() => setModule(p.key)}
                className="card p-4 text-left hover:border-orange-400 dark:hover:border-orange-600 group transition-all">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <p.icon size={17} className="text-white"/>
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.sub}</p>
                {done
                  ? <span className="badge-green text-xs mt-2">Completed ✓</span>
                  : <span className="badge-orange text-xs mt-2">Start →</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-orange-100 dark:bg-gray-800 rounded-xl w-fit">
        {[['passport','Skill Passport'],['proof','Proof Map'],['activity','Activity']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab===k ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab==='passport' && (
        <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Radar — live */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="section-title text-lg">Skill Radar</h2><p className="section-sub text-xs">Coverage map</p></div>
              <span className="badge-orange">{radarData.length} Skills</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top:10, right:20, bottom:10, left:20 }}>
                  <PolarGrid stroke="rgba(249,115,22,0.2)"/>
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize:11, fill:'#f97316' }}/>
                  <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fontSize:9, fill:'#9ca3af' }}/>
                  <Radar name="Skills" dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.25} strokeWidth={2}/>
                  <Tooltip content={<RadarTip/>}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill bars — live */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="section-title text-lg">Skill Strength</h2><p className="section-sub text-xs">Verified evidence</p></div>
              <span className="badge-green">Tracked</span>
            </div>
            <div className="space-y-4">
              {skillBars.map(s => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{s.proof}</span>
                      <span className="text-sm font-bold text-orange-500">{s.pct}%</span>
                    </div>
                  </div>
                  <AnimatedBar pct={s.pct} color={s.color}/>
                </div>
              ))}
            </div>
          </div>

          {/* Readiness ring — live readiness value */}
          <div className="card lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-36 h-36 shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="12"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f97316" strokeWidth="12"
                    strokeDasharray={`${2*Math.PI*50*(readiness/100)} ${2*Math.PI*50}`}
                    strokeLinecap="round" className="transition-all duration-700"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black gradient-text">{readiness}%</span>
                  <span className="text-xs text-gray-400">Readiness</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="section-title text-lg mb-1">Industry Readiness Score</h2>
                <p className="section-sub text-sm mb-3">Weighted proof score average across all tracked skills</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {provenSkills.slice(0,4).map(s => (
                    <span key={s.id} className="badge-green flex items-center gap-1">
                      <CheckCircle2 size={11}/> {s.name}
                    </span>
                  ))}
                  {gapSkills.slice(0,2).map(s => (
                    <span key={s.id} className="badge-red flex items-center gap-1">
                      <AlertTriangle size={11}/> {s.name} Gap
                    </span>
                  ))}
                </div>
                {bridgeSkill && (
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                      <Zap size={14}/> Skill Bridge Suggestion
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                      Bridge <strong>{bridgeSkill.name}</strong> → est. readiness ~{estAfterBridge}%.
                    </p>
                    <button onClick={() => setModule('bridge')} className="btn-primary mt-2 text-xs py-1.5 px-3">
                      Start Bridge <ArrowRight size={12}/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==='proof' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {proofMap.map(p => (
            <div key={p.skill} className={`card border-2 ${p.status==='proven'?'border-green-200 dark:border-green-800':'border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white">{p.skill}</h3>
                {p.status==='proven'
                  ? <span className="badge-green"><CheckCircle2 size={11}/> Proven</span>
                  : <span className="badge-red"><AlertTriangle size={11}/> Gap</span>}
              </div>
              {p.items.length > 0 ? (
                <div className="space-y-2">
                  {p.items.includes('github')     && <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-2"><GitBranch size={13}/> GitHub ✅</div>}
                  {p.items.includes('cert')       && <div className="flex items-center gap-2 text-xs text-gray-500 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2"><FileText size={13} className="text-orange-500"/> Certificate ✅</div>}
                  {p.items.includes('challenge')  && <div className="flex items-center gap-2 text-xs text-gray-500 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2"><Trophy size={13} className="text-amber-500"/> Challenge ✅</div>}
                  {p.items.includes('assessment') && <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2"><Brain size={13} className="text-blue-500"/> Assessment ✅</div>}
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-xs text-gray-400 mb-2">No evidence yet</p>
                  <button onClick={() => setModule('bridge')} className="btn-primary text-xs py-1.5 px-3">Bridge Gap</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==='activity' && (
        <div className="card max-w-2xl animate-fade-in">
          <h2 className="section-title text-lg mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity yet. Start by uploading evidence or taking an assessment.</p>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 10).map((a) => {
                const cfg = ACTIVITY_ICON_MAP[a.type] || ACTIVITY_ICON_MAP.profile
                const Icon = cfg.icon
                return (
                  <div key={a.id} className="flex items-start gap-3 animate-slide-up">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className={cfg.color}/>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{a.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10}/> {timeAgo(a.time)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── MODULE: CHALLENGES ────────────────────────────────────────────
const DIFF_COLOR = { Easy:'badge-green', Medium:'badge-orange', Hard:'badge-red' }
const CHALLENGE_ICONS = { python:Code, ml:Brain, cloud:Cloud, sql:Database, opencv:Eye, react:Code }

function ModuleChallenges() {
  const { challenges, startChallenge, submitChallenge, completeChallenge, doneCount } = useStudentData()
  const { notify } = useNotifications()
  const [selected,  setSelected]  = useState(null)
  const [submitUrl, setSubmitUrl] = useState('')
  const [phase,     setPhase]     = useState('brief') // brief | started | submitted

  const openChallenge = (c) => {
    setSelected(c)
    setSubmitUrl('')
    setPhase('brief')
  }

  const handleStart = () => {
    if (!selected) return
    startChallenge(selected.id)
    setPhase('started')
    notify.challengeStarted(selected.title)
  }

  const handleSubmit = () => {
    if (!selected || !submitUrl.trim()) return
    submitChallenge(selected.id, submitUrl.trim())
    setPhase('submitted')
    notify.challengeStarted(`${selected.title} — submitted`)
    // Simulate review → auto-complete after 2s for demo
    setTimeout(() => {
      completeChallenge(selected.id)
      notify.challengeDone(selected.title)
      notify.passportUpdated()
      setSelected(null)
    }, 2000)
  }

  const available = challenges.filter(c => c.status === 'open' || c.status === 'started')
  const completed = challenges.filter(c => c.status === 'completed')
  const bridge    = challenges.filter(c => c.status === 'open')  // skill-bridge ones
  const avgScore  = completed.length ? 91 : 0  // placeholder avg

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Available',    value: available.length, icon:Play,         color:'text-orange-500', bg:'bg-orange-100 dark:bg-orange-900/30' },
          { label:'Completed',    value: doneCount,        icon:CheckCircle2, color:'text-green-500',  bg:'bg-green-100 dark:bg-green-900/30'   },
          { label:'Skill Bridge', value: bridge.length,    icon:Zap,          color:'text-amber-500',  bg:'bg-amber-100 dark:bg-amber-900/30'   },
          { label:'Avg Score',    value: avgScore||'—',    icon:TrendingUp,   color:'text-blue-500',   bg:'bg-blue-100 dark:bg-blue-900/30'     },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3 py-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={18} className={s.color}/>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {challenges.map(c => {
          const Icon = CHALLENGE_ICONS[c.skill] || Code
          const colorMap = { python:'from-orange-400 to-orange-600', ml:'from-amber-400 to-orange-500', cloud:'from-orange-500 to-red-500', sql:'from-amber-500 to-orange-600', opencv:'from-orange-400 to-orange-600', react:'from-blue-500 to-blue-700' }
          const color = colorMap[c.skill] || 'from-orange-400 to-orange-600'
          const isGap = c.status === 'open'

          return (
            <div key={c.id} className={`card flex flex-col gap-3 hover:border-orange-300 dark:hover:border-orange-700 transition-all
              ${isGap ? 'border-orange-400 dark:border-orange-600 ring-1 ring-orange-400/30' : ''}`}>
              {c.status === 'open' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-lg px-2.5 py-1.5 w-fit">
                  <Zap size={12}/> Skill Bridge Recommended
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0`}>
                    <Icon size={20} className="text-white"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{c.title}</h3>
                    <p className="text-xs text-gray-500">{c.company}</p>
                  </div>
                </div>
                <span className={`badge ${DIFF_COLOR[c.difficulty] || 'badge-orange'} shrink-0 text-xs`}>{c.difficulty}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
                <Award size={13} className="text-amber-500 shrink-0"/> {c.reward}
              </div>
              {c.status === 'completed' ? (
                <div className="flex items-center justify-between">
                  <span className="badge-green flex items-center gap-1 py-1.5 px-3"><CheckCircle2 size={12}/> Completed</span>
                  {c.completedAt && <span className="text-xs text-gray-400">{c.completedAt}</span>}
                </div>
              ) : c.status === 'submitted' ? (
                <div className="flex items-center gap-2 badge-orange py-1.5 px-3 text-xs">
                  <Clock size={12}/> Under review…
                </div>
              ) : c.status === 'started' ? (
                <button onClick={() => openChallenge(c)} className="btn-secondary w-full justify-center text-sm">
                  <ArrowRight size={14}/> Continue &amp; Submit
                </button>
              ) : (
                <button onClick={() => openChallenge(c)} className="btn-primary w-full justify-center text-sm">
                  <Play size={14}/> Start Challenge
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Challenge modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-lg w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shrink-0">
                <Play size={22} className="text-white"/>
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 dark:text-white">{selected.title}</h2>
                <p className="text-xs text-gray-500">{selected.company}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-2 text-gray-400 hover:text-red-500">✕</button>
            </div>

            {phase === 'brief' && (
              <>
                <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-sm text-orange-700 dark:text-orange-300 mb-4">
                  ⚡ Estimated time: <strong>{selected.timeEst}</strong>. Submit via GitHub link when ready.
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Complete this challenge to earn <strong className="text-orange-500">{selected.reward}</strong> and improve your {selected.skill} proof score.
                </p>
                <button onClick={handleStart} className="btn-primary w-full justify-center py-3 glow-orange">
                  <Play size={16}/> Start Challenge
                </button>
              </>
            )}

            {phase === 'started' && (
              <div className="space-y-3 animate-fade-in">
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700">
                  <p className="font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle2 size={16}/> Challenge Started
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Build your solution and paste your GitHub repository link below to submit.
                  </p>
                </div>
                <label className="label">GitHub Repository Link</label>
                <input
                  value={submitUrl}
                  onChange={e => setSubmitUrl(e.target.value)}
                  placeholder="https://github.com/username/solution-repo"
                  className="input"
                />
                <p className="text-xs text-gray-400">Your submission will be added to your Proof-of-Skill evidence.</p>
                <button
                  onClick={handleSubmit}
                  disabled={!submitUrl.trim()}
                  className="btn-primary w-full justify-center py-3 glow-orange disabled:opacity-40"
                >
                  Submit Solution <ArrowRight size={16}/>
                </button>
              </div>
            )}

            {phase === 'submitted' && (
              <div className="text-center py-6 animate-fade-in space-y-3">
                <CheckCircle2 size={40} className="text-green-500 mx-auto"/>
                <p className="font-bold text-green-700 dark:text-green-300">Submitted!</p>
                <p className="text-sm text-gray-500">Reviewing your solution and updating your Passport…</p>
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"/>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── MODULE: SKILL BRIDGE ──────────────────────────────────────────
function ModuleSkillBridge({ setModule }) {
  const { skills, challenges, readiness, completeChallenge } = useStudentData()
  const { notify } = useNotifications()

  const gapSkills    = skills.filter(s => s.gap)
  const bridgeChall  = challenges.find(c => c.status === 'open' || c.status === 'started')
  const estReadiness = Math.min(100, readiness + Math.round((gapSkills.length > 0 ? 12 : 0) / Math.max(1, skills.length) * 100))

  if (gapSkills.length === 0) {
    return (
      <div className="card text-center py-12 animate-fade-in max-w-xl">
        <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4"/>
        <h2 className="section-title text-lg mb-2">No Skill Gaps Detected</h2>
        <p className="text-sm text-gray-500">Your skill evidence is strong across all tracked areas. Keep completing challenges to maintain your proof scores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {gapSkills.map(gapSkill => (
        <div key={gapSkill.id} className="card border-2 border-orange-400 dark:border-orange-600">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} className="text-orange-500"/>
            <h2 className="section-title text-lg">Skill Bridge: {gapSkill.name}</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your current readiness is <strong className="text-orange-500">{readiness}%</strong>.
            Bridging <strong>{gapSkill.name}</strong> is estimated to bring you to <strong className="text-green-500">~{Math.min(100, readiness + 12)}%</strong>.
          </p>

          {/* Step pipeline */}
          <div className="flex flex-col gap-0 mb-5">
            {[
              { label:'Gap Identified',     desc:`${gapSkill.name} — proof score ${gapSkill.proofScore}% (below threshold)`, color:'bg-red-500',    done: true  },
              { label:'Challenge Assigned', desc: bridgeChall ? bridgeChall.title : `${gapSkill.name} practical challenge`, color:'bg-orange-500',  done: true  },
              { label:'Submit Solution',    desc:'Score 60+ to earn the skill badge',                                       color:'bg-amber-500',   done: false },
              { label:'Passport Updated',   desc:`${gapSkill.name} added with challenge evidence`,                         color:'bg-green-500',   done: false },
              { label:'New Matches Unlock', desc:'More role matches become available based on your improved profile',      color:'bg-blue-500',    done: false },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 pb-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${step.done ? step.color : 'bg-gray-200 dark:bg-gray-700'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  {i < 4 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1"/>}
                </div>
                <div className="pt-1 pb-2">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{step.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setModule('challenges')} className="btn-primary glow-orange w-full justify-center py-3">
            <Play size={16}/> Start {gapSkill.name} Challenge <ArrowRight size={16}/>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── MODULE: PROFILE SETUP ─────────────────────────────────────────
function ModuleProfile() {
  const [tab,    setTab]    = useState('academic')
  const [skills, setSkills] = useState(['Python','Machine Learning','OpenCV'])
  const [skillInput, setSkillInput] = useState('')
  const [projects, setProjects] = useState([{ title:'Face Detection System', github:'', desc:'' }])
  const addSkill = s => { if (s && !skills.includes(s)) setSkills(p=>[...p,s]); setSkillInput('') }

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div className="flex gap-1 p-1 bg-orange-100 dark:bg-gray-800 rounded-xl overflow-x-auto w-fit">
        {[['academic','Academic'],['skills','Skills'],['projects','Projects'],['certs','Certificates'],['internships','Internships']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all
              ${tab===k?'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm':'text-gray-500 dark:text-gray-400 hover:text-orange-500'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab==='academic' && (
        <div className="card space-y-4">
          <h2 className="section-title text-base">Academic Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Overall CGPA','8.3'],['Active Backlogs','0'],['Graduation Year','2027'],['Current Semester','6']].map(([l,p]) => (
              <div key={l}><label className="label">{l}</label><input placeholder={p} className="input"/></div>
            ))}
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <Shield size={16} className="text-orange-500 shrink-0 mt-0.5"/>
            <p className="text-xs text-orange-600 dark:text-orange-400"><strong>AI Security Scan Active.</strong> All uploaded documents are pre-screened for QR codes and pixel-level fraud indicators.</p>
          </div>
        </div>
      )}
      {tab==='skills' && (
        <div className="card space-y-4">
          <h2 className="section-title text-base">Your Skills</h2>
          <div className="flex gap-2">
            <input value={skillInput} onChange={e=>setSkillInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addSkill(skillInput)}
              placeholder="Type a skill and press Enter..." className="input flex-1"/>
            <button onClick={() => addSkill(skillInput)} className="btn-primary shrink-0"><Plus size={16}/></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <div key={s} className="flex items-center gap-1.5 badge-orange py-1.5 px-3 text-sm">
                {s} <button onClick={()=>setSkills(p=>p.filter(x=>x!==s))} className="hover:text-red-500"><X size={12}/></button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.filter(s=>!skills.includes(s)).map(s => (
              <button key={s} onClick={()=>addSkill(s)}
                className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900/30 py-1.5 px-3 text-sm cursor-pointer transition-all">
                <Plus size={11} className="mr-1 inline"/>{s}
              </button>
            ))}
          </div>
        </div>
      )}
      {tab==='projects' && (
        <div className="space-y-4">
          {projects.map((p,i) => (
            <div key={i} className="card space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Project {i+1}</h3>
                {projects.length>1&&<button onClick={()=>setProjects(p=>p.filter((_,j)=>j!==i))} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>}
              </div>
              <div><label className="label">Title</label><input value={p.title} onChange={e=>setProjects(p=>p.map((r,j)=>j===i?{...r,title:e.target.value}:r))} className="input"/></div>
              <div>
                <label className="label">GitHub Link</label>
                <div className="relative"><GitBranch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input value={p.github} onChange={e=>setProjects(p=>p.map((r,j)=>j===i?{...r,github:e.target.value}:r))} placeholder="https://github.com/user/repo" className="input pl-10"/>
                </div>
                {p.github&&<p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 size={12}/> Will be AI-verified</p>}
              </div>
              <div><label className="label">Description</label><textarea value={p.desc} onChange={e=>setProjects(p=>p.map((r,j)=>j===i?{...r,desc:e.target.value}:r))} rows={3} className="input resize-none"/></div>
            </div>
          ))}
          <button onClick={()=>setProjects(p=>[...p,{title:'',github:'',desc:''}])} className="btn-secondary w-full justify-center py-3"><Plus size={16}/> Add Project</button>
        </div>
      )}
      {(tab==='certs'||tab==='internships') && (
        <div className="card space-y-4">
          <h2 className="section-title text-base">{tab==='certs'?'Certificates':'Internships'}</h2>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 transition-all">
            <FileText size={24} className="text-orange-400 mx-auto mb-2"/>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop files or <span className="text-orange-500">browse</span></p>
            <p className="text-xs text-gray-400 mt-1">PDF · JPG · Max 10MB · AI scan on upload</p>
          </div>
          <p className="text-xs text-blue-500 italic">AI scan is automated pre-screening. Manual review recommended for final confirmation.</p>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button className="btn-secondary">Save Draft</button>
        <button className="btn-primary glow-orange">Save & Build Passport <Zap size={15}/></button>
      </div>
    </div>
  )
}

// ── NOTIFICATION PANEL ───────────────────────────────────────────
function NotificationPanel({ onClose, setModule }) {
  const { items, unreadCount, markRead, markAllRead, dismiss } = useNotifications()
  const panelRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose() }
    const escHandler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', escHandler) }
  }, [onClose])

  const handleClick = (n) => {
    markRead(n.id)
    if (n.navigateTo) setModule(n.navigateTo)
    onClose()
  }

  const typeIcon = (type) => {
    const map = {
      assessment: Brain, evidence: FileText, challenge: Trophy,
      github: GitBranch, skill_gap: AlertTriangle,
      passport: FileText, recruiter: Briefcase,
      profile: User, system: Bell,
    }
    return map[type] || Bell
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in"
      style={{ background: 'var(--tw-bg-opacity, 1)', maxHeight: '70vh' }}
    >
      <div className="bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-orange-500"/>
            <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-white bg-orange-500 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              Mark all read
            </button>
          )}
        </div>

        {/* Items */}
        <div className="overflow-y-auto flex-1">
          {items.length === 0 ? (
            <div className="text-center py-10">
              <Bell size={28} className="text-gray-300 mx-auto mb-2"/>
              <p className="text-sm text-gray-400">No notifications yet</p>
            </div>
          ) : (
            items.map(n => {
              const cfg = N_CONFIG[n.type] || N_CONFIG.system
              const Icon = typeIcon(n.type)
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:bg-orange-50 dark:hover:bg-orange-900/10
                    ${!n.read ? 'bg-orange-50/50 dark:bg-orange-900/5' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: cfg.bg }}>
                    <Icon size={14} style={{ color: cfg.color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {n.title}
                      </p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1"/>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.time)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0 self-start mt-0.5 p-0.5"
                  >
                    <X size={12}/>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN STUDENT APP ──────────────────────────────────────────────
export default function StudentApp() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { readiness }    = useStudentData()
  const { unreadCount, panelOpen, togglePanel, closePanel } = useNotifications()
  const navigate         = useNavigate()
  const [module,     setModule]     = useState('dashboard')
  const [collapsed,  setCollapsed]  = useState(false)

  const doLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden" style={{
      background: 'var(--app-bg, #fafaf8)',
    }}>
      <style>{`
        :root { --app-bg: #fafaf8; }
        .dark { --app-bg: #080b14; }

        /* Sidebar entrance */
        @keyframes sidebarIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        /* Nav item entrance stagger */
        @keyframes navItemIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        /* Module content swap */
        @keyframes moduleSwap {
          from { opacity: 0; transform: translateY(10px) scale(0.995); }
          to   { opacity: 1; transform: translateY(0)    scale(1);     }
        }
        /* Topbar slide */
        @keyframes topbarIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Readiness badge pulse */
        @keyframes readinessPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
          60%     { box-shadow: 0 0 0 6px rgba(249,115,22,0); }
        }
        .sidebar-enter { animation: sidebarIn 0.38s cubic-bezier(0.34,1.1,0.64,1) both; }
        .topbar-enter  { animation: topbarIn  0.3s ease both; }
        .module-enter  { animation: moduleSwap 0.32s cubic-bezier(0.34,1.1,0.64,1) both; }
        .readiness-badge { animation: readinessPulse 3s ease-out infinite; }

        /* Sidebar background */
        .sp-sidebar {
          background: linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,248,237,0.96) 100%);
          border-right: 1px solid rgba(249,115,22,0.1);
        }
        .dark .sp-sidebar {
          background: linear-gradient(180deg, rgba(10,14,26,0.98) 0%, rgba(8,11,20,0.99) 100%);
          border-right: 1px solid rgba(249,115,22,0.07);
        }

        /* Collapse toggle */
        .sp-collapse-btn {
          background: linear-gradient(135deg, #f97316, #ea580c);
          box-shadow: 0 3px 10px rgba(249,115,22,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sp-collapse-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 4px 14px rgba(249,115,22,0.55);
        }

        /* Nav group label */
        .sp-nav-group {
          font-size: 9.5px; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 12px 10px 4px;
          color: rgba(156,163,175,0.7);
        }
        .dark .sp-nav-group { color: rgba(100,116,139,0.7); }

        /* Active sidebar item gradient */
        .sidebar-link.active {
          background: linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.07) 100%) !important;
          color: #ea580c !important;
          font-weight: 600 !important;
        }
        .dark .sidebar-link.active {
          background: linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(234,88,12,0.06) 100%) !important;
          color: #fb923c !important;
        }

        /* Topbar glass */
        .sp-topbar {
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          background: rgba(255,255,255,0.82);
          border-bottom: 1px solid rgba(249,115,22,0.08);
          box-shadow: 0 1px 12px rgba(249,115,22,0.06);
        }
        .dark .sp-topbar {
          background: rgba(8,11,20,0.85);
          border-bottom-color: rgba(249,115,22,0.06);
          box-shadow: 0 1px 12px rgba(0,0,0,0.3);
        }

        /* User avatar glow */
        .sp-avatar {
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 10px rgba(249,115,22,0.3);
        }
        .sp-avatar:hover { transform: scale(1.06); box-shadow: 0 4px 16px rgba(249,115,22,0.45); }

        /* Logo icon */
        .sp-logo-icon { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .sp-logo-icon:hover { transform: rotate(-8deg) scale(1.08); }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className={`sp-sidebar sidebar-enter relative flex flex-col h-screen sticky top-0 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'} hidden md:flex`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-orange-100/60 dark:border-orange-900/20 shrink-0">
          <div className="sp-logo-icon w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
            <Zap size={16} className="text-white"/>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="font-extrabold text-sm gradient-text leading-none">SkillPassport</p>
              <p className="text-[9px] text-gray-400 font-semibold tracking-widest uppercase leading-none mt-0.5">SIH26044</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c=>!c)}
          className="sp-collapse-btn absolute -right-3 top-[72px] w-6 h-6 rounded-full text-white flex items-center justify-center z-10">
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>

        {/* User info */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                {user?.name?.[0]||'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate leading-tight">{user?.email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <div className="nav-dot"/>
              <span className="text-[10px] font-semibold text-orange-500">Student · Active</span>
            </div>
          </div>
        )}

        {/* Divider */}
        {!collapsed && <div className="mx-4 h-px bg-orange-100 dark:bg-orange-900/20 mb-1"/>}

        {/* Nav */}
        <nav className="flex-1 px-2 pt-1 flex flex-col overflow-y-auto">
          {GROUPS.map((g, gi) => (
            <div key={g.key}>
              {!collapsed && <p className="sp-nav-group">{g.label}</p>}
              {NAV.filter(n=>n.group===g.key).map(({ key, label, icon:Icon }, ni) => (
                <button key={key} onClick={() => setModule(key)}
                  className={`sidebar-link ${module===key?'active':''} ${collapsed?'justify-center px-0':''} w-full text-left mb-0.5`}
                  title={collapsed?label:undefined}
                  style={{ animationDelay: `${(gi * 4 + ni) * 35}ms` }}>
                  <Icon size={16} className="shrink-0 transition-transform duration-200 group-hover:scale-110"/>
                  {!collapsed && <span className="text-xs font-medium">{label}</span>}
                  {module===key && !collapsed && <span className="nav-dot ml-auto"/>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-4 pt-3 border-t border-orange-100/60 dark:border-orange-900/20">
          <button onClick={toggle} className={`sidebar-link ${collapsed?'justify-center px-0':''} w-full mb-0.5`}>
            {dark
              ? <Sun  size={16} className="text-orange-400 shrink-0"/>
              : <Moon size={16} className="text-orange-600 shrink-0"/>}
            {!collapsed && <span className="text-xs">{dark?'Light Mode':'Dark Mode'}</span>}
          </button>
          <button onClick={doLogout} className={`sidebar-link ${collapsed?'justify-center px-0':''} w-full`}>
            <LogOut size={16} className="shrink-0"/>
            {!collapsed && <span className="text-xs">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <header className="sp-topbar topbar-enter sticky top-0 z-30 flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{MODULE_TITLES[module]}</h1>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"/>
              {user?.name} · SIH26044
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Readiness badge */}
            <div className="readiness-badge hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
              bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-400/25 text-orange-600 dark:text-orange-400">
              <Shield size={12}/> {readiness}% Ready
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button onClick={togglePanel} className="relative btn-ghost p-2 icon-lift"
                aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}>
                <Bell size={18}/>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5 animate-scale-in">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {panelOpen && <NotificationPanel onClose={closePanel} setModule={setModule}/>}
            </div>

            {/* Avatar */}
            <div className="sp-avatar w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer">
              {user?.name?.[0]||'S'}
            </div>
          </div>
        </header>

        {/* Module content */}
        <div className="p-6 max-w-7xl mx-auto module-enter" key={module}>
          {module==='dashboard'   && <ModuleDashboard  setModule={setModule}/>}
          {module==='passport'    && <ModuleDashboard  setModule={setModule}/>}
          {module==='fraud'       && <FraudDetection/>}
          {module==='assessment'  && <Assessment/>}
          {module==='analytics'   && <AnalyticsDashboard/>}
          {module==='corporate'   && <CorporateBridge/>}
          {module==='challenges'  && <ModuleChallenges/>}
          {module==='assessment2' && <SkillAssessment/>}
          {module==='profile'     && <ModuleProfile/>}
          {module==='evidence'    && <EvidenceCredibility/>}
          {module==='bridge'      && <ModuleSkillBridge setModule={setModule}/>}
          {module==='privacy'     && <PrivacyCenter/>}
        </div>

        <AIAssistant role="student" module={module}/>
      </main>
    </div>
  )
}
