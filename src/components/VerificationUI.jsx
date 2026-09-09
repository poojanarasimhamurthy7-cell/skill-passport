import { useState } from 'react'
import { Shield, CheckCircle2, AlertTriangle, XCircle, QrCode, Eye, Scan, Clock, Info, Zap } from 'lucide-react'

const SCAN_RESULTS = [
  {
    file: 'Python_Certificate_Coursera.pdf',
    qr: 'valid',
    pixel: 'clean',
    status: 'genuine',
    issuer: 'Coursera',
    date: 'Mar 2025',
    confidence: 97,
    checks: [
      { label: 'QR Code Found',         pass: true,  detail: 'QR resolves to coursera.org/verify/ABC123' },
      { label: 'Issuer Domain Match',    pass: true,  detail: 'Certificate domain matches coursera.org'   },
      { label: 'Pixel Integrity',        pass: true,  detail: 'No editing artifacts detected'             },
      { label: 'Font Consistency',       pass: true,  detail: 'Typography matches Coursera template'      },
      { label: 'Metadata Timestamp',     pass: true,  detail: 'PDF created 2025-03-14, unmodified'        },
    ],
  },
  {
    file: 'ML_Certificate_Unknown.jpg',
    qr: 'missing',
    pixel: 'suspicious',
    status: 'suspicious',
    issuer: 'Unknown',
    date: 'Jan 2025',
    confidence: 34,
    checks: [
      { label: 'QR Code Found',         pass: false, detail: 'No QR code detected in image'              },
      { label: 'Issuer Domain Match',    pass: false, detail: 'Cannot verify issuer'                      },
      { label: 'Pixel Integrity',        pass: false, detail: '⚠ Editing artifacts found near name field' },
      { label: 'Font Consistency',       pass: true,  detail: 'Fonts appear standard'                     },
      { label: 'Metadata Timestamp',     pass: false, detail: 'Image metadata stripped — suspicious'      },
    ],
  },
  {
    file: 'Internship_Letter_TCS.pdf',
    qr: 'missing',
    pixel: 'clean',
    status: 'unverifiable',
    issuer: 'TCS',
    date: 'Jun 2025',
    confidence: 61,
    checks: [
      { label: 'QR Code Found',         pass: false, detail: 'No QR code — manual review needed'         },
      { label: 'Issuer Domain Match',    pass: true,  detail: 'Letterhead matches tcs.com branding'       },
      { label: 'Pixel Integrity',        pass: true,  detail: 'No editing artifacts detected'             },
      { label: 'Font Consistency',       pass: true,  detail: 'Typography matches TCS template'           },
      { label: 'Metadata Timestamp',     pass: false, detail: 'Cannot auto-verify without QR/URL'         },
    ],
  },
]

const STATUS_CONFIG = {
  genuine:      { label: 'Genuine',        icon: CheckCircle2,  color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20',   border: 'border-green-200 dark:border-green-800',  badge: 'badge-green' },
  suspicious:   { label: 'Suspicious',     icon: XCircle,       color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800',      badge: 'badge-red'   },
  unverifiable: { label: 'Cannot Verify',  icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 badge' },
}

function ScanningAnimation() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <div className="w-24 h-24 rounded-2xl border-2 border-orange-300 dark:border-orange-700 flex items-center justify-center bg-orange-50 dark:bg-orange-900/20">
        <QrCode size={36} className="text-orange-400" />
      </div>
      {/* Scanning line animation */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-[scanLine_1.5s_ease-in-out_infinite]"
        style={{ animation: 'scanLine 1.5s ease-in-out infinite' }} />
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-orange-500 rounded-tl" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-orange-500 rounded-tr" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-orange-500 rounded-bl" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-orange-500 rounded-br" />
    </div>
  )
}

function ConfidenceRing({ pct, status }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const color = status === 'genuine' ? '#22c55e' : status === 'suspicious' ? '#ef4444' : '#f59e0b'
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(156,163,175,0.2)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{pct}%</span>
      </div>
    </div>
  )
}

export default function VerificationUI() {
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(true)
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="card border-2 border-orange-300 dark:border-orange-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h2 className="section-title text-lg">AI Security Scan Engine</h2>
            <p className="section-sub text-xs">QR verification · Pixel integrity · Metadata analysis</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'QR Code Check',     icon: QrCode,   desc: 'Resolves issuer URL'       },
            { label: 'Pixel Analysis',    icon: Eye,      desc: 'Detects editing artifacts'  },
            { label: 'Metadata Scan',     icon: Scan,     desc: 'Timestamp & origin check'   },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
              <c.icon size={18} className="text-orange-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decision key */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, c]) => (
          <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${c.bg} ${c.border}`}>
            <c.icon size={15} className={c.color} />
            <span className={`text-xs font-semibold ${c.color}`}>{c.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <Info size={13} /> No QR → manual review assigned
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {SCAN_RESULTS.map((r, i) => {
          const cfg = STATUS_CONFIG[r.status]
          const Icon = cfg.icon
          return (
            <div key={i} className={`card border-2 ${cfg.border} transition-all`}>
              <div className="flex items-start gap-4 flex-wrap">
                <ConfidenceRing pct={r.confidence} status={r.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{r.file}</p>
                    <span className={`${cfg.badge} flex items-center gap-1 text-xs`}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <span>Issuer: <strong className="text-gray-700 dark:text-gray-300">{r.issuer}</strong></span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {r.date}</span>
                    <span>QR: <strong className={r.qr === 'valid' ? 'text-green-600' : 'text-red-500'}>{r.qr === 'valid' ? 'Valid ✓' : 'Not found ✗'}</strong></span>
                    <span>Pixels: <strong className={r.pixel === 'clean' ? 'text-green-600' : 'text-amber-600'}>{r.pixel === 'clean' ? 'Clean ✓' : 'Suspicious ⚠'}</strong></span>
                  </div>
                </div>
                <button onClick={() => setExpanded(expanded === i ? null : i)}
                  className="btn-ghost text-xs text-orange-500 shrink-0">
                  {expanded === i ? 'Hide' : 'Details'}
                </button>
              </div>

              {expanded === i && (
                <div className="mt-4 space-y-2 animate-fade-in">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Check-by-check breakdown</p>
                  {r.checks.map((ch, j) => (
                    <div key={j} className={`flex items-center gap-3 p-2.5 rounded-xl border
                      ${ch.pass ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'}`}>
                      {ch.pass
                        ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        : <XCircle size={14} className="text-red-500 shrink-0" />}
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{ch.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{ch.detail}</span>
                      </div>
                    </div>
                  ))}
                  {r.status === 'suspicious' && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
                      <Zap size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 dark:text-red-300">
                        <strong>Action required:</strong> This document has been flagged. It will not appear on your public Skill Passport until manually reviewed by our trust team.
                      </p>
                    </div>
                  )}
                  {r.status === 'unverifiable' && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
                      <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Manual review queued.</strong> No QR code detected. A trust reviewer will verify this document within 48 hours.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
