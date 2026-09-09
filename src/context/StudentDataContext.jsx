/**
 * StudentDataContext
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all live student state.
 * Every module (Dashboard, Challenges, SkillBridge, Passport,
 * Evidence, Assessment) reads from and writes to this context.
 * Changes propagate instantly to every subscriber.
 *
 * Persistence: localStorage key "sp-student-data"
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const StudentDataContext = createContext(null)

/* ── Default skill set ───────────────────────────────────────── */
const DEFAULT_SKILLS = [
  { id: 'python',   name: 'Python',          score: 72, proofScore: 68, evidence: ['cert'],         gap: false },
  { id: 'ml',       name: 'Machine Learning', score: 58, proofScore: 52, evidence: ['challenge'],    gap: false },
  { id: 'opencv',   name: 'OpenCV',           score: 45, proofScore: 40, evidence: ['github'],       gap: true  },
  { id: 'sql',      name: 'SQL',              score: 80, proofScore: 74, evidence: ['cert','github'], gap: false },
  { id: 'cloud',    name: 'Cloud Deploy',     score: 12, proofScore: 0,  evidence: [],               gap: true  },
  { id: 'react',    name: 'React.js',         score: 50, proofScore: 42, evidence: ['github'],       gap: false },
]

/* ── Default challenges ──────────────────────────────────────── */
const DEFAULT_CHALLENGES = [
  {
    id: 'c1', title: 'Python Data Pipeline', company: 'DataCorp',
    skill: 'python', difficulty: 'Medium', timeEst: '3h', reward: '+8% proof',
    status: 'open',   // open | started | submitted | completed
    submittedUrl: '', completedAt: null,
  },
  {
    id: 'c2', title: 'ML Model Deployment', company: 'NovaMed',
    skill: 'ml', difficulty: 'Hard', timeEst: '5h', reward: '+12% proof',
    status: 'open', submittedUrl: '', completedAt: null,
  },
  {
    id: 'c3', title: 'Cloud Infrastructure Setup', company: 'CloudNine',
    skill: 'cloud', difficulty: 'Hard', timeEst: '4h', reward: '+15% proof',
    status: 'open', submittedUrl: '', completedAt: null,
  },
  {
    id: 'c4', title: 'SQL Analytics Dashboard', company: 'BizData',
    skill: 'sql', difficulty: 'Easy', timeEst: '2h', reward: '+6% proof',
    status: 'completed', submittedUrl: 'github.com/demo/sql-dash', completedAt: '2026-08-15',
  },
]

/* ── Default evidence ────────────────────────────────────────── */
const DEFAULT_EVIDENCE = [
  {
    id: 'e1', type: 'Certificate', name: 'Python for AI — Coursera',
    skill: 'python', scanStatus: 'verified', // verified | pending | failed | frontend-sim
    confidence: 97, addedAt: '2026-07-10',
    extracted: { course: 'Python for AI', org: 'Coursera', date: 'Jul 2026', skills: ['Python','NumPy','Pandas'] },
  },
  {
    id: 'e2', type: 'GitHub', name: 'face-detect project',
    skill: 'opencv', scanStatus: 'verified', confidence: 88, addedAt: '2026-08-01',
    extracted: { repo: 'face-detect', stars: 12, commits: 47, skills: ['OpenCV','Python'] },
  },
  {
    id: 'e3', type: 'Certificate', name: 'SQL Fundamentals — LinkedIn',
    skill: 'sql', scanStatus: 'frontend-sim', confidence: 74, addedAt: '2026-06-20',
    extracted: { course: 'SQL Fundamentals', org: 'LinkedIn Learning', date: 'Jun 2026', skills: ['SQL','PostgreSQL'] },
  },
]

/* ── Default profile ─────────────────────────────────────────── */
const DEFAULT_PROFILE = {
  name: '',
  email: '',
  college: '',
  branch: '',
  year: '',
  cgpa: '',
  phone: '',
  github: '',
  linkedin: '',
  bio: '',
  profileComplete: 0, // 0–100
}

/* ── Default phases ──────────────────────────────────────────── */
const DEFAULT_PHASES = {
  fraud:      { done: true,  startedAt: '2026-07-01' },
  assessment: { done: false, startedAt: null },
  analytics:  { done: false, startedAt: null },
  corporate:  { done: false, startedAt: null },
}

/* ── Default assessment state ────────────────────────────────── */
const DEFAULT_ASSESSMENT = {
  lastScore: null,      // 0–100
  lastTakenAt: null,
  totalAttempts: 0,
  bySkill: {},          // { python: { score:72, takenAt:'...' } }
}

/* ── Activity feed ───────────────────────────────────────────── */
const DEFAULT_ACTIVITY = [
  { id: 'a1', type: 'evidence',    text: 'Certificate "Python for AI" verified',   time: '2026-08-01T10:00:00Z' },
  { id: 'a2', type: 'github',      text: 'GitHub project "face-detect" linked',    time: '2026-07-28T14:30:00Z' },
  { id: 'a3', type: 'challenge',   text: 'SQL Analytics challenge completed (91/100)', time: '2026-08-15T09:15:00Z' },
]

/* ── Compute readiness from skills ───────────────────────────── */
function computeReadiness(skills) {
  if (!skills.length) return 0
  const total = skills.reduce((s, k) => s + k.proofScore, 0)
  return Math.round(total / skills.length)
}

/* ── Load from localStorage ──────────────────────────────────── */
function loadPersistedData(email) {
  if (!email) return null
  try {
    const raw = localStorage.getItem(`sp-student-${email}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/* ── Save to localStorage ────────────────────────────────────── */
function persistData(email, data) {
  if (!email) return
  try {
    localStorage.setItem(`sp-student-${email}`, JSON.stringify(data))
  } catch { /* quota exceeded — fail silently */ }
}

/* ════════════════════════════════════════════════════════════════
   PROVIDER
════════════════════════════════════════════════════════════════ */
export function StudentDataProvider({ children, userEmail, userName }) {
  const emailRef = useRef(userEmail)

  const init = () => {
    const saved = loadPersistedData(userEmail)
    if (saved) return saved
    return {
      skills:     DEFAULT_SKILLS,
      challenges: DEFAULT_CHALLENGES,
      evidence:   DEFAULT_EVIDENCE,
      profile:    { ...DEFAULT_PROFILE, name: userName || '', email: userEmail || '' },
      phases:     DEFAULT_PHASES,
      assessment: DEFAULT_ASSESSMENT,
      activity:   DEFAULT_ACTIVITY,
      githubConnected: false,
      passportVisible: true,
    }
  }

  const [state, setStateRaw] = useState(init)

  // Persist on every change
  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persistData(emailRef.current, next)
      return next
    })
  }, [])

  // When user switches accounts, re-init from their saved data
  useEffect(() => {
    if (userEmail && userEmail !== emailRef.current) {
      emailRef.current = userEmail
      const saved = loadPersistedData(userEmail)
      if (saved) {
        setStateRaw(saved)
      } else {
        setStateRaw({
          skills:     DEFAULT_SKILLS,
          challenges: DEFAULT_CHALLENGES,
          evidence:   DEFAULT_EVIDENCE,
          profile:    { ...DEFAULT_PROFILE, name: userName || '', email: userEmail || '' },
          phases:     DEFAULT_PHASES,
          assessment: DEFAULT_ASSESSMENT,
          activity:   DEFAULT_ACTIVITY,
          githubConnected: false,
          passportVisible: true,
        })
      }
    }
  }, [userEmail, userName])

  /* ── Derived values ─────────────────────────────────────────── */
  const readiness    = computeReadiness(state.skills)
  const gapCount     = state.skills.filter(s => s.gap).length
  const evidenceCount= state.evidence.length
  const doneCount    = state.challenges.filter(c => c.status === 'completed').length

  /* ── Activity helper ────────────────────────────────────────── */
  const addActivity = useCallback((type, text) => {
    setState(prev => ({
      ...prev,
      activity: [
        { id: `a${Date.now()}`, type, text, time: new Date().toISOString() },
        ...prev.activity,
      ].slice(0, 50),  // cap at 50 entries
    }))
  }, [setState])

  /* ── SKILLS ─────────────────────────────────────────────────── */
  const updateSkillScore = useCallback((skillId, scoreDelta, proofDelta) => {
    setState(prev => {
      const skills = prev.skills.map(s => {
        if (s.id !== skillId) return s
        const newScore = Math.min(100, Math.max(0, s.score + scoreDelta))
        const newProof = Math.min(100, Math.max(0, s.proofScore + proofDelta))
        return { ...s, score: newScore, proofScore: newProof, gap: newProof < 30 }
      })
      return { ...prev, skills }
    })
  }, [setState])

  const addSkill = useCallback((skill) => {
    setState(prev => {
      if (prev.skills.find(s => s.id === skill.id)) return prev
      return { ...prev, skills: [...prev.skills, skill] }
    })
  }, [setState])

  /* ── EVIDENCE ────────────────────────────────────────────────── */
  const addEvidence = useCallback((evidence) => {
    setState(prev => {
      // bump the matching skill's proofScore
      const skills = prev.skills.map(s => {
        if (s.id !== evidence.skill) return s
        const bump = evidence.scanStatus === 'verified' ? 8 : 4
        const newProof = Math.min(100, s.proofScore + bump)
        const newEvidence = [...s.evidence, evidence.type.toLowerCase()]
        return { ...s, proofScore: newProof, evidence: newEvidence, gap: newProof < 30 }
      })
      return {
        ...prev,
        skills,
        evidence: [evidence, ...prev.evidence],
      }
    })
    addActivity('evidence', `New evidence added: ${evidence.name}`)
  }, [setState, addActivity])

  const updateEvidenceScan = useCallback((evidenceId, scanStatus, confidence, extracted) => {
    setState(prev => ({
      ...prev,
      evidence: prev.evidence.map(e =>
        e.id === evidenceId ? { ...e, scanStatus, confidence, extracted: extracted || e.extracted } : e
      ),
    }))
  }, [setState])

  /* ── CHALLENGES ──────────────────────────────────────────────── */
  const startChallenge = useCallback((challengeId) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c =>
        c.id === challengeId ? { ...c, status: 'started' } : c
      ),
    }))
    addActivity('challenge', `Challenge started`)
  }, [setState, addActivity])

  const submitChallenge = useCallback((challengeId, submittedUrl) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c =>
        c.id === challengeId ? { ...c, status: 'submitted', submittedUrl } : c
      ),
    }))
    addActivity('challenge', `Challenge submitted — under review`)
  }, [setState, addActivity])

  const completeChallenge = useCallback((challengeId) => {
    setState(prev => {
      const challenge = prev.challenges.find(c => c.id === challengeId)
      if (!challenge) return prev

      // Apply proof boost to matching skill
      const skills = prev.skills.map(s => {
        if (s.id !== challenge.skill) return s
        const boost = challenge.difficulty === 'Hard' ? 12
                    : challenge.difficulty === 'Medium' ? 8 : 5
        const newProof = Math.min(100, s.proofScore + boost)
        const newScore = Math.min(100, s.score + Math.round(boost * 0.6))
        return {
          ...s,
          proofScore: newProof,
          score: newScore,
          gap: newProof < 30,
          evidence: [...new Set([...s.evidence, 'challenge'])],
        }
      })

      return {
        ...prev,
        skills,
        challenges: prev.challenges.map(c =>
          c.id === challengeId
            ? { ...c, status: 'completed', completedAt: new Date().toISOString().slice(0, 10) }
            : c
        ),
        phases: { ...prev.phases, corporate: { done: true, startedAt: new Date().toISOString() } },
      }
    })
    addActivity('challenge', `Challenge completed — evidence updated`)
  }, [setState, addActivity])

  /* ── ASSESSMENT ──────────────────────────────────────────────── */
  const recordAssessment = useCallback((skillId, score) => {
    setState(prev => {
      const skills = prev.skills.map(s => {
        if (s.id !== skillId) return s
        // Score ≥60 = pass → boost skill
        const passed = score >= 60
        const scoreDelta = passed ? Math.round((score - s.score) * 0.5) : -3
        const proofDelta = passed ? Math.round(score * 0.12) : 0
        const newScore = Math.min(100, Math.max(0, s.score + scoreDelta))
        const newProof = Math.min(100, Math.max(0, s.proofScore + proofDelta))
        return {
          ...s,
          score: newScore,
          proofScore: newProof,
          gap: newProof < 30,
          evidence: passed ? [...new Set([...s.evidence, 'assessment'])] : s.evidence,
        }
      })

      return {
        ...prev,
        skills,
        assessment: {
          ...prev.assessment,
          lastScore: score,
          lastTakenAt: new Date().toISOString(),
          totalAttempts: prev.assessment.totalAttempts + 1,
          bySkill: {
            ...prev.assessment.bySkill,
            [skillId]: { score, takenAt: new Date().toISOString() },
          },
        },
        phases: {
          ...prev.phases,
          assessment: { done: score >= 60, startedAt: new Date().toISOString() },
        },
      }
    })
    addActivity('assessment', `Assessment completed — score ${score}%`)
  }, [setState, addActivity])

  /* ── GITHUB ──────────────────────────────────────────────────── */
  const connectGitHub = useCallback((username, repos) => {
    setState(prev => {
      // Each repo with >10 commits contributes to a relevant skill
      const skills = prev.skills.map(s => {
        const matching = repos.filter(r =>
          r.language && r.language.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])
        )
        if (!matching.length) return s
        const boost = Math.min(10, matching.length * 3)
        return {
          ...s,
          proofScore: Math.min(100, s.proofScore + boost),
          evidence: [...new Set([...s.evidence, 'github'])],
        }
      })
      return {
        ...prev,
        skills,
        githubConnected: true,
        profile: { ...prev.profile, github: username },
      }
    })
    addActivity('github', `GitHub connected — ${repos.length} repositories imported`)
  }, [setState, addActivity])

  /* ── PROFILE ─────────────────────────────────────────────────── */
  const updateProfile = useCallback((updates) => {
    setState(prev => {
      const profile = { ...prev.profile, ...updates }
      // Compute completeness
      const fields = ['name','email','college','branch','year','cgpa','phone','github','bio']
      const filled = fields.filter(f => profile[f] && profile[f].trim && profile[f].trim())
      const profileComplete = Math.round((filled.length / fields.length) * 100)
      return { ...prev, profile: { ...profile, profileComplete } }
    })
    addActivity('profile', 'Profile updated')
  }, [setState, addActivity])

  /* ── PHASES ──────────────────────────────────────────────────── */
  const markPhaseDone = useCallback((phase) => {
    setState(prev => ({
      ...prev,
      phases: { ...prev.phases, [phase]: { done: true, startedAt: new Date().toISOString() } },
    }))
  }, [setState])

  /* ── RESET (dev only) ────────────────────────────────────────── */
  const resetData = useCallback(() => {
    if (emailRef.current) localStorage.removeItem(`sp-student-${emailRef.current}`)
    setStateRaw({
      skills:     DEFAULT_SKILLS,
      challenges: DEFAULT_CHALLENGES,
      evidence:   DEFAULT_EVIDENCE,
      profile:    { ...DEFAULT_PROFILE, name: userName || '', email: userEmail || '' },
      phases:     DEFAULT_PHASES,
      assessment: DEFAULT_ASSESSMENT,
      activity:   DEFAULT_ACTIVITY,
      githubConnected: false,
      passportVisible: true,
    })
  }, [userName, userEmail])

  const value = {
    /* raw state */
    ...state,
    /* derived */
    readiness,
    gapCount,
    evidenceCount,
    doneCount,
    /* actions */
    updateSkillScore,
    addSkill,
    addEvidence,
    updateEvidenceScan,
    startChallenge,
    submitChallenge,
    completeChallenge,
    recordAssessment,
    connectGitHub,
    updateProfile,
    markPhaseDone,
    addActivity,
    resetData,
    setState,  // escape hatch for complex updates
  }

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  )
}

export const useStudentData = () => {
  const ctx = useContext(StudentDataContext)
  if (!ctx) throw new Error('useStudentData must be used inside StudentDataProvider')
  return ctx
}
