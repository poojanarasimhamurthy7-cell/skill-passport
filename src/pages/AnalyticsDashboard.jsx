import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Legend
} from 'recharts'
import {
  BarChart3, Brain, Code, BookOpen, AlertTriangle, CheckCircle2,
  XCircle, Zap, TrendingUp, Lock, Unlock, RefreshCw, ExternalLink,
  Trophy, Clock, ArrowRight, Shield, Star, Target
} from 'lucide-react'

// ── MOCK DATA ─────────────────────────────────────────────────────
const STUDENT_SCORE = {
  overall: 58,   // below 60 baseline — triggers review pool
  sections: {
    knowledge:  { score: 62, total: 100, label: 'Knowledge Mapping',    icon: Brain,  color: 'from-blue-400 to-blue-600'     },
    logical:    { score: 54, total: 100, label: 'Logical Execution',     icon: Zap,    color: 'from-orange-400 to-orange-600' },
    syntactic:  { score: 58, total: 100, label: 'Syntactical Precision', icon: Code,   color: 'from-purple-400 to-purple-600' },
  },
  byTopic: [
    { topic: 'Python',  score: 75, maxScore: 100 },
    { topic: 'Java',    score: 60, maxScore: 100 },
    { topic: 'C/C++',   score: 50, maxScore: 100 },
    { topic: 'DSA',     score: 55, maxScore: 100 },
    { topic: 'OS',      score: 48, maxScore: 100 },
    { topic: 'DBMS',    score: 62, maxScore: 100 },
  ],
  difficulty: [
    { diff: 'Easy (20)',   attempted: 18, correct: 15, pct: 83 },
    { diff: 'Medium (30)', attempted: 28, correct: 16, pct: 57 },
    { diff: 'Hard (10)',   attempted:  8, correct:  2, pct: 25 },
  ],
  timeline: [
    { time: '0-15min', correct: 6, wrong: 1 },
    { time: '15-30min', correct: 5, wrong: 3 },
    { time: '30-45min', correct: 4, wrong: 4 },
    { time: '45-60min', correct: 4, wrong: 3 },
    { time: '60-75min', correct: 3, wrong: 4 },
    { time: '75-90min', correct: 3, wrong: 4 },
  ],
  radarData: [
    { sub: 'Python',  score: 75 },
    { sub: 'Java',    score: 60 },
    { sub: 'DSA',     score: 55 },
    { sub: 'OS',      score: 48 },
    { sub: 'DBMS',    score: 62 },
    { sub: 'C/C++',   score: 50 },
  ],
  weakAreas: ['OS', 'C/C++', 'DSA — Hard problems', 'Logical reasoning under time pressure'],
}

// Upskilling resources keyed by weak area
const UPSKILLING_RESOURCES = {
  'OS': [
    { type: 'video',  title: 'Operating Systems Full Course',    source: 'NPTEL',        link: '#', duration: '40 hrs' },
    { type: 'doc',    title: 'OS Concepts by Silberschatz',      source: 'Reference Text',      link: '#', duration: 'Book'  },
    { type: 'course', title: 'OS for GATE — Topic-wise',         source: 'GeeksforGeeks',link: '#', duration: '12 hrs'},
  ],
  'DSA': [
    { type: 'video',  title: 'DSA Masterclass — Trees & Graphs', source: 'NPTEL',        link: '#', duration: '25 hrs' },
    { type: 'course', title: 'LeetCode Top 150 Problems',        source: 'LeetCode',     link: '#', duration: 'Self-paced'},
    { type: 'doc',    title: 'Introduction to Algorithms (CLRS)',source: 'Reference Text',      link: '#', duration: 'Book'  },
  ],
  'C/C++': [
    { type: 'video',  title: 'C Programming Full Course',        source: 'NPTEL',        link: '#', duration: '30 hrs' },
    { type: 'course', title: 'C++ STL & Templates Deep Dive',    source: 'Coursera',     link: '#', duration: '8 hrs' },
    { type: 'doc',    title: 'C++ Reference Documentation',      source: 'cppreference', link: '#', duration: 'Reference'},
  ],
  'Logic': [
    { type: 'video',  title: 'Logical Reasoning & Problem Solving',source:'NPTEL',       link: '#', duration: '15 hrs' },
    { type: 'course', title: 'Competitive Programming Basics',    source: 'Codeforces',  link: '#', duration: 'Self-paced'},
  ],
}

// 3-round filter prerequisites
const FILTER_ROUNDS = [
  {
    round: 1, label: 'Prerequisite Courses',
    desc: 'Complete 2 assigned upskilling modules from your weak areas.',
    tasks: ['Complete OS Fundamentals module (NPTEL)', 'Complete DSA revision module'],
    unlocks: 'Access to Round 2',
  },
  {
    round: 2, label: 'Mini Assessment',
    desc: 'Pass a targeted 20-question assessment on your flagged weak areas.',
    tasks: ['Score ≥ 60% in OS module quiz', 'Score ≥ 60% in DSA module quiz'],
    unlocks: 'Access to Round 3',
  },
  {
    round: 3, label: 'Full Retake Token',
    desc: 'On completing all prerequisites, a secure retake token is generated.',
    tasks: ['Complete Rounds 1 and 2', 'Wait 7-day cooldown period'],
    unlocks: 'Secure exam retake token issued',
  },
]

// ── CHART TOOLTIP ─────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-gray-700 space-y-1">
      <p className="font-bold text-orange-400">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  ) : null

// ── OVERALL SCORE RING ────────────────────────────────────────────
function ScoreRing({ score, baseline = 60 }) {
  const passed  = score >= baseline
  const color   = passed ? '#22c55e' : '#f97316'
  const circ    = 2 * Math.PI * 50
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(156,163,175,0.2)" strokeWidth="12"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${circ * score / 100} ${circ}`} strokeLinecap="round"/>
        {/* Baseline marker */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3"
          strokeDasharray={`2 ${circ - 2}`}
          strokeDashoffset={-(circ * baseline / 100)} strokeLinecap="round"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}%</span>
        <span className="text-xs text-gray-400">Overall</span>
      </div>
    </div>
  )
}

// ── SECTION METRIC CARD ───────────────────────────────────────────
function SectionCard({ sec }) {
  const { score, label, icon: Icon, color } = sec
  const passed = score >= 60
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
          <Icon size={18} className="text-white"/>
        </div>
        <span className={passed ? 'badge-green text-xs' : 'badge-orange text-xs'}>
          {passed ? 'Pass' : 'Below Baseline'}
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
        <p className="text-2xl font-black text-orange-500 mt-1">{score}<span className="text-base font-normal text-gray-400">/100</span></p>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full skill-bar-fill ${passed ? 'bg-green-500' : 'bg-orange-500'}`}
          style={{ '--bar-width': `${score}%`, width: `${score}%` }}/>
      </div>
      <p className="text-xs text-gray-400">Baseline: 60%</p>
    </div>
  )
}

// ── UPSKILLING RESOURCES PANEL ────────────────────────────────────
function UpskillingPanel({ weakAreas, roundProgress, onCompleteTask }) {
  const [expanded, setExpanded] = useState('OS')
  const TYPE_ICON = { video:'▶', doc:'📄', course:'🎓' }
  const TYPE_COLOR = { video:'badge-red', doc:'badge-blue', course:'badge-orange' }

  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
          <BookOpen size={20} className="text-white"/>
        </div>
        <div>
          <h2 className="section-title text-base">Auto-Generated Upskilling Resources</h2>
          <p className="section-sub text-xs">Tailored to your detected weak areas</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
        <strong>Weak areas detected:</strong> {weakAreas.join(' · ')}
      </div>

      {/* Resource groups */}
      {['OS','DSA','C/C++','Logic'].map(area => (
        <div key={area} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <button onClick={() => setExpanded(expanded === area ? null : area)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">{area} — Remediation Resources</span>
            <span className="text-gray-400">{expanded === area ? '▲' : '▼'}</span>
          </button>
          {expanded === area && (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {(UPSKILLING_RESOURCES[area] || []).map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <span className={`${TYPE_COLOR[r.type]} badge text-xs shrink-0`}>{TYPE_ICON[r.type]} {r.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.source} · {r.duration}</p>
                  </div>
                  <a href={r.link} className="btn-ghost text-xs text-orange-500 flex items-center gap-1 shrink-0">
                    Open <ExternalLink size={11}/>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── 3-ROUND FILTER LOOP ───────────────────────────────────────────
function FilterLoop() {
  const [progress, setProgress] = useState({ 1: [], 2: [], 3: [] })
  const [token,    setToken]    = useState(null)
  const [tokenSpin,setTokenSpin]= useState(false)

  const completeTask = (round, taskIdx) => {
    setProgress(prev => {
      const roundDone = [...(prev[round] || [])]
      if (!roundDone.includes(taskIdx)) roundDone.push(taskIdx)
      return { ...prev, [round]: roundDone }
    })
  }

  const roundComplete = (r) =>
    progress[r]?.length >= FILTER_ROUNDS[r-1].tasks.length

  const allComplete = roundComplete(1) && roundComplete(2) && roundComplete(3)

  const generateToken = () => {
    if (!allComplete) return
    setTokenSpin(true)
    setTimeout(() => {
      setToken('RTK-' + Math.random().toString(36).slice(2,6).toUpperCase() + '-SP2026')
      setTokenSpin(false)
    }, 1200)
  }

  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
          <Shield size={20} className="text-white"/>
        </div>
        <div>
          <h2 className="section-title text-base">3-Round Filter Evaluation Loop</h2>
          <p className="section-sub text-xs">Complete all rounds to unlock your secure retake token</p>
        </div>
      </div>

      {/* Round cards */}
      <div className="space-y-4">
        {FILTER_ROUNDS.map((r, idx) => {
          const prevDone = idx === 0 ? true : roundComplete(idx)
          const isDone   = roundComplete(idx + 1)
          const locked   = !prevDone

          return (
            <div key={r.round} className={`rounded-xl border-2 overflow-hidden transition-all
              ${isDone ? 'border-green-300 dark:border-green-700' :
                locked  ? 'border-gray-200 dark:border-gray-700 opacity-60' :
                          'border-orange-300 dark:border-orange-700'}`}>
              {/* Header */}
              <div className={`flex items-center gap-3 px-4 py-3
                ${isDone ? 'bg-green-50 dark:bg-green-900/20' :
                  locked  ? 'bg-gray-50 dark:bg-gray-800' :
                            'bg-orange-50 dark:bg-orange-900/20'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm
                  ${isDone ? 'bg-green-500 text-white' :
                    locked  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500' :
                              'bg-orange-500 text-white'}`}>
                  {isDone ? <CheckCircle2 size={16}/> : locked ? <Lock size={14}/> : r.round}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Round {r.round}: {r.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
                </div>
                {isDone && <span className="badge-green text-xs">Complete ✓</span>}
                {locked  && <Lock size={14} className="text-gray-400 shrink-0"/>}
              </div>

              {/* Tasks */}
              {!locked && (
                <div className="px-4 py-3 space-y-2">
                  {r.tasks.map((task, ti) => {
                    const done = progress[r.round]?.includes(ti)
                    return (
                      <div key={ti} className="flex items-center gap-3">
                        <button onClick={() => completeTask(r.round, ti)} disabled={done}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                            ${done ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'}`}>
                          {done && <CheckCircle2 size={12} className="text-white"/>}
                        </button>
                        <span className={`text-xs ${done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{task}</span>
                      </div>
                    )
                  })}
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
                    <ArrowRight size={11}/> Unlocks: {r.unlocks}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Retake token generation */}
      <div className={`p-4 rounded-xl border-2 transition-all ${allComplete ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'}`}>
        {token ? (
          <div className="text-center animate-fade-in">
            <CheckCircle2 size={24} className="text-green-500 mx-auto mb-2"/>
            <p className="font-bold text-sm text-green-700 dark:text-green-300">Retake Token Generated</p>
            <div className="mt-2 px-4 py-2 bg-gray-900 rounded-xl">
              <p className="font-mono text-lg font-black text-green-400 tracking-widest">{token}</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">Valid for 48 hours. Use at the assessment portal to unlock your retake.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {allComplete ? <Unlock size={18} className="text-green-500"/> : <Lock size={18} className="text-gray-400"/>}
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Secure Exam Retake Token</p>
                <p className="text-xs text-gray-500">{allComplete ? 'All rounds complete — ready to generate' : 'Complete all 3 rounds to unlock'}</p>
              </div>
            </div>
            <button onClick={generateToken} disabled={!allComplete || tokenSpin}
              className={`btn-primary text-sm flex items-center gap-2 shrink-0 ${!allComplete ? 'opacity-50 cursor-not-allowed' : 'glow-orange'}`}>
              {tokenSpin ? <RefreshCw size={14} className="animate-spin"/> : <Zap size={14}/>}
              Generate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const score   = STUDENT_SCORE.overall
  const passed  = score >= 60
  const [tab,   setTab] = useState('overview')

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Phase header */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-200 dark:border-orange-800">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-md">
          <BarChart3 size={20} className="text-white"/>
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Phase 3 — Skill Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Knowledge · Logical Execution · Syntactical Precision · Upskilling Engine</p>
        </div>
        <span className="badge-orange ml-auto shrink-0">SP-Analytics</span>
      </div>

      {/* 60% filter banner */}
      {!passed && (
        <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 animate-fade-in">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="font-bold text-amber-700 dark:text-amber-300">Below 60% Industry Baseline</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
              Your score of <strong>{score}%</strong> is below the 60% industry threshold.
              Your profile has been moved to the <strong>admin review pool</strong> and is not visible to recruiters.
              Complete the 3-round filter loop below to qualify for a retake token.
            </p>
          </div>
          <div className="shrink-0 text-center">
            <p className="text-2xl font-black text-amber-500">{score}%</p>
            <p className="text-xs text-amber-400">/ 60% needed</p>
          </div>
        </div>
      )}
      {passed && (
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 animate-fade-in">
          <CheckCircle2 size={20} className="text-green-500 shrink-0"/>
          <div>
            <p className="font-bold text-green-700 dark:text-green-300">Above 60% Baseline — Profile Active</p>
            <p className="text-sm text-green-600 dark:text-green-400">Your profile is visible to vetted recruiters. Keep improving your score to rank higher.</p>
          </div>
          <p className="text-2xl font-black text-green-500 ml-auto shrink-0">{score}%</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-orange-100 dark:bg-gray-800 rounded-xl w-fit flex-wrap">
        {[['overview','Overview'],['breakdown','Sub-section Breakdown'],['upskilling','Upskilling Plan'],['filter','3-Round Filter']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === key ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Score summary */}
          <div className="card flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={score}/>
            <div className="flex-1">
              <h2 className="section-title text-lg mb-1">Assessment Performance Summary</h2>
              <p className="section-sub text-sm mb-3">Track: Engineering / Tech · Arjun Verma · Sep 2026</p>
              <div className="flex flex-wrap gap-2">
                {STUDENT_SCORE.weakAreas.map(w => (
                  <span key={w} className="badge-red text-xs flex items-center gap-1"><AlertTriangle size={10}/> {w}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Baseline marker shown on ring at 60%. White dash = threshold.
              </p>
            </div>
          </div>

          {/* Three section cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.values(STUDENT_SCORE.sections).map(sec => (
              <SectionCard key={sec.label} sec={sec}/>
            ))}
          </div>

          {/* Difficulty breakdown table */}
          <div className="card">
            <h2 className="section-title text-base mb-4">Performance by Difficulty</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {['Difficulty','Attempted','Correct','Score','Status'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {STUDENT_SCORE.difficulty.map(d => (
                    <tr key={d.diff}>
                      <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">{d.diff}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{d.attempted}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{d.correct}</td>
                      <td className="py-3 px-3 font-mono font-bold text-orange-500">{d.pct}%</td>
                      <td className="py-3 px-3">
                        {d.pct >= 60
                          ? <span className="badge-green text-xs">Pass</span>
                          : <span className="badge-red text-xs">Below baseline</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── BREAKDOWN TAB ── */}
      {tab === 'breakdown' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Topic bar chart */}
            <div className="card">
              <h2 className="section-title text-base mb-1">Score by Topic</h2>
              <p className="section-sub text-xs mb-4">Individual topic performance — dashed line = 60% baseline</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={STUDENT_SCORE.byTopic} margin={{ top:5, right:10, left:-20, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)"/>
                    <XAxis dataKey="topic" tick={{ fontSize:11, fill:'#9ca3af' }}/>
                    <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'#9ca3af' }}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Bar dataKey="score" fill="#f97316" radius={[6,6,0,0]} name="Score"/>
                    {/* Baseline reference line via custom cell not supported simply — shown in label */}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar */}
            <div className="card">
              <h2 className="section-title text-base mb-1">Skill Coverage Radar</h2>
              <p className="section-sub text-xs mb-4">Competency coverage across assessed domains</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={STUDENT_SCORE.radarData} margin={{ top:10, right:20, bottom:10, left:20 }}>
                    <PolarGrid stroke="rgba(249,115,22,0.2)"/>
                    <PolarAngleAxis dataKey="sub" tick={{ fontSize:11, fill:'#f97316' }}/>
                    <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fontSize:9, fill:'#9ca3af' }}/>
                    <Radar name="Score" dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.3} strokeWidth={2}/>
                    <Tooltip content={<ChartTip/>}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Timeline accuracy */}
            <div className="card lg:col-span-2">
              <h2 className="section-title text-base mb-1">Accuracy Over Time</h2>
              <p className="section-sub text-xs mb-4">Correct vs wrong answers per 15-minute session block</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={STUDENT_SCORE.timeline} margin={{ top:5, right:20, left:-20, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)"/>
                    <XAxis dataKey="time" tick={{ fontSize:11, fill:'#9ca3af' }}/>
                    <YAxis tick={{ fontSize:10, fill:'#9ca3af' }}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Legend wrapperStyle={{ fontSize:'11px' }}/>
                    <Line type="monotone" dataKey="correct" stroke="#22c55e" strokeWidth={2} dot={{ r:4 }} name="Correct"/>
                    <Line type="monotone" dataKey="wrong"   stroke="#ef4444" strokeWidth={2} dot={{ r:4 }} name="Wrong"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Three sub-section deep dive */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label:'Knowledge Mapping',    score:62, desc:'Theoretical understanding of core CS concepts. Strongest in Python and DBMS.',       items:['Python: 75%','DBMS: 62%','Java: 60%'] },
              { label:'Logical Execution',    score:54, desc:'Problem-solving, algorithm design and runtime analysis. Weakest in Hard-level DSA.', items:['Easy DSA: 80%','Medium DSA: 55%','Hard DSA: 25%'] },
              { label:'Syntactical Precision',score:58, desc:'Code correctness, syntax accuracy and compilation readiness.',                       items:['Python syntax: 70%','C/C++ syntax: 45%','Java syntax: 58%'] },
            ].map(s => (
              <div key={s.label} className="card">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{s.label}</h3>
                <p className="text-2xl font-black text-orange-500 mb-2">{s.score}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{s.desc}</p>
                <div className="space-y-1.5">
                  {s.items.map(item => (
                    <div key={item} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{item.split(':')[0]}</span>
                      <span className="font-bold text-orange-500">{item.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── UPSKILLING TAB ── */}
      {tab === 'upskilling' && (
        <UpskillingPanel weakAreas={STUDENT_SCORE.weakAreas} onCompleteTask={() => {}}/>
      )}

      {/* ── FILTER LOOP TAB ── */}
      {tab === 'filter' && <FilterLoop/>}
    </div>
  )
}
