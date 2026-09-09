import { useState, useRef, useEffect } from 'react'
import {
  Shield, Upload, Scan, CheckCircle2, XCircle, AlertTriangle,
  FileText, GitBranch, User, ExternalLink, RefreshCw, Zap,
  Eye, Camera, Globe, Code, BarChart3, Clock, ChevronDown,
  ChevronUp, Info, Trophy, Star
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── MOCK DATA ──────────────────────────────────────────────────────
const SCAN_CHECKS = {
  certificate: [
    { id: 'qr',       label: 'QR Code Detection',       pass: true,  detail: 'QR resolves to learnbridge.io/verify/XK29' },
    { id: 'issuer',   label: 'Issuer Pattern Match',     pass: true,  detail: 'Template matches LearnBridge official format'  },
    { id: 'pixel',    label: 'Pixel Integrity Scan',     pass: true,  detail: 'No editing artefacts detected'                 },
    { id: 'meta',     label: 'Metadata Timestamp',       pass: true,  detail: 'File created 2026-03-14, unmodified'           },
    { id: 'font',     label: 'Font Consistency',         pass: true,  detail: 'Typography matches platform template'          },
  ],
  fake: [
    { id: 'qr',       label: 'QR Code Detection',       pass: false, detail: 'No QR code found in document'                  },
    { id: 'issuer',   label: 'Issuer Pattern Match',     pass: false, detail: 'Issuer name inconsistency detected'            },
    { id: 'pixel',    label: 'Pixel Integrity Scan',     pass: false, detail: '⚠ Editing artefacts near name field (91% conf)'},
    { id: 'meta',     label: 'Metadata Timestamp',       pass: false, detail: 'Metadata stripped — high-risk indicator'       },
    { id: 'font',     label: 'Font Consistency',         pass: true,  detail: 'Fonts appear standard'                        },
  ],
  internship: [
    { id: 'qr',       label: 'QR Code Detection',       pass: false, detail: 'No QR — queued for manual review'              },
    { id: 'issuer',   label: 'Issuer Pattern Match',     pass: true,  detail: 'Letterhead matches NovaMed branding'           },
    { id: 'pixel',    label: 'Pixel Integrity Scan',     pass: true,  detail: 'No editing artefacts detected'                 },
    { id: 'meta',     label: 'Metadata Timestamp',       pass: false, detail: 'Cannot auto-verify without QR/URL'             },
    { id: 'font',     label: 'Font Consistency',         pass: true,  detail: 'Typography matches corporate standard'         },
  ],
}

const FRAUD_MATRIX = [
  { criterion: 'Institutional Email Domain',       real: 'Matches registered college domain',     fake: 'Gmail / personal domain used',      status: 'pass' },
  { criterion: 'Certificate QR Verification',     real: 'QR resolves to issuer platform',        fake: 'QR missing or broken link',          status: 'pass' },
  { criterion: 'Document Pixel Integrity',         real: 'No editing artefacts detected',         fake: 'Name/date field pixel anomalies',    status: 'pass' },
  { criterion: 'Metadata Timestamp Consistency',   real: 'Creation date matches issued date',     fake: 'Metadata stripped or mismatched',    status: 'pass' },
  { criterion: 'Portrait–Resume Name Match',       real: 'Face matches document name field',      fake: 'No face or name mismatch detected', status: 'pass' },
  { criterion: 'CGPA–Marksheet Correlation',       real: 'Declared CGPA matches upload',          fake: 'CGPA inflated vs marksheet scan',    status: 'warn' },
  { criterion: 'GitHub Commit Authenticity',       real: 'Commits authored by stated username',   fake: 'No commits / cloned repos only',    status: 'pass' },
  { criterion: 'LinkedIn Profile Link Validity',   real: 'Active profile with work history',      fake: 'Broken link or empty profile',       status: 'fail' },
]

const OSINT_DATA = {
  leetcode:  { solved: 324, easy: 180, medium: 118, hard: 26,  rank: '~85k', score: 74 },
  gfg:       { score: 1480, problems: 210, streak: 18,          score_pct: 68           },
  github:    { repos: 14, stars: 22, commits: 847, prs: 9,      score: 81               },
  linkedin:  { connected: true, headline: 'CSE Student · ML Enthusiast', connections: 180, score: 60 },
}

const PORTRAIT_STEPS = [
  { label: 'Face Detection',       done: true,  detail: '1 face detected in document'             },
  { label: 'Facial Landmark Map',  done: true,  detail: '68 landmarks extracted'                  },
  { label: 'Feature Vector Match', done: true,  detail: 'Cosine similarity: 0.91 (threshold 0.80)'},
  { label: 'Liveness Check',       done: true,  detail: 'Photo is from a real document, not screen'},
  { label: 'Name Field Overlay',   done: true,  detail: '"Arjun Verma" — matches profile name'    },
]

// ── HELPERS ────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'pass') return <span className="badge-green text-xs flex items-center gap-1"><CheckCircle2 size={10}/> Pass</span>
  if (status === 'fail') return <span className="badge-red text-xs flex items-center gap-1"><XCircle size={10}/> Fail</span>
  return <span className="text-xs flex items-center gap-1 badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><AlertTriangle size={10}/> Warning</span>
}

function CheckRow({ check, revealed }) {
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
      !revealed ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50' :
      check.pass ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' :
                   'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'}`}>
      {!revealed
        ? <Clock size={14} className="text-gray-400 shrink-0 animate-pulse"/>
        : check.pass
          ? <CheckCircle2 size={14} className="text-green-500 shrink-0"/>
          : <XCircle size={14} className="text-red-500 shrink-0"/>}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{check.label}</span>
        {revealed && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{check.detail}</p>}
      </div>
    </div>
  )
}

// ── SECTION 1: DOCUMENT SCANNER ─────────────────────────────────
function DocumentScanner({ onFlag }) {
  const [docType,   setDocType]   = useState(null)
  const [scanning,  setScanning]  = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [revealed,  setRevealed]  = useState(0)
  const [done,      setDone]      = useState(false)
  const [fileName,  setFileName]  = useState('')
  const fileRef = useRef()

  const TYPES = [
    { key:'certificate', label:'Certificate',     icon:FileText  },
    { key:'fake',        label:'Fake Document',   icon:AlertTriangle },
    { key:'internship',  label:'Internship Ltr',  icon:FileText  },
  ]

  const startScan = (type) => {
    setDocType(type)
    setScanning(true)
    setProgress(0)
    setRevealed(0)
    setDone(false)
    setFileName(`Sample_${type}_document.pdf`)

    // Animate progress + reveal checks one by one
    let p = 0
    let r = 0
    const checks = SCAN_CHECKS[type]
    const interval = setInterval(() => {
      p += 4
      setProgress(Math.min(p, 100))
      if (p % 20 === 0 && r < checks.length) {
        r += 1
        setRevealed(r)
      }
      if (p >= 100) {
        clearInterval(interval)
        setRevealed(checks.length)
        setScanning(false)
        setDone(true)
        // Flag if fake
        if (type === 'fake') onFlag('Uploaded document flagged — pixel artefacts and missing QR detected.')
      }
    }, 120)
  }

  const reset = () => { setDocType(null); setDone(false); setProgress(0); setRevealed(0); setScanning(false) }

  const checks  = docType ? SCAN_CHECKS[docType] : []
  const passed  = checks.filter(c => c.pass).length
  const conf    = docType === 'certificate' ? 97 : docType === 'internship' ? 61 : 22
  const overall = docType === 'certificate' ? 'pass' : docType === 'internship' ? 'warn' : 'fail'

  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
          <Scan size={20} className="text-white"/>
        </div>
        <div>
          <h2 className="section-title text-base">AI Document Scanner</h2>
          <p className="section-sub text-xs">OCR · QR Verification · Pixel Integrity · Metadata Analysis</p>
        </div>
      </div>

      {/* Doc type selector */}
      {!docType && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Select a document type to scan:</p>
          <div className="grid grid-cols-3 gap-3">
            {TYPES.map(t => (
              <button key={t.key} onClick={() => startScan(t.key)}
                className={`card p-4 text-center hover:border-orange-400 dark:hover:border-orange-600 transition-all cursor-pointer
                  ${t.key === 'fake' ? 'border-red-200 dark:border-red-900' : ''}`}>
                <t.icon size={22} className={`mx-auto mb-2 ${t.key === 'fake' ? 'text-red-400' : 'text-orange-400'}`}/>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t.label}</p>
              </button>
            ))}
          </div>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 transition-all"
            onClick={() => fileRef.current?.click()}>
            <Upload size={24} className="text-orange-400 mx-auto mb-2"/>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop your own file or <span className="text-orange-500">browse</span></p>
            <p className="text-xs text-gray-400 mt-1">PDF · JPG · PNG · Max 10MB</p>
            <input ref={fileRef} type="file" className="hidden" onChange={e => e.target.files[0] && startScan('certificate')}/>
          </div>
        </div>
      )}

      {/* Scan in progress / result */}
      {docType && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <FileText size={18} className="text-orange-500 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{fileName}</p>
              <p className="text-xs text-gray-400">Arjun Verma · LearnBridge</p>
            </div>
            {done && <StatusBadge status={overall}/>}
          </div>

          {/* Scan animation */}
          {scanning && (
            <div className="relative h-32 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
              <FileText size={48} className="text-gray-300 dark:text-gray-600"/>
              {/* Scan line */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                style={{ top: `${progress}%`, transition: 'top 0.12s linear' }}/>
              {/* Corner brackets */}
              {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map((pos,i) => (
                <div key={i} className={`absolute w-4 h-4 ${pos} border-orange-500 ${i<2?'border-t':'border-b'} ${i%2===0?'border-l':'border-r'}`}/>
              ))}
              <div className="absolute bottom-2 right-2 text-xs text-orange-500 font-mono">{progress}%</div>
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Scanning document...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div className="h-2 rounded-full bg-orange-500 transition-all duration-100" style={{ width:`${progress}%` }}/>
            </div>
          </div>

          {/* Check rows */}
          <div className="space-y-2">
            {checks.map((c, i) => <CheckRow key={c.id} check={c} revealed={i < revealed}/>)}
          </div>

          {/* Result */}
          {done && (
            <div className="space-y-3 animate-fade-in">
              {/* Confidence ring */}
              <div className={`p-4 rounded-xl border-2 flex items-center gap-4
                ${overall==='pass' ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' :
                  overall==='fail' ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' :
                                     'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10'}`}>
                <div className="relative w-16 h-16 shrink-0">
                  <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(156,163,175,0.2)" strokeWidth="7"/>
                    <circle cx="36" cy="36" r="28" fill="none"
                      stroke={overall==='pass'?'#22c55e':overall==='fail'?'#ef4444':'#f59e0b'}
                      strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*28*conf/100} ${2*Math.PI*28}`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black" style={{color:overall==='pass'?'#22c55e':overall==='fail'?'#ef4444':'#f59e0b'}}>{conf}%</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    {overall==='pass' ? '✓ Scan Passed' : overall==='fail' ? '✗ Document Flagged' : '⚠ Manual Review Required'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {passed}/{checks.length} checks passed
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                    AI scan is pre-screening only. Manual review recommended for final confirmation.
                  </p>
                </div>
              </div>

              {overall === 'fail' && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
                  <p className="text-sm font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                    <XCircle size={14}/> Application Blocked
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    This document has been flagged and removed from active recruiter visibility.
                    It has been forwarded to the admin review queue.
                  </p>
                </div>
              )}
            </div>
          )}

          <button onClick={reset} className="btn-ghost text-sm text-orange-500 flex items-center gap-1">
            <RefreshCw size={14}/> Scan another document
          </button>
        </div>
      )}
    </div>
  )
}

// ── SECTION 2: FRAUD DISCREPANCY MATRIX ─────────────────────────
function FraudMatrix() {
  const overall = FRAUD_MATRIX.filter(r => r.status === 'fail').length
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Eye size={20} className="text-white"/>
          </div>
          <div>
            <h2 className="section-title text-base">Visual Fraud Discrepancy Matrix</h2>
            <p className="section-sub text-xs">Real vs Fake criteria — system cross-check</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-green text-xs">{FRAUD_MATRIX.filter(r=>r.status==='pass').length} Pass</span>
          <span className="badge text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{FRAUD_MATRIX.filter(r=>r.status==='warn').length} Warn</span>
          {overall > 0 && <span className="badge-red text-xs">{overall} Fail</span>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Criterion</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-green-600 uppercase tracking-wide">✓ Genuine Indicator</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-red-500 uppercase tracking-wide">✗ Fraud Indicator</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {FRAUD_MATRIX.map((row, i) => (
              <tr key={i} className={`transition-colors ${row.status==='fail'?'bg-red-50 dark:bg-red-900/10':row.status==='warn'?'bg-amber-50 dark:bg-amber-900/10':''}`}>
                <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200 text-xs">{row.criterion}</td>
                <td className="py-3 px-3 text-xs text-gray-600 dark:text-gray-400">{row.real}</td>
                <td className="py-3 px-3 text-xs text-gray-600 dark:text-gray-400">{row.fake}</td>
                <td className="py-3 px-3 text-center"><StatusBadge status={row.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-300">
        <strong>Note:</strong> Flagged applications are immediately blocked from recruiter visibility and forwarded to the admin review queue.
      </div>
    </div>
  )
}

// ── SECTION 3: PORTRAIT MATCH ────────────────────────────────────
function PortraitMatch() {
  const [running,  setRunning]  = useState(false)
  const [step,     setStep]     = useState(0)
  const [done,     setDone]     = useState(false)

  const run = () => {
    setRunning(true); setStep(0); setDone(false)
    let s = 0
    const iv = setInterval(() => {
      s += 1
      setStep(s)
      if (s >= PORTRAIT_STEPS.length) { clearInterval(iv); setRunning(false); setDone(true) }
    }, 700)
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
          <Camera size={20} className="text-white"/>
        </div>
        <div>
          <h2 className="section-title text-base">Photo–Resume Portrait Match</h2>
          <p className="section-sub text-xs">Facial landmark extraction · Cosine similarity · Liveness check</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Profile photo mock */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
            <User size={40} className="text-white"/>
          </div>
          <p className="text-xs text-gray-500">Profile Photo</p>
          {done && <span className="badge-green text-xs">Face Detected ✓</span>}
        </div>
        {/* Document photo mock */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-24 h-24 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-md overflow-hidden">
            <FileText size={32} className="text-gray-400"/>
            {done && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                <CheckCircle2 size={32} className="text-green-500"/>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">Document Face</p>
          {done && <span className="badge-green text-xs">Matched ✓</span>}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {PORTRAIT_STEPS.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all
            ${i < step ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' :
                         'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50'}`}>
            {i < step
              ? <CheckCircle2 size={14} className="text-green-500 shrink-0"/>
              : <Clock size={14} className="text-gray-400 shrink-0 animate-pulse"/>}
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{s.label}</p>
              {i < step && <p className="text-xs text-gray-500">{s.detail}</p>}
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 animate-fade-in">
          <p className="text-sm font-bold text-green-700 dark:text-green-300">✓ Portrait Match Confirmed</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
            Similarity score 0.91 — exceeds 0.80 threshold. Identity cross-check passed.
          </p>
          <p className="text-xs text-blue-500 mt-1 italic">Pre-screening result only. Subject to manual review.</p>
        </div>
      )}

      {!done && (
        <button onClick={run} disabled={running} className="btn-primary w-full justify-center py-2.5 glow-orange">
          {running ? <><RefreshCw size={14} className="animate-spin"/> Running Match...</> : <><Camera size={14}/> Run Portrait Match</>}
        </button>
      )}
    </div>
  )
}

// ── SECTION 4: OSINT PIPELINE ───────────────────────────────────
function OsintPipeline() {
  const [scraping,  setScraping]  = useState(false)
  const [revealed,  setRevealed]  = useState(false)
  const [platform,  setPlatform]  = useState(null)

  const scrape = (p) => {
    setPlatform(p); setScraping(true); setRevealed(false)
    setTimeout(() => { setScraping(false); setRevealed(true) }, 1800)
  }

  const PLATFORMS = [
    { key:'leetcode', label:'LeetCode',  icon:Code,     color:'from-yellow-500 to-orange-500' },
    { key:'gfg',      label:'GFG',       icon:Code,     color:'from-green-500 to-green-700'   },
    { key:'github',   label:'GitHub',    icon:GitBranch,color:'from-gray-500 to-gray-700'      },
    { key:'linkedin', label:'LinkedIn',  icon:Globe,    color:'from-blue-500 to-blue-700'      },
  ]

  const overallOsint = Math.round((OSINT_DATA.leetcode.score + OSINT_DATA.gfg.score_pct + OSINT_DATA.github.score + OSINT_DATA.linkedin.score) / 4)

  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
          <Globe size={20} className="text-white"/>
        </div>
        <div>
          <h2 className="section-title text-base">OSINT External Portfolio Scraper</h2>
          <p className="section-sub text-xs">LeetCode · GeeksforGeeks · GitHub · LinkedIn — real-time aggregation</p>
        </div>
      </div>

      {/* Platform buttons */}
      <div className="grid grid-cols-4 gap-2">
        {PLATFORMS.map(p => (
          <button key={p.key} onClick={() => scrape(p.key)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
              ${platform===p.key ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-orange-300'}`}>
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
              <p.icon size={14} className="text-white"/>
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {scraping && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <RefreshCw size={16} className="text-blue-500 animate-spin shrink-0"/>
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Scraping {platform?.toUpperCase()}...</p>
            <p className="text-xs text-blue-500">Aggregating public profile data</p>
          </div>
        </div>
      )}

      {/* Results */}
      {revealed && !scraping && (
        <div className="space-y-3 animate-fade-in">
          {platform === 'leetcode' && (
            <div className="card bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5"><Code size={15} className="text-yellow-500"/> LeetCode Stats</h3>
                <span className="badge-orange text-xs">Score: {OSINT_DATA.leetcode.score}/100</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[['Total Solved',OSINT_DATA.leetcode.solved,'text-gray-900 dark:text-white'],
                  ['Easy',OSINT_DATA.leetcode.easy,'text-green-600'],
                  ['Medium',OSINT_DATA.leetcode.medium,'text-amber-600'],
                  ['Hard',OSINT_DATA.leetcode.hard,'text-red-500'],
                  ['Global Rank',OSINT_DATA.leetcode.rank,'text-orange-500'],
                  ['Score',`${OSINT_DATA.leetcode.score}%`,'text-orange-600']].map(([l,v,c]) => (
                  <div key={l} className="p-2 rounded-xl bg-white dark:bg-gray-900">
                    <p className={`text-base font-black ${c}`}>{v}</p>
                    <p className="text-xs text-gray-400">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {platform === 'gfg' && (
            <div className="card bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5"><Code size={15} className="text-green-600"/> GeeksforGeeks</h3>
                <span className="badge-green text-xs">Score: {OSINT_DATA.gfg.score_pct}/100</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[['GFG Score',OSINT_DATA.gfg.score,'text-green-600'],
                  ['Problems',OSINT_DATA.gfg.problems,'text-gray-900 dark:text-white'],
                  ['Streak',`${OSINT_DATA.gfg.streak}d`,'text-orange-500']].map(([l,v,c]) => (
                  <div key={l} className="p-2 rounded-xl bg-white dark:bg-gray-900">
                    <p className={`text-base font-black ${c}`}>{v}</p>
                    <p className="text-xs text-gray-400">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {platform === 'github' && (
            <div className="card bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5"><GitBranch size={15}/> GitHub Activity</h3>
                <span className="badge-orange text-xs">Score: {OSINT_DATA.github.score}/100</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[['Repos',OSINT_DATA.github.repos],['Stars',OSINT_DATA.github.stars],
                  ['Commits',OSINT_DATA.github.commits],['PRs',OSINT_DATA.github.prs]].map(([l,v]) => (
                  <div key={l} className="p-2 rounded-xl bg-white dark:bg-gray-900">
                    <p className="text-base font-black text-gray-900 dark:text-white">{v}</p>
                    <p className="text-xs text-gray-400">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {platform === 'linkedin' && (
            <div className="card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5"><Globe size={15} className="text-blue-600"/> LinkedIn Profile</h3>
                <span className="badge-blue text-xs">Score: {OSINT_DATA.linkedin.score}/100</span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300"><strong>Headline:</strong> {OSINT_DATA.linkedin.headline}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Connections:</strong> {OSINT_DATA.linkedin.connections}+</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Profile:</strong> <span className="text-green-600">Active ✓</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aggregate OSINT score */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 text-white flex items-center justify-between">
        <div>
          <p className="text-xs text-orange-100 uppercase tracking-wide font-semibold">Aggregate OSINT Score</p>
          <p className="text-3xl font-black">{overallOsint}<span className="text-base font-normal text-orange-200">/100</span></p>
          <p className="text-xs text-orange-100 mt-0.5">LeetCode + GFG + GitHub + LinkedIn weighted average</p>
        </div>
        <Trophy size={36} className="text-orange-200 shrink-0"/>
      </div>
    </div>
  )
}

// ── MAIN EXPORT ──────────────────────────────────────────────────
export default function FraudDetection() {
  const { flagCandidate } = useAuth()

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Phase header */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-200 dark:border-orange-800">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-md">
          <Shield size={20} className="text-white"/>
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Phase 1 — Fraud Detection Engine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">OCR Scanner · Discrepancy Matrix · Portrait Match · OSINT Pipeline</p>
        </div>
        <span className="badge-orange ml-auto shrink-0">SP-Verify</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DocumentScanner onFlag={reason => flagCandidate('STU003', reason)}/>
        <PortraitMatch/>
      </div>
      <FraudMatrix/>
      <OsintPipeline/>
    </div>
  )
}
