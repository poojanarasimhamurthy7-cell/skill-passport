import { GitBranch, FileText, Trophy, Briefcase, Star, Clock, TrendingUp, Info, CheckCircle2, AlertTriangle } from 'lucide-react'

const EVIDENCE_LEVELS = [
  {
    rank: 1, weight: 95, label: 'Industry Challenge',
    icon: Trophy, color: 'from-orange-500 to-red-500', textColor: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700',
    desc: 'Real-world task set by hiring company. Evaluated on actual output — highest signal of practical ability.',
    examples: ['Image processing pipeline', 'ML model deployment', 'SQL analytics task'],
    freshWindow: '12 months',
  },
  {
    rank: 2, weight: 85, label: 'Internship Letter',
    icon: Briefcase, color: 'from-amber-400 to-orange-500', textColor: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-700',
    desc: 'Verified offer/completion letter proves real-world professional exposure with the claimed skill.',
    examples: ['Offer letter with role', 'Completion certificate', 'Manager reference'],
    freshWindow: '24 months',
  },
  {
    rank: 3, weight: 75, label: 'GitHub Project',
    icon: GitBranch, color: 'from-gray-500 to-gray-700', textColor: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600',
    desc: 'Public repository with meaningful commits. AI scans commit history, code quality and recency.',
    examples: ['Face detection repo', 'ML model notebook', 'Web app codebase'],
    freshWindow: '18 months',
  },
  {
    rank: 4, weight: 60, label: 'Course Certificate',
    icon: FileText, color: 'from-orange-400 to-amber-500', textColor: 'text-orange-500',
    bg: 'bg-orange-50/60 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800',
    desc: 'Verified platform certificate. QR-validated. Proves theoretical knowledge but not practical ability.',
    examples: ['Coursera certificate', 'NPTEL course', 'Google certification'],
    freshWindow: '36 months',
  },
  {
    rank: 5, weight: 30, label: 'Self-Declared Claim',
    icon: AlertTriangle, color: 'from-gray-300 to-gray-400', textColor: 'text-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700',
    desc: 'Student listed skill with no supporting evidence. Shown to recruiter with a ⚠ unverified tag.',
    examples: ['Skill added in profile', 'No linked project', 'No certificate'],
    freshWindow: 'N/A',
  },
]

const SKILL_EXAMPLE = {
  name: 'Python',
  items: [
    { type: 'Industry Challenge', score: 84, weight: 95, date: 'Aug 2026', fresh: true  },
    { type: 'GitHub Project',     score: 78, weight: 75, date: 'Jun 2026', fresh: true  },
    { type: 'Course Certificate', score: 90, weight: 60, date: 'Jan 2024', fresh: false },
  ],
}

function computePoS(items) {
  const valid = items.filter(i => i.fresh)
  if (!valid.length) return 0
  const totalWeight = valid.reduce((s, i) => s + i.weight, 0)
  const weighted = valid.reduce((s, i) => s + (i.score * i.weight), 0)
  return Math.round(weighted / totalWeight)
}

export default function EvidenceCredibility() {
  const pos = computePoS(SKILL_EXAMPLE.items)

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="card border-2 border-orange-300 dark:border-orange-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
            <Star size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title text-lg">Evidence Confidence Score</h2>
            <p className="section-sub text-xs">Not all evidence is equal — here's how each type is weighted</p>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-300">
          <Info size={14} className="shrink-0 mt-0.5" />
          Self-declared claim (30%) → Certificate (60%) → GitHub Project (75%) → Internship (85%) → Industry Challenge (95%)
        </div>
      </div>

      {/* Evidence hierarchy */}
      <div className="space-y-3">
        {EVIDENCE_LEVELS.map((e, i) => (
          <div key={e.rank} className={`card border-2 ${e.border} ${e.bg}`}>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Rank + weight bar */}
              <div className="flex flex-col items-center gap-1 w-14 shrink-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${e.color} flex items-center justify-center shadow-md`}>
                  <e.icon size={18} className="text-white" />
                </div>
                <span className="text-xs text-gray-400">Rank #{e.rank}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className={`font-bold text-sm ${e.textColor}`}>{e.label}</h3>
                  <span className={`badge text-xs font-black ${e.bg} ${e.textColor} border ${e.border}`}>
                    Weight: {e.weight}%
                  </span>
                  <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs flex items-center gap-1">
                    <Clock size={10} /> Fresh: {e.freshWindow}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{e.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {e.examples.map(ex => (
                    <span key={ex} className="badge bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700 text-xs">{ex}</span>
                  ))}
                </div>
              </div>

              {/* Weight bar */}
              <div className="w-20 shrink-0">
                <div className="text-right text-xs font-black mb-1" style={{ color: i === 0 ? '#f97316' : i === 4 ? '#9ca3af' : '#f97316' }}>{e.weight}%</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full bg-gradient-to-r ${e.color}`} style={{ width: `${e.weight}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live example */}
      <div className="card">
        <h2 className="section-title text-base mb-4">Live Example: <span className="gradient-text">{SKILL_EXAMPLE.name} Proof-of-Skill</span></h2>
        <div className="space-y-3 mb-4">
          {SKILL_EXAMPLE.items.map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border
              ${item.fresh ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.type}</span>
                  {!item.fresh && <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs flex items-center gap-1"><Clock size={9} /> Expired</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>Score: <strong className="text-orange-500">{item.score}%</strong></span>
                  <span>Weight: <strong className="text-gray-700 dark:text-gray-300">{item.weight}%</strong></span>
                  <span>{item.date}</span>
                </div>
              </div>
              {item.fresh
                ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                : <AlertTriangle size={16} className="text-gray-400 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 text-white">
          <div>
            <p className="text-xs text-orange-100">Weighted Proof-of-Skill Score</p>
            <p className="text-2xl font-black">{pos}% <span className="text-base font-semibold">— High Confidence 🔥</span></p>
            <p className="text-xs text-orange-100 mt-0.5">Expired certificate excluded from calculation</p>
          </div>
          <TrendingUp size={32} className="text-orange-200 shrink-0" />
        </div>
      </div>
    </div>
  )
}
