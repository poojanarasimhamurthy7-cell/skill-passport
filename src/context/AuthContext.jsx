import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext()

// Roles: student | recruiter | college | ministry | admin
// Admin accounts — hidden, max 6
const ADMIN_ACCOUNTS = [
  { email: 'overseer1@skillpassport.admin', password: 'Admin@SP2026#1', name: 'Overseer Alpha' },
  { email: 'overseer2@skillpassport.admin', password: 'Admin@SP2026#2', name: 'Overseer Beta'  },
  { email: 'overseer3@skillpassport.admin', password: 'Admin@SP2026#3', name: 'Overseer Gamma' },
]

// Immutable student fields once set (SRN, college)
const IMMUTABLE_FIELDS = ['srn', 'college', 'branch', 'enrollmentYear']

// Simulated candidate database
const CANDIDATE_DB = [
  {
    id: 'STU001', name: 'Arjun Verma', email: 'arjun@git.edu',
    srn: 'GIT2023CS001', college: 'Greenfield Institute of Technology',
    branch: 'CSE', enrollmentYear: '2023', year: '3rd', cgpa: '8.4',
    readiness: 76, assessmentScore: 72, status: 'active', flagged: false,
    osint: { leetcode: 420, gfg: 1200, github: 18, linkedin: true },
    skills: ['Python', 'ML', 'SQL', 'OpenCV'],
  },
  {
    id: 'STU002', name: 'Priya Nair', email: 'priya@git.edu',
    srn: 'GIT2023CS002', college: 'Greenfield Institute of Technology',
    branch: 'CSE', enrollmentYear: '2023', year: '3rd', cgpa: '9.1',
    readiness: 88, assessmentScore: 91, status: 'active', flagged: false,
    osint: { leetcode: 780, gfg: 2400, github: 34, linkedin: true },
    skills: ['Python', 'ML', 'React', 'Node.js'],
  },
  {
    id: 'STU003', name: 'Ravi Kumar', email: 'ravi@git.edu',
    srn: 'GIT2023ME003', college: 'Greenfield Institute of Technology',
    branch: 'ME', enrollmentYear: '2023', year: '3rd', cgpa: '6.8',
    readiness: 42, assessmentScore: 48, status: 'review', flagged: true,
    osint: { leetcode: 80, gfg: 200, github: 2, linkedin: false },
    skills: ['AutoCAD', 'SolidWorks'],
  },
]

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('sp-user')) || null } catch { return null }
  })
  const [magicTokens,  setMagicTokens]  = useState({})  // email -> token
  const [candidates,   setCandidates]   = useState(CANDIDATE_DB)
  const [flaggedDocs,  setFlaggedDocs]  = useState([])
  const [companies,    setCompanies]    = useState([
    { id: 'C001', name: 'NovaMed Solutions',   domain: 'novamed.com',  vetted: true,  active: true  },
    { id: 'C002', name: 'TechBridge Corp',     domain: 'techbridge.io', vetted: true, active: true  },
    { id: 'C003', name: 'CloudNine Ventures',  domain: 'cloudnine.in',  vetted: false, active: false },
  ])

  const persist = u => {
    setUser(u)
    if (u) localStorage.setItem('sp-user', JSON.stringify(u))
    else    localStorage.removeItem('sp-user')
  }

  // Student login — simulate magic token
  const requestMagicToken = useCallback((email) => {
    const token = Math.random().toString(36).slice(2, 10).toUpperCase()
    setMagicTokens(t => ({ ...t, [email]: token }))
    console.info(`[DEV] Magic token for ${email}: ${token}`) // shown in dev console only
    return token
  }, [])

  const verifyMagicToken = useCallback((email, token) => {
    return magicTokens[email] === token
  }, [magicTokens])

  const loginStudent = useCallback((email, name, extraFields = {}) => {
    const u = { role: 'student', email, name, ...extraFields }
    persist(u)
  }, [])

  // Admin login — checks against hidden account list
  const loginAdmin = useCallback((email, password) => {
    const match = ADMIN_ACCOUNTS.find(a => a.email === email && a.password === password)
    if (!match) return false
    persist({ role: 'admin', email: match.email, name: match.name })
    return true
  }, [])

  // Recruiter login — block personal domains
  const BLOCKED = ['gmail', 'yahoo', 'hotmail', 'outlook', 'rediff', 'icloud']
  const loginRecruiter = useCallback((email, name) => {
    const blocked = BLOCKED.some(d => email.toLowerCase().includes(`@${d}.`))
    if (blocked) return false
    persist({ role: 'recruiter', email, name })
    return true
  }, [])

  const loginRole = useCallback((role, name, email) => {
    persist({ role, name, email })
  }, [])

  const logout = useCallback(() => persist(null), [])

  // Update candidate — respects immutable fields
  const updateCandidate = useCallback((id, updates) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c
      const safe = { ...updates }
      IMMUTABLE_FIELDS.forEach(f => { delete safe[f] }) // strip immutable
      return { ...c, ...safe }
    }))
  }, [])

  const flagCandidate = useCallback((id, reason) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, flagged: true, flagReason: reason, status: 'review' } : c))
    setFlaggedDocs(prev => [...prev, { candidateId: id, reason, timestamp: new Date().toISOString() }])
  }, [])

  const vettedCompanies = companies.filter(c => c.vetted && c.active)

  return (
    <AuthContext.Provider value={{
      user,
      // login is an alias for loginStudent — keeps Signup.jsx and any legacy callers working
      login: loginStudent,
      loginStudent, loginAdmin, loginRecruiter, loginRole, logout,
      requestMagicToken, verifyMagicToken,
      candidates, updateCandidate, flagCandidate, flaggedDocs,
      companies, setCompanies, vettedCompanies,
      IMMUTABLE_FIELDS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
