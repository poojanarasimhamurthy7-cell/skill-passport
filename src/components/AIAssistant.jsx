/**
 * AIAssistant — SkillPassport floating conversational AI panel.
 *
 * Architecture:
 *   UI ──▶ generateResponse(message, role, module, appContext)
 *        ──▶ intent classifier ──▶ response builder
 *        ──▶ Future: replace generateResponse with fetch('/api/ai', {...})
 *
 * Features:
 * • Fully conversational — handles greetings, freeform questions, follow-ups
 * • Role-aware (student / recruiter / college / ministry / landing)
 * • Page/module-aware — focuses on current section context
 * • App-state aware — uses readiness, gaps, skills, evidence counts
 * • Typing animation, thinking indicator, message history
 * • Global theme (dark/light) via useTheme
 * • prefers-reduced-motion safe
 * • Visible on Landing + all authenticated pages
 * • Hidden on Login / Signup / Create Password / OAuth pages
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { X, Send, Sparkles, ChevronDown, RotateCcw, MessageCircle } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   INTENT CLASSIFIER
   Maps free-form input to an intent string using keyword matching.
   Order matters — more specific patterns first.
═══════════════════════════════════════════════════════════════ */
const INTENT_PATTERNS = [
  // Greetings
  { intent: 'greeting',       patterns: ['hello','hi','hey','good morning','good afternoon','good evening','howdy','sup','hiya','greetings'] },
  // Farewells
  { intent: 'farewell',       patterns: ['bye','goodbye','see you','cya','later','thanks bye','thank you bye'] },
  // Thanks
  { intent: 'thanks',         patterns: ['thank','thanks','thank you','thx','cheers','appreciate'] },
  // SkillPassport identity
  { intent: 'what_is_sp',     patterns: ['what is skillpassport','what is skill passport','about skillpassport','explain skillpassport','tell me about skill','what does skillpassport do','how does skillpassport work','what can you do'] },
  // Identity — who is the AI
  { intent: 'who_are_you',    patterns: ['who are you','what are you','are you an ai','are you a bot','are you human','your name','what do you do'] },
  // Help
  { intent: 'help',           patterns: ['help','how can you help','what can i ask','what can i do','i need help','guide me','show me'] },
  // Readiness / score
  { intent: 'readiness',      patterns: ['readiness','industry ready','ready score','my score','overall score','how ready','am i ready','my readiness','percentage','score'] },
  // Skills general
  { intent: 'skills',         patterns: ['my skills','skill list','what skills','which skills','skill profile','skills i have','skills do i have'] },
  // Improve skill
  { intent: 'improve_skill',  patterns: ['improve','get better','how to improve','learn','study','upskill','next skill','what should i learn','focus on','work on','recommended skill'] },
  // Skill gap
  { intent: 'skill_gap',      patterns: ['skill gap','gap','missing skill','what am i missing','lacking','gap analysis','gaps in my','cloud gap','ml gap','python gap'] },
  // Evidence
  { intent: 'evidence',       patterns: ['evidence','certificate','project','github','upload','document','proof','verify','verification','add evidence','my evidence','evidence centre','what to upload'] },
  // Assessment
  { intent: 'assessment',     patterns: ['assessment','exam','quiz','test','score calculation','how scored','proctoring','retake','attempt','assessment result'] },
  // Passport
  { intent: 'passport',       patterns: ['passport','skill passport','digital passport','share passport','recruiter view','public view','my passport','what is in my passport'] },
  // Challenges
  { intent: 'challenges',     patterns: ['challenge','industry challenge','task','project challenge','complete challenge','assigned challenge','bridge challenge','submit challenge'] },
  // Skill Bridge
  { intent: 'bridge',         patterns: ['skill bridge','bridge','close gap','gap bridge','how to close','fill gap','bridge plan'] },
  // Candidates (recruiter)
  { intent: 'candidates',     patterns: ['candidate','candidates','student profile','find talent','search candidate','candidate list','applicant'] },
  // Match / hiring
  { intent: 'matching',       patterns: ['match','matching','match score','why matched','match percentage','match %','86%','94%','why is this candidate','candidate match','how match'] },
  // Shortlist
  { intent: 'shortlist',      patterns: ['shortlist','shortlisted','save candidate','bookmark','favourite candidate'] },
  // Interview
  { intent: 'interview',      patterns: ['interview','schedule interview','interview slot','interview feedback','set up interview'] },
  // Requirements (recruiter)
  { intent: 'requirements',   patterns: ['requirement','job requirement','skill requirement','create requirement','job post','hiring requirement'] },
  // Analytics (recruiter/college/ministry)
  { intent: 'analytics',      patterns: ['analytics','trends','skill trend','demand','industry demand','most demanded','popular skill','top skill'] },
  // Students (college)
  { intent: 'students',       patterns: ['student','students','student list','track student','student progress','student readiness','placement ready'] },
  // Workshop (college)
  { intent: 'workshop',       patterns: ['workshop','training','bootcamp','recommended workshop','which workshop','close gap workshop'] },
  // Curriculum (college)
  { intent: 'curriculum',     patterns: ['curriculum','syllabus','course update','add module','curriculum intelligence','what to teach','what to add'] },
  // National / map (ministry)
  { intent: 'national',       patterns: ['national','nationally','country','india','all institutions','aggregate','overall india','national score','national gap'] },
  // Policy
  { intent: 'policy',         patterns: ['policy','policy action','recommendation','government action','intervention','national plan','training policy'] },
  // Future skills / warning
  { intent: 'future_skill',   patterns: ['future skill','emerging skill','early warning','next skill','upcoming skill','skill warning','what will be needed','future demand','trending skill'] },
  // Chart / current page
  { intent: 'explain_page',   patterns: ['this chart','this graph','this page','current page','what does this show','explain this','what is this','this dashboard','this section','what am i looking at'] },
  // Proof of skill
  { intent: 'proof',          patterns: ['proof of skill','proof score','proof graph','skill proof','how proof','what counts as proof','my proof','evidence for skill'] },
  // Resume / profile
  { intent: 'resume',         patterns: ['resume','cv','profile','generate resume','my profile','profile page','create resume','profile data'] },
  // Notifications
  { intent: 'notifications',  patterns: ['notification','alert','bell','unread','new notification','what happened'] },
  // Settings / privacy
  { intent: 'settings',       patterns: ['settings','privacy','visibility','who can see','public profile','recruiter visibility','hide profile'] },
  // Logout / account
  { intent: 'account',        patterns: ['logout','log out','sign out','account','delete account','my account','switch role'] },
  // Generic question catch-all
  { intent: 'general',        patterns: [] },
]

function classifyIntent(message) {
  const q = message.toLowerCase().trim()
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some(p => q.includes(p))) return intent
  }
  return 'general'
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSE GENERATOR
   Returns a markdown-lite string (supports **bold**).
   Role + module + intent determine the response.
═══════════════════════════════════════════════════════════════ */
function generateResponse(message, role, module, ctx = {}) {
  const intent = classifyIntent(message)
  const q = message.toLowerCase().trim()

  const { readiness = 82, topSkills = ['Python','SQL','Machine Learning'], gaps = ['Cloud Deployment','Docker','NLP'], evidenceCount = 7 } = ctx

  // ── Universal intents ─────────────────────────────────────
  if (intent === 'greeting') {
    const greetings = [
      `Hi there! I'm **SkillPassport AI**. How can I help you today?`,
      `Hello! I'm here to help with your SkillPassport experience. What would you like to know?`,
      `Hey! Great to see you. Ask me anything about your skills, passport, or how SkillPassport works.`,
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  if (intent === 'farewell') {
    return `Goodbye! Come back anytime if you have questions. Good luck with your skill journey! 👋`
  }

  if (intent === 'thanks') {
    return `You're welcome! Is there anything else I can help you with?`
  }

  if (intent === 'who_are_you') {
    return `I'm **SkillPassport AI** — your intelligent assistant built into the SkillPassport platform.\n\nI can help you navigate your dashboard, understand your skills and gaps, find candidates, analyse institutional data, or explain anything on the current page.\n\nI'm a frontend AI service right now — my responses are generated from your live application context. A real AI backend can be connected to power me with deeper intelligence.`
  }

  if (intent === 'what_is_sp') {
    return `**SkillPassport** is India's first AI-powered Digital Skill Passport platform.\n\nInstead of relying on resumes, it lets students **prove skills with real evidence** — GitHub projects, certificates, assessments and industry challenges all feed a verified Proof-of-Skill graph.\n\nRecruiters search by evidence, not keywords. Colleges track institutional skill readiness. The Ministry gets national skill intelligence.\n\nThe core idea: Don't just claim skills — **prove them.**`
  }

  if (intent === 'help') {
    const helpByRole = {
      student:   `I can help you with:\n• Your skills, evidence and readiness score\n• Understanding your skill gaps\n• Skill Bridge challenges\n• Assessment results\n• Your Digital Skill Passport\n• Resume/profile generation\n\nJust type naturally — no need to pick from a list!`,
      recruiter: `I can help you with:\n• Finding and evaluating candidates\n• Understanding match scores\n• Creating job requirements\n• Shortlisting and interviews\n• Skill demand analytics\n\nAsk me anything about your hiring workflow.`,
      college:   `I can help you with:\n• Student skill readiness\n• Institutional skill gaps\n• Workshop recommendations\n• Curriculum intelligence\n• Industry demand trends\n\nAsk me about your students or institutional analytics.`,
      ministry:  `I can help you with:\n• National skill readiness\n• Regional skill gap analysis\n• Future skill early warnings\n• Policy action recommendations\n• Workforce intelligence\n\nAsk me about national or aggregated skill data.`,
      landing:   `I can tell you about SkillPassport — how it works, who it's for, what the features are, and how to get started.\n\nJust ask me anything!`,
    }
    return helpByRole[role] || helpByRole.landing
  }

  if (intent === 'explain_page') {
    const pageExplanations = {
      dashboard:    `This is your **Dashboard** — the central overview of your SkillPassport. It shows your industry readiness score (currently **${readiness}%**), your top skills, active skill gaps, recent activity and recommended next actions.\n\nAll the metrics here update automatically as you complete assessments, add evidence or finish challenges.`,
      proof:        `This is your **Proof-of-Skill Graph** — it visually maps each skill to all the evidence behind it. Each node represents a skill, and the connected evidence (GitHub, certificates, challenges, assessments) determines your proof score.\n\nClick any skill node to see the exact evidence chain that produced that score.`,
      gaps:         `This is the **Skill-Gap Analysis** page. It compares your proven skills against current industry demand.\n\nGreen = strong match. Amber = partial match. Red = critical gap with no evidence. The gap size is based on how far your proof score falls below what industry currently expects.`,
      bridge:       `This is the **Skill Bridge** — it converts your skill gaps into actionable learning paths.\n\nFor each gap, the Bridge assigns a specific practical challenge. Completing the challenge adds new evidence to your passport and closes that gap.`,
      evidence:     `This is the **Evidence Centre** — where you upload and manage your skill proof. Each piece of evidence goes through AI scanning: it checks QR codes, pixel integrity, metadata and issuer patterns before being accepted.\n\nStronger evidence = higher proof scores = better recruiter visibility.`,
      intelligence: `This is the **Skill Intelligence** dashboard. It aggregates student skill data across your institution and compares it to live industry demand.\n\nThe gap analysis shows where your students collectively fall short, driving workshop and curriculum recommendations.`,
      warning:      `This is the **Future Skill Early Warning** system. It analyses industry demand trends to predict which skills will become critical before they become mainstream.\n\nSkills in the "Emerging" zone are growing fast. "Critical Gap" means demand already significantly exceeds supply.`,
    }
    return pageExplanations[module] || `This page shows ${module}-related data for your ${role} portal. The charts and metrics update based on real SkillPassport activity. Is there a specific section you'd like me to explain in detail?`
  }

  if (intent === 'notifications') {
    return `Notifications keep you updated on important changes — evidence verification results, assessment completions, skill gap changes, new challenge assignments, recruiter activity and passport updates.\n\nClick the bell icon in the top-right to see your notification panel. Unread notifications are shown with an orange badge.`
  }

  if (intent === 'account') {
    return `You can log out using the **Sign Out** button in the sidebar or header.\n\nYour theme preference, passport data and session history are preserved across logins. If you need to switch roles, log out and select a different role on the login page.`
  }

  // ── Student intents ──────────────────────────────────────
  if (role === 'student' || role === 'landing') {

    if (intent === 'readiness') {
      return `Your current **Industry Readiness score is ${readiness}%**.\n\nThis is calculated from:\n• Evidence strength per skill\n• Assessment results\n• Completed industry challenges\n• Skill diversity and recency\n\n${readiness >= 80 ? 'You\'re in a strong position! Focus on closing your remaining gaps to push above 85%.' : readiness >= 60 ? 'You\'re above the 60% baseline. Adding cloud evidence and completing one more challenge would make a significant difference.' : 'You\'re below the 60% industry baseline. Prioritise adding evidence for your top skills and completing at least one Skill Bridge challenge.'}`
    }

    if (intent === 'skills') {
      return `Your current proven skills include: **${topSkills.join(', ')}**.\n\nEach skill has a proof score based on the evidence behind it. Python and SQL are your strongest — both have multiple evidence sources. Machine Learning has one challenge result but no certificate yet.\n\nYou can view the full breakdown in the **Proof-of-Skill Graph** section.`
    }

    if (intent === 'improve_skill') {
      return `Based on your current profile and industry demand, here's what I'd recommend:\n\n1. **Cloud Deployment** — critical gap, zero evidence, very high demand. Start with the assigned Skill Bridge challenge.\n2. **Docker** — emerging skill with growing demand. A small project on GitHub would add solid proof.\n3. **Machine Learning** — you have a challenge result but no certificate. An NPTEL or Coursera cert would significantly boost this score.\n\nFocusing on Cloud + one ML certificate would raise your readiness by an estimated 8–12%.`
    }

    if (intent === 'skill_gap') {
      return `Your current skill gaps are: **${gaps.join(', ')}**.\n\nA gap means industry demand for that skill is high but your passport has little or no verified evidence for it.\n\n**Cloud Deployment** is the most critical — it has 0% evidence and appears in 71% of relevant job requirements. The Skill Bridge has an active challenge ready for you.\n\nGo to **Skill-Gap Analysis** to see the full breakdown with evidence recommendations.`
    }

    if (intent === 'evidence') {
      return `You currently have **${evidenceCount} evidence items** in your passport.\n\nEvidence types you can add:\n• **Certificates** (NPTEL, Coursera, AWS, etc.)\n• **GitHub repositories** (linked or uploaded)\n• **Internship letters**\n• **Project descriptions**\n• **Assessment results** (auto-added)\n• **Challenge completions** (auto-added)\n\nEach item goes through AI verification before it counts toward your proof score. The highest-impact addition right now would be a cloud or ML certificate.`
    }

    if (intent === 'assessment') {
      return `Assessments on SkillPassport are **adaptive and proctored**.\n\nYour score is calculated from three sections:\n• **Knowledge** (MCQ — 40%)\n• **Logical Execution** (coding problems — 40%)\n• **Syntactical Precision** (code quality — 20%)\n\nThe 60% mark is the industry baseline. Scores above 60% make your profile visible to recruiters. Below 60%, your profile enters the review pool and you're offered a 3-round filter to qualify for a retake.\n\nAssessment results automatically update your Proof-of-Skill scores.`
    }

    if (intent === 'passport') {
      return `Your **Digital Skill Passport** is your verified professional identity on SkillPassport.\n\nIt contains:\n• Personal and academic profile\n• Proven skills with evidence chains\n• Proof-of-Skill graph\n• Assessment history\n• Completed challenges\n• Industry readiness score\n\nYou can share it via a link in three modes: **Full Passport**, **Recruiter View** (hides private details), or **Public View**.\n\nRecruiters who find you through Smart Search see your passport automatically.`
    }

    if (intent === 'challenges') {
      return `**Industry Challenges** are practical, company-set tasks that generate strong skill evidence.\n\nCompleting a challenge:\n1. Adds a challenge result to your evidence\n2. Updates your proof score for the relevant skills\n3. Updates your industry readiness\n4. Notifies relevant recruiters of your new evidence\n\nChallenges assigned through **Skill Bridge** are specifically targeted at your current gaps — these have the highest impact on your readiness score.`
    }

    if (intent === 'bridge') {
      return `The **Skill Bridge** converts your skill gaps into targeted learning paths.\n\nHere's how it works:\n1. Gap detected (e.g. Cloud Deployment)\n2. Bridge assigns a specific practical challenge\n3. You complete and submit the challenge\n4. Evidence is verified and added to your passport\n5. Gap closes, readiness score updates\n\nYour current active bridge challenge is for **Cloud Deployment**. Go to the Skill Bridge section to see the full task.`
    }

    if (intent === 'proof') {
      return `Your **Proof-of-Skill** is SkillPassport's unique approach to skill credibility.\n\nFor each skill, your proof score is built from:\n• GitHub repositories (weighted high)\n• Certificates (weighted high)\n• Assessment results\n• Industry challenge completions\n• Internship letters\n\nExample — your Python proof score of 88% comes from: a GitHub Face Detection project + an ML challenge result (84/100) + an NPTEL certificate. That combination makes Python one of your strongest skills.`
    }

    if (intent === 'resume') {
      return `The **Resume Generator** builds your professional profile directly from your Passport data — no manual entry needed.\n\nIt uses your:\n• Academic information\n• Verified skills and proof scores\n• Evidence (certificates, projects, challenges)\n• Readiness score\n\nYou can generate different views — a full CV, a skills-focused profile, or a recruiter-optimised one-pager. Go to the Resume section in your sidebar.`
    }

    if (intent === 'settings') {
      return `In **Profile & Settings** you can control:\n• Personal information\n• Passport visibility (public, recruiter-only, private)\n• Which skills appear in recruiter view\n• Notification preferences\n• Account security\n\nChanging visibility settings takes effect immediately — recruiters will see or not see your profile based on your current setting.`
    }
  }

  // ── Recruiter intents ────────────────────────────────────
  if (role === 'recruiter') {

    if (intent === 'readiness') {
      return `The readiness score you see on a candidate profile represents their **Industry Readiness** — a composite of their verified evidence strength, assessment scores, challenge completions and skill diversity.\n\nScores above 75% indicate a placement-ready candidate. Scores between 60–75% mean the candidate has solid skills but may have a gap or two. Below 60% means they're still building their profile.`
    }

    if (intent === 'candidates') {
      return `Candidates on SkillPassport are students with **verified, evidence-backed skill profiles**.\n\nYou can find them through **Smart Candidate Search** — type naturally like "Python developer with ML project experience" and the AI returns ranked matches with evidence explanations.\n\nEach candidate shows their proof score per skill, so you know exactly what evidence backs each claim — no resume guessing.`
    }

    if (intent === 'matching') {
      return `The **match percentage** compares a candidate's proven skills against your active requirement map.\n\n**100%** — every required skill has strong evidence.\n**80–99%** — strong match with minor gaps.\n**60–79%** — good match but one or two skills need attention.\n**Below 60%** — significant evidence gaps against your requirements.\n\nClick any candidate to see the skill-by-skill match breakdown with the exact evidence backing each score.`
    }

    if (intent === 'shortlist') {
      return `To shortlist a candidate, click the **Shortlist** button on their profile or in search results.\n\nShortlisted candidates are collected in your **Shortlist** module where you can compare them side-by-side, add notes and schedule interviews.\n\nYou can export your shortlist or share it with colleagues for collaborative hiring decisions.`
    }

    if (intent === 'interview') {
      return `You can schedule interviews directly from a candidate's profile or from your Shortlist.\n\nThe interview scheduler lets you:\n• Set date, time and format (in-person / video / phone)\n• Add notes and requirements\n• The candidate is notified automatically\n\nAfter the interview, record your feedback in the candidate's profile to keep your hiring pipeline organised.`
    }

    if (intent === 'requirements') {
      return `In **Industry Requirements**, you define what skills a role needs.\n\nThe AI converts your job description into a **Skill Requirement Map** — weighted by importance. This map is then used to automatically score all available candidates against your specific needs.\n\nYou can adjust individual skill weights, set minimum evidence requirements and specify preferred challenge or certification types.`
    }

    if (intent === 'analytics') {
      return `The **Skill Analytics** module shows you real-time supply and demand intelligence:\n\n• Top 5 most demanded skills in current requirements\n• Average readiness of available candidates\n• Skills with highest unmet demand\n• Emerging skills gaining traction\n\nCurrently, **Cloud/AWS** has the largest demand-supply gap — high recruiter demand, relatively low student proof available. Acting early gives you first-mover advantage.`
    }

    if (intent === 'skill_gap') {
      return `When viewing a candidate, skill gaps are shown in their Proof-of-Skill graph — skills with low or no evidence appear in amber or red.\n\nThe **Gap vs Requirement** section on a candidate's detail page shows exactly which of your required skills they're missing evidence for, and how significant that gap is relative to your requirement weights.`
    }
  }

  // ── College intents ──────────────────────────────────────
  if (role === 'college') {

    if (intent === 'readiness') {
      return `Your institution's current average student readiness is **68%** — up 4 points from last semester.\n\n342 students (28%) are placement-ready (above 75%). The biggest drag on the average is the Cloud skills gap — only 22% of students have any cloud evidence, despite 80% industry demand.\n\nThe Skill Intelligence module has a full breakdown by department and skill.`
    }

    if (intent === 'students') {
      return `The **Student Tracker** shows all enrolled students with their live skill profiles.\n\nYou can filter by:\n• Readiness score\n• Department / branch\n• Specific skills\n• Evidence status\n• Assessment completion\n\nClick any student to see their full skill profile, evidence list and recommended next steps. All data updates automatically as students complete assessments and upload evidence.`
    }

    if (intent === 'skill_gap') {
      return `Your institution's current top 3 skill gaps:\n\n1. **Cloud & DevOps** — 58% gap (demand 80%, student proof 22%)\n2. **React.js** — 28% gap (demand 70%, proof 42%)\n3. **Machine Learning** — 27% gap (demand 75%, proof 48%)\n\nThese gaps are based on the difference between what industry currently demands and what your students have proven evidence for.\n\nThe Workshop Recommendations section has specific training options to close these.`
    }

    if (intent === 'workshop') {
      return `Based on your current skill gap data, the AI recommends:\n\n1. **Cloud & DevOps Bootcamp** (highest impact — closes 58% Cloud gap)\n2. **Applied ML Workshop** (closes 27% ML gap, affects ~280 students)\n3. **Computer Vision Lab** (closes OpenCV gap)\n4. **NLP & Text Analytics** (emerging demand)\n\nAll recommendations are ranked by gap-closure impact × number of students affected. You can register workshop outcomes in the system to track improvement over time.`
    }

    if (intent === 'curriculum') {
      return `The **Curriculum Intelligence** module compares your current teaching content against live industry skill demand.\n\nCurrent high-priority curriculum opportunities:\n• Add a **Cloud Deployment lab** — demand 80%, zero student proof\n• Introduce **React.js project modules** — demand 70%, proof only 42%\n• Make **ML assessments practical**, not just theory-based\n\nThese three changes are estimated to improve placement readiness by 12–18%. The system also flags skills that are declining in demand so you can deprioritise appropriately.`
    }

    if (intent === 'analytics') {
      return `The **Industry Demand** module shows what skills employers are currently requesting across all active SkillPassport recruiters.\n\nTrending upward: **Cloud/AWS**, **ML/AI**, **Docker**, **Cybersecurity**.\nHigh but stable: **Python**, **SQL**, **React**.\nDeclining: **legacy Java frameworks**, **manual testing** (being replaced by automation).\n\nThis data updates in real-time as recruiters post new requirements.`
    }
  }

  // ── Ministry intents ─────────────────────────────────────
  if (role === 'ministry') {

    if (intent === 'readiness' || intent === 'national') {
      return `The current **national skill readiness score is 64%** — aggregated and anonymised across all connected institutions.\n\nStem disciplines average 71%. Healthcare-Tech averages 58%. Karnataka and Maharashtra lead in AI/ML readiness. Northeast states show the most critical gaps in Cloud and Cybersecurity.\n\nAll figures are based on verified passport data — not self-reported surveys.`
    }

    if (intent === 'skill_gap') {
      return `The **top 3 national skill gaps** by urgency:\n\n1. **Cloud & DevOps** — demand 78%, national proof 19% → 59% gap\n2. **Cybersecurity** — demand 65%, proof 14% → 51% gap\n3. **Machine Learning** — demand 72%, proof 38% → 34% gap\n\nAll three are classified as **Critical Gap** — industry demand significantly exceeds proven student supply. Targeted interventions are recommended in the Policy Action Tracker.`
    }

    if (intent === 'future_skill') {
      return `Current **Early Warning** skills — demand growing faster than student preparation:\n\n🔴 **Quantum Computing** — demand growing 340% YoY, near-zero student proof\n🟠 **Edge AI** — rising in manufacturing, only 2% national proof\n🟡 **Cybersecurity / Zero Trust** — critical in BFSI and government sectors\n\nThese are skills that don't yet appear widely in curricula but will be in high demand within 2–3 years. Early curriculum intervention is recommended.`
    }

    if (intent === 'policy') {
      return `The **Policy Action Tracker** currently has 3 active recommendations:\n\n1. **National Cloud Skills Mission** — target Tier 2/3 colleges, estimated +40,000 cloud-ready graduates by 2027\n2. **AICTE Curriculum Update** — mandate one industry challenge per semester across all engineering programmes\n3. **AWS/Azure Lab Partnership** — subsidised cloud lab access for 500+ institutions\n\nAll impact figures are illustrative projections. Real outcomes will be tracked as institutions implement and report back through SkillPassport.`
    }

    if (intent === 'analytics') {
      return `**National Skill Demand Trends** (current):\n\nRising fastest: Cloud/DevOps (+34% YoY), AI/ML (+28%), Cybersecurity (+22%)\nStable high demand: Python, SQL, React, Node.js\nDeclining: Traditional Java EE, Manual QA, Basic HTML/CSS\n\nSector breakdown: IT/Tech dominates demand. Healthcare-Tech is the fastest-growing sector for emerging skill requirements. Manufacturing is the most underserved in terms of digital skill supply.`
    }

    if (intent === 'improve_skill' || intent === 'workshop') {
      return `Based on national gap data, the highest-impact training interventions recommended are:\n\n1. **Cloud & DevOps** — affects the most institutions, largest supply gap\n2. **Cybersecurity fundamentals** — growing demand, very low current preparation\n3. **Applied ML/AI** — demand is mature but student proof is still catching up\n\nSee the **Training Intelligence** module for institution-level targeting and the **Policy Action Tracker** for formal intervention plans.`
    }
  }

  // ── Landing-specific ─────────────────────────────────────
  if (role === 'landing') {
    if (intent === 'evidence' || intent === 'proof') {
      return `**Evidence** on SkillPassport is any verified proof of a skill — GitHub projects, certificates, internship letters, assessment results or completed industry challenges.\n\nUnlike a resume where you just list "Python — 3 years", SkillPassport shows exactly what backs that claim: a Face Detection GitHub repo + an ML challenge result + an NPTEL certificate.\n\nRecruiters see the evidence chain, not just the claim.`
    }
    if (intent === 'improve_skill') {
      return `SkillPassport helps you improve skills through the **Skill Bridge** — a feature that detects your exact gap, assigns a practical challenge, and updates your passport the moment you prove the skill.\n\nOnce you create your passport and complete an assessment, the system automatically identifies which skills you need to build evidence for and gives you a clear path forward.`
    }
  }

  // ── General fallback ─────────────────────────────────────
  const fallbacks = {
    student:   `That's a great question. Based on your current profile — **${readiness}% readiness**, skills in ${topSkills.slice(0,2).join(' and ')}, and ${evidenceCount} evidence items — I'd say the most impactful next step is closing your **${gaps[0]}** gap through the Skill Bridge.\n\nIs there something more specific you'd like to know about your skills, evidence, assessments or passport?`,
    recruiter: `Good question. The best place to dig into that would be the **Smart Candidate Search** or **Skill Analytics** section depending on what you're looking for. If you can tell me more about what you're trying to find or evaluate, I can give you a more specific answer.`,
    college:   `That's an important question for institutional planning. The **Skill Intelligence** and **Curriculum Intelligence** modules have the most relevant data. If you're looking for specific student or gap information, try the Skill-Gap Analysis section. What aspect of your institution's performance are you most interested in?`,
    ministry:  `Good question at the national level. The **National Skill Intelligence** and **Future Skill Early Warning** modules contain the most comprehensive data on this. If you can be more specific about the region, sector or skill category you're interested in, I can give you a sharper answer.`,
    landing:   `Great question about SkillPassport! The platform connects students, recruiters, colleges and the government through a single evidence-based skill intelligence system.\n\nIf you'd like to know more about a specific feature — like Proof-of-Skill, Skill Bridge, or how recruiters find candidates — just ask and I'll explain in detail.`,
  }

  return fallbacks[role] || fallbacks.landing
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXT-AWARE SUGGESTED QUESTIONS
═══════════════════════════════════════════════════════════════ */
const SUGGESTIONS = {
  student: {
    dashboard:   ['What is my industry readiness score?', 'Which skills should I work on next?', 'What evidence am I missing?'],
    passport:    ['How do I share my passport with recruiters?', 'What does my proof score mean?', 'Which skills have the strongest evidence?'],
    evidence:    ['How does AI verify my certificate?', 'What should I upload to strengthen my profile?', 'Why was my evidence marked for review?'],
    assessment:  ['How is my score calculated?', 'What should I revise before retaking?', 'How does proctoring work?'],
    proof:       ['What evidence contributes to my Python score?', 'Why is Cloud showing as a gap?', 'How do I improve my proof score?'],
    gaps:        ['What is my most critical skill gap?', 'How does Skill Bridge close gaps?', 'Which gap affects my placement chances most?'],
    bridge:      ['What challenge is assigned for my Cloud gap?', 'How long does a bridge challenge take?', 'What happens after I complete the challenge?'],
    challenges:  ['How are challenges scored?', 'Which challenge would help me most?', 'Does completing a challenge update my passport?'],
    resume:      ['What data is used for my resume?', 'How can I make my profile more recruiter-friendly?', 'Can I customise recruiter view?'],
    default:     ['How can I improve my readiness?', 'What should I work on today?', 'How do recruiters see my profile?'],
  },
  recruiter: {
    dashboard:   ['How many candidates match my requirements?', 'What skills are most in demand?', 'Which candidates are ready for interviews?'],
    requirements:['How does the AI build my skill requirement map?', 'Can I adjust skill importance weights?', 'How are candidates scored?'],
    search:      ['How do I find candidates with Python evidence?', 'What does match % mean?', 'How do I filter by evidence type?'],
    candidates:  ['What evidence backs this candidate\'s skills?', 'Why is this candidate ranked first?', 'How do I shortlist someone?'],
    shortlist:   ['How do I compare shortlisted candidates?', 'Can I export my shortlist?', 'What\'s next after shortlisting?'],
    interviews:  ['How do I schedule an interview?', 'Can I share interview details with the candidate?', 'How do I record feedback?'],
    analytics:   ['Which skills are most in demand right now?', 'What\'s the average candidate readiness?', 'Which skills have the biggest supply gap?'],
    default:     ['How does evidence-based hiring work?', 'What makes SkillPassport different from a resume?', 'How accurate is the match score?'],
  },
  college: {
    overview:    ['What is my institution\'s average readiness?', 'Which department has the best placement readiness?', 'What are my top 3 skill gaps?'],
    students:    ['How do I track a student\'s progress?', 'Which students are placement-ready?', 'Who has the lowest readiness score?'],
    intelligence:['How is our institutional skill gap calculated?', 'Which skills have the biggest industry gap?', 'What training would have the highest impact?'],
    gaps:        ['What\'s the most urgent skill gap?', 'How does our gap compare to peer institutions?', 'What\'s causing the Cloud gap?'],
    workshops:   ['How are workshops recommended?', 'Which workshop closes the most gaps?', 'How do I log a workshop outcome?'],
    curriculum:  ['Which skills are missing from our curriculum?', 'What changes would improve placement rates?', 'How can I use this for accreditation?'],
    default:     ['How can I improve student placement rates?', 'How is student readiness calculated?', 'What does the skill intelligence show?'],
  },
  ministry: {
    intelligence:['What is the national readiness score?', 'Which sectors have the most critical gaps?', 'How is the data aggregated?'],
    map:         ['Which states have the highest skill gaps?', 'Can I drill down by region?', 'How does the national skill map work?'],
    demand:      ['What are the top 5 emerging skills nationally?', 'Which industries have skill shortages?', 'How is demand data collected?'],
    gaps:        ['What is the most critical national gap?', 'How does the gap compare to last year?', 'Which region needs the most attention?'],
    warning:     ['Which skills are in the early warning zone?', 'How is future skill risk calculated?', 'What intervention is recommended?'],
    policy:      ['What policy actions are recommended?', 'How are training requirements estimated?', 'Which institutions are targeted?'],
    default:     ['What does the national skill dashboard show?', 'How is data privacy maintained?', 'What is the source of demand data?'],
  },
  landing: {
    landing: ['What is SkillPassport?', 'How does Proof-of-Skill work?', 'Who is SkillPassport for?'],
    default: ['What is SkillPassport?', 'How do I get started?', 'What makes SkillPassport different?'],
  },
}

/* ═══════════════════════════════════════════════════════════════
   TYPING EFFECT HOOK
═══════════════════════════════════════════════════════════════ */
function useTypingEffect(text, speed = 12, active = true) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active || !text) { setDisplayed(text || ''); setDone(true); return }
    setDisplayed('')
    setDone(false)
    let i = 0
    const tick = () => {
      i++
      setDisplayed(text.slice(0, i))
      if (i < text.length) timerRef.current = setTimeout(tick, speed)
      else setDone(true)
    }
    timerRef.current = setTimeout(tick, speed)
    return () => clearTimeout(timerRef.current)
  }, [text, speed, active])

  return { displayed, done }
}

/* ═══════════════════════════════════════════════════════════════
   MARKDOWN RENDERER — supports **bold** and \n newlines
═══════════════════════════════════════════════════════════════ */
function MarkdownText({ text, color }) {
  const lines = text.split('\n')
  return (
    <span>
      {lines.map((line, li) => (
        <span key={li}>
          {line.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={pi} style={{ color: '#f97316', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
              : <span key={pi}>{part}</span>
          )}
          {li < lines.length - 1 && <br/>}
        </span>
      ))}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE COMPONENTS
═══════════════════════════════════════════════════════════════ */
function AIMessage({ text, isNew, textColor, bubbleBg, bubbleBorder }) {
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion:reduce)').matches
  const { displayed } = useTypingEffect(text, 11, isNew && !prefersReduced)
  const content = (isNew && !prefersReduced) ? displayed : text

  return (
    <div style={{ marginBottom: 12, animation: 'aiMsgIn 0.22s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
          background: 'linear-gradient(135deg,#f97316,#ea580c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={9} color="white"/>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          SkillPassport AI
        </span>
        {isNew && content.length < text.length && (
          <span style={{ display: 'flex', gap: 2 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 3, height: 3, borderRadius: '50%', background: '#f97316',
                animation: `aiDot 1s ${i*0.2}s ease-in-out infinite`,
              }}/>
            ))}
          </span>
        )}
      </div>
      <div style={{
        padding: '10px 13px',
        borderRadius: '4px 14px 14px 14px',
        background: bubbleBg,
        border: `1px solid ${bubbleBorder}`,
        fontSize: 13, lineHeight: 1.7, color: textColor,
      }}>
        <MarkdownText text={content} color={textColor}/>
      </div>
    </div>
  )
}

function UserMessage({ text, textColor, bubbleBg }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, animation: 'aiMsgIn 0.18s ease both' }}>
      <div style={{
        padding: '9px 13px',
        borderRadius: '14px 4px 14px 14px',
        background: bubbleBg,
        border: '1px solid rgba(249,115,22,0.28)',
        fontSize: 13, lineHeight: 1.5, color: textColor, maxWidth: '86%',
      }}>
        {text}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function AIAssistant({ role = 'student', module = 'dashboard', appContext = {} }) {
  const { dark } = useTheme()
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [messages, setMessages] = useState([])
  const [thinking, setThinking] = useState(false)
  const [unread, setUnread]   = useState(1)
  const inputRef  = useRef(null)
  const scrollRef = useRef(null)

  // Theme tokens — full dark/light support
  const panelBg    = dark ? '#111827'  : '#ffffff'
  const headerBg   = dark ? '#1a2236'  : '#fffbf5'
  const border     = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textColor  = dark ? '#f1f5f9'  : '#111827'
  const subColor   = dark ? '#94a3b8'  : '#64748b'
  const inputBg    = dark ? 'rgba(255,255,255,0.05)' : '#f8fafc'
  const inputBdr   = dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)'
  const aiBubbleBg = dark ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.06)'
  const aiBubbleBr = dark ? 'rgba(249,115,22,0.16)' : 'rgba(249,115,22,0.2)'
  const uBubbleBg  = dark ? 'rgba(249,115,22,0.16)' : 'rgba(249,115,22,0.12)'
  const btnCloseBg = dark ? '#1e293b' : '#f1f5f9'

  const suggestions = SUGGESTIONS[role]?.[module] ?? SUGGESTIONS[role]?.default ?? SUGGESTIONS.student.default

  // First open — greeting
  useEffect(() => {
    if (!open) return
    if (messages.length === 0) {
      const greetText = role === 'landing'
        ? `Hi! I'm **SkillPassport AI**.\n\nAsk me anything about SkillPassport — how it works, who it's for, or what the features are. I'm here to help!`
        : `Hi! I'm your **SkillPassport AI Assistant**.\n\nI'm ${
            role === 'student'   ? 'here to help with your skills, evidence, assessments and career journey'   :
            role === 'recruiter' ? 'here to help with candidate search, matching and hiring'                   :
            role === 'college'   ? 'here to help with student skill intelligence and institutional insights'    :
            'here to help with national skill intelligence and workforce policy insights'
          }. Ask me anything — I understand your current page and data.`
      setMessages([{ id: 0, role: 'ai', text: greetText, isNew: true }])
      setUnread(0)
    }
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking])

  // Unread badge on module change
  useEffect(() => {
    if (!open) setUnread(u => Math.min(u + 1, 3))
  }, [module])

  const send = useCallback(async (text) => {
    const q = (text ?? input).trim()
    if (!q || thinking) return
    setInput('')
    const userMsg = { id: Date.now(), role: 'user', text: q }
    setMessages(m => [...m, userMsg])
    setThinking(true)

    // Realistic thinking delay 300–650ms
    await new Promise(r => setTimeout(r, 300 + Math.random() * 350))

    const answer = generateResponse(q, role, module, appContext)
    setMessages(m => [...m, { id: Date.now() + 1, role: 'ai', text: answer, isNew: true }])
    setThinking(false)
  }, [input, thinking, role, module, appContext])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const clearConversation = () => { setMessages([]); setInput('') }

  return (
    <>
      <style>{`
        @keyframes aiMsgIn  { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes aiPanelIn{ from{opacity:0;transform:translateY(12px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes aiDot    { 0%,80%,100%{transform:translateY(0);} 40%{transform:translateY(-4px);} }
        @keyframes aiBtnPop { 0%,100%{box-shadow:0 8px 28px rgba(249,115,22,0.4);} 50%{box-shadow:0 8px 36px rgba(249,115,22,0.6);} }
        @media(prefers-reduced-motion:reduce){
          .ai-panel,.ai-msg,.ai-dot{animation:none!important;opacity:1!important;transform:none!important;}
        }
      `}</style>

      {/* ── Panel ── */}
      {open && (
        <div
          role="dialog"
          aria-label="SkillPassport AI Assistant"
          aria-modal="true"
          className="ai-panel"
          style={{
            position: 'fixed', bottom: 84, right: 20, zIndex: 1000,
            width: 370, maxWidth: 'calc(100vw - 24px)',
            background: panelBg,
            borderRadius: 20,
            border: `1px solid ${border}`,
            boxShadow: dark
              ? '0 24px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(249,115,22,0.07)'
              : '0 16px 50px rgba(0,0,0,0.14), 0 0 0 1px rgba(249,115,22,0.08)',
            display: 'flex', flexDirection: 'column',
            maxHeight: 'min(560px, calc(100vh - 108px))',
            animation: 'aiPanelIn 0.24s cubic-bezier(0.22,1,0.36,1) both',
            fontFamily: 'Inter,sans-serif',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 15px 11px',
            borderBottom: `1px solid ${border}`,
            background: headerBg,
            borderRadius: '20px 20px 0 0',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg,#f97316,#ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(249,115,22,0.35)', flexShrink: 0,
              }}>
                <Sparkles size={15} color="white"/>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textColor }}>
                  ✦ Ask SkillPassport AI
                </p>
                <p style={{ margin: 0, fontSize: 10, color: subColor }}>
                  {role === 'landing' ? 'SkillPassport' : role.charAt(0).toUpperCase() + role.slice(1)}
                  {module !== 'landing' && module !== 'dashboard' ? ` · ${module}` : ''}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              <button onClick={clearConversation} aria-label="Clear conversation"
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: `1px solid ${border}`, background: 'transparent',
                  cursor: 'pointer', color: subColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="New conversation"
              >
                <RotateCcw size={12}/>
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close"
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: `1px solid ${border}`, background: 'transparent',
                  cursor: 'pointer', color: subColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={13}/>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: '14px 14px 4px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(249,115,22,0.2) transparent',
          }}>
            {/* Empty state */}
            {messages.length === 0 && !thinking && (
              <div style={{ textAlign: 'center', padding: '24px 16px 12px' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, margin: '0 auto 12px',
                  background: 'linear-gradient(135deg,#f97316,#ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                }}>
                  <MessageCircle size={22} color="white"/>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: textColor, margin: '0 0 4px' }}>
                  How can I help?
                </p>
                <p style={{ fontSize: 12, color: subColor, margin: 0 }}>
                  Ask me anything or pick a suggestion below.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map(m =>
              m.role === 'user'
                ? <UserMessage key={m.id} text={m.text} textColor={textColor} bubbleBg={uBubbleBg}/>
                : <AIMessage   key={m.id} text={m.text} isNew={m.isNew} textColor={textColor} bubbleBg={aiBubbleBg} bubbleBorder={aiBubbleBr}/>
            )}

            {/* Thinking */}
            {thinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, animation: 'aiMsgIn 0.18s ease both' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  background: 'linear-gradient(135deg,#f97316,#ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={9} color="white"/>
                </div>
                <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <span key={i} className="ai-dot" style={{
                      width: 5, height: 5, borderRadius: '50%', background: '#f97316',
                      animation: `aiDot 1s ${i*0.2}s ease-in-out infinite`,
                    }}/>
                  ))}
                </span>
              </div>
            )}

            {/* Suggestions */}
            {!thinking && suggestions.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: subColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                  Suggested
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => send(s)}
                      style={{
                        textAlign: 'left', padding: '7px 10px', borderRadius: 9,
                        background: 'transparent',
                        border: `1px solid ${dark ? 'rgba(249,115,22,0.18)' : 'rgba(249,115,22,0.22)'}`,
                        color: subColor, fontSize: 12, cursor: 'pointer', lineHeight: 1.4,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(249,115,22,0.08)'; e.currentTarget.style.color='#f97316'; e.currentTarget.style.borderColor='rgba(249,115,22,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=subColor; e.currentTarget.style.borderColor=dark?'rgba(249,115,22,0.18)':'rgba(249,115,22,0.22)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '8px 12px 13px', flexShrink: 0, borderTop: `1px solid ${border}` }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything…"
                rows={1}
                style={{
                  flex: 1, resize: 'none', padding: '9px 12px', borderRadius: 11,
                  fontSize: 13, outline: 'none', fontFamily: 'Inter,sans-serif',
                  background: inputBg, color: textColor,
                  border: `1.5px solid ${inputBdr}`,
                  transition: 'border-color 0.18s, box-shadow 0.18s',
                  maxHeight: 100, overflowY: 'auto', lineHeight: 1.5,
                }}
                onFocus={e => { e.target.style.borderColor='#f97316'; e.target.style.boxShadow='0 0 0 3px rgba(249,115,22,0.12)' }}
                onBlur={e  => { e.target.style.borderColor=inputBdr;  e.target.style.boxShadow='none' }}
              />
              <button onClick={() => send()} disabled={!input.trim() || thinking}
                aria-label="Send"
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: input.trim() && !thinking
                    ? 'linear-gradient(135deg,#f97316,#ea580c)' : (dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'),
                  border: 'none',
                  cursor: input.trim() && !thinking ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: input.trim() && !thinking ? '0 3px 10px rgba(249,115,22,0.3)' : 'none',
                  transition: 'all 0.18s',
                }}>
                <Send size={14} color={input.trim() && !thinking ? 'white' : subColor}/>
              </button>
            </div>
            <p style={{ margin: '5px 0 0', fontSize: 10, color: subColor, textAlign: 'center', opacity: 0.7 }}>
              Frontend AI — connect a backend for real-time intelligence
            </p>
          </div>
        </div>
      )}

      {/* ── Trigger button ── */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(0) }}
        aria-label={open ? 'Close AI Assistant' : '✦ Ask SkillPassport AI'}
        title="✦ Ask SkillPassport AI"
        style={{
          position: 'fixed', bottom: 22, right: 22, zIndex: 1001,
          width: 54, height: 54, borderRadius: 16,
          background: open
            ? btnCloseBg
            : 'linear-gradient(135deg,#f97316,#ea580c)',
          border: open ? `1.5px solid ${border}` : 'none',
          boxShadow: open ? 'none' : '0 8px 28px rgba(249,115,22,0.45)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
          animation: !open ? 'aiBtnPop 2.5s ease-in-out 3s infinite' : 'none',
        }}
      >
        {open
          ? <ChevronDown size={20} color={dark ? '#94a3b8' : '#64748b'}/>
          : <Sparkles size={22} color="white"/>
        }
        {!open && unread > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800, color: 'white',
          }}>
            {unread}
          </div>
        )}
      </button>
    </>
  )
}
