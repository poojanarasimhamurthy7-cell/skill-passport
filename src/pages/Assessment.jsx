import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Shield, AlertTriangle, Camera, Clock, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, Code, Monitor, Zap, Trophy,
  RefreshCw, Play, Square, AlertOctagon, Eye, Wifi
} from 'lucide-react'

// ── QUESTION BANK ─────────────────────────────────────────────────
const QUESTION_BANK = {
  tech: [
    // Easy (20)
    { id:1,  diff:'easy',   topic:'Python',  q:'What is the output of `type([])`?',                               opts:['list','array','tuple','dict'],                    ans:0 },
    { id:2,  diff:'easy',   topic:'Python',  q:'Which keyword defines a function in Python?',                    opts:['func','def','function','lambda'],                 ans:1 },
    { id:3,  diff:'easy',   topic:'Java',    q:'Which method is the entry point of a Java program?',             opts:['start()','init()','main()','run()'],              ans:2 },
    { id:4,  diff:'easy',   topic:'Java',    q:'What does JVM stand for?',                                       opts:['Java Virtual Machine','Java Variable Memory','Java Verified Module','None'], ans:0 },
    { id:5,  diff:'easy',   topic:'C',       q:'What is the correct syntax to print in C?',                      opts:['print()','echo()','printf()','cout'],             ans:2 },
    { id:6,  diff:'easy',   topic:'C',       q:'Which header file is required for printf in C?',                 opts:['stdlib.h','string.h','stdio.h','math.h'],        ans:2 },
    { id:7,  diff:'easy',   topic:'OS',      q:'What does CPU stand for?',                                       opts:['Central Processing Unit','Core Program Utility','Central Program Unit','None'], ans:0 },
    { id:8,  diff:'easy',   topic:'OS',      q:'Which scheduling algorithm gives priority to shortest jobs?',    opts:['FCFS','Round Robin','SJF','Priority'],            ans:2 },
    { id:9,  diff:'easy',   topic:'DBMS',    q:'SQL stands for?',                                                opts:['Structured Query Language','Simple Query Language','System Query Logic','None'], ans:0 },
    { id:10, diff:'easy',   topic:'DBMS',    q:'Which command retrieves data in SQL?',                           opts:['INSERT','UPDATE','SELECT','DELETE'],              ans:2 },
    { id:11, diff:'easy',   topic:'DSA',     q:'What is the time complexity of binary search?',                  opts:['O(n)','O(n²)','O(log n)','O(1)'],                ans:2 },
    { id:12, diff:'easy',   topic:'DSA',     q:'Which data structure uses LIFO order?',                          opts:['Queue','Stack','Tree','Graph'],                   ans:1 },
    { id:13, diff:'easy',   topic:'C++',     q:'What is the output of `cout << 2+3`?',                          opts:['23','5','Error','None'],                         ans:1 },
    { id:14, diff:'easy',   topic:'C++',     q:'Which OOP concept hides internal implementation?',               opts:['Polymorphism','Encapsulation','Inheritance','Abstraction'], ans:3 },
    { id:15, diff:'easy',   topic:'Python',  q:'Which function returns the length of a list?',                   opts:['size()','count()','len()','length()'],            ans:2 },
    { id:16, diff:'easy',   topic:'OS',      q:'What is a deadlock in OS?',                                      opts:['Process waiting indefinitely','Fast execution','Memory overflow','None'], ans:0 },
    { id:17, diff:'easy',   topic:'DBMS',    q:'What is a primary key?',                                         opts:['Duplicate record identifier','Unique row identifier','Foreign key alias','None'], ans:1 },
    { id:18, diff:'easy',   topic:'DSA',     q:'Which traversal visits root first?',                             opts:['Inorder','Postorder','Preorder','Level order'],   ans:2 },
    { id:19, diff:'easy',   topic:'Python',  q:'What does `range(5)` produce?',                                  opts:['1 to 5','0 to 5','0 to 4','1 to 4'],             ans:2 },
    { id:20, diff:'easy',   topic:'Java',    q:'Which collection allows duplicate elements?',                    opts:['Set','Map','List','None'],                        ans:2 },
    // Medium (30)
    { id:21, diff:'medium', topic:'Python',  q:'What is a decorator in Python?',                                 opts:['A class modifier','A function wrapper','A loop type','A data type'], ans:1 },
    { id:22, diff:'medium', topic:'Python',  q:'What does `*args` allow in a function?',                         opts:['Keyword arguments','Variable positional args','Fixed args','None'], ans:1 },
    { id:23, diff:'medium', topic:'DSA',     q:'What is the worst-case complexity of QuickSort?',                opts:['O(n log n)','O(n)','O(n²)','O(log n)'],          ans:2 },
    { id:24, diff:'medium', topic:'DSA',     q:'Which data structure is used in BFS?',                           opts:['Stack','Queue','Heap','Tree'],                    ans:1 },
    { id:25, diff:'medium', topic:'Java',    q:'What is the difference between `==` and `.equals()`?',           opts:['No difference','== compares reference, equals compares value','== compares value','None'], ans:1 },
    { id:26, diff:'medium', topic:'Java',    q:'Which keyword prevents method overriding?',                      opts:['static','abstract','final','private'],            ans:2 },
    { id:27, diff:'medium', topic:'C++',     q:'What is a virtual function in C++?',                             opts:['Compile-time function','Runtime polymorphism enabler','Inline function','None'], ans:1 },
    { id:28, diff:'medium', topic:'C++',     q:'What does `new` operator do in C++?',                            opts:['Declares a variable','Allocates heap memory','Allocates stack memory','None'], ans:1 },
    { id:29, diff:'medium', topic:'OS',      q:'What is thrashing in OS?',                                       opts:['High CPU usage','Excessive paging, low CPU work','Memory corruption','None'], ans:1 },
    { id:30, diff:'medium', topic:'OS',      q:'Explain semaphore in OS?',                                       opts:['A file type','Synchronisation mechanism','CPU scheduler','None'], ans:1 },
    { id:31, diff:'medium', topic:'DBMS',    q:'What is normalisation in DBMS?',                                 opts:['Encrypting data','Organising to reduce redundancy','Indexing tables','None'], ans:1 },
    { id:32, diff:'medium', topic:'DBMS',    q:'What does ACID stand for in transactions?',                      opts:['Atomicity Consistency Isolation Durability','All Commands In Database','None','None'], ans:0 },
    { id:33, diff:'medium', topic:'Python',  q:'What is the GIL in Python?',                                     opts:['Global Iteration Loop','Global Interpreter Lock','General Import Library','None'], ans:1 },
    { id:34, diff:'medium', topic:'DSA',     q:'What is a hash collision?',                                      opts:['Two keys map to same index','Hash function error','Array overflow','None'], ans:0 },
    { id:35, diff:'medium', topic:'C',       q:'What is a pointer in C?',                                        opts:['A function type','Variable storing memory address','A loop type','None'], ans:1 },
    { id:36, diff:'medium', topic:'C',       q:'What is dynamic memory allocation?',                             opts:['Stack allocation','Compile-time allocation','Runtime heap allocation','None'], ans:2 },
    { id:37, diff:'medium', topic:'Java',    q:'What is the purpose of garbage collection in Java?',             opts:['Optimise CPU','Automatically free unused memory','Encrypt data','None'], ans:1 },
    { id:38, diff:'medium', topic:'Python',  q:'What is a generator in Python?',                                 opts:['A random number tool','Lazy iterator using yield','A class decorator','None'], ans:1 },
    { id:39, diff:'medium', topic:'OS',      q:'What is the difference between process and thread?',             opts:['Process is lighter','Thread shares memory space of process','No difference','None'], ans:1 },
    { id:40, diff:'medium', topic:'DBMS',    q:'What is an index in DBMS?',                                      opts:['Data backup','Data structure to speed up queries','Table constraint','None'], ans:1 },
    { id:41, diff:'medium', topic:'DSA',     q:'What is memoisation?',                                           opts:['A sorting method','Caching subproblem results','Graph traversal','None'], ans:1 },
    { id:42, diff:'medium', topic:'C++',     q:'What is RAII in C++?',                                           opts:['Resource Acquisition Is Initialisation','Runtime Array Iteration Index','None','None'], ans:0 },
    { id:43, diff:'medium', topic:'Python',  q:'What does `__init__` do?',                                       opts:['Destroys object','Initialises object attributes','Copies object','None'], ans:1 },
    { id:44, diff:'medium', topic:'Java',    q:'What is an interface in Java?',                                   opts:['A class with implementation','Abstract contract with no implementation','A data type','None'], ans:1 },
    { id:45, diff:'medium', topic:'OS',      q:'What is context switching?',                                     opts:['CPU switching between processes','Memory swap','File system change','None'], ans:0 },
    { id:46, diff:'medium', topic:'DBMS',    q:'What is a foreign key?',                                         opts:['Primary key of same table','Reference to primary key of another table','Duplicate key','None'], ans:1 },
    { id:47, diff:'medium', topic:'C',       q:'What is the difference between `malloc` and `calloc`?',          opts:['No difference','calloc initialises to zero, malloc does not','malloc is faster','None'], ans:1 },
    { id:48, diff:'medium', topic:'DSA',     q:'What is the space complexity of a recursive Fibonacci?',         opts:['O(1)','O(n)','O(n²)','O(log n)'],               ans:1 },
    { id:49, diff:'medium', topic:'Python',  q:'What is the difference between `deepcopy` and `copy`?',          opts:['No difference','deepcopy copies nested objects','copy is faster','None'], ans:1 },
    { id:50, diff:'medium', topic:'Java',    q:'What does `volatile` keyword do in Java?',                       opts:['Makes variable constant','Ensures visibility across threads','Encrypts variable','None'], ans:1 },
    // Hard (10)
    { id:51, diff:'hard',   topic:'DSA',     q:'What is the amortised complexity of dynamic array append?',      opts:['O(n)','O(log n)','O(1)','O(n²)'],               ans:2 },
    { id:52, diff:'hard',   topic:'OS',      q:'Explain the Banker\'s Algorithm.',                               opts:['Deadlock avoidance','Memory compression','CPU scheduling','None'], ans:0 },
    { id:53, diff:'hard',   topic:'Python',  q:'What is the difference between `__new__` and `__init__`?',       opts:['No difference','__new__ creates instance, __init__ initialises','__new__ initialises','None'], ans:1 },
    { id:54, diff:'hard',   topic:'Java',    q:'What is the Java Memory Model?',                                 opts:['JVM heap layout','Rules for thread visibility of shared variables','GC algorithm','None'], ans:1 },
    { id:55, diff:'hard',   topic:'DSA',     q:'Explain the difference between DFS and BFS in graph traversal.', opts:['DFS uses queue','BFS uses queue, DFS uses stack','No difference','None'], ans:1 },
    { id:56, diff:'hard',   topic:'DBMS',    q:'What is a B+ tree and why is it used in databases?',             opts:['Binary search tree variant','Balanced tree for ordered indexing with leaf linked list','Hash structure','None'], ans:1 },
    { id:57, diff:'hard',   topic:'C++',     q:'What is undefined behaviour in C++?',                            opts:['Compile error','Runtime behaviour not defined by standard','Syntax error','None'], ans:1 },
    { id:58, diff:'hard',   topic:'OS',      q:'What is the difference between mutex and semaphore?',            opts:['No difference','Mutex is ownership-based, semaphore is signalling','Semaphore is faster','None'], ans:1 },
    { id:59, diff:'hard',   topic:'Python',  q:'Explain Python\'s descriptor protocol.',                         opts:['File I/O protocol','__get__ __set__ __delete__ for attribute access','A C extension API','None'], ans:1 },
    { id:60, diff:'hard',   topic:'DSA',     q:'What is the time complexity of Dijkstra\'s algorithm with a min-heap?', opts:['O(V²)','O(E log V)','O(V log E)','O(E²)'], ans:1 },
  ],
  medical: [
    { id:1,  diff:'easy',   topic:'Ayurveda',  q:'What are the three doshas in Ayurveda?',                       opts:['Vata Pitta Kapha','Ojas Tejas Prana','Agni Soma Vayu','None'],       ans:0 },
    { id:2,  diff:'easy',   topic:'Herbology', q:'Which herb is known as "Indian Ginseng"?',                     opts:['Turmeric','Ashwagandha','Neem','Tulsi'],                           ans:1 },
    { id:3,  diff:'easy',   topic:'Anatomy',   q:'How many bones are in the adult human body?',                  opts:['200','206','212','198'],                                           ans:1 },
    { id:4,  diff:'easy',   topic:'Ayurveda',  q:'What is Panchakarma?',                                         opts:['Five herbal formulas','Five detoxification procedures','Five doshas','None'], ans:1 },
    { id:5,  diff:'easy',   topic:'Pharma',    q:'What is the active compound in Turmeric?',                     opts:['Piperine','Curcumin','Quercetin','Allicin'],                       ans:1 },
    { id:6,  diff:'easy',   topic:'Anatomy',   q:'Which organ produces insulin?',                                opts:['Liver','Kidney','Pancreas','Thyroid'],                             ans:2 },
    { id:7,  diff:'easy',   topic:'Ayurveda',  q:'What is Agni in Ayurveda?',                                    opts:['Fire element / digestive power','Water element','Air element','None'], ans:0 },
    { id:8,  diff:'easy',   topic:'Herbology', q:'Which plant is the source of Aspirin?',                        opts:['Willow bark','Neem leaf','Tulsi stem','Aloe vera'], ans:0 },
    { id:9,  diff:'easy',   topic:'Pharma',    q:'What is the function of antibiotics?',                         opts:['Kill viruses','Kill bacteria','Reduce fever','Cure cancer'], ans:1 },
    { id:10, diff:'easy',   topic:'Anatomy',   q:'What is the largest organ of the human body?',                 opts:['Liver','Brain','Skin','Heart'],                                    ans:2 },
    ...Array.from({length:50}, (_,i) => ({
      id: i+11, diff: i<30?'medium':'hard',
      topic:'Clinical', q:`Sample medical question ${i+11} (medium/hard)`,
      opts:['Option A','Option B','Option C','Option D'], ans:0
    }))
  ],
  commerce: [
    { id:1,  diff:'easy',   topic:'Accounting', q:'What is the accounting equation?',                            opts:['Assets = Liabilities + Equity','Revenue = Profit + Loss','None','None'], ans:0 },
    { id:2,  diff:'easy',   topic:'Tally',       q:'What does Tally ERP 9 primarily handle?',                   opts:['Inventory only','Accounting and inventory','Design','None'],          ans:1 },
    { id:3,  diff:'easy',   topic:'Finance',     q:'What is a balance sheet?',                                   opts:['Income statement','Statement of financial position','Cash flow','None'], ans:1 },
    { id:4,  diff:'easy',   topic:'Accounting',  q:'What is double-entry bookkeeping?',                          opts:['Recording each transaction in two accounts','Duplicate records','None','None'], ans:0 },
    { id:5,  diff:'easy',   topic:'Finance',     q:'What does ROI stand for?',                                   opts:['Return on Investment','Rate of Interest','Revenue over Income','None'], ans:0 },
    ...Array.from({length:55}, (_,i) => ({
      id: i+6, diff: i<25?'easy':i<45?'medium':'hard',
      topic:'Commerce', q:`Sample commerce question ${i+6}`,
      opts:['Option A','Option B','Option C','Option D'], ans:0
    }))
  ],
  other: Array.from({length:60}, (_,i) => ({
    id: i+1, diff: i<20?'easy':i<50?'medium':'hard',
    topic:'Engineering', q:`Sample technical question ${i+1} (ME/Civil/Other)`,
    opts:['Option A','Option B','Option C','Option D'], ans:0
  }))
}

const CODING_PROBLEMS = {
  easy: {
    title: 'Reverse a String',
    desc: 'Write a function that reverses a given string without using built-in reverse methods.',
    examples: [{ input: '"hello"', output: '"olleh"' }, { input: '"abcd"', output: '"dcba"' }],
    starter: { python:'def reverse_string(s):\n    # Your code here\n    pass', java:'class Solution {\n    public String reverseString(String s) {\n        // Your code here\n        return "";\n    }\n}', cpp:'#include<string>\nusing namespace std;\nstring reverseString(string s) {\n    // Your code here\n    return "";\n}', c:'#include<string.h>\nvoid reverseString(char* s) {\n    // Your code here\n}' }
  },
  hard: {
    title: 'Longest Common Subsequence',
    desc: 'Given two strings, find the length of their longest common subsequence using dynamic programming.',
    examples: [{ input: 'text1="abcde", text2="ace"', output: '3 (ace)' }, { input: 'text1="abc", text2="abc"', output: '3' }],
    starter: { python:'def lcs(text1, text2):\n    # dp approach\n    m, n = len(text1), len(text2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    # Your code here\n    return dp[m][n]', java:'class Solution {\n    public int lcs(String text1, String text2) {\n        // dp approach\n        return 0;\n    }\n}', cpp:'int lcs(string text1, string text2) {\n    // dp approach\n    return 0;\n}', c:'int lcs(char* text1, char* text2) {\n    // dp approach\n    return 0;\n}' }
  }
}

const TRACKS = [
  { key:'tech',     label:'Engineering / Tech',     desc:'BE · BCA · MCA · B.Tech',    color:'from-orange-400 to-orange-600' },
  { key:'medical',  label:'Medical / Ayush',         desc:'MBBS · BAMS · BPharm',       color:'from-green-500 to-green-700'   },
  { key:'commerce', label:'Commerce / Finance',      desc:'BCom · MBA Finance',         color:'from-blue-500 to-blue-700'     },
  { key:'other',    label:'Other Technical',         desc:'ME · Civil · Architecture',  color:'from-purple-500 to-purple-700' },
]

const TOTAL_TIME = 5400 // 1.5 hours

// ── PROCTORING HOOK ───────────────────────────────────────────────
function useProctoring(active, onTerminate) {
  const [flags,       setFlags]       = useState([])
  const [terminated,  setTerminated]  = useState(false)
  const [camActive,   setCamActive]   = useState(false)

  useEffect(() => {
    if (!active) return

    const addFlag = (reason) => {
      setFlags(prev => {
        const next = [...prev, { reason, time: new Date().toLocaleTimeString() }]
        if (next.length >= 5) {
          setTerminated(true)
          onTerminate('5 proctoring violations detected. Assessment terminated.')
        }
        return next
      })
    }

    // Tab / window focus detection
    const onBlur = () => addFlag('Window focus lost — possible tab switch')
    const onVisibility = () => { if (document.hidden) addFlag('Tab hidden / minimised') }

    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)

    // Camera simulation — start after 1s
    const camTimer = setTimeout(() => setCamActive(true), 1000)

    return () => {
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimeout(camTimer)
    }
  }, [active, onTerminate])

  // Anomaly simulation (dev tool — not shown in production builds)
  const simulateAnomaly = useCallback(() => {
    setFlags(prev => {
      const next = [...prev, { reason: 'Head movement anomaly detected by camera', time: new Date().toLocaleTimeString() }]
      if (next.length >= 5) { setTerminated(true); onTerminate('5 violations — assessment terminated.') }
      return next
    })
  }, [onTerminate])

  return { flags, terminated, camActive, simulateAnomaly }
}

// ── COUNTDOWN TIMER ───────────────────────────────────────────────
function useTimer(active, initialSeconds, onExpire) {
  const [remaining, setRemaining] = useState(initialSeconds)

  useEffect(() => {
    if (!active) return
    if (remaining <= 0) { onExpire(); return }
    const iv = setInterval(() => setRemaining(r => {
      if (r <= 1) { clearInterval(iv); onExpire(); return 0 }
      return r - 1
    }), 1000)
    return () => clearInterval(iv)
  }, [active])

  const mm = String(Math.floor(remaining / 60)).padStart(2,'0')
  const ss = String(remaining % 60).padStart(2,'0')
  const hh = String(Math.floor(remaining / 3600)).padStart(2,'0')
  const pct = (remaining / initialSeconds) * 100

  return { remaining, display: `${hh}:${mm}:${ss}`, pct }
}

// ── CAMERA PANEL ──────────────────────────────────────────────────
function CameraPanel({ active, flags }) {
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    if (!active) return
    const iv = setInterval(() => setBlink(b => !b), 1200)
    return () => clearInterval(iv)
  }, [active])

  return (
    <div className="fixed bottom-4 right-4 z-50 w-48">
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        {/* Camera feed simulation */}
        <div className="relative h-32 bg-gray-800 flex items-center justify-center">
          {active ? (
            <>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Eye size={20} className="text-white"/>
              </div>
              {/* Tracking dots */}
              {[[-20,-20],[20,-20],[0,20],[-20,20],[20,20]].map(([x,y],i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-green-400 opacity-60"
                  style={{ left:`calc(50% + ${x}px)`, top:`calc(50% + ${y}px)` }}/>
              ))}
              {/* Record indicator */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${blink?'bg-red-500':'bg-red-800'} transition-colors`}/>
              <div className="absolute top-2 left-2 text-xs text-green-400 font-mono">LIVE</div>
            </>
          ) : (
            <div className="text-center">
              <Camera size={24} className="text-gray-500 mx-auto mb-1"/>
              <p className="text-xs text-gray-500">Camera off</p>
            </div>
          )}
        </div>
        {/* Flag count */}
        <div className="px-2 py-1.5 flex items-center justify-between">
          <span className="text-xs text-gray-400">AI Overwatch</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_,i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < flags.length ? 'bg-red-500' : 'bg-gray-700'}`}/>
            ))}
          </div>
        </div>
        {flags.length > 0 && (
          <div className="px-2 pb-1.5">
            <p className="text-xs text-red-400 truncate">{flags[flags.length-1]?.reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MCQ SECTION ───────────────────────────────────────────────────
function McqSection({ questions, answers, onAnswer, current, onNav }) {
  const q = questions[current]
  if (!q) return null
  const DIFF_COLOR = { easy:'text-green-500', medium:'text-amber-500', hard:'text-red-500' }
  const answered = Object.keys(answers).length
  const total    = questions.length

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Question {current+1} of {total}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold capitalize ${DIFF_COLOR[q.diff]}`}>{q.diff}</span>
          <span className="badge-orange text-xs">{q.topic}</span>
          <span className="text-xs text-gray-400">{answered}/{total} answered</span>
        </div>
      </div>

      {/* Mini question map */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((qq, i) => (
          <button key={qq.id} onClick={() => onNav(i)}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all
              ${i === current ? 'bg-orange-500 text-white' :
                answers[qq.id] !== undefined ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-400' :
                'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            {i+1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div className="card">
        <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed mb-5">{q.q}</p>
        <div className="space-y-3">
          {q.opts.map((opt, i) => {
            const selected = answers[q.id] === i
            return (
              <button key={i} onClick={() => onAnswer(q.id, i)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3
                  ${selected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold
                  ${selected ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                  {String.fromCharCode(65+i)}
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button onClick={() => onNav(Math.max(0,current-1))} disabled={current===0} className="btn-secondary text-sm flex items-center gap-1">
          <ChevronLeft size={16}/> Previous
        </button>
        <button onClick={() => onNav(Math.min(questions.length-1,current+1))} disabled={current===questions.length-1} className="btn-primary text-sm flex items-center gap-1">
          Next <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  )
}

// ── CODING SANDBOX ────────────────────────────────────────────────
function CodingSandbox({ problem, onSubmit }) {
  const [lang,   setLang]   = useState('python')
  const [code,   setCode]   = useState(problem.starter.python)
  const [output, setOutput] = useState('')
  const [running,setRunning]= useState(false)

  const LANGS = ['python','java','cpp','c']

  const changeLang = (l) => {
    setLang(l)
    setCode(problem.starter[l] || '// Write your solution here')
    setOutput('')
  }

  const run = () => {
    setRunning(true)
    setTimeout(() => {
      setOutput(`> Running ${lang} solution...\n> Test case 1: ${problem.examples[0].input} → ${problem.examples[0].output} ✓\n> Test case 2: ${problem.examples[1].input} → ${problem.examples[1].output} ✓\n> All test cases passed (2/2)\n> Execution time: 12ms\n> Memory: 14.2 MB\n\n[Note: This is a sandboxed simulation. Real execution requires backend integration.]`)
      setRunning(false)
    }, 1500)
  }

  return (
    <div className="space-y-4">
      {/* Problem statement */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-amber-500"/>
          <h3 className="font-bold text-gray-900 dark:text-white">{problem.title}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{problem.desc}</p>
        <div className="space-y-1.5">
          {problem.examples.map((ex,i) => (
            <div key={i} className="text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-2 font-mono">
              <span className="text-gray-500">Input: </span><span className="text-orange-500">{ex.input}</span>
              <span className="text-gray-500 ml-3">Output: </span><span className="text-green-500">{ex.output}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Language selector */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {LANGS.map(l => (
          <button key={l} onClick={() => changeLang(l)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${lang===l ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Code editor simulation */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"/>
            <div className="w-3 h-3 rounded-full bg-yellow-400"/>
            <div className="w-3 h-3 rounded-full bg-green-400"/>
          </div>
          <span className="text-xs text-gray-500 ml-2 font-mono">solution.{lang==='cpp'?'cpp':lang==='c'?'c':lang==='java'?'java':'py'}</span>
        </div>
        <textarea value={code} onChange={e => setCode(e.target.value)} rows={12}
          className="w-full p-4 bg-gray-950 text-green-400 font-mono text-sm resize-none outline-none leading-relaxed"
          spellCheck={false}/>
      </div>

      {/* Run button */}
      <div className="flex gap-3">
        <button onClick={run} disabled={running} className="btn-primary flex items-center gap-2">
          {running ? <RefreshCw size={15} className="animate-spin"/> : <Play size={15}/>}
          {running ? 'Running...' : 'Run Code'}
        </button>
        <button onClick={() => onSubmit(code, lang)} className="btn-secondary flex items-center gap-2">
          <CheckCircle2 size={15}/> Submit Solution
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Output</span>
          </div>
          <pre className="p-4 bg-gray-950 text-green-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">{output}</pre>
        </div>
      )}
    </div>
  )
}

// ── MAIN ASSESSMENT PAGE ─────────────────────────────────────────
export default function Assessment({ onComplete }) {
  const [phase,       setPhase]       = useState('select')   // select | brief | mcq | coding | done
  const [track,       setTrack]       = useState(null)
  const [mcqTab,      setMcqTab]      = useState('mcq')      // mcq | coding-easy | coding-hard
  const [mcqIndex,    setMcqIndex]    = useState(0)
  const [answers,     setAnswers]     = useState({})
  const [codeResults, setCodeResults] = useState({})
  const [terminated,  setTerminated]  = useState(false)
  const [termReason,  setTermReason]  = useState('')

  const handleTerminate = useCallback((reason) => {
    setTermReason(reason)
    setTerminated(true)
    setPhase('done')
  }, [])

  const { flags, camActive, simulateAnomaly } = useProctoring(
    phase === 'mcq' || phase === 'coding',
    handleTerminate
  )

  const { display: timerDisplay, pct: timerPct, remaining } = useTimer(
    phase === 'mcq' || phase === 'coding',
    TOTAL_TIME,
    () => handleTerminate('Time expired — assessment auto-submitted.')
  )

  const questions = track ? QUESTION_BANK[track] : []

  const handleAnswer = (qid, ans) => setAnswers(prev => ({ ...prev, [qid]: ans }))

  const calcScore = () => {
    const qs = questions
    let correct = 0
    qs.forEach(q => { if (answers[q.id] === q.ans) correct++ })
    return Math.round((correct / qs.length) * 100)
  }

  const submitAssessment = () => {
    const score = calcScore()
    setPhase('done')
    if (onComplete) onComplete(score)
  }

  // ── TRACK SELECTION ────────────────────────────────────────────
  if (phase === 'select') return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-200 dark:border-orange-800">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0"><Monitor size={20} className="text-white"/></div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Phase 2 — Adaptive Proctored Assessment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">1.5 Hours · 60 MCQ · 2 Coding Problems · AI Proctored</p>
        </div>
        <span className="badge-orange ml-auto shrink-0">SP-Assessment</span>
      </div>

      {/* Browser notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <Shield size={18} className="text-amber-500 shrink-0 mt-0.5"/>
        <div>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Browser Requirements</p>
          <ul className="text-xs text-amber-600 dark:text-amber-400 mt-1 space-y-0.5 list-disc list-inside">
            <li>Use Google Chrome or Mozilla Firefox only</li>
            <li>Webcam access must be granted before starting</li>
            <li>Do not switch tabs or minimise the window</li>
            <li>5 proctoring flags will terminate the assessment immediately</li>
            <li>Full-screen mode is enforced during the exam</li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="section-title text-base mb-3">Select Your Academic Track</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TRACKS.map(t => (
            <button key={t.key} onClick={() => { setTrack(t.key); setPhase('brief') }}
              className="card text-left hover:border-orange-400 dark:hover:border-orange-600 group transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Code size={18} className="text-white"/>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{t.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.desc}</p>
              <div className="flex gap-2 mt-3">
                <span className="badge-green text-xs">20 Easy</span>
                <span className="badge text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">30 Medium</span>
                <span className="badge-red text-xs">10 Hard</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── BRIEF / START SCREEN ───────────────────────────────────────
  if (phase === 'brief') {
    const t = TRACKS.find(t => t.key === track)
    return (
      <div className="space-y-6 animate-slide-up max-w-2xl">
        <div className="card border-2 border-orange-300 dark:border-orange-700">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Assessment Brief</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Track: <strong className="text-orange-500">{t?.label}</strong></p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[['Duration','1:30:00',Clock],['MCQ','60 Questions',CheckCircle2],['Coding','2 Problems',Code]].map(([l,v,Icon]) => (
              <div key={l} className="text-center p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <Icon size={18} className="text-orange-500 mx-auto mb-1"/>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{v}</p>
                <p className="text-xs text-gray-400">{l}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            <p>• Easy (20 Qs) — 1 mark each · Medium (30 Qs) — 2 marks each · Hard (10 Qs) — 3 marks each</p>
            <p>• Coding Problem 1 (Easy) + Coding Problem 2 (Hard)</p>
            <p>• AI camera overwatch active throughout</p>
            <p>• 60% industry baseline required to proceed to recruiter visibility</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase('select')} className="btn-secondary">← Change Track</button>
          <button onClick={() => setPhase('mcq')} className="btn-primary flex-1 justify-center py-3 glow-orange">
            <Play size={16}/> Start Assessment
          </button>
        </div>
      </div>
    )
  }

  // ── TERMINATED ─────────────────────────────────────────────────
  if (terminated || (phase === 'done' && terminated)) return (
    <div className="flex items-center justify-center min-h-96 animate-fade-in">
      <div className="card max-w-md text-center border-2 border-red-300 dark:border-red-700">
        <AlertOctagon size={48} className="text-red-500 mx-auto mb-4"/>
        <h2 className="text-xl font-black text-red-600 dark:text-red-400 mb-2">Assessment Terminated</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{termReason}</p>
        <div className="space-y-2 mb-4">
          {flags.map((f,i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-left">
              <AlertTriangle size={12} className="text-red-500 shrink-0"/>
              <span className="text-xs text-red-600 dark:text-red-400">{f.time} — {f.reason}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">All violations have been logged. Contact your institution for assistance.</p>
      </div>
    </div>
  )

  // ── COMPLETED ──────────────────────────────────────────────────
  if (phase === 'done' && !terminated) {
    const score = calcScore()
    const passed = score >= 60
    return (
      <div className="flex items-center justify-center min-h-96 animate-fade-in">
        <div className={`card max-w-md text-center border-2 ${passed?'border-green-300 dark:border-green-700':'border-amber-300 dark:border-amber-700'}`}>
          {passed ? <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4"/> : <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4"/>}
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Assessment {passed?'Passed':'Submitted'}</h2>
          <div className="text-4xl font-black gradient-text mb-2">{score}%</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {passed ? 'You meet the 60% industry baseline. Your profile is now visible to vetted recruiters.' :
                      'Score below 60% baseline. You have been placed in the upskilling queue.'}
          </p>
          <p className="text-xs text-gray-400">
            Proctoring flags: {flags.length}/5 · Time used: {Math.floor((TOTAL_TIME-remaining)/60)} mins
          </p>
        </div>
      </div>
    )
  }

  // ── ACTIVE ASSESSMENT ──────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top bar — timer + flags */}
      <div className="sticky top-0 z-40 flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-gray-950/90 backdrop-blur border border-orange-200 dark:border-gray-800 shadow-md">
        {/* Timer */}
        <div className="flex items-center gap-2 flex-1">
          <Clock size={16} className={remaining < 600 ? 'text-red-500 animate-pulse' : 'text-orange-500'}/>
          <span className={`font-mono font-black text-lg ${remaining < 600 ? 'text-red-500' : 'text-orange-500'}`}>{timerDisplay}</span>
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 max-w-32">
            <div className={`h-2 rounded-full transition-all ${remaining < 600 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width:`${timerPct}%` }}/>
          </div>
        </div>

        {/* Flag indicators */}
        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-gray-400"/>
          {[...Array(5)].map((_,i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i<flags.length?'bg-red-500':'bg-gray-200 dark:bg-gray-700'}`}/>
          ))}
          <span className="text-xs text-gray-500 ml-1">{5-flags.length} remaining</span>
        </div>

        {/* Simulate anomaly (dev tool) */}
        <button onClick={simulateAnomaly} className="btn-ghost text-xs text-red-400 hover:text-red-600">
          + Flag (test)
        </button>

        {/* Submit */}
        <button onClick={submitAssessment} className="btn-primary text-sm flex items-center gap-1.5">
          <Square size={14}/> Submit
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-orange-100 dark:bg-gray-800 rounded-xl w-fit">
        {[['mcq','60 MCQ Questions'],['coding-easy','Coding: Easy'],['coding-hard','Coding: Hard']].map(([key,label]) => (
          <button key={key} onClick={() => setMcqTab(key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all
              ${mcqTab===key ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {mcqTab === 'mcq' && (
        <McqSection questions={questions} answers={answers} onAnswer={handleAnswer}
          current={mcqIndex} onNav={setMcqIndex}/>
      )}
      {mcqTab === 'coding-easy' && (
        <CodingSandbox problem={CODING_PROBLEMS.easy} onSubmit={(code,lang) => setCodeResults(r => ({...r, easy:{code,lang}}))}/>
      )}
      {mcqTab === 'coding-hard' && (
        <CodingSandbox problem={CODING_PROBLEMS.hard} onSubmit={(code,lang) => setCodeResults(r => ({...r, hard:{code,lang}}))}/>
      )}

      {/* Camera panel */}
      <CameraPanel active={camActive} flags={flags}/>
    </div>
  )
}
