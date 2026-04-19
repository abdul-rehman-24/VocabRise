'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Send, Share2, Trophy, Crown, Plus, ArrowUp, Star, Lightbulb } from 'lucide-react'

interface Nomination {
  id: string
  word: string
  pos: string
  definition: string
  submittedBy: string
  submittedByInitial: string
  timestamp: string
  votes: number
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'warning'
}

interface LeaderboardUser {
  username: string
  count: number
  initial: string
}

const ConfettiParticle = ({ delay, duration }: { delay: number; duration: number }) => {
  const colors = ['#FDE047', '#EAB308', '#EC4899', '#7C3AED', '#32CD32', '#A855F7']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomLeft = Math.random() * 100
  const randomRotation = Math.random() * 360

  return (
    <div
      style={{
        position: 'fixed',
        left: `${randomLeft}%`,
        top: '-10px',
        width: '10px',
        height: '10px',
        backgroundColor: randomColor,
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: `confettiFall ${duration}s linear ${delay}s both`,
        zIndex: 9999,
        transform: `rotate(${randomRotation}deg)`,
      }}
    />
  )
}

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => onRemove(toast.id), 3000)
      return () => clearTimeout(timer)
    })
  }, [toasts, onRemove])

  return (
    <div className="fixed bottom-4 right-4 z-[10000] space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-2 animate-slide-in font-bold text-sm border ${
            toast.type === 'success'
              ? 'bg-[rgba(34,197,94,0.15)] border-[#22C55E] text-[#22C55E]'
              : toast.type === 'info'
              ? 'bg-[rgba(124,58,237,0.15)] border-[#7C3AED] text-[#A855F7]'
              : 'bg-[rgba(234,179,8,0.15)] border-[#EAB308] text-[#EAB308]'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

const getAvatarColor = (name: string) => {
  const colors = [
    'linear-gradient(135deg, #7C3AED, #EC4899)',
    'linear-gradient(135deg, #06B6D4, #3B82F6)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
    'linear-gradient(135deg, #10B981, #059669)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function WordOfTheWeek() {
  const initialNominations: Nomination[] = [
    { id: '1', word: 'Serendipity', pos: 'NOUN', definition: 'A happy, unexpected discovery in a completely unrelated search.', submittedBy: '@ahmed_lahore', submittedByInitial: 'A', timestamp: '2d ago', votes: 142 },
    { id: '2', word: 'Ephemeral', pos: 'ADJ', definition: 'Lasting for a very short time; transient.', submittedBy: '@sara_pk', submittedByInitial: 'S', timestamp: '3d ago', votes: 98 },
    { id: '3', word: 'Resilient', pos: 'ADJ', definition: 'Able to withstand or recover quickly from difficult conditions.', submittedBy: '@bilal_reads', submittedByInitial: 'B', timestamp: '1d ago', votes: 87 },
    { id: '4', word: 'Melancholy', pos: 'NOUN', definition: 'A feeling of pensive sadness, typically with no obvious cause.', submittedBy: '@noor_vocab', submittedByInitial: 'N', timestamp: '4d ago', votes: 65 },
    { id: '5', word: 'Candid', pos: 'ADJ', definition: 'Truthful and straightforward; frank.', submittedBy: '@hamza_learns', submittedByInitial: 'H', timestamp: '2d ago', votes: 54 },
    { id: '6', word: 'Verbose', pos: 'ADJ', definition: 'Using or expressed in more words than are needed.', submittedBy: '@zara_english', submittedByInitial: 'Z', timestamp: '5d ago', votes: 31 },
  ]

  const [nominations, setNominations] = useState<Nomination[]>(initialNominations)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [votesLeft, setVotesLeft] = useState(3)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [showWinnerScreen, setShowWinnerScreen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [formData, setFormData] = useState({ word: '', definition: '', why: '', pos: 'NOUN' })
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 32, seconds: 7 })
  const [showConfetti, setShowConfetti] = useState(true) // Play on load
  const [animatedBars, setAnimatedBars] = useState(false)

  // Trigger bar animations
  useEffect(() => {
    setTimeout(() => setAnimatedBars(true), 100);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) { hours = 23; days-- }
        return { days: Math.max(0, days), hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const sortedNominations = useMemo(() => [...nominations].sort((a, b) => b.votes - a.votes), [nominations])
  const totalVotesCount = useMemo(() => sortedNominations.reduce((acc, curr) => acc + curr.votes, 0) || 1, [sortedNominations])

  const topVoters = useMemo<LeaderboardUser[]>(() => [
    { username: '@ahmed_lahore', count: 18, initial: 'A' },
    { username: '@sara_pk', count: 15, initial: 'S' },
    { username: '@bilal_reads', count: 12, initial: 'B' },
    { username: '@noor_vocab', count: 9, initial: 'N' },
    { username: '@hamza_learns', count: 7, initial: 'H' },
  ], [])

  const topSubmitters = useMemo<LeaderboardUser[]>(() => [
    { username: '@sara_pk', count: 4, initial: 'S' },
    { username: '@ahmed_lahore', count: 3, initial: 'A' },
    { username: '@bilal_reads', count: 2, initial: 'B' },
    { username: '@zara_english', count: 2, initial: 'Z' },
    { username: '@noor_vocab', count: 1, initial: 'N' },
  ], [])

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToasts(prev => [...prev, { id: Date.now().toString(), message, type }])
  }

  const handleVote = (id: string) => {
    if (votedIds.has(id)) return;
    if (votesLeft <= 0) {
      addToast('No votes left for today!', 'warning');
      return;
    }

    setNominations(prev => prev.map(nom => nom.id === id ? { ...nom, votes: nom.votes + 1 } : nom))
    setVotedIds(prev => new Set(prev).add(id))
    setVotesLeft(prev => prev - 1)
    addToast('✓ Voted! +5 XP for voting!', 'success')
  }

  const handleSubmitNomination = () => {
    if (!formData.word.trim() || !formData.definition.trim()) {
      addToast('Please fill in all required fields', 'warning')
      return
    }

    const newNomination: Nomination = {
      id: Date.now().toString(),
      word: formData.word,
      pos: formData.pos,
      definition: formData.definition,
      submittedBy: '@you',
      submittedByInitial: 'Y',
      timestamp: 'just now',
      votes: 1, // Start with 1 vote (own vote)
    }

    setNominations(prev => [...prev, newNomination])
    setFormData({ word: '', definition: '', why: '', pos: 'NOUN' })
    setShowSubmitForm(false)
    addToast(`Your word "${formData.word}" is in the race! 🚀`, 'success')
  }

  // Card Intersection Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const cardRef = (node: HTMLDivElement | null) => {
    if (!node) return;
    if (!observer.current) {
      observer.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible-card');
            observer.current?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
    }
    observer.current.observe(node);
  }

  return (
    <div className="min-h-screen bg-[#0D0B1A] font-body text-white relative overflow-x-hidden pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes confettiFall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 5px rgba(124,58,237,0.2); } 50% { box-shadow: 0 0 15px rgba(124,58,237,0.6); border-color: rgba(168,85,247,0.8); } }
        @keyframes shimmerSweep { 0% { transform: rotate(30deg) translateY(-50%) translateX(-100%); } 100% { transform: rotate(30deg) translateY(-50%) translateX(200%); } }
        @keyframes trophyShimmer { 0%, 100% { filter: drop-shadow(0 0 5px rgba(234,179,8,0.4)); } 50% { filter: drop-shadow(0 0 15px rgba(234,179,8,0.8)) brightness(1.2); } }
        @keyframes sparkleAnim { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.3); opacity: 1; text-shadow: 0 0 10px rgba(255,255,255,0.8); } }

        .seconds-pulse { animation: pulseGlow 1s ease-in-out infinite; }
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent); transform: rotate(30deg) translateY(-50%) translateX(-100%); transition: 0s; }
        .shimmer-btn:hover::after { animation: shimmerSweep 0.8s forwards; }
        
        .trophy-glow { animation: trophyShimmer 3s infinite; }
        .sparkle-text { animation: sparkleAnim 2s infinite; }

        .vote-card { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
        .visible-card { opacity: 1; transform: translateY(0); }

        .scroll-container::-webkit-scrollbar { width: 4px; }
        .scroll-container::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 4px; }
        
        /* Modal Scroll Lock */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; overflow-y: auto; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; }
      `}} />

      {/* Subtle Dot Grid & Floating Orbs Background */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.03 }}></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#EAB308] opacity-[0.08] blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#7C3AED] opacity-[0.08] blur-[100px] pointer-events-none z-0"></div>

      {showConfetti && Array.from({ length: 40 }).map((_, i) => <ConfettiParticle key={i} delay={Math.random() * 0.3} duration={2.5} />)}

      <div className="max-w-[1100px] mx-auto px-4 pt-12 relative z-10">
        
        {/* ========================================================= */}
        {/* SCREEN 1: HEADER AREA */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-heading text-[32px] font-bold text-white flex items-center gap-3 mb-1 leading-tight">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Vote: Word of the Week
            </h1>
            <p className="text-[#94A3B8] text-sm">The community decides the word that defines this week</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex flex-col items-center">
                <div className="bg-[#110e24] border border-[rgba(124,58,237,0.3)] rounded-lg w-[50px] h-[50px] flex items-center justify-center text-[28px] font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.1)]">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold mt-1 tracking-widest">DAYS</span>
              </div>
              <span className="text-[#7C3AED] text-2xl font-bold mb-5">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-[#110e24] border border-[rgba(124,58,237,0.3)] rounded-lg w-[50px] h-[50px] flex items-center justify-center text-[28px] font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.1)]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold mt-1 tracking-widest">HRS</span>
              </div>
              <span className="text-[#7C3AED] text-2xl font-bold mb-5">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-[#110e24] border border-[rgba(124,58,237,0.3)] rounded-lg w-[50px] h-[50px] flex items-center justify-center text-[28px] font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.1)]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold mt-1 tracking-widest">MIN</span>
              </div>
              <span className="text-[#7C3AED] text-2xl font-bold mb-5">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-[#110e24] border border-[rgba(124,58,237,0.5)] rounded-lg w-[50px] h-[50px] flex items-center justify-center text-[28px] font-bold text-white seconds-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <span className="text-[10px] text-[#94A3B8] font-bold mt-1 tracking-widest">SEC</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 group relative cursor-help">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Votes Left:</span>
              <div className="flex gap-1.5">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full ${i <= votesLeft ? 'bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'border border-[rgba(168,85,247,0.3)] bg-transparent'}`}></div>
                ))}
              </div>
              <div className="absolute top-full right-0 mt-2 bg-[#1A1A2E] border border-[rgba(255,255,255,0.1)] text-xs text-white px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                Vote on up to 3 words per day
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button onClick={() => setShowSubmitForm(true)} className="shimmer-btn flex items-center gap-2 bg-[#7C3AED] text-white px-6 py-3 rounded-full font-bold hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all uppercase tracking-wider text-sm">
            <Plus size={18} strokeWidth={3} /> Nominate a Word
          </button>
          <button onClick={() => setShowWinnerScreen(true)} className="flex items-center gap-2 bg-transparent border border-[#EAB308] text-[#EAB308] px-6 py-3 rounded-full font-bold hover:bg-[#EAB308] hover:text-[#111] transition-colors uppercase tracking-wider text-sm group">
            <Crown size={18} className="group-hover:text-[#111]" /> Preview Winner Announcement
          </button>
        </div>

        {/* Last Week's Winner Banner */}
        <div className="mb-10 rounded-2xl p-[1px] bg-gradient-to-r from-[rgba(234,179,8,0.5)] via-[rgba(234,179,8,0.2)] to-transparent shadow-[0_0_20px_rgba(234,179,8,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[rgba(234,179,8,0.05)] to-transparent pointer-events-none"></div>
          <div className="bg-[#110e24] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 shrink-0 trophy-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.5" className="w-full h-full">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 22h16" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="url(#goldTrophyGrad)" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="goldTrophyGrad" x1="6" y1="2" x2="18" y2="15" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE047"/>
                    <stop offset="0.5" stopColor="#EAB308"/>
                    <stop offset="1" stopColor="#A16207"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-[#EAB308] font-bold text-xs uppercase tracking-[0.2em] mb-1 flex items-center justify-center sm:justify-start gap-2">
                <Star size={12} fill="currentColor" /> Last Week's Champion
              </div>
              <h2 className="font-heading text-3xl font-black text-white mb-2">Ephemeral</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <p className="text-[#94A3B8] text-sm">Submitted by <span className="font-bold text-white">@sara_pk</span></p>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-[#EAB308]/50"></div>
                <div className="inline-block px-3 py-1 rounded-full bg-[rgba(234,179,8,0.1)] border border-[#EAB308] text-[#EAB308] text-xs font-bold w-fit mx-auto sm:mx-0">
                  Sara earned +500 XP!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN CONTENT GRID */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Word Vote Cards Grid (2 columns) */}
          <div className="flex-[2] grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
            {sortedNominations.map((nom, idx) => {
              const isFirst = idx === 0;
              const hasVoted = votedIds.has(nom.id);
              const percentage = Math.min(Math.round((nom.votes / totalVotesCount) * 100), 100);
              
              return (
                <div 
                  key={nom.id} 
                  ref={cardRef}
                  className={`vote-card relative bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 flex flex-col h-full ${
                    isFirst ? 'border border-[#EAB308] shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'border-[0.5px] border-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-3 -left-3">
                    {isFirst ? (
                      <div className="bg-gradient-to-r from-[#FDE047] to-[#EAB308] text-[#111] px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow-[0_4px_10px_rgba(234,179,8,0.4)] border border-[#FEF08A]">
                        <Crown size={14} /> #1 Leading
                      </div>
                    ) : idx === 1 ? (
                      <div className="bg-gradient-to-r from-[#E2E8F0] to-[#94A3B8] text-[#111] px-2 py-1 rounded-lg font-bold text-xs shadow-md border border-[#F8FAFC]">
                        #2
                      </div>
                    ) : idx === 2 ? (
                      <div className="bg-gradient-to-r from-[#FDBA74] to-[#D97706] text-[#111] px-2 py-1 rounded-lg font-bold text-xs shadow-md border border-[#FED7AA]">
                        #3
                      </div>
                    ) : (
                      <div className="bg-[rgba(255,255,255,0.1)] text-[#94A3B8] px-2 py-1 rounded-lg font-bold text-xs backdrop-blur-sm border border-[rgba(255,255,255,0.05)]">
                        #{idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3 mt-1">
                    <h3 className="font-heading text-2xl font-bold text-white">{nom.word}</h3>
                    <span className="bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] text-[#A855F7] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                      {nom.pos}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#94A3B8] leading-[1.5] line-clamp-2 mb-4 flex-1">
                    {nom.definition}
                  </p>

                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-inner" style={{ background: getAvatarColor(nom.submittedBy) }}>
                      {nom.submittedByInitial}
                    </div>
                    <span className="text-xs text-[#A855F7] font-medium">{nom.submittedBy}</span>
                    <span className="text-xs text-[#94A3B8]">· {nom.timestamp}</span>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-white leading-none">{nom.votes}</span>
                        <span className="text-[10px] text-[#94A3B8] uppercase font-bold">votes</span>
                      </div>
                      <span className="text-xs font-bold text-white">{percentage}%</span>
                    </div>
                    
                    <div className="w-full h-2 rounded-[99px] bg-[rgba(255,255,255,0.06)] overflow-hidden mb-4">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] rounded-[99px] transition-all duration-1000 ease-out"
                        style={{ width: animatedBars ? `${percentage}%` : '0%' }}
                      />
                    </div>

                    <button
                      onClick={() => handleVote(nom.id)}
                      disabled={hasVoted || (!hasVoted && votesLeft <= 0)}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        hasVoted 
                          ? 'bg-[#22C55E] text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-not-allowed'
                          : isFirst
                            ? 'bg-transparent border-2 border-[#EAB308] text-[#EAB308] hover:bg-[#EAB308] hover:text-[#111] hover:scale-[1.02] shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                            : 'bg-transparent border-2 border-[#7C3AED] text-[#A855F7] hover:bg-[#7C3AED] hover:text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                      } ${!hasVoted && votesLeft <= 0 ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
                    >
                      {hasVoted ? (
                        <>✓ Voted!</>
                      ) : (
                        <><ArrowUp size={16} strokeWidth={3} /> Vote</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDEBAR */}
          {/* ========================================================= */}
          <div className="flex-1 flex flex-col gap-6 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto scroll-container pr-2">
            
            {/* Top Voters */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6">
              <h3 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-[rgba(255,255,255,0.05)]">
                <Trophy size={18} className="text-[#EAB308]" /> Top Voters
              </h3>
              <div className="space-y-1">
                {topVoters.map((user, idx) => (
                  <div key={user.username} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[rgba(124,58,237,0.1)] transition-colors group">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#111] shadow-md shrink-0 ${
                      idx === 0 ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308]' :
                      idx === 1 ? 'bg-gradient-to-br from-[#E2E8F0] to-[#94A3B8]' :
                      idx === 2 ? 'bg-gradient-to-br from-[#FDBA74] to-[#D97706]' :
                      'bg-[#7C3AED] text-white'
                    }`}>
                      #{idx + 1}
                    </div>
                    <span className="text-sm font-medium text-white truncate flex-1 flex items-center gap-1.5">
                      {user.username}
                      {idx === 0 && <span className="text-sm">🔥</span>}
                    </span>
                    <div className="bg-[rgba(234,179,8,0.1)] border border-[#EAB308] text-[#EAB308] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {user.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Submitters */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6">
              <h3 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-[rgba(255,255,255,0.05)]">
                <Star size={18} fill="#EAB308" className="text-[#EAB308]" /> Top Submitters
              </h3>
              <div className="space-y-1">
                {topSubmitters.map((user, idx) => (
                  <div key={user.username} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[rgba(124,58,237,0.1)] transition-colors group">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#111] shadow-md shrink-0 ${
                      idx === 0 ? 'bg-gradient-to-br from-[#FDE047] to-[#EAB308]' :
                      idx === 1 ? 'bg-gradient-to-br from-[#E2E8F0] to-[#94A3B8]' :
                      idx === 2 ? 'bg-gradient-to-br from-[#FDBA74] to-[#D97706]' :
                      'bg-[#7C3AED] text-white'
                    }`}>
                      #{idx + 1}
                    </div>
                    <span className="text-sm font-medium text-white truncate flex-1">
                      {user.username}
                    </span>
                    <div className="bg-[rgba(234,179,8,0.1)] border border-[#EAB308] text-[#EAB308] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {user.count} words
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* XP Bonus Banner */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-[#A16207] via-[#EAB308] to-[#FDE047] text-[#111] shadow-[0_0_20px_rgba(234,179,8,0.3)] relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-[#111] opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Trophy size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center mb-3">
                  <Lightbulb size={20} className="text-[#EAB308]" />
                </div>
                <h3 className="font-heading font-black text-[17px] uppercase tracking-tight leading-tight mb-1">
                  🏆 Win = <span className="sparkle-text inline-block">+500 XP</span> Bonus!
                </h3>
                <p className="text-xs font-bold opacity-80">Submit a winning word and earn huge rewards.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* WINNER PREVIEW MODAL */}
      {/* ========================================================= */}
      {showWinnerScreen && (
        <div className="modal-overlay" onClick={() => setShowWinnerScreen(false)}>
          <div className="relative bg-[#0D0B1A] border border-[rgba(234,179,8,0.5)] rounded-3xl p-10 text-center max-w-2xl mx-auto shadow-[0_0_50px_rgba(234,179,8,0.2)] animate-slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[rgba(234,179,8,0.2)] via-transparent to-transparent pointer-events-none"></div>
            
            <button onClick={() => setShowWinnerScreen(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] transition-colors z-10">
              <X size={18} />
            </button>

            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 mb-6 trophy-glow">
                <svg viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.5" className="w-full h-full">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 22h16" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="url(#goldTrophyGrad2)" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="goldTrophyGrad2" x1="6" y1="2" x2="18" y2="15">
                      <stop stopColor="#FDE047"/>
                      <stop offset="0.5" stopColor="#EAB308"/>
                      <stop offset="1" stopColor="#A16207"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <h1 className="font-heading text-[#EAB308] text-sm font-bold tracking-[0.3em] uppercase mb-2">Word of the Week</h1>
              <div className="font-heading text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-6xl font-black mb-6 drop-shadow-lg">
                Serendipity
              </div>

              <div className="flex flex-col items-center gap-1 mb-8">
                <p className="text-lg text-[#94A3B8]">Submitted by <span className="font-bold text-white">@ahmed_lahore</span></p>
                <div className="bg-[rgba(34,197,94,0.15)] border border-[#22C55E] text-[#22C55E] px-4 py-1.5 rounded-full font-bold text-lg mt-2">
                  Ahmed earns +500 XP! 🎉
                </div>
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl p-5 mb-8 text-left italic text-[#94A3B8] relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308] rounded-l-xl"></div>
                "This week's Word of the Week on VocabRise is <strong>Serendipity</strong>! Can you use it in a sentence? 📚"
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const text = `This week's Word of the Week on VocabRise is Serendipity! Can you use it in a sentence? 📚`
                    if (navigator.share) navigator.share({ title: 'Word of the Week', text })
                    else { navigator.clipboard.writeText(text); addToast('Copied to clipboard!', 'success'); }
                  }}
                  className="px-8 py-3.5 rounded-full font-bold text-[#111] flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] transition-colors shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                >
                  <Share2 size={18} /> Share on WhatsApp
                </button>
                <button
                  onClick={() => setShowWinnerScreen(false)}
                  className="px-8 py-3.5 rounded-full font-bold text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMIT NOMINATION MODAL */}
      {/* ========================================================= */}
      {showSubmitForm && (
        <div className="modal-overlay" onClick={() => setShowSubmitForm(false)}>
          <div className="modal-content bg-[#0D0B1A] border border-[rgba(124,58,237,0.5)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="h-1 w-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] rounded-t-2xl"></div>
            
            <div className="p-8">
              <button onClick={() => setShowSubmitForm(false)} className="absolute top-5 right-5 text-[#94A3B8] hover:text-white p-2 bg-[rgba(255,255,255,0.05)] rounded-full transition-colors">
                <X size={18} />
              </button>

              <h2 className="font-heading text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Plus size={24} className="text-[#A855F7]" /> Nominate a Word
              </h2>
              <p className="text-sm text-[#94A3B8] mb-6">Suggest a powerful word for next week's vote.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5">Word <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={e => setFormData({ ...formData, word: e.target.value })}
                    placeholder="e.g. Ubiquitous"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white text-lg font-bold placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5">Part of Speech</label>
                  <div className="flex gap-2">
                    {['NOUN', 'VERB', 'ADJ', 'ADV'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => setFormData({ ...formData, pos })}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors flex-1 ${
                          formData.pos === pos ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5">Definition <span className="text-[#EF4444]">*</span></label>
                  <textarea
                    value={formData.definition}
                    onChange={e => setFormData({ ...formData, definition: e.target.value })}
                    placeholder="Provide a clear, simple meaning..."
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white text-base placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all resize-y min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5 flex items-center gap-2">
                    Why this word? <span className="text-xs font-normal text-[#94A3B8]">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.why}
                    onChange={e => setFormData({ ...formData, why: e.target.value })}
                    placeholder="Tell us why it deserves to win..."
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white text-base placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all resize-y min-h-[60px]"
                  />
                </div>

                <div className="bg-[rgba(234,179,8,0.1)] border border-[rgba(234,179,8,0.3)] rounded-xl p-3 flex items-start gap-3">
                  <div className="text-[#EAB308] shrink-0 mt-0.5"><Lightbulb size={16} /></div>
                  <p className="text-xs text-[#EAB308]">If your nominated word wins the weekly vote, you will earn a massive <strong className="font-bold">500 XP bonus!</strong></p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowSubmitForm(false)} className="flex-1 py-3.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-white font-bold text-sm hover:border-[rgba(239,68,68,0.5)] hover:text-[#EF4444] transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSubmitNomination} className="flex-[2] shimmer-btn bg-gradient-to-r from-[#7C3AED] to-[#EC4899] py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2">
                    <Send size={16} /> Submit Word
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Toasts container defined inline */}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(t => t.filter(x => x.id !== id))} />

    </div>
  )
}
