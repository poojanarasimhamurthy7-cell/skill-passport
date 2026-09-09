import { useState } from 'react'
import { Shield, Eye, EyeOff, Phone, Mail, FileText, GitBranch, Briefcase, GraduationCap, User, Lock, Unlock, Info, CheckCircle2 } from 'lucide-react'

const PRIVACY_ITEMS = [
  { id: 'name',        label: 'Full Name',           icon: User,          category: 'identity',  default: true,  risk: 'low',    desc: 'Your name visible on profile card'            },
  { id: 'college',     label: 'College & Branch',    icon: GraduationCap, category: 'identity',  default: true,  risk: 'low',    desc: 'Institution name shown to recruiters'         },
  { id: 'email',       label: 'Email Address',       icon: Mail,          category: 'contact',   default: false, risk: 'medium', desc: 'Direct email — only shared on interview req'  },
  { id: 'phone',       label: 'Phone Number',        icon: Phone,         category: 'contact',   default: false, risk: 'high',   desc: 'Phone blurred until student approves contact' },
  { id: 'cgpa',        label: 'CGPA / Marks',        icon: GraduationCap, category: 'academic',  default: true,  risk: 'low',    desc: 'Semester performance shown as bar chart'      },
  { id: 'marksheets',  label: 'Marksheet Documents', icon: FileText,      category: 'academic',  default: false, risk: 'high',   desc: 'Full documents blurred by default'            },
  { id: 'github',      label: 'GitHub Projects',     icon: GitBranch,     category: 'skills',    default: true,  risk: 'low',    desc: 'Public project links shown in proof map'      },
  { id: 'certs',       label: 'Certificates',        icon: FileText,      category: 'skills',    default: true,  risk: 'low',    desc: 'Certificate thumbnails visible — not full PDF'},
  { id: 'internship',  label: 'Internship Letters',  icon: Briefcase,     category: 'work',      default: false, risk: 'high',   desc: 'Letters blurred — only company name shown'   },
]

const RISK_COLOR = {
  low:    { badge: 'badge-green', label: 'Low Risk'    },
  medium: { badge: 'badge-orange', label: 'Medium Risk' },
  high:   { badge: 'badge-red',   label: 'High Risk'   },
}

const CATEGORY_LABELS = {
  identity: 'Identity',
  contact:  'Contact',
  academic: 'Academic',
  skills:   'Skills & Projects',
  work:     'Work Experience',
}

export default function PrivacyCenter() {
  const [visibility, setVisibility] = useState(
    Object.fromEntries(PRIVACY_ITEMS.map(i => [i.id, i.default]))
  )
  const [saved, setSaved] = useState(false)

  const toggle = (id) => { setVisibility(v => ({ ...v, [id]: !v[id] })); setSaved(false) }
  const visibleCount = Object.values(visibility).filter(Boolean).length

  const categories = [...new Set(PRIVACY_ITEMS.map(i => i.category))]

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="card border-2 border-orange-300 dark:border-orange-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h2 className="section-title text-lg">Privacy Control Centre</h2>
            <p className="section-sub text-xs">You own your data. You decide what recruiters see.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div className="h-2.5 rounded-full bg-orange-500 transition-all duration-500"
              style={{ width: `${(visibleCount / PRIVACY_ITEMS.length) * 100}%` }} />
          </div>
          <span className="text-sm font-bold text-orange-500 shrink-0">{visibleCount}/{PRIVACY_ITEMS.length} fields shared</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
          <Info size={11} /> Recruiters only see what you explicitly allow. Phone &amp; documents are hidden by default.
        </p>
      </div>

      {/* Category groups */}
      {categories.map(cat => (
        <div key={cat} className="card space-y-3">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-orange-500" />
            {CATEGORY_LABELS[cat]}
          </h3>
          {PRIVACY_ITEMS.filter(i => i.category === cat).map(item => {
            const on = visibility[item.id]
            const rc = RISK_COLOR[item.risk]
            return (
              <div key={item.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all
                ${on ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
                  ${on ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <item.icon size={16} className={on ? 'text-orange-500' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</span>
                    <span className={`${rc.badge} text-xs`}>{rc.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {on ? <Eye size={14} className="text-orange-400" /> : <EyeOff size={14} className="text-gray-400" />}
                  <button onClick={() => toggle(item.id)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none
                      ${on ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    aria-label={`Toggle ${item.label}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300
                      ${on ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Recruiter view preview */}
      <div className="card">
        <h3 className="section-title text-base mb-3">Recruiter View Preview</h3>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">PS</div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{visibility.name ? 'Priya Sharma' : '██████ ██████'}</p>
              <p className="text-xs text-gray-400">{visibility.college ? 'IIT Delhi · CSE · 3rd Year' : '████ · ███ · ██████'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded-lg ${visibility.email ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              <Mail size={11} className="inline mr-1" />
              {visibility.email ? 'priya@iitd.ac.in' : 'Email hidden'}
            </div>
            <div className={`p-2 rounded-lg ${visibility.phone ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              <Phone size={11} className="inline mr-1" />
              {visibility.phone ? '+91 98765 43210' : 'Phone hidden'}
            </div>
            <div className={`p-2 rounded-lg ${visibility.github ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              <GitBranch size={11} className="inline mr-1" />
              {visibility.github ? 'github.com/priya' : 'GitHub hidden'}
            </div>
            <div className={`p-2 rounded-lg ${visibility.marksheets ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              <FileText size={11} className="inline mr-1" />
              {visibility.marksheets ? 'View Marksheet' : '🔒 Document blurred'}
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between gap-3">
        {saved && <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 size={14} /> Privacy settings saved</span>}
        <button onClick={() => setSaved(true)} className="btn-primary glow-orange ml-auto">
          <Lock size={15} /> Save Privacy Settings
        </button>
      </div>
    </div>
  )
}
