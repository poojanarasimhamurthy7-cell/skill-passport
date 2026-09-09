import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  Trophy, Clock, Star, ArrowRight, CheckCircle2, Lock,
  Code, Eye, Brain, Cloud, Database, Zap, Filter, Bell,
  Play, Users, Award, TrendingUp
} from 'lucide-react'

const CHALLENGES = [
  {
    id: 1,
    title: 'Image Processing Pipeline',
    company: 'Wipro AI Labs',
    skill: 'OpenCV',
    difficulty: 'Medium',
    time: '3 hours',
    participants: 1240,
    reward: 'OpenCV Proof-of-Skill Badge',
    icon: Eye,
    color: 'from-orange-400 to-orange-600',
    tags: ['Python', 'OpenCV', 'NumPy'],
    desc: 'Build a real-time image processing pipeline that detects and classifies objects in a provided dataset. Your solution is evaluated on accuracy, speed, and code quality.',
    status: 'open',
  },
  {
    id: 2,
    title: 'ML Model Deployment',
    company: 'Dabur Digital',
    skill: 'Machine Learning',
    difficulty: 'Hard',
    time: '5 hours',
    participants: 890,
    reward: 'ML Practical Badge + Priority Shortlisting',
    icon: Brain,
    color: 'from-amber-400 to-orange-500',
    tags: ['Python', 'Scikit-learn', 'REST API'],
    desc: 'Train a classification model on a healthcare dataset and deploy it as a REST API. Evaluated on model accuracy, API performance and code documentation.',
    status: 'open',
  },
  {
    id: 3,
    title: 'Cloud Infrastructure Setup',
    company: 'TechCorp India',
    skill: 'Cloud Deployment',
    difficulty: 'Hard',
    time: '4 hours',
    participants: 450,
    reward: 'Cloud Skills Badge — bridges your passport gap',
    icon: Cloud,
    color: 'from-orange-500 to-red-500',
    tags: ['AWS', 'Docker', 'CI/CD'],
    desc: 'Set up a scalable cloud infrastructure for a sample application. Includes containerisation, load balancing and automated deployment pipeline.',
    status: 'bridge',   // skill bridge recommended
  },
  {
    id: 4,
    title: 'SQL Data Analysis',
    company: 'Apollo Analytics',
    skill: 'SQL',
    difficulty: 'Easy',
    time: '1.5 hours',
    participants: 2100,
    reward: 'SQL Proficiency Badge',
    icon: Database,
    color: 'from-amber-500 to-orange-600',
    tags: ['SQL', 'PostgreSQL', 'Data Analysis'],
    desc: 'Analyse a medical records dataset using complex SQL queries. Write optimised queries to extract meaningful insights from structured healthcare data.',
    status: 'completed',
    score: 91,
  },
  {
    id: 5,
    title: 'NLP Text Classifier',
    company: 'MedAI Startup',
    skill: 'NLP',
    difficulty: 'Hard',
    time: '6 hours',
    participants: 320,
    reward: 'NLP Specialist Badge',
    icon: Code,
    color: 'from-orange-400 to-amber-600',
    tags: ['Python', 'NLTK', 'Transformers'],
    desc: 'Build a text classifier to categorise medical queries into specialties. Use any NLP approach — rule-based, ML, or transformer models.',
    status: 'open',
  },
  {
    id: 6,
    title: 'React Dashboard',
    company: 'FinHealth Corp',
    skill: 'React',
    difficulty: 'Medium',
    time: '2.5 hours',
    participants: 780,
    reward: 'Frontend Skills Badge',
    icon: Code,
    color: 'from-amber-400 to-orange-500',
    tags: ['React', 'Tailwind', 'Charts'],
    desc: 'Build an interactive analytics dashboard using React. Includes data visualisation, real-time updates and responsive design.',
    status: 'locked',
  },
]

const DIFFICULTY_COLOR = {
  Easy:   'badge-green',
  Medium: 'badge-orange',
  Hard:   'badge-red',
}

function ChallengeCard({ c, onOpen }) {
  const Icon = c.icon
  return (
    <div className={`card flex flex-col gap-4 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 
      ${c.status === 'locked' ? 'opacity-60' : ''}
      ${c.status === 'bridge' ? 'border-orange-400 dark:border-orange-600 ring-1 ring-orange-400/30' : ''}`}>

      {/* Bridge badge */}
      {c.status === 'bridge' && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-lg px-2.5 py-1.5 w-fit">
          <Zap size={12} /> Skill Bridge Recommended — closes your passport gap!
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md shrink-0`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{c.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{c.company}</p>
          </div>
        </div>
        <div className={`badge ${DIFFICULTY_COLOR[c.difficulty]} shrink-0`}>{c.difficulty}</div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{c.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {c.tags.map(t => (
          <span key={t} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs py-0.5">{t}</span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><Clock size={12} /> {c.time}</span>
        <span className="flex items-center gap-1"><Users size={12} /> {c.participants.toLocaleString()} participants</span>
      </div>

      {/* Reward */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300 font-medium">
        <Award size={13} className="text-amber-500 shrink-0" /> {c.reward}
      </div>

      {/* CTA */}
      {c.status === 'completed' ? (
        <div className="flex items-center justify-between">
          <span className="badge-green flex items-center gap-1 py-1.5 px-3"><CheckCircle2 size={12} /> Completed</span>
          <span className="text-lg font-black text-green-600 dark:text-green-400">{c.score}/100</span>
        </div>
      ) : c.status === 'locked' ? (
        <button disabled className="btn-secondary justify-center opacity-60 cursor-not-allowed w-full">
          <Lock size={14} /> Unlock with Profile Setup
        </button>
      ) : (
        <button onClick={() => onOpen(c)} className={`w-full justify-center ${c.status === 'bridge' ? 'btn-primary glow-orange' : 'btn-primary'} flex items-center gap-2`}>
          <Play size={14} /> Start Challenge <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}

function ChallengeModal({ c, onClose }) {
  const [started, setStarted] = useState(false)
  if (!c) return null
  const Icon = c.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card max-w-lg w-full animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md shrink-0`}>
            <Icon size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">{c.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{c.company} · {c.skill}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 text-gray-400 hover:text-red-500">✕</button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{c.desc}</p>

          <div className="grid grid-cols-3 gap-3">
            {[['Duration', c.time, Clock], ['Difficulty', c.difficulty, Star], ['Reward', 'Badge', Trophy]].map(([label, val, Ic]) => (
              <div key={label} className="text-center p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <Ic size={16} className="text-orange-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{val}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="label">Technologies Required</p>
            <div className="flex flex-wrap gap-2">
              {c.tags.map(t => <span key={t} className="badge-orange">{t}</span>)}
            </div>
          </div>

          {!started ? (
            <>
              <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-sm text-orange-700 dark:text-orange-300">
                <strong>⚠ Rules:</strong> You have <strong>{c.time}</strong> once you start. Your solution must be your own work. AI code assistants are not permitted. Submit via GitHub link.
              </div>
              <button onClick={() => setStarted(true)} className="btn-primary w-full justify-center py-3 glow-orange">
                <Play size={16} /> I'm Ready — Start Challenge
              </button>
            </>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                <CheckCircle2 size={24} className="text-green-500 mx-auto mb-2" />
                <p className="font-bold text-green-700 dark:text-green-300">Challenge Started!</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Timer is running. Complete your solution and submit your GitHub link below.</p>
              </div>
              <div>
                <label className="label">Submit GitHub Repository Link</label>
                <input placeholder="https://github.com/username/challenge-solution" className="input" />
              </div>
              <button onClick={onClose} className="btn-primary w-full justify-center py-3 glow-orange">
                Submit Solution <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Challenges() {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = filter === 'all' ? CHALLENGES
    : filter === 'bridge' ? CHALLENGES.filter(c => c.status === 'bridge')
    : filter === 'completed' ? CHALLENGES.filter(c => c.status === 'completed')
    : CHALLENGES.filter(c => c.status === 'open')

  return (
    <div className="flex h-screen bg-orange-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar role="student" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-orange-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Industry Challenges</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Prove your skills with real-world industry mini-projects</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="badge-orange py-1.5 px-3 font-bold flex items-center gap-1.5">
              <Trophy size={13} /> 1 Completed · 4 Available
            </div>
            <button className="relative btn-ghost p-2">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Available',  value: '4',  icon: Play,          color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
              { label: 'Completed',  value: '1',  icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30'  },
              { label: 'Skill Bridge', value: '1',icon: Zap,           color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-900/30'  },
              { label: 'Avg Score',  value: '91', icon: TrendingUp,    color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30'    },
            ].map(s => (
              <div key={s.label} className="card flex items-center gap-3 py-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-gray-400" />
            {[['all','All'], ['bridge','🔥 Skill Bridge'], ['open','Open'], ['completed','Completed']].map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`text-sm px-3.5 py-1.5 rounded-full font-medium transition-all ${filter === key ? 'bg-orange-500 text-white' : 'bg-orange-100 dark:bg-gray-800 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <ChallengeCard key={c.id} c={c} onOpen={setSelected} />
            ))}
          </div>
        </div>
      </main>

      <ChallengeModal c={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
