/**
 * NotificationContext
 * ─────────────────────────────────────────────────────────────
 * Shared notification system for the entire application.
 * Any component can call addNotification() and every subscriber
 * (bell icon, panel, etc.) will update instantly.
 *
 * Persistence: localStorage key "sp-notifications-{email}"
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const NotificationContext = createContext(null)

/* ── Notification types ──────────────────────────────────────── */
export const N_TYPES = {
  ASSESSMENT:  'assessment',
  EVIDENCE:    'evidence',
  CHALLENGE:   'challenge',
  GITHUB:      'github',
  SKILL_GAP:   'skill_gap',
  PASSPORT:    'passport',
  RECRUITER:   'recruiter',
  PROFILE:     'profile',
  SYSTEM:      'system',
}

/* ── Type → icon/color config ────────────────────────────────── */
export const N_CONFIG = {
  assessment: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Assessment'  },
  evidence:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'Evidence'   },
  challenge:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'Challenge'  },
  github:     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  label: 'GitHub'     },
  skill_gap:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Skill Gap'  },
  passport:   { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  label: 'Passport'   },
  recruiter:  { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   label: 'Recruiter'  },
  profile:    { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Profile'    },
  system:     { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'System'     },
}

/* ── Default seed notifications ──────────────────────────────── */
const SEED_NOTIFICATIONS = [
  {
    id: 'n0',
    type: N_TYPES.EVIDENCE,
    title: 'Evidence verified',
    body: 'Your Python certificate has been verified and added to your Passport.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    navigateTo: null,
  },
  {
    id: 'n1',
    type: N_TYPES.SKILL_GAP,
    title: 'Skill gap identified',
    body: 'Cloud Deployment is identified as a critical gap. Complete the bridge challenge to improve.',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
    navigateTo: 'bridge',
  },
  {
    id: 'n2',
    type: N_TYPES.CHALLENGE,
    title: 'Challenge completed',
    body: 'SQL Analytics Dashboard challenge is marked complete. Your SQL proof score has improved.',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    navigateTo: 'challenges',
  },
]

/* ── Helpers ─────────────────────────────────────────────────── */
function loadNotifications(email) {
  if (!email) return SEED_NOTIFICATIONS
  try {
    const raw = localStorage.getItem(`sp-notifications-${email}`)
    return raw ? JSON.parse(raw) : SEED_NOTIFICATIONS
  } catch { return SEED_NOTIFICATIONS }
}

function saveNotifications(email, items) {
  if (!email) return
  try {
    localStorage.setItem(`sp-notifications-${email}`, JSON.stringify(items))
  } catch {}
}

/* ════════════════════════════════════════════════════════════════
   PROVIDER
════════════════════════════════════════════════════════════════ */
export function NotificationProvider({ children, userEmail }) {
  const emailRef = useRef(userEmail)

  const [items, setItemsRaw] = useState(() => loadNotifications(userEmail))
  const [panelOpen, setPanelOpen] = useState(false)

  const setItems = useCallback((updater) => {
    setItemsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveNotifications(emailRef.current, next)
      return next
    })
  }, [])

  // Re-load when user switches
  useEffect(() => {
    if (userEmail && userEmail !== emailRef.current) {
      emailRef.current = userEmail
      setItemsRaw(loadNotifications(userEmail))
    }
  }, [userEmail])

  /* ── Derived ─────────────────────────────────────────────────── */
  const unreadCount = items.filter(n => !n.read).length

  /* ── Actions ─────────────────────────────────────────────────── */
  const addNotification = useCallback((type, title, body, navigateTo = null) => {
    const n = {
      id: `n${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      type,
      title,
      body,
      time: new Date().toISOString(),
      read: false,
      navigateTo,
    }
    setItems(prev => [n, ...prev].slice(0, 100)) // cap at 100
  }, [setItems])

  const markRead = useCallback((id) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [setItems])

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }, [setItems])

  const dismiss = useCallback((id) => {
    setItems(prev => prev.filter(n => n.id !== id))
  }, [setItems])

  const clearAll = useCallback(() => {
    setItems([])
  }, [setItems])

  const openPanel  = useCallback(() => setPanelOpen(true),  [])
  const closePanel = useCallback(() => setPanelOpen(false), [])
  const togglePanel = useCallback(() => setPanelOpen(p => !p), [])

  /* ── Convenience shortcuts for common notifications ─────────── */
  const notify = {
    assessmentDone: (skill, score) =>
      addNotification(N_TYPES.ASSESSMENT,
        'Assessment completed',
        `${skill} assessment completed with score ${score}%.`,
        'analytics'),

    evidenceAdded: (name) =>
      addNotification(N_TYPES.EVIDENCE,
        'Evidence added',
        `New evidence added to your Passport: ${name}.`,
        'evidence'),

    scanDone: (name, status) =>
      addNotification(N_TYPES.EVIDENCE,
        status === 'verified' ? 'Evidence verified' : 'Evidence scan complete',
        `${name} scan ${status === 'verified' ? 'passed' : 'completed — manual review recommended'}.`,
        'evidence'),

    challengeStarted: (title) =>
      addNotification(N_TYPES.CHALLENGE,
        'Challenge started',
        `You started: ${title}.`,
        'challenges'),

    challengeDone: (title) =>
      addNotification(N_TYPES.CHALLENGE,
        'Challenge completed',
        `${title} — your skill evidence has been updated.`,
        'challenges'),

    gapDetected: (skill) =>
      addNotification(N_TYPES.SKILL_GAP,
        'Skill gap identified',
        `${skill} is identified as a gap. Complete the bridge challenge to improve.`,
        'bridge'),

    readinessChanged: (score) =>
      addNotification(N_TYPES.PASSPORT,
        'Readiness updated',
        `Your industry readiness score is now ${score}%.`,
        'passport'),

    passportUpdated: () =>
      addNotification(N_TYPES.PASSPORT,
        'Passport updated',
        'Your Digital Skill Passport has been updated with new evidence.',
        'passport'),

    githubConnected: (repos) =>
      addNotification(N_TYPES.GITHUB,
        'GitHub connected',
        `${repos} repositories imported and added to your Passport.`,
        'evidence'),

    recruiterView: (company) =>
      addNotification(N_TYPES.RECRUITER,
        'Recruiter activity',
        `A recruiter from ${company} viewed your SkillPassport.`,
        'passport'),
  }

  const value = {
    items,
    unreadCount,
    panelOpen,
    openPanel,
    closePanel,
    togglePanel,
    addNotification,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
    notify,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}
