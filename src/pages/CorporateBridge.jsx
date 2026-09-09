
import { useState, useCallback } from 'react'
import {
  Building2, Shield, CheckCircle2, XCircle, AlertTriangle,
  Globe, Search, Calendar, Mail, Phone, Clock, Users,
  ChevronDown, ChevronUp, RefreshCw, Zap, Star, MapPin,
  Briefcase, FileText, ArrowRight, Plus, Trash2, Filter,
  TrendingUp, Lock, CheckSquare, Eye
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── MOCK DATA ─────────────────────────────────────────────────────
const INITIAL_COMPANIES = [
  {
    id: 'C001', name: 'NovaMed Solutions', domain: 'novamed-demo.local',
    industry: 'Healthcare-Tech', size: '200-500', hq: 'Bangalore',
    linkedin: 'linkedin.com/company/novamed-demo', website: 'novamed-demo.local',
    vetted: true, active: true, bgCheck: 'passed', linkedinScore: 88,
    verifiedBy: 'Overseer Alpha', verifiedOn: 'Aug 12, 2026',
    roles: [
      { id:'R001', title:'ML Intern',        skills:['Python','ML','OpenCV'],      stipend:'₹15,000/mo', seats:3, duration:'6 months' },
      { id:'R002', title:'Data Analyst',     skills:['Python','SQL','Tableau'],    stipend:'₹12,000/mo', seats:2, duration:'3 months' },
    ],
    contacts: [{ name:'Preethi Nair', role:'HR Manager', email:'hr@novamed-demo.local', phone:'+91-98XXX-XXXXX' }],
  },
  {
    id: 'C002', name: 'TechBridge Corp', domain: 'techbridge-demo.local',
    industry: 'IT Services', size: '500-1000', hq: 'Hyderabad',
    linkedin: 'linkedin.com/company/techbridge-demo', website: 'techbridge-demo.local',
    vetted: true, active: true, bgCheck: 'passed', linkedinScore: 79,
    verifiedBy: 'Overseer Beta', verifiedOn: 'Aug 20, 2026',
    roles: [
      { id:'R003', title:'Full Stack Intern', skills:['React','Node.js','SQL'],    stipend:'₹18,000/mo', seats:5, duration:'6 months' },
      { id:'R004', title:'Java Developer',    skills:['Java','Spring','DBMS'],     stipend:'₹20,000/mo', seats:2, duration:'PPO' },
    ],
    contacts: [{ name:'Vikram Rajan', role:'Recruitment Lead', email:'recruit@techbridge-demo.local', phone:'+91-97XXX-XXXXX' }],
  },
  {
    id: 'C003', name: 'CloudNine Ventures', domain: 'cloudnine-demo.local',
    industry: 'Cloud & DevOps', size: '50-200', hq: 'Chennai',
    linkedin: 'linkedin.com/company/cloudnine-demo', website: 'cloudnine-demo.local',
    vetted: false, active: false, bgCheck: 'failed', linkedinScore: 31,
    verifiedBy: null, verifiedOn: null,
    roles: [],
    contacts: [],
  },
  {
    id: 'C004', name: 'AyurTech Institute', domain: 'ayurtech-demo.local',
    industry: 'Ayurveda-Tech', size: '10-50', hq: 'Pune',
    linkedin: 'linkedin.com/company/ayurtech-demo', website: 'ayurtech-demo.local',
    vetted: false, active: false, bgCheck: 'pending', linkedinScore: 55,
    verifiedBy: null, verifiedOn: null,
    roles: [
      { id:'R005', title:'Ayurveda Research Intern', skills:['Research','Documentation','Herbology'], stipend:'₹8,000/mo', seats:2, duration:'3 months' },
    ],
    contacts: [],
  },
]

const CANDIDATES = [
  { id:'STU001', name:'Arjun Verma',  college:'Greenfield IT',  branch:'CSE', year:'3rd', score:76, skills:['Python','ML','SQL','OpenCV'],  status:'active',  matched:['R001','R002'] },
  { id:'STU002', name:'Priya Nair',   college:'Greenfield IT',  branch:'CSE', year:'3rd', score:88, skills:['Python','ML','React','Node.js'],status:'active',  matched:['R001','R003'] },
  { id:'STU003', name:'Ravi Kumar',   college:'Greenfield IT',  branch:'ME',  year:'3rd', score:48, skills:['AutoCAD','SolidWorks'],         status:'review',  matched:[] },
]

const VETTING_CHECKS = [
  { id:'linkedin', label:'LinkedIn Presence Verified',    desc:'Active company page with verifiable history'       },
  { id:'domain',   label:'Domain WHOIS Check',            desc:'Domain registered > 1 year, not disposable'       },
  { id:'gst',      label:'GST / Company Registration',    desc:'Valid business registration number on file'        },
  { id:'bg',       label:'Background Reputation Check',   desc:'No fraudulent listings or blacklist flags'         },
  { id:'hr',       label:'HR Contact Verified',           desc:'Company email domain matches official domain'      },
]

const INTERVIEW_SLOTS = [
  { date:'Sep 10, 2026', time:'10:00 AM', mode:'Video' },
  { date:'Sep 10, 2026', time:'02:00 PM', mode:'Video' },
  { date:'Sep 11, 2026', time:'11:00 AM', mode:'In-person' },
  { date:'Sep 12, 2026', time:'03:00 PM', mode:'Video' },
]

// ── HELPERS ────────────────────────────────────────────────────────
function VettingBadge({ company }) {
  if (company.vetted)
    return <span className="badge-green text-xs flex items-center gap-1"><Shield size={10}/> Vetted</span>
  if (company.bgCheck === 'failed')
    return <span className="badge-red text-xs flex items-center gap-1"><XCircle size={10}/> Blocked</span>
  return <span className="badge text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1"><AlertTriangle size={10}/> Pending</span>
}

// ── SECTION 1: COMPANY VETTING PANEL ─────────────────────────────
function CompanyVetting() {
  const [companies,  setCompanies]  = useState(INITIAL_COMPANIES)
  const [vetting,    setVetting]    = useState(null)     // id of company being vetted
  const [checks,     setChecks]     = useState({})       // id -> completed check ids
  const [expanded,   setExpanded]   = useState(null)
  const [scraping,   setScraping]   = useState(null)

  const startVet = (id) => {
    setVetting(id); setChecks(c => ({ ...c, [id]: [] }))
  }

  const completeCheck = (cid, chk) => {
    setChecks(prev => {
      const arr = [...(prev[cid] || [])]
      if (!arr.includes(chk)) arr.push(chk)
      return { ...prev, [cid]: arr }
    })
  }

  const approveCompany = (id) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, vetted:true, active:true, bgCheck:'passed' } : c))
    setVetting(null)
  }

  const blockCompany = (id) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, vetted:false, active:false, bgCheck:'failed' } : c))
    setVetting(null)
  }

  const scrapeLinkedIn = (id) => {
    setScraping(id)
    setTimeout(() => setScraping(null), 1800)
  }

  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
          <Building2 size={20} className="text-white"/>
        </div>
        <div>
          <h2 className="section-title text-base">Company Vetting & Verification</h2>
          <p className="section-sub text-xs">Background checks · LinkedIn scrape · Domain verification · Anti-fraud</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="badge-green text-xs">{companies.filter(c=>c.vetted).length} Approved</span>
          <span className="badge-red text-xs">{companies.filter(c=>c.bgCheck==='failed').length} Blocked</span>
          <span className="badge text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{companies.filter(c=>!c.vetted && c.bgCheck!=='failed').length} Pending</span>
        </div>
      </div>

      <div className="space-y-3">
        {companies.map(c => (
          <div key={c.id} className={`border-2 rounded-xl overflow-hidden transition-all
            ${c.vetted ? 'border-green-200 dark:border-green-800' :
              c.bgCheck==='failed' ? 'border-red-200 dark:border-red-800' :
              'border-amber-200 dark:border-amber-800'}`}>
            {/* Company header */}
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-white"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</p>
                  <VettingBadge company={c}/>
                </div>
                <p className="text-xs text-gray-500">{c.industry} · {c.hq} · {c.domain}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">LinkedIn: <strong className={c.linkedinScore>=60?'text-green-500':c.linkedinScore>=40?'text-amber-500':'text-red-500'}>{c.linkedinScore}%</strong></span>
                {expanded === c.id ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
              </div>
            </div>

            {/* Expanded vetting detail */}
            {expanded === c.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
                {/* LinkedIn scrape simulation */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-blue-500"/>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn: {c.linkedin}</span>
                  </div>
                  <button onClick={() => scrapeLinkedIn(c.id)} className="btn-ghost text-xs text-blue-500 flex items-center gap-1">
                    {scraping === c.id ? <RefreshCw size={12} className="animate-spin"/> : <Search size={12}/>}
                    {scraping === c.id ? 'Scraping...' : 'Scrape Profile'}
                  </button>
                </div>

                {/* Vetting checklist */}
                {!c.vetted && c.bgCheck !== 'failed' && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verification Checklist</p>
                    {VETTING_CHECKS.map(chk => {
                      const done = checks[c.id]?.includes(chk.id)
                      return (
                        <div key={chk.id} className="flex items-center gap-3">
                          <button onClick={() => completeCheck(c.id, chk.id)} disabled={done}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                              ${done ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'}`}>
                            {done && <CheckCircle2 size={12} className="text-white"/>}
                          </button>
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{chk.label}</p>
                            <p className="text-xs text-gray-400">{chk.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => approveCompany(c.id)}
                        disabled={(checks[c.id]?.length || 0) < VETTING_CHECKS.length}
                        className={`btn-primary text-xs flex items-center gap-1.5 ${(checks[c.id]?.length || 0) < VETTING_CHECKS.length ? 'opacity-50 cursor-not-allowed' : 'glow-orange'}`}>
                        <CheckCircle2 size={13}/> Approve Company
                      </button>
                      <button onClick={() => blockCompany(c.id)} className="btn-ghost text-xs text-red-500 flex items-center gap-1.5">
                        <XCircle size={13}/> Block Listing
                      </button>
                    </div>
                  </div>
                )}

                {/* Approved info */}
                {c.vetted && (
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300 space-y-1">
                    <p><strong>Verified by:</strong> {c.verifiedBy} on {c.verifiedOn}</p>
                    <p><strong>Roles posted:</strong> {c.roles.length}</p>
                    {c.contacts[0] && <p><strong>HR Contact:</strong> {c.contacts[0].name} · {c.contacts[0].email}</p>}
                  </div>
                )}

                {/* Blocked info */}
                {c.bgCheck === 'failed' && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                    <p><strong>Status:</strong> Blocked — background check failed.</p>
                    <p className="mt-0.5">LinkedIn score {c.linkedinScore}% is below the 40% acceptance threshold. No job listings are visible to candidates from this entity.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SECTION 2: ROLE LISTINGS ─────────────────────────────────────
function RoleListings({ onMatch }) {
  const [filter, setFilter] = useState('all')
  const vetted = INITIAL_COMPANIES.filter(c => c.vetted)
  const roles  = vetted.flatMap(c => c.roles.map(r => ({ ...r, company: c.name, industry: c.industry })))

  const SKILLS_ALL = [...new Set(roles.flatMap(r => r.skills))]
  const filtered   = filter === 'all' ? roles : roles.filter(r => r.skills.includes(filter))

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
          <Briefcase size={20} className="text-white"/>
        </div>
        <div>
          <h2 className="section-title text-base">Active Internship & Placement Roles</h2>
          <p className="section-sub text-xs">From vetted companies only · {roles.length} roles available</p>
        </div>
      </div>

      {/* Skill filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filter==='all'?'bg-orange-500 text-white':'bg-orange-100 dark:bg-gray-800 text-orange-700 dark:text-orange-300'}`}>
          All
        </button>
        {SKILLS_ALL.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filter===s?'bg-orange-500 text-white':'bg-orange-100 dark:bg-gray-800 text-orange-700 dark:text-orange-300'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{r.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.company} · {r.industry}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-green text-xs">{r.seats} seats</span>
                <span className="badge-orange text-xs">{r.stipend}</span>
                <span className="badge text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{r.duration}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {r.skills.map(s => <span key={s} className="badge bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">{s}</span>)}
            </div>
            <button onClick={() => onMatch(r)} className="btn-primary text-xs mt-3 flex items-center gap-1.5">
              <Users size={12}/> Match Candidates
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SECTION 3: CANDIDATE MATCHING PIPELINE ───────────────────────
function MatchingPipeline({ role, onSchedule }) {
  if (!role) return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <Users size={32} className="text-gray-300 dark:text-gray-600 mb-3"/>
      <p className="text-sm text-gray-500 dark:text-gray-400">Select a role from the listings to view matched candidates</p>
    </div>
  )

  const matched = CANDIDATES.filter(c => c.matched.includes(role.id))
  const SCORE_COLOR = s => s >= 80 ? 'text-green-500' : s >= 60 ? 'text-orange-500' : 'text-red-500'

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-md">
          <Users size={20} className="text-white"/>
        </div>
        <div className="flex-1">
          <h2 className="section-title text-base">Matched Candidates</h2>
          <p className="section-sub text-xs">Role: {role.title} · {role.company}</p>
        </div>
        <span className="badge-orange text-xs">{matched.length} matches</span>
      </div>

      {matched.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <AlertTriangle size={24} className="mx-auto mb-2 text-amber-400"/>
          <p className="text-sm">No candidates meet the skill requirements for this role.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matched.map((c, i) => {
            const matchedSkills  = c.skills.filter(s => role.skills.includes(s))
            const missingSkills  = role.skills.filter(s => !c.skills.includes(s))
            const matchPct       = Math.round((matchedSkills.length / role.skills.length) * 100 * 0.6 + c.score * 0.4)

            return (
              <div key={c.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {c.name.split(' ').map(w=>w[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.college} · {c.branch} · {c.year}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <p className={`text-xl font-black ${SCORE_COLOR(matchPct)}`}>{matchPct}%</p>
                    <p className="text-xs text-gray-400">Match</p>
                  </div>
                  {i === 0 && <span className="badge-orange text-xs flex items-center gap-1"><Star size={10}/> Top Match</span>}
                </div>

                {/* Skill match */}
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map(s => <span key={s} className="badge-green text-xs flex items-center gap-1"><CheckCircle2 size={9}/> {s}</span>)}
                  {missingSkills.map(s => <span key={s} className="badge-red text-xs flex items-center gap-1"><XCircle size={9}/> {s}</span>)}
                </div>

                <button onClick={() => onSchedule(c, role)} className="btn-primary text-xs flex items-center gap-1.5">
                  <Calendar size={12}/> Schedule Interview
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── SECTION 4: INTERVIEW APPOINTMENT PLANNER ────────────────────
function InterviewPlanner({ candidate, role, onClose }) {
  const [slot,      setSlot]      = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [notifSent, setNotifSent] = useState(false)

  const confirm = () => {
    if (!slot) return
    setConfirmed(true)
    setTimeout(() => setNotifSent(true), 800)
  }

  if (!candidate) return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <Calendar size={32} className="text-gray-300 dark:text-gray-600 mb-3"/>
      <p className="text-sm text-gray-500 dark:text-gray-400">Select a candidate to schedule their interview</p>
    </div>
  )

  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
          <Calendar size={20} className="text-white"/>
        </div>
        <div className="flex-1">
          <h2 className="section-title text-base">Interview Appointment Planner</h2>
          <p className="section-sub text-xs">{candidate.name} · {role?.title} at {role?.company}</p>
        </div>
        <button onClick={onClose} className="btn-ghost text-xs text-gray-400">✕ Close</button>
      </div>

      {!confirmed ? (
        <>
          {/* Candidate summary */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {candidate.name.split(' ').map(w=>w[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{candidate.name}</p>
              <p className="text-xs text-gray-500">{candidate.college} · Score: {candidate.score}%</p>
            </div>
          </div>

          {/* Slot selection */}
          <div>
            <p className="label mb-2">Select Interview Slot</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {INTERVIEW_SLOTS.map((s, i) => (
                <button key={i} onClick={() => setSlot(s)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                    ${slot === s ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}>
                  <Calendar size={16} className={slot===s?'text-orange-500':'text-gray-400'}/>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.date}</p>
                    <p className="text-xs text-gray-500">{s.time} · {s.mode}</p>
                  </div>
                  {slot === s && <CheckCircle2 size={16} className="text-orange-500 ml-auto shrink-0"/>}
                </button>
              ))}
            </div>
          </div>

          {/* Interview mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label">Interview Type</p>
              <select className="input text-sm">
                <option>Technical Round</option>
                <option>HR Round</option>
                <option>Full Interview</option>
              </select>
            </div>
            <div>
              <p className="label">Platform (if video)</p>
              <select className="input text-sm">
                <option>Google Meet</option>
                <option>Zoom</option>
                <option>MS Teams</option>
                <option>In-person</option>
              </select>
            </div>
          </div>

          <div>
            <p className="label">Additional Notes</p>
            <textarea rows={2} placeholder="Instructions for candidate (optional)..."
              className="input resize-none text-sm"/>
          </div>

          <button onClick={confirm} disabled={!slot}
            className={`btn-primary w-full justify-center py-3 flex items-center gap-2 ${!slot?'opacity-50 cursor-not-allowed':'glow-orange'}`}>
            <CheckCircle2 size={16}/> Confirm & Notify Candidate
          </button>
        </>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 text-center">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2"/>
            <p className="font-bold text-green-700 dark:text-green-300">Interview Scheduled!</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {slot?.date} at {slot?.time} · {slot?.mode}
            </p>
          </div>

          {/* Notification status */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notifications Sent</p>
            {[
              { channel:'In-App Notification', status: notifSent, detail:`Sent to ${candidate.name}'s dashboard` },
              { channel:'Email Notification',  status: notifSent, detail:`Sent to candidate registered email` },
              { channel:'WhatsApp Alert',      status: notifSent, detail:'Simulated — requires backend integration' },
            ].map((n,i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all
                ${n.status ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 opacity-50'}`}>
                {n.status ? <CheckCircle2 size={14} className="text-green-500 shrink-0"/> : <RefreshCw size={14} className="text-gray-400 animate-spin shrink-0"/>}
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{n.channel}</p>
                  <p className="text-xs text-gray-400">{n.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center">
            Interview confirmation has been dispatched. Candidate response tracking available in Admin Panel.
          </p>
        </div>
      )}
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
export default function CorporateBridge() {
  const [tab,        setTab]        = useState('vetting')
  const [activeRole, setActiveRole] = useState(null)
  const [schedCand,  setSchedCand]  = useState(null)
  const [schedRole,  setSchedRole]  = useState(null)

  const handleSchedule = (candidate, role) => {
    setSchedCand(candidate)
    setSchedRole(role)
    setTab('planner')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Phase header */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-200 dark:border-orange-800">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-md">
          <Building2 size={20} className="text-white"/>
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Phase 4 — Corporate Internship Bridge</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Company Vetting · Role Listings · Candidate Matching · Interview Planner</p>
        </div>
        <span className="badge-orange ml-auto shrink-0">Phase 4</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-orange-100 dark:bg-gray-800 rounded-xl w-fit flex-wrap">
        {[['vetting','Company Vetting'],['roles','Role Listings'],['matching','Candidate Matching'],['planner','Interview Planner']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab===key ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'vetting'  && <CompanyVetting/>}
      {tab === 'roles'    && <RoleListings onMatch={r => { setActiveRole(r); setTab('matching') }}/>}
      {tab === 'matching' && <MatchingPipeline role={activeRole} onSchedule={handleSchedule}/>}
      {tab === 'planner'  && <InterviewPlanner candidate={schedCand} role={schedRole} onClose={() => setTab('matching')}/>}
    </div>
  )
}
