/**
 * AuthLeftPanel — cinematic 3D credential visual for Login/Signup.
 * Left side: glowing SkillPassport credential card floating on
 * an illuminated platform with orbital rings and orange particles —
 * matching the reference design exactly.
 * Responds to global ThemeContext for light/dark.
 */
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/* ─────────────────────────────────────────────────────────────
   ROLE META
───────────────────────────────────────────────────────────── */
const ROLE_META = {
  student: {
    overline: 'Student Portal',
    headline: ['Your skills', 'open doors.'],
    sub:      'Sign in to your SkillPassport account and continue your journey.',
    perks:    ['Build a verified, shareable profile', 'Showcase real skills with evidence', 'Connect with opportunities that matter'],
  },
  recruiter: {
    overline: 'Recruiter Portal',
    headline: ['Hire on proof,', 'not promises.'],
    sub:      'Find candidates with verified, evidence-backed skills. Every match explained.',
    perks:    ['Evidence-first candidate matching', 'Natural language talent search', 'Skill gap visibility per candidate'],
  },
  college: {
    overline: 'Institution Portal',
    headline: ['Skill intelligence', 'for academia.'],
    sub:      'Track student readiness and align curriculum with live industry demand.',
    perks:    ['Real-time student skill tracking', 'Curriculum intelligence dashboard', 'AI workshop recommendations'],
  },
  ministry: {
    overline: 'Ministry Portal',
    headline: ['National skill', 'intelligence.'],
    sub:      'Drive policy with aggregated, evidence-based workforce data nationwide.',
    perks:    ['National skill map & analytics', 'Future skill early warning system', 'Policy action tracker'],
  },
  default: {
    overline: 'SkillPassport',
    headline: ['Your skills', 'open doors.'],
    sub:      'Prove every skill with real evidence. Connect with opportunities that match your true abilities.',
    perks:    ['Evidence-backed skill proof', 'AI-powered matching', 'Verified digital passport'],
  },
}

/* ─────────────────────────────────────────────────────────────
   3D CREDENTIAL VISUAL — matches the reference image exactly
   Dark: deep dark bg, orange glowing card, lit platform
   Light: warm cream bg, soft-lit card, amber platform
───────────────────────────────────────────────────────────── */
function CredentialVisual({ dark }) {
  const cardFill    = dark ? '#0e1628'                    : '#ffffff'
  const cardStroke  = dark ? '#f97316'                    : '#f97316'
  const cardShadow  = dark ? 'rgba(249,115,22,0.55)'      : 'rgba(249,115,22,0.30)'
  const lineFill    = dark ? 'rgba(255,255,255,0.18)'     : 'rgba(0,0,0,0.12)'
  const lineFill2   = dark ? 'rgba(255,255,255,0.10)'     : 'rgba(0,0,0,0.08)'
  const bgTop       = dark ? '#070a14'                    : '#fff8f0'
  const bgBot       = dark ? '#040608'                    : '#fef3e6'
  const platformTop = dark ? '#0d1525'                    : '#fde8d0'
  const platformRim = dark ? 'rgba(249,115,22,0.70)'      : 'rgba(249,115,22,0.55)'
  const orbitStroke = dark ? 'rgba(249,115,22,0.22)'      : 'rgba(249,115,22,0.30)'
  const glowOp      = dark ? '0.55'                       : '0.30'
  const avatarBg    = dark ? 'rgba(249,115,22,0.18)'      : 'rgba(249,115,22,0.12)'
  const badgeBg     = dark ? '#f97316'                    : '#ea580c'
  const docLine     = dark ? 'rgba(255,255,255,0.22)'     : 'rgba(0,0,0,0.15)'

  /* Particle positions — fixed so they don't re-render randomly */
  const particles = [
    { cx: 85,  cy: 82,  r: 2.5, op: 0.9 },
    { cx: 310, cy: 65,  r: 2.0, op: 0.7 },
    { cx: 50,  cy: 160, r: 1.8, op: 0.8 },
    { cx: 340, cy: 145, r: 2.2, op: 0.85},
    { cx: 130, cy: 42,  r: 1.5, op: 0.6 },
    { cx: 270, cy: 38,  r: 1.8, op: 0.75},
    { cx: 62,  cy: 115, r: 1.4, op: 0.5 },
    { cx: 355, cy: 200, r: 2.0, op: 0.65},
    { cx: 180, cy: 30,  r: 1.6, op: 0.55},
    { cx: 240, cy: 188, r: 1.5, op: 0.60},
    { cx: 100, cy: 200, r: 1.8, op: 0.70},
    { cx: 320, cy: 105, r: 1.4, op: 0.55},
  ]

  /* Spark streaks around orbital rings */
  const sparks = [
    { x1:110, y1:90,  x2:122, y2:86  },
    { x1:298, y1:88,  x2:285, y2:84  },
    { x1:88,  y1:178, x2:100, y2:182 },
    { x1:318, y1:176, x2:306, y2:180 },
    { x1:160, y1:52,  x2:170, y2:46  },
    { x1:248, y1:52,  x2:238, y2:46  },
  ]

  return (
    <svg
      viewBox="0 0 400 270"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id="cv-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={bgTop}/>
          <stop offset="100%" stopColor={bgBot}/>
        </linearGradient>

        {/* Platform glow */}
        <radialGradient id="cv-plat-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f97316" stopOpacity={glowOp}/>
          <stop offset="60%"  stopColor="#f97316" stopOpacity="0.10"/>
          <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
        </radialGradient>

        {/* Card face gradient — warm orange tint on dark */}
        <linearGradient id="cv-card" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%"   stopColor={dark ? '#131f38' : '#ffffff'}/>
          <stop offset="100%" stopColor={dark ? '#0b1220' : '#fff8f2'}/>
        </linearGradient>

        {/* Card edge glow filter */}
        <filter id="cv-edge-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>

        {/* Soft blur for glows */}
        <filter id="cv-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6"/>
        </filter>
        <filter id="cv-soft2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3"/>
        </filter>
        <filter id="cv-soft3" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10"/>
        </filter>

        {/* Platform top gradient */}
        <linearGradient id="cv-plat-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={dark ? '#1a2a44' : '#fde8d0'}/>
          <stop offset="100%" stopColor={dark ? '#0d1830' : '#f8d8bc'}/>
        </linearGradient>

        {/* Platform side */}
        <linearGradient id="cv-plat-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={dark ? '#0f1f38' : '#f5c4a0'}/>
          <stop offset="100%" stopColor={dark ? '#070d1a' : '#eaad88'}/>
        </linearGradient>

        {/* Badge glow */}
        <radialGradient id="cv-badge-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f97316" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.7"/>
        </radialGradient>

        {/* Particle glow */}
        <radialGradient id="cv-particle" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fb923c" stopOpacity="1"/>
          <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
        </radialGradient>

        {/* Clip path for card */}
        <clipPath id="cv-card-clip">
          <rect x="118" y="38" width="164" height="128" rx="10"/>
        </clipPath>
      </defs>

      {/* ── BACKGROUND ── */}
      <rect width="400" height="270" fill="url(#cv-bg)"/>

      {/* Ambient background glow — centre */}
      <ellipse cx="200" cy="150" rx="160" ry="100"
        fill="#f97316" opacity={dark ? '0.06' : '0.04'} filter="url(#cv-soft3)"/>

      {/* ── ORBITAL RINGS ── */}
      {/* Outer ring — tilted ellipse */}
      <ellipse cx="200" cy="148" rx="145" ry="58"
        fill="none" stroke={orbitStroke} strokeWidth="1.2"
        strokeDasharray="6 8" opacity="0.8"/>
      {/* Inner ring */}
      <ellipse cx="200" cy="148" rx="108" ry="43"
        fill="none" stroke={orbitStroke} strokeWidth="0.8"
        strokeDasharray="4 10" opacity="0.6"/>
      {/* Tiny innermost ring */}
      <ellipse cx="200" cy="148" rx="72" ry="28"
        fill="none" stroke={orbitStroke} strokeWidth="0.6"
        strokeDasharray="3 12" opacity="0.4"/>

      {/* ── SPARK STREAKS on rings ── */}
      {sparks.map((s, i) => (
        <line key={i}
          x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="#f97316" strokeWidth="1.8" strokeLinecap="round"
          opacity={dark ? 0.65 : 0.45}/>
      ))}

      {/* ── FLOATING PARTICLES ── */}
      {particles.map((p, i) => (
        <g key={i}>
          <circle cx={p.cx} cy={p.cy} r={p.r * 2.5}
            fill="#f97316" opacity={p.op * 0.15} filter="url(#cv-soft2)"/>
          <circle cx={p.cx} cy={p.cy} r={p.r}
            fill="#fb923c" opacity={p.op}/>
        </g>
      ))}

      {/* ── PLATFORM ── */}
      {/* Platform outer glow */}
      <ellipse cx="200" cy="215" rx="105" ry="22"
        fill="url(#cv-plat-glow)" filter="url(#cv-soft)"/>
      {/* Platform body — top face (ellipse) */}
      <ellipse cx="200" cy="208" rx="88" ry="18" fill="url(#cv-plat-top)"/>
      {/* Platform rim highlight */}
      <ellipse cx="200" cy="208" rx="88" ry="18"
        fill="none" stroke={platformRim} strokeWidth="1.5" opacity="0.7"/>
      {/* Platform body sides */}
      <path d="M112 208 L112 222 Q200 240 288 222 L288 208 Q200 226 112 208Z"
        fill="url(#cv-plat-side)"/>
      {/* Platform inner ring */}
      <ellipse cx="200" cy="208" rx="68" ry="13"
        fill="none" stroke={dark ? 'rgba(249,115,22,0.35)' : 'rgba(249,115,22,0.25)'}
        strokeWidth="1"/>
      {/* Centre hotspot glow on platform */}
      <ellipse cx="200" cy="208" rx="42" ry="9"
        fill="#f97316" opacity={dark ? '0.30' : '0.18'} filter="url(#cv-soft2)"/>

      {/* ── 3D CREDENTIAL CARD — main body ── */}
      {/* Card shadow / depth */}
      <rect x="124" y="48" width="164" height="128" rx="10"
        fill="rgba(0,0,0,0.45)" filter="url(#cv-soft)"/>

      {/* Card perspective bottom edge — gives 3D depth */}
      <path d="M118 162 L128 174 L282 174 L282 162 Z"
        fill={dark ? '#0a1428' : '#f0d8c0'} opacity="0.7"/>
      <path d="M282 38 L292 50 L292 174 L282 162 Z"
        fill={dark ? '#0c1830' : '#f5d4b0'} opacity="0.6"/>

      {/* Card face */}
      <rect x="118" y="38" width="164" height="124" rx="10"
        fill="url(#cv-card)"
        stroke={cardStroke} strokeWidth="1.4" strokeOpacity={dark ? '0.7' : '0.5'}/>

      {/* Card edge glow — the orange border shine from reference */}
      <rect x="118" y="38" width="164" height="124" rx="10"
        fill="none"
        stroke="#f97316" strokeWidth="2.5" strokeOpacity={dark ? '0.5' : '0.3'}
        filter="url(#cv-soft2)"/>

      {/* ── CARD CONTENT ── */}
      {/* Header bar */}
      <rect x="118" y="38" width="164" height="26" rx="10" fill={dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)'}/>
      <rect x="118" y="52" width="164" height="12" fill={dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)'}/>

      {/* SkillPassport logo mark on card */}
      <rect x="128" y="46" width="18" height="18" rx="5"
        fill="linear-gradient(135deg,#f97316,#ea580c)"/>
      <rect x="128" y="46" width="18" height="18" rx="5" fill="#f97316"/>
      {/* Shield icon simplified */}
      <path d="M137 49 L142 51 L142 56 Q137 59 132 56 L132 51 Z"
        fill="white" opacity="0.9"/>

      {/* Card title lines */}
      <rect x="152" y="47" width="55" height="4" rx="2" fill={dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)'}/>
      <rect x="152" y="54" width="38" height="3" rx="1.5" fill="#f97316" opacity="0.8"/>

      {/* Verified badge top-right */}
      <rect x="258" y="44" width="18" height="18" rx="5" fill="url(#cv-badge-glow)"/>
      <circle cx="267" cy="53" r="6" fill="none" stroke="white" strokeWidth="1.2"/>
      {/* Check mark */}
      <path d="M263.5 53 L266 55.5 L271 50.5"
        stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Avatar circle */}
      <circle cx="152" cy="93" r="22" fill={avatarBg}
        stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.6"/>
      {/* Person silhouette in avatar */}
      <circle cx="152" cy="87" r="8" fill="#f97316" opacity={dark ? '0.7' : '0.6'}/>
      <ellipse cx="152" cy="103" rx="13" ry="8" fill="#f97316" opacity={dark ? '0.5' : '0.4'}/>

      {/* Card text lines — right of avatar */}
      <rect x="184" y="82" width="70" height="5" rx="2.5" fill={lineFill}/>
      <rect x="184" y="91" width="52" height="4" rx="2" fill={lineFill2}/>
      <rect x="184" y="99" width="62" height="4" rx="2" fill={lineFill2}/>

      {/* Divider */}
      <line x1="128" y1="122" x2="272" y2="122"
        stroke={dark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.18)'} strokeWidth="1"/>

      {/* Bottom content: doc lines */}
      <rect x="128" y="130" width="88" height="3.5" rx="1.5" fill={docLine}/>
      <rect x="128" y="137" width="72" height="3" rx="1.5" fill={docLine} opacity="0.7"/>
      <rect x="128" y="144" width="80" height="3" rx="1.5" fill={docLine} opacity="0.6"/>
      <rect x="128" y="151" width="65" height="3" rx="1.5" fill={docLine} opacity="0.5"/>

      {/* Badge/seal — bottom right of card — matches reference */}
      <circle cx="248" cy="145" r="18"
        fill="none" stroke="#f97316" strokeWidth="2" strokeOpacity={dark ? '0.6' : '0.5'}/>
      <circle cx="248" cy="145" r="14"
        fill={dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)'}
        stroke="#f97316" strokeWidth="1" strokeOpacity="0.4"/>
      {/* Checkmark inside seal */}
      <path d="M241 145 L245.5 149.5 L256 139"
        stroke="#f97316" strokeWidth="2.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Seal glow */}
      <circle cx="248" cy="145" r="18"
        fill="none" stroke="#f97316" strokeWidth="4" strokeOpacity="0.15"
        filter="url(#cv-soft2)"/>

      {/* Card face orange glow — the illuminated orange sheen from reference */}
      <rect x="118" y="38" width="164" height="124" rx="10"
        fill={dark
          ? 'linear-gradient(135deg,rgba(249,115,22,0.08) 0%,transparent 60%)'
          : 'linear-gradient(135deg,rgba(249,115,22,0.05) 0%,transparent 60%)'}
        opacity="1"/>
      {/* Inline gradient workaround */}
      <defs>
        <linearGradient id="cv-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#f97316" stopOpacity={dark ? '0.12' : '0.06'}/>
          <stop offset="55%"  stopColor="#f97316" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect x="118" y="38" width="164" height="124" rx="10" fill="url(#cv-sheen)"/>

      {/* ── PLATFORM GLOW BEAM — light shaft from bottom of card ── */}
      <path d="M170 162 L140 208 L260 208 L230 162 Z"
        fill="#f97316"
        opacity={dark ? '0.08' : '0.05'}
        filter="url(#cv-soft)"/>

      {/* Ground reflection under platform */}
      <ellipse cx="200" cy="230" rx="75" ry="10"
        fill="#f97316" opacity={dark ? '0.12' : '0.07'} filter="url(#cv-soft2)"/>

      {/* ── VIGNETTE ── */}
      <defs>
        <radialGradient id="cv-vign" cx="50%" cy="50%" r="70%">
          <stop offset="45%" stopColor="transparent"/>
          <stop offset="100%" stopColor={dark ? 'rgba(0,0,0,0.65)' : 'rgba(240,195,155,0.25)'}/>
        </radialGradient>
      </defs>
      <rect width="400" height="270" fill="url(#cv-vign)"/>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────── */
export default function AuthLeftPanel({ role = 'student', vis = true }) {
  const { dark } = useTheme()
  const meta = ROLE_META[role] || ROLE_META.default

  /* Theme-aware tokens — all orange family, no blue/purple */
  const bg          = dark
    ? 'linear-gradient(160deg,#090d1a 0%,#0a0e1c 55%,#060910 100%)'
    : 'linear-gradient(160deg,#fff8f2 0%,#fff4e8 50%,#fef3e2 100%)'
  const logoText    = dark ? '#f8fafc'  : '#0f172a'
  const overlineClr = '#f97316'
  const headMain    = dark ? '#f8fafc'  : '#0f172a'
  const headAcct    = '#f97316'
  const subText     = dark ? '#94a3b8'  : '#6b7280'
  const perkText    = dark ? '#94a3b8'  : '#6b7280'
  const footText    = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)'
  const dotColor    = '#f97316'
  const arcStroke   = dark ? 'rgba(249,115,22,0.10)' : 'rgba(249,115,22,0.15)'
  const blobColor   = dark ? 'rgba(249,115,22,0.22)' : 'rgba(249,115,22,0.12)'
  const perkIconBg  = dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.10)'
  const perkIconBorder = dark ? 'rgba(249,115,22,0.25)' : 'rgba(249,115,22,0.22)'

  /* Perk icons — all orange, match reference exactly */
  const PERK_ICONS = [
    /* shield */
    <svg key="0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    /* bar chart */
    <svg key="1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    /* users */
    <svg key="2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ]

  return (
    <div
      className="hidden lg:flex flex-col"
      style={{
        width: '46%',
        position: 'relative',
        overflow: 'hidden',
        padding: '36px 40px 32px',
        background: bg,
        transition: 'background 0.3s ease',
      }}
    >
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes lp-float  { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-9px);} }
        @keyframes lp-glow   { 0%,100%{opacity:0.55;} 50%{opacity:1;} }
        @keyframes lp-slideR { from{opacity:0;transform:translateX(-18px);} to{opacity:1;transform:translateX(0);} }
        @keyframes lp-perk   { from{opacity:0;transform:translateX(-10px);} to{opacity:1;transform:translateX(0);} }
        @keyframes lp-particle {
          0%   { opacity:0; transform:scale(0.5) translateY(0); }
          20%  { opacity:1; }
          80%  { opacity:0.6; }
          100% { opacity:0; transform:scale(1.2) translateY(-18px); }
        }
        @media(prefers-reduced-motion:reduce){
          .lp-anim,.lp-float-wrap { animation:none!important; opacity:1!important; transform:none!important; }
        }
      `}</style>

      {/* ── Arc decorations ── */}
      <svg
        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'visible' }}
        viewBox="0 0 460 860" fill="none" preserveAspectRatio="xMidYMid slice"
      >
        <ellipse cx="-25" cy="430" rx="360" ry="360"
          stroke={arcStroke} strokeWidth="0.8" strokeDasharray="7 10" opacity="1"/>
        <ellipse cx="-25" cy="430" rx="260" ry="260"
          stroke={arcStroke} strokeWidth="0.5" strokeDasharray="5 14" opacity="0.7"/>
      </svg>

      {/* ── Ambient blobs ── */}
      <div style={{
        position:'absolute', top:-60, left:-60, width:260, height:260, borderRadius:'50%',
        background:`radial-gradient(circle,${blobColor} 0%,transparent 70%)`,
        filter:'blur(40px)', pointerEvents:'none',
        animation:'lp-glow 5s ease-in-out infinite',
      }}/>
      <div style={{
        position:'absolute', bottom:-40, right:-40, width:200, height:200, borderRadius:'50%',
        background:`radial-gradient(circle,${blobColor} 0%,transparent 70%)`,
        filter:'blur(32px)', pointerEvents:'none',
        animation:'lp-glow 7s ease-in-out 1.5s infinite',
      }}/>

      {/* ── Logo ── */}
      <div
        className="lp-anim"
        style={{
          position:'relative', zIndex:2,
          animation: vis ? 'lp-slideR 0.5s 0.08s ease both' : 'none',
          opacity: vis ? undefined : 0,
        }}
      >
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            background:'linear-gradient(135deg,#f97316,#ea580c)',
            boxShadow:'0 4px 14px rgba(249,115,22,0.45)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Shield size={17} color="white"/>
          </div>
          <div>
            <p style={{ margin:0, lineHeight:1, fontSize:18, fontWeight:900 }}>
              <span style={{ color:logoText }}>Skill</span>
              <span style={{ color:'#f97316' }}>Passport</span>
            </p>
            <p style={{ margin:'2px 0 0', fontSize:10, color:subText }}>
              Your Skills. Your Proof. Your Future.
            </p>
          </div>
        </Link>
      </div>

      {/* ── Centre content ── */}
      <div style={{
        position:'relative', zIndex:2, flex:1,
        display:'flex', flexDirection:'column', justifyContent:'center', gap:14,
      }}>

        {/* Headline */}
        <div
          className="lp-anim"
          style={{
            animation: vis ? 'lp-slideR 0.55s 0.15s ease both' : 'none',
            opacity: vis ? undefined : 0,
          }}
        >
          <p style={{
            margin:'0 0 8px', fontSize:10, fontWeight:700,
            letterSpacing:'0.2em', color:overlineClr, textTransform:'uppercase',
          }}>
            {meta.overline}
          </p>
          <h2 style={{
            margin:'0 0 10px', fontWeight:900, lineHeight:1.12,
            color:headMain, fontSize:'1.9rem',
          }}>
            {meta.headline[0]}<br/>
            <span style={{ color:headAcct }}>{meta.headline[1]}</span>
          </h2>
          <p style={{ margin:0, fontSize:13, color:subText, lineHeight:1.65, maxWidth:270 }}>
            {meta.sub}
          </p>
        </div>

        {/* ── 3D Credential visual — floating ── */}
        <div
          className="lp-float-wrap lp-anim"
          style={{
            animation: vis ? 'lp-float 4.5s 0.3s ease-in-out infinite' : 'none',
            opacity: vis ? undefined : 0,
            flex: '0 0 auto',
            /* No border/box around it — the SVG provides its own frame */
          }}
        >
          <CredentialVisual dark={dark}/>
        </div>

        {/* ── Perks — matching reference exactly ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {meta.perks.map((perk, i) => (
            <div
              key={i}
              className="lp-anim"
              style={{
                display:'flex', alignItems:'center', gap:10,
                animation: vis ? `lp-perk 0.4s ${0.42 + i * 0.09}s ease both` : 'none',
                opacity: vis ? undefined : 0,
              }}
            >
              {/* Icon chip — matches reference style */}
              <div style={{
                width:26, height:26, borderRadius:7, flexShrink:0,
                background:perkIconBg,
                border:`1px solid ${perkIconBorder}`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {PERK_ICONS[i % 3]}
              </div>
              <span style={{ fontSize:12.5, color:perkText, fontWeight:500 }}>{perk}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <p style={{ color:footText, fontSize:10, position:'relative', zIndex:2, marginTop:8 }}>
        © 2026 SkillPassport
      </p>
    </div>
  )
}
