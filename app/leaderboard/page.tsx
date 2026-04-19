'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import Navbar from '@/app/components/shared/Navbar'
import { ArrowUp, ArrowDown, Minus, BookOpen, Globe, TrendingUp, Users, Calendar, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  image: string | null
  totalXP: number
  level: number
  wordsLearned: number
  rankChange: 'up' | 'down' | 'same'
  isActive: boolean
}

// Consistent colors for avatars based on name
const getAvatarColor = (name: string) => {
  const char = name.charAt(0).toUpperCase()
  if (['A','B','C','D'].includes(char)) return 'linear-gradient(135deg, #7C3AED, #EC4899)' // Purple->Pink
  if (['E','F','G','H'].includes(char)) return 'linear-gradient(135deg, #3B82F6, #7C3AED)' // Blue->Purple
  if (['I','J','K','L'].includes(char)) return 'linear-gradient(135deg, #10B981, #06B6D4)' // Green->Cyan
  if (['M','N','O','P'].includes(char)) return 'linear-gradient(135deg, #F59E0B, #EF4444)' // Amber->Red
  if (['Q','R','S','T'].includes(char)) return 'linear-gradient(135deg, #EC4899, #F43F5E)' // Pink->Rose
  return 'linear-gradient(135deg, #8B5CF6, #3B82F6)' // Default
}

// Animated Counter component
const AnimatedCounter = ({ value, duration = 1500 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'global' | 'week' | 'friends'>('global')
  const [showInactive, setShowInactive] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (status === 'authenticated') setTimeout(() => setLoaded(true), 500)
  }, [status, router])

  // Enhanced mock data for perfect UI demonstration
  const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: 'u1', name: 'Ahmed Khan', image: null, totalXP: 12540, level: 12, wordsLearned: 450, rankChange: 'same', isActive: true },
    { rank: 2, userId: 'u2', name: 'Sara Ali', image: null, totalXP: 10280, level: 10, wordsLearned: 380, rankChange: 'up', isActive: true },
    { rank: 3, userId: 'u3', name: 'Usman Malik', image: null, totalXP: 9150, level: 9, wordsLearned: 320, rankChange: 'down', isActive: true },
    // Current user mock (if Abdul Rehman)
    { rank: 4, userId: session?.user?.email || 'mock@mock.com', name: session?.user?.name || 'Abdul Rehman', image: null, totalXP: 8850, level: 8, wordsLearned: 290, rankChange: 'up', isActive: true },
    { rank: 5, userId: 'u5', name: 'Zainab Noor', image: null, totalXP: 8200, level: 8, wordsLearned: 275, rankChange: 'same', isActive: true },
    { rank: 6, userId: 'u6', name: 'Bilal Ahmed', image: null, totalXP: 7950, level: 7, wordsLearned: 260, rankChange: 'up', isActive: true },
    { rank: 7, userId: 'u7', name: 'Fatima Zohra', image: null, totalXP: 6400, level: 6, wordsLearned: 210, rankChange: 'down', isActive: true },
    { rank: 8, userId: 'u8', name: 'Hassan Raza', image: null, totalXP: 0, level: 1, wordsLearned: 0, rankChange: 'same', isActive: false },
    { rank: 9, userId: 'u9', name: 'Mariam Ali', image: null, totalXP: 0, level: 1, wordsLearned: 0, rankChange: 'same', isActive: false },
  ]

  const topThree = mockLeaderboard.slice(0, 3)
  const restActive = mockLeaderboard.slice(3).filter(u => u.isActive)
  const restInactive = mockLeaderboard.filter(u => !u.isActive)

  const currentUser = mockLeaderboard.find(u => u.userId === session?.user?.email) || mockLeaderboard[3]
  const userAbove = mockLeaderboard.find(u => u.rank === currentUser.rank - 1)

  if (status === 'loading' || !loaded) {
    return (
      <div className="min-h-screen bg-[#0D0B1A] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[rgba(124,58,237,0.3)] border-t-[#7C3AED] animate-spin"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#0D0B1A] font-body text-white pb-20 relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmerText { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes borderShimmer { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes starRotate { 0% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 5px #EAB308); } 50% { transform: rotate(180deg) scale(1.2); filter: drop-shadow(0 0 15px #FDE047); } 100% { transform: rotate(360deg) scale(1); filter: drop-shadow(0 0 5px #EAB308); } }
        @keyframes floatAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(234,179,8,0.4); } 70% { box-shadow: 0 0 0 10px rgba(234,179,8,0); } 100% { box-shadow: 0 0 0 0 rgba(234,179,8,0); } }
        @keyframes confettiFall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .shimmer-text { background: linear-gradient(90deg, #fff 0%, #A855F7 50%, #fff 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmerText 3s linear infinite; }
        .star-anim { animation: starRotate 4s linear infinite; }
        .float-anim { animation: floatAnim 3s ease-in-out infinite; }
        .pulse-avatar { animation: pulseRing 2s infinite; }
        .row-slide-in { opacity: 0; animation: slideInUp 0.5s ease-out forwards; }
      `}} />

      <Navbar />

      {/* Cinematic Radial Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-[#EAB308] opacity-[0.12] blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vh] bg-[#7C3AED] opacity-[0.12] blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vh] bg-[#D97706] opacity-[0.12] blur-[120px] pointer-events-none z-0"></div>

      {/* Floating Particles */}
      {loaded && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-[#EAB308]" style={{
              width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px',
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3,
              animation: `floatAnim ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `-${Math.random() * 10}s`
            }} />
          ))}
        </div>
      )}

      {/* Confetti for #1 */}
      {loaded && Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="absolute w-2 h-2 rounded-sm bg-[#EAB308] z-50 pointer-events-none" style={{
          left: `calc(50% + ${(Math.random() - 0.5) * 20}vw)`, top: '-20px',
          backgroundColor: ['#EAB308', '#FDE047', '#D97706'][Math.floor(Math.random() * 3)],
          animation: `confettiFall ${Math.random() * 2 + 2}s linear ${Math.random() * 1}s both`,
          transform: `rotate(${Math.random() * 360}deg)`
        }}></div>
      ))}

      <main className="max-w-[800px] mx-auto px-4 pt-10 pb-20 relative z-10">
        
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}
        <div className="text-center mb-16 animate-slide-in">
          <div className="inline-block bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.4)] text-[#A855F7] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(124,58,237,0.3)] backdrop-blur-md">
            Global Rankings
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-black mb-3 shimmer-text tracking-tight">
            Leaderboard
          </h1>
          <p className="text-[15px] text-[#94A3B8] flex items-center justify-center gap-2 max-w-sm mx-auto">
            <Globe size={16} /> Compete with learners worldwide and claim your spot at the top
          </p>
        </div>

        {/* ========================================================= */}
        {/* PODIUM SECTION */}
        {/* ========================================================= */}
        <div className="mb-8 pt-10">
          <div className="flex justify-center items-end gap-2 sm:gap-4 lg:gap-6 relative z-20">
            
            {/* Rank 2 - Left */}
            <div className="flex flex-col items-center w-[30%] max-w-[180px] float-anim" style={{ animationDelay: '0.5s' }}>
              <div className="bg-[rgba(255,255,255,0.03)] border border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.2)] rounded-2xl p-4 w-full text-center relative z-10 mb-2 backdrop-blur-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1A1A2E] border border-[#A855F7] text-[#A855F7] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  🥈 2nd Place
                </div>
                <div className="w-14 h-14 mx-auto rounded-full border-2 border-[#A855F7] flex items-center justify-center text-xl font-heading font-bold text-white mb-2 shadow-[0_0_10px_rgba(168,85,247,0.4)]" style={{ background: getAvatarColor(topThree[1].name) }}>
                  {topThree[1].name.charAt(0)}
                </div>
                <h3 className="font-bold text-white text-[15px] truncate mb-1">{topThree[1].name}</h3>
                <div className="font-heading font-black text-[#A855F7] text-xl mb-1"><AnimatedCounter value={topThree[1].totalXP} /> XP</div>
                <div className="bg-[rgba(168,85,247,0.15)] text-[#A855F7] text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mx-auto">Lvl {topThree[1].level}</div>
              </div>
            </div>

            {/* Rank 1 - Center */}
            <div className="flex flex-col items-center w-[35%] max-w-[220px] relative z-30">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40">
                <Star className="text-[#EAB308] w-10 h-10 star-anim" fill="currentColor" />
              </div>
              <div className="bg-[rgba(20,15,30,0.8)] border-2 border-[#EAB308] rounded-2xl p-5 w-full text-center relative z-10 mb-2 shadow-[0_0_30px_rgba(234,179,8,0.5)] backdrop-blur-md">
                <div className="text-[#EAB308] text-[10px] font-bold tracking-widest uppercase mb-2">👑 Champion</div>
                <div className="w-20 h-20 mx-auto rounded-full border-[3px] border-[#EAB308] flex items-center justify-center text-3xl font-heading font-black text-white mb-3 pulse-avatar" style={{ background: getAvatarColor(topThree[0].name) }}>
                  {topThree[0].name.charAt(0)}
                </div>
                <h3 className="font-heading font-black text-white text-xl truncate mb-1">{topThree[0].name}</h3>
                <div className="font-heading font-black text-[#EAB308] text-2xl mb-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]"><AnimatedCounter value={topThree[0].totalXP} /> XP</div>
                <div className="bg-[rgba(234,179,8,0.15)] border border-[#EAB308] text-[#EAB308] text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto shadow-[0_0_10px_rgba(234,179,8,0.3)]">Level {topThree[0].level}</div>
              </div>
            </div>

            {/* Rank 3 - Right */}
            <div className="flex flex-col items-center w-[30%] max-w-[180px] float-anim" style={{ animationDelay: '1s' }}>
              <div className="bg-[rgba(255,255,255,0.03)] border border-[#D97706] shadow-[0_0_20px_rgba(217,119,6,0.2)] rounded-2xl p-4 w-full text-center relative z-10 mb-2 backdrop-blur-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1A1A2E] border border-[#D97706] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  🥉 3rd Place
                </div>
                <div className="w-14 h-14 mx-auto rounded-full border-2 border-[#D97706] flex items-center justify-center text-xl font-heading font-bold text-white mb-2 shadow-[0_0_10px_rgba(217,119,6,0.4)]" style={{ background: getAvatarColor(topThree[2].name) }}>
                  {topThree[2].name.charAt(0)}
                </div>
                <h3 className="font-bold text-white text-[15px] truncate mb-1">{topThree[2].name}</h3>
                <div className="font-heading font-black text-[#D97706] text-xl mb-1"><AnimatedCounter value={topThree[2].totalXP} /> XP</div>
                <div className="bg-[rgba(217,119,6,0.15)] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mx-auto">Lvl {topThree[2].level}</div>
              </div>
            </div>
          </div>

          {/* PODIUM BASE STEPS */}
          <div className="flex justify-center items-end px-4 sm:px-10 h-[100px] relative -mt-4 z-0">
            {/* Step 2 */}
            <div className="w-[30%] max-w-[180px] h-[60px] bg-gradient-to-t from-[rgba(168,85,247,0.1)] to-[rgba(168,85,247,0.3)] border-t-2 border-l-2 border-r-2 border-[rgba(168,85,247,0.5)] rounded-t-lg relative flex items-center justify-center shadow-[0_-10px_20px_rgba(168,85,247,0.15)]">
              <span className="font-heading font-black text-4xl text-[#A855F7] opacity-40">2</span>
            </div>
            {/* Step 1 */}
            <div className="w-[35%] max-w-[220px] h-[100px] bg-gradient-to-t from-[rgba(234,179,8,0.1)] to-[rgba(234,179,8,0.4)] border-t-[3px] border-l-2 border-r-2 border-[#EAB308] rounded-t-xl relative flex items-start pt-4 justify-center shadow-[0_-15px_30px_rgba(234,179,8,0.2)] z-10">
              <span className="font-heading font-black text-6xl text-[#EAB308] opacity-50 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">1</span>
            </div>
            {/* Step 3 */}
            <div className="w-[30%] max-w-[180px] h-[40px] bg-gradient-to-t from-[rgba(217,119,6,0.1)] to-[rgba(217,119,6,0.3)] border-t-2 border-l-2 border-r-2 border-[rgba(217,119,6,0.5)] rounded-t-lg relative flex items-center justify-center shadow-[0_-10px_20px_rgba(217,119,6,0.15)]">
              <span className="font-heading font-black text-3xl text-[#D97706] opacity-40">3</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FILTER TABS */}
        {/* ========================================================= */}
        <div className="flex justify-center gap-3 mb-8">
          <button onClick={() => setActiveTab('global')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'global' ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'bg-transparent border border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)] hover:text-white'}`}>
            <Globe size={16} /> Global
          </button>
          <button onClick={() => setActiveTab('week')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'week' ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'bg-transparent border border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)] hover:text-white'}`}>
            <Calendar size={16} /> This Week
          </button>
          <button onClick={() => setActiveTab('friends')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'friends' ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'bg-transparent border border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)] hover:text-white'}`}>
            <Users size={16} /> Friends
          </button>
        </div>

        {/* ========================================================= */}
        {/* RANKINGS LIST (4+) */}
        {/* ========================================================= */}
        <div className="space-y-3 mb-10">
          {restActive.map((entry, idx) => {
            const isCurrentUser = entry.userId === session?.user?.email;
            return (
              <div 
                key={entry.rank} 
                className={`row-slide-in h-[64px] px-5 flex items-center justify-between transition-colors relative overflow-hidden group ${
                  isCurrentUser 
                    ? 'bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] rounded-xl' 
                    : 'bg-transparent border border-transparent border-b-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {isCurrentUser && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#7C3AED]"></div>}
                
                <div className="flex items-center gap-4 w-[50%]">
                  {/* Rank & Indicator */}
                  <div className="flex items-center gap-1.5 w-10 shrink-0">
                    <span className={`font-heading font-bold text-base ${isCurrentUser ? 'text-[#A855F7]' : 'text-[#94A3B8]'}`}>{entry.rank}</span>
                    {entry.rankChange === 'up' && <ArrowUp size={12} className="text-[#22C55E]" strokeWidth={3} />}
                    {entry.rankChange === 'down' && <ArrowDown size={12} className="text-[#EF4444]" strokeWidth={3} />}
                    {entry.rankChange === 'same' && <Minus size={12} className="text-[#64748B]" strokeWidth={3} />}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-heading font-bold" style={{ background: getAvatarColor(entry.name) }}>
                    {entry.name.charAt(0)}
                  </div>
                  
                  {/* Name & Badge */}
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-[15px] text-white truncate">{entry.name}</span>
                    {isCurrentUser && <span className="bg-[#A855F7] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">YOU</span>}
                    <span className="bg-[#1A1A2E] border border-[rgba(124,58,237,0.3)] text-[#A855F7] text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">Lvl {entry.level}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 justify-end w-[40%]">
                  <div className="hidden sm:flex items-center gap-1.5 text-[#94A3B8]">
                    <BookOpen size={14} className="opacity-70" />
                    <span className="text-[13px] font-medium">{entry.wordsLearned} words</span>
                  </div>
                  <div className={`font-heading font-black text-lg text-right w-20 ${isCurrentUser ? 'text-[#A855F7]' : 'text-white'}`}>
                    <AnimatedCounter value={entry.totalXP} /> XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* INACTIVE USERS TOGGLE */}
        {restInactive.length > 0 && (
          <div className="mb-10">
            <button onClick={() => setShowInactive(!showInactive)} className="w-full py-3 text-[#94A3B8] text-sm font-bold flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.05)] rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              {showInactive ? 'Hide Inactive Users' : 'Show Inactive Users (0 XP)'}
            </button>
            {showInactive && (
              <div className="space-y-2 mt-3 animate-slide-in">
                {restInactive.map((entry) => (
                  <div key={entry.rank} className="h-[50px] px-5 flex items-center justify-between bg-transparent border border-transparent border-b-[rgba(255,255,255,0.02)] opacity-50 group cursor-help relative">
                    <div className="flex items-center gap-4">
                      <span className="font-heading font-bold text-sm text-[#64748B] w-8">{entry.rank}</span>
                      <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-[#94A3B8] font-bold text-xs">
                        {entry.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm text-[#94A3B8]">{entry.name}</span>
                    </div>
                    <span className="font-heading font-bold text-[#64748B]">0 XP</span>
                    
                    {/* Tooltip */}
                    <div className="absolute right-[80px] bg-[#1A1A2E] border border-[rgba(255,255,255,0.1)] text-white text-[10px] font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Start learning to earn XP!
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* YOUR GLOBAL STANDING CARD (BOTTOM) */}
        {/* ========================================================= */}
        <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.25)] rounded-[20px] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between animate-slide-in" style={{ animationDelay: '0.3s' }}>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7C3AED] to-[#EAB308]"></div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#7C3AED] opacity-10 rounded-full blur-[50px]"></div>

          {/* Left: Rank */}
          <div className="text-center md:text-left shrink-0">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em] mb-1">Your Rank</div>
            <div className="font-heading font-black text-5xl text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              #{currentUser.rank}
            </div>
          </div>

          {/* Center: Progress */}
          <div className="flex-1 w-full max-w-[400px]">
            <h3 className="font-bold text-white text-lg mb-1 text-center md:text-left">Keep climbing! 🔥</h3>
            {userAbove && (
              <p className="text-[13px] text-[#94A3B8] mb-4 text-center md:text-left">
                You're <span className="font-bold text-white">{userAbove.totalXP - currentUser.totalXP} XP</span> away from #{userAbove.rank} ({userAbove.name})
              </p>
            )}
            
            <div className="relative w-full h-[10px] bg-[rgba(255,255,255,0.05)] rounded-full mb-2">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7C3AED] to-[#EAB308] rounded-full" style={{ width: '85%' }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#EAB308] rounded-full shadow-[0_0_10px_rgba(234,179,8,1)]"></div>
              </div>
            </div>
            
            {userAbove && (
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-[#A855F7]">You: {currentUser.totalXP} XP</span>
                <span className="text-[#94A3B8]">{userAbove.name}: {userAbove.totalXP} XP</span>
              </div>
            )}
          </div>

          {/* Right: Total XP & CTA */}
          <div className="text-center md:text-right shrink-0 flex flex-col items-center md:items-end">
            <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em] mb-1">Total XP</div>
            <div className="font-heading font-black text-3xl text-white mb-2"><AnimatedCounter value={currentUser.totalXP} /></div>
            
            {/* Tiny sparkline mock */}
            <div className="flex items-end gap-1 h-6 mb-4 opacity-70">
              {[3, 5, 4, 7, 6, 9, 8].map((h, i) => (
                <div key={i} className="w-1.5 bg-[#A855F7] rounded-sm" style={{ height: `${h * 10}%` }}></div>
              ))}
            </div>

            <Link href="/dashboard" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              Earn More XP <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
