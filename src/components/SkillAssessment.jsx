import { useState } from 'react'
import { Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw, Zap, Star, Clock, Target } from 'lucide-react'

const ASSESSMENTS = {
  Python: [
    { q: 'What does the `zip()` function return in Python?', opts: ['A list of tuples', 'A zip object (iterator)', 'A dictionary', 'A set'], ans: 1 },
    { q: 'Which keyword is used to define a generator function?', opts: ['async', 'yield', 'return', 'lambda'], ans: 1 },
    { q: 'What is the output of `[x**2 for x in range(3)]`?', opts: ['[1,4,9]', '[0,1,4]', '[0,1,2]', '[1,2,3]'], ans: 1 },
    { q: 'Which of these is an immutable data type?', opts: ['list', 'dict', 'tuple', 'set'], ans: 2 },
    { q: 'What does `__init__` do in a class?', opts: ['Destroys the object', 'Initialises the object', 'Returns the class', 'Copies the object'], ans: 1 },
  ],
  'Machine Learning': [
    { q: 'What does overfitting mean in ML?', opts: ['Model performs well on train, poor on test', 'Model performs poorly on both', 'Model underfits all data', 'None of the above'], ans: 0 },
    { q: 'Which metric is used for classification accuracy?', opts: ['RMSE', 'F1-Score', 'R²', 'MAE'], ans: 1 },
    { q: 'What is the purpose of a validation set?', opts: ['To train the model', 'To tune hyperparameters', 'To deploy the model', 'To clean data'], ans: 1 },
    { q: 'Which algorithm uses decision boundaries called hyperplanes?', opts: ['KNN', 'Decision Tree', 'SVM', 'K-Means'], ans: 2 },
    { q: 'What is gradient descent?', opts: ['A data cleaning method', 'An optimisation algorithm', 'A type of neural network', 'A feature selection method'], ans: 1 },
  ],
  OpenCV: [
    { q: 'Which function loads an image in OpenCV?', opts: ['cv2.load()', 'cv2.imread()', 'cv2.open()', 'cv2.fetch()'], ans: 1 },
    { q: 'What does `cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)` do?', opts: ['Resizes image', 'Converts to grayscale', 'Detects edges', 'Blurs image'], ans: 1 },
    { q: 'Which method detects edges in an image?', opts: ['cv2.blur()', 'cv2.Canny()', 'cv2.resize()', 'cv2.flip()'], ans: 1 },
    { q: 'What is a kernel in image processing?', opts: ['A matrix for convolution', 'A type of pixel', 'A colour space', 'A file format'], ans: 0 },
    { q: 'What does `cv2.waitKey(0)` do?', opts: ['Closes the window', 'Waits indefinitely for a key press', 'Opens a camera', 'Saves the image'], ans: 1 },
  ],
}

function getConfidence(pct) {
  if (pct >= 85) return { label: 'High Confidence 🔥', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-700' }
  if (pct >= 60) return { label: 'Moderate Confidence', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700' }
  return { label: 'Low Confidence', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700' }
}

export default function SkillAssessment() {
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)

  const skills = Object.keys(ASSESSMENTS)
  const questions = selectedSkill ? ASSESSMENTS[selectedSkill] : []
  const current = questions[step]

  const choose = (idx) => {
    if (selected !== null) return
    setSelected(idx)
  }

  const next = () => {
    const newAnswers = [...answers, selected]
    if (step + 1 >= questions.length) {
      setAnswers(newAnswers)
      setFinished(true)
    } else {
      setAnswers(newAnswers)
      setStep(s => s + 1)
      setSelected(null)
    }
  }

  const reset = () => {
    setStep(0); setAnswers([]); setSelected(null); setFinished(false); setSelectedSkill(null)
  }

  const score = finished ? Math.round((answers.filter((a, i) => a === questions[i].ans).length / questions.length) * 100) : 0
  const conf = getConfidence(score)

  // Skill picker
  if (!selectedSkill) return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h2 className="section-title text-lg">Skill Assessment</h2>
            <p className="section-sub text-xs">Adaptive quiz · 5 questions · ~5 mins · Adds confidence score to your Passport</p>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mb-5 text-sm text-orange-700 dark:text-orange-300">
          <strong>How it works:</strong> Claim a skill → Take adaptive assessment → Result combined with GitHub + challenges + certificates → Final <em>Proof-of-Skill</em> confidence score.
        </div>
        <p className="label mb-3">Select a skill to assess</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {skills.map(s => (
            <button key={s} onClick={() => setSelectedSkill(s)}
              className="card hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-orange-200/40 hover:shadow-lg text-left transition-all group p-4">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                <Brain size={18} className="text-orange-500" />
              </div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{s}</p>
              <p className="text-xs text-gray-400 mt-0.5">5 adaptive questions</p>
            </button>
          ))}
        </div>
      </div>
      {/* Past results */}
      <div className="card">
        <h2 className="section-title text-base mb-4">Previous Assessment Results</h2>
        <div className="space-y-3">
          {[
            { skill:'Python',    score:88, github:true, challenge:84, final:87, conf:'High Confidence 🔥' },
            { skill:'SQL',       score:76, github:false,challenge:91, final:82, conf:'High Confidence 🔥' },
          ].map(r => (
            <div key={r.skill} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{r.skill}</span>
                <span className="badge-green text-xs">{r.conf}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  ['Assessment', `${r.score}%`, 'text-orange-500'],
                  ['GitHub',     r.github ? '✓' : '—', r.github ? 'text-green-500' : 'text-gray-400'],
                  ['Challenge',  `${r.challenge}/100`, 'text-amber-500'],
                  ['Final PoS',  `${r.final}%`, 'text-orange-600 font-black'],
                ].map(([label, val, col]) => (
                  <div key={label} className="text-center p-2 rounded-lg bg-white dark:bg-gray-900">
                    <p className="text-gray-400">{label}</p>
                    <p className={`font-bold mt-0.5 ${col}`}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Finished screen
  if (finished) {
    const correct = answers.filter((a, i) => a === questions[i].ans).length
    return (
      <div className="space-y-5 animate-fade-in max-w-xl">
        <div className={`card border-2 ${conf.border} text-center`}>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={score >= 85 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444'} strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 50 * score / 100} ${2 * Math.PI * 50}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black gradient-text">{score}%</span>
              <span className="text-xs text-gray-400">Score</span>
            </div>
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">{selectedSkill} Assessment Complete</h2>
          <p className={`text-sm font-bold ${conf.color} mb-3`}>{conf.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{correct} of {questions.length} correct</p>

          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl ${conf.bg} border ${conf.border} mb-4`}>
            {[
              ['Assessment', `${score}%`, conf.color],
              ['GitHub',     'Linked ✓',   'text-green-600 dark:text-green-400'],
              ['Certificate','Verified ✓', 'text-orange-500'],
              ['Final PoS',  `${Math.round((score * 0.4 + 85 * 0.3 + 90 * 0.3))}%`, 'text-orange-600 font-black'],
            ].map(([label, val, col]) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-400">{label}</p>
                <p className={`text-sm font-bold mt-0.5 ${col}`}>{val}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="btn-secondary text-sm"><RotateCcw size={14} /> Try Another</button>
            <button className="btn-primary glow-orange text-sm">Add to Passport <Zap size={14} /></button>
          </div>
        </div>

        {/* Answer review */}
        <div className="card">
          <h3 className="section-title text-base mb-3">Answer Review</h3>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const correct = answers[i] === q.ans
              return (
                <div key={i} className={`p-3 rounded-xl border ${correct ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'}`}>
                  <div className="flex items-start gap-2">
                    {correct ? <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" /> : <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Q{i + 1}: {q.q}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your answer: <span className={correct ? 'text-green-600' : 'text-red-500'}>{q.opts[answers[i]]}</span></p>
                      {!correct && <p className="text-xs text-green-600 dark:text-green-400">Correct: {q.opts[q.ans]}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Quiz in progress
  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{selectedSkill} Assessment</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} /> Question {step + 1} of {questions.length}</span>
        </div>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? 'bg-green-500' : i === step ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{step + 1}</div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">{current.q}</p>
        </div>
        <div className="space-y-2.5">
          {current.opts.map((opt, i) => {
            let cls = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-300 dark:hover:border-orange-700 cursor-pointer'
            if (selected !== null) {
              if (i === current.ans) cls = 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20 cursor-default'
              else if (i === selected && selected !== current.ans) cls = 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 cursor-default'
              else cls = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-default'
            }
            return (
              <button key={i} onClick={() => choose(i)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold
                  ${selected !== null && i === current.ans ? 'border-green-500 bg-green-500 text-white'
                    : selected === i && selected !== current.ans ? 'border-red-500 bg-red-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">{opt}</span>
                {selected !== null && i === current.ans && <CheckCircle2 size={15} className="text-green-500 ml-auto shrink-0" />}
                {selected === i && selected !== current.ans && <XCircle size={15} className="text-red-500 ml-auto shrink-0" />}
              </button>
            )
          })}
        </div>
        {selected !== null && (
          <button onClick={next} className="btn-primary w-full justify-center py-3 mt-4 glow-orange">
            {step + 1 >= questions.length ? 'See Results' : 'Next Question'} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
