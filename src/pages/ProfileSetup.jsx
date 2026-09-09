import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  GitBranch, Upload, Plus, X, CheckCircle2, AlertTriangle,
  FileText, Briefcase, BookOpen, Code, Trash2, ExternalLink,
  Shield, Zap, Info
} from 'lucide-react'

const SECTION_TABS = [
  { key: 'academic',     label: 'Academic',      icon: BookOpen   },
  { key: 'skills',       label: 'Skills',         icon: Code       },
  { key: 'projects',     label: 'Projects',       icon: GitBranch     },
  { key: 'certs',        label: 'Certificates',   icon: FileText   },
  { key: 'internships',  label: 'Internships',    icon: Briefcase  },
]

const SKILL_OPTIONS = ['Python','Machine Learning','OpenCV','React','Node.js','SQL','Cloud','Docker','TensorFlow','NLP','Java','C++','Data Analysis','Tableau','Flutter']

function UploadZone({ label, hint, accepted, icon: Icon }) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState([])

  const addFile = f => setFiles(prev => [...prev, { name: f.name, status: Math.random() > 0.2 ? 'verified' : 'failed' }])

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); [...e.dataTransfer.files].forEach(addFile) }}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${dragging ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'}`}
      >
        <input type="file" accept={accepted} multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => [...e.target.files].forEach(addFile)} />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Icon size={20} className="text-orange-500" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop files here or <span className="text-orange-500">browse</span></p>
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="space-y-2 mt-2">
          {files.map((f, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-sm
              ${f.status === 'verified' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}`}>
              {f.status === 'verified'
                ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                : <AlertTriangle size={15} className="text-red-500 shrink-0" />}
              <span className="flex-1 truncate text-gray-800 dark:text-gray-200">{f.name}</span>
              <span className={`text-xs font-semibold ${f.status === 'verified' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {f.status === 'verified' ? 'AI Verified ✓' : 'Scan Failed ✗'}
              </span>
              <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProfileSetup() {
  const [tab, setTab] = useState('academic')
  const [skills, setSkills] = useState(['Python', 'Machine Learning', 'OpenCV'])
  const [skillInput, setSkillInput] = useState('')
  const [projects, setProjects] = useState([
    { title: 'Face Detection System', GitBranch: 'https://github.com/priya/face-detect', desc: 'Real-time face detection using OpenCV and Python.' },
  ])
  const [marksheets, setMarksheets] = useState([
    { sem: 'Semester 1', cgpa: '7.8' },
    { sem: 'Semester 2', cgpa: '8.1' },
    { sem: 'Semester 3', cgpa: '8.4' },
  ])

  const addSkill = s => {
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  const addProject = () => setProjects(prev => [...prev, { title: '', GitBranch: '', desc: '' }])
  const updateProject = (i, key, val) => setProjects(prev => prev.map((p, j) => j === i ? { ...p, [key]: val } : p))
  const removeProject = i => setProjects(prev => prev.filter((_, j) => j !== i))

  return (
    <div className="flex h-screen bg-orange-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar role="student" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-orange-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Profile Setup</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Build your Digital Skill Passport · Every field adds evidence</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full font-medium">
              <Shield size={12} /> AI scans all uploads for authenticity
            </div>
            <button className="btn-primary text-sm">Save Changes</button>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Section tabs */}
          <div className="flex gap-1 p-1 bg-orange-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
            {SECTION_TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all
                  ${tab === key ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* ── ACADEMIC ── */}
          {tab === 'academic' && (
            <div className="space-y-5 animate-fade-in">
              <div className="card">
                <h2 className="section-title text-base mb-4">Semester Marks</h2>
                <div className="space-y-3">
                  {marksheets.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-28 text-sm font-medium text-gray-700 dark:text-gray-300">{m.sem}</div>
                      <input value={m.cgpa} onChange={e => setMarksheets(prev => prev.map((r, j) => j === i ? {...r, cgpa: e.target.value} : r))}
                        className="input w-24" placeholder="CGPA" />
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className="h-2 rounded-full bg-orange-500" style={{ width: `${(parseFloat(m.cgpa) / 10) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-orange-500 w-8">{m.cgpa}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setMarksheets(prev => [...prev, { sem: `Semester ${prev.length + 1}`, cgpa: '' }])}
                  className="btn-ghost text-sm mt-4 text-orange-500">
                  <Plus size={14} /> Add Semester
                </button>
              </div>

              <div className="card">
                <h2 className="section-title text-base mb-4">Upload Documents</h2>
                <div className="space-y-5">
                  <UploadZone label="Marksheets / Transcripts" hint="PDF, JPG · Max 5MB each" accepted=".pdf,.jpg,.png" icon={FileText} />
                  <UploadZone label="Consolidated Marks Card" hint="Official transcript PDF" accepted=".pdf" icon={FileText} />
                </div>
              </div>

              <div className="card">
                <h2 className="section-title text-base mb-4">Academic Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[['Overall CGPA','8.1','number'],['Active Backlogs','0','number'],['Graduation Year','2026','number']].map(([label, placeholder, type]) => (
                    <div key={label}>
                      <label className="label">{label}</label>
                      <input type={type} placeholder={placeholder} className="input" />
                    </div>
                  ))}
                  <div>
                    <label className="label">Current Semester</label>
                    <select className="input">
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SKILLS ── */}
          {tab === 'skills' && (
            <div className="space-y-5 animate-fade-in">
              <div className="card">
                <h2 className="section-title text-base mb-1">Add Your Skills</h2>
                <p className="section-sub text-xs mb-4">Each skill needs proof — link projects or upload certificates below.</p>

                <div className="flex gap-2 mb-4">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)}
                    placeholder="Type a skill and press Enter..." className="input flex-1" />
                  <button onClick={() => addSkill(skillInput)} className="btn-primary shrink-0"><Plus size={16} /></button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map(s => (
                    <div key={s} className="flex items-center gap-1.5 badge-orange py-1.5 px-3 text-sm">
                      {s}
                      <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="hover:text-red-500 ml-0.5">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="label">Suggested Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                      <button key={s} onClick={() => addSkill(s)}
                        className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 py-1.5 px-3 text-sm cursor-pointer transition-all">
                        <Plus size={11} className="mr-1" />{s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PROJECTS ── */}
          {tab === 'projects' && (
            <div className="space-y-5 animate-fade-in">
              {projects.map((p, i) => (
                <div key={i} className="card space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">Project {i + 1}</h3>
                    {projects.length > 1 && (
                      <button onClick={() => removeProject(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="label">Project Title</label>
                    <input value={p.title} onChange={e => updateProject(i, 'title', e.target.value)} placeholder="Face Detection System" className="input" />
                  </div>
                  <div>
                    <label className="label">GitBranch Repository Link</label>
                    <div className="relative">
                      <GitBranch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={p.GitBranch} onChange={e => updateProject(i, 'github', e.target.value)} placeholder="https://github.com/username/repo" className="input pl-10" />
                    </div>
                    {p.GitBranch && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 size={12} /> GitBranch link will be auto-verified by AI
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Project Demo URL (optional)</label>
                    <div className="relative">
                      <ExternalLink size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input placeholder="https://your-demo.vercel.app" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea value={p.desc} onChange={e => updateProject(i, 'desc', e.target.value)} rows={3} placeholder="Describe what you built and which skills it demonstrates..." className="input resize-none" />
                  </div>
                  <div>
                    <label className="label">Skills Demonstrated</label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer text-gray-600 dark:text-gray-400">
                          <input type="checkbox" className="accent-orange-500" /> {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addProject} className="btn-secondary w-full justify-center py-3">
                <Plus size={16} /> Add Another Project
              </button>
            </div>
          )}

          {/* ── CERTIFICATES ── */}
          {tab === 'certs' && (
            <div className="space-y-5 animate-fade-in">
              <div className="card">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mb-5">
                  <Shield size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">AI Security Scan Active</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Every uploaded certificate is scanned for valid QR codes and pixel-level editing detection before being added to your passport.</p>
                  </div>
                </div>
                <UploadZone label="Upload Certificates" hint="PDF or JPG with QR code · Max 10MB" accepted=".pdf,.jpg,.png,.jpeg" icon={FileText} />
              </div>
              <div className="card space-y-3">
                <h2 className="section-title text-base">Manual Certificate Entry</h2>
                {[0].map(i => (
                  <div key={i} className="grid sm:grid-cols-2 gap-4">
                    <div><label className="label">Certificate Name</label><input placeholder="Python for AI — Coursera" className="input" /></div>
                    <div><label className="label">Issuing Organisation</label><input placeholder="Coursera / NPTEL / Google" className="input" /></div>
                    <div><label className="label">Issue Date</label><input type="date" className="input" /></div>
                    <div><label className="label">Certificate URL</label><input placeholder="https://cert.example.com/verify" className="input" /></div>
                  </div>
                ))}
                <button className="btn-secondary text-sm"><Plus size={14} /> Add Another</button>
              </div>
            </div>
          )}

          {/* ── INTERNSHIPS ── */}
          {tab === 'internships' && (
            <div className="space-y-5 animate-fade-in">
              <div className="card space-y-4">
                <h2 className="section-title text-base">Internship Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="label">Company Name</label><input placeholder="TCS / Infosys / Startup" className="input" /></div>
                  <div><label className="label">Role / Designation</label><input placeholder="ML Intern" className="input" /></div>
                  <div><label className="label">Start Date</label><input type="date" className="input" /></div>
                  <div><label className="label">End Date</label><input type="date" className="input" /></div>
                </div>
                <div>
                  <label className="label">Work Description</label>
                  <textarea rows={3} placeholder="Describe your work, technologies used, and impact..." className="input resize-none" />
                </div>
                <UploadZone label="Upload Offer / Completion Letter" hint="PDF only · AI verifies letterhead and signature" accepted=".pdf" icon={Briefcase} />
              </div>
              <button className="btn-secondary w-full justify-center py-3"><Plus size={16} /> Add Another Internship</button>
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end gap-3 pt-2 pb-8">
            <button className="btn-secondary">Save Draft</button>
            <button className="btn-primary glow-orange">Save & Build Passport <Zap size={15} /></button>
          </div>
        </div>
      </main>
    </div>
  )
}
