'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/app/components/shared/Navbar'
import { Flame, Star, Book, Zap, Bookmark, Volume2, Users, Clock, Sparkles } from 'lucide-react'
import DashboardSkeleton from './DashboardSkeleton'

// Sparkline Mini Chart Component
const Sparkline = ({ color }: { color: string }) => {
  return (
    <div className="flex items-end gap-[2px] h-4 mt-2">
      {[40, 70, 45, 90, 60, 100, 85].map((h, i) => (
        <div key={i} className="w-[4px] rounded-t-sm" style={{ height: `${h}%`, backgroundColor: color, opacity: i === 6 ? 1 : 0.4 }}></div>
      ))}
    </div>
  )
}

// CountUp Component
const CountUp = ({ value, duration = 1.2 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <>{count}</>
}

// 3D Tilt Card Component
const TiltCard = ({ children, className, style }: any) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    window.requestAnimationFrame(() => {
      setTilt({ x: -(y / rect.height) * 15, y: (x / rect.width) * 15 })
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{
        ...style,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      <div style={{ transform: 'translateZ(30px)' }}>
        {children}
      </div>
    </div>
  )
}


export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [showToast, setShowToast] = useState(false)
  const [countdown, setCountdown] = useState("00:04:32")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [stats, setStats] = useState({
    totalXP: 2450,
    level: 12,
    currentStreak: 3,
    wordsLearned: 142,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // Wait until session is ready
    if (status === 'loading') return;

    // Check cache first
    const cached = localStorage.getItem('dashboard_cache');
    if (cached) {
      try {
        setStats(JSON.parse(cached));
        setLoading(false); // show instantly
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }

    // Simulate fetchFresh
    const fetchFresh = () => new Promise<typeof stats>(resolve => {
      setTimeout(() => {
        resolve({
          totalXP: 2450,
          level: 12,
          currentStreak: 3,
          wordsLearned: 142,
        })
      }, 800)
    })

    fetchFresh().then(d => {
      setStats(d);
      localStorage.setItem('dashboard_cache', JSON.stringify(d));
      setLoading(false);
    })
  }, [status])

  // Scroll animations
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
          observer.unobserve(entry.target) // Stop tracking once revealed!
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [loading])

  // Toast Notification
  useEffect(() => {
    if (!loading && stats.currentStreak > 0) {
      const timer = setTimeout(() => setShowToast(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [loading, stats.currentStreak])

  // Fake Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        const parts = prev.split(':').map(Number)
        let [h, m, s] = parts
        if (s > 0) s--
        else {
          s = 59
          if (m > 0) m--
          else { m = 59; h-- }
        }
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading' || loading || !session) {
    return <DashboardSkeleton />
  }

  const userName = session.user?.name || 'User'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="bg-[#0D0B1A] min-h-screen text-white font-body relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        :root {
          --font-heading: 'Plus Jakarta Sans', sans-serif;
          --font-body: 'Inter', sans-serif;
        }
        .font-heading { font-family: var(--font-heading); }
        .font-body { font-family: var(--font-body); }

        .bg-dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.03;
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
        }

        .reveal-on-scroll {
          opacity: 0; transform: translateY(30px);
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .reveal-active { opacity: 1; transform: translateY(0); }

        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .stat-card-float-0 { animation: floatY 4s ease-in-out infinite; animation-delay: 0s; will-change: transform; }
        .stat-card-float-1 { animation: floatY 4s ease-in-out infinite; animation-delay: 1s; will-change: transform; }
        .stat-card-float-2 { animation: floatY 4s ease-in-out infinite; animation-delay: 2s; will-change: transform; }
        .stat-card-float-3 { animation: floatY 4s ease-in-out infinite; animation-delay: 3s; will-change: transform; }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .lightning-flicker { animation: flicker 0.9s ease-in-out infinite; }

        @keyframes soundwave {
          0% { transform: scaleY(0.2); }
          100% { transform: scaleY(1.0); }
        }
        .soundwave-bar {
          width: 3px; height: 20px; border-radius: 99px;
          background-color: #A855F7;
          animation: soundwave 0.5s ease-in-out infinite alternate;
          transform-origin: bottom;
        }
        .soundwave-bar:nth-child(1) { animation-delay: 0s; }
        .soundwave-bar:nth-child(2) { animation-delay: 0.15s; }
        .soundwave-bar:nth-child(3) { animation-delay: 0.3s; }

        .toast-slide {
          animation: slideInRight 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .confetti-particle {
          position: absolute;
          width: 6px; height: 6px;
          background: #F97316;
          border-radius: 50%;
          animation: confettiPop 1.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes confettiPop {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}} />

      <div className="bg-dot-grid"></div>
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">

        {/* GREETING SECTION */}
        <div className="mb-12 relative reveal-on-scroll">
          <div className="absolute -inset-10 pointer-events-none -z-10" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.08) 0%, transparent 60%)' }}></div>

          <p className="text-[#94A3B8] font-medium mb-1 font-body text-lg">Good morning,</p>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-heading font-black">
              {userName.split(' ')[0]}
            </h1>
            {stats.currentStreak >= 3 && (
              <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-[#F97316] to-[#EC4899] px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                <Flame size={16} className="text-white" />
                <span className="text-white">On Fire — {stats.currentStreak} Day Streak!</span>
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => {
                    const tx = [15, -25, 30, -10, 20, -5][i];
                    const ty = [-10, 15, -20, 5, -15, 10][i];
                    const delay = [0, 0.1, 0.05, 0.15, 0.02, 0.12][i];
                    return (
                      <div key={i} className="confetti-particle top-1/2 left-1/2" style={{ '--tx': `${tx}px`, '--ty': `${ty}px`, animationDelay: `${delay}s` } as React.CSSProperties}></div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-medium">
            <span className="text-[#94A3B8] flex items-center gap-2"><Clock size={16} /> {mounted ? today : '...'}</span>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <span className="text-[#A855F7]">Daily Goal: 2/5 words</span>
              <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] w-2/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Current Streak', value: stats.currentStreak, color: '#F97316', icon: Flame, delay: 0 },
            { label: 'Total XP', value: stats.totalXP, color: '#A855F7', icon: Sparkles, delay: 1 },
            { label: 'Words Learned', value: stats.wordsLearned, color: '#22C55E', icon: Book, delay: 2 },
            { label: 'Level', value: stats.level, color: '#EAB308', icon: Star, delay: 3 }
          ].map((stat, i) => (
            <div
              key={i}
              className={`reveal-on-scroll stat-card-float-${stat.delay} group relative bg-[rgba(255,255,255,0.02)] backdrop-blur-[12px] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.04] overflow-hidden cursor-default`}
            >
              <div className="absolute top-0 left-0 w-full h-[3px] opacity-70 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: stat.color, boxShadow: `0 0 15px ${stat.color}` }}></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `radial-gradient(circle at top right, ${stat.color}, transparent 60%)` }}></div>

              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">{stat.label}</span>
                <stat.icon size={20} color={stat.color} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <div className="text-4xl font-heading font-black mb-1" style={{ color: stat.color }}>
                <CountUp value={stat.value} />
              </div>
              <Sparkline color={stat.color} />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* WORD OF THE DAY CARD */}
          <div className="lg:col-span-2 reveal-on-scroll">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-[#7C3AED] rounded-full shadow-[0_0_10px_#7C3AED]"></div>
              <h2 className="text-2xl font-heading font-black">Word of the Day</h2>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#7C3AED] shadow-[0_0_20px_#7C3AED]"></div>

              <div className="flex justify-between items-start mb-8">
                <span className="bg-[#7C3AED]/20 text-[#A855F7] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#7C3AED]/30">Adjective</span>
                <button className="flex items-center gap-2 text-sm font-bold text-[#94A3B8] hover:text-[#A855F7] transition-colors group/btn">
                  <Bookmark size={18} className="group-hover/btn:fill-[#A855F7] transition-colors" /> Save Word
                </button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-5xl md:text-6xl font-heading font-black mb-2 text-white">Ephemeral</h3>
                  <p className="text-[#A855F7] font-medium text-lg italic">/əˈfem(ə)rəl/</p>
                </div>

                <div className="flex items-center gap-4 bg-black/30 p-3 pr-5 rounded-2xl border border-white/5">
                  <button className="w-12 h-12 rounded-full bg-[#7C3AED] flex items-center justify-center text-white hover:bg-[#A855F7] hover:scale-105 transition-all shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                    <Volume2 size={20} fill="currentColor" />
                  </button>
                  <div className="flex items-end gap-[3px]">
                    <div className="soundwave-bar"></div>
                    <div className="soundwave-bar"></div>
                    <div className="soundwave-bar"></div>
                  </div>
                </div>
              </div>

              <p className="text-xl text-[#94A3B8] leading-relaxed mb-4">Lasting for a very short time; short-lived or transitory.</p>
              <p className="text-[#EC4899] font-medium text-lg mb-8 font-heading">عارضی (Aarzi) / تھوڑی دیر کا</p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 italic text-[#94A3B8]">
                "The <strong className="text-white">ephemeral</strong> beauty of the sunset painted the sky in fleeting colors."
              </div>

              <div className="flex gap-2 justify-center mt-8">
                <div className="w-2 h-2 rounded-full bg-[#7C3AED] shadow-[0_0_8px_#7C3AED]"></div>
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
              </div>
            </div>
          </div>

          {/* CHALLENGE CARD */}
          <div className="reveal-on-scroll relative">
            <div className="absolute -inset-20 pointer-events-none -z-10" style={{ background: 'radial-gradient(circle at 80% 50%, rgba(236,72,153,0.05) 0%, transparent 60%)' }}></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-[#F97316] rounded-full shadow-[0_0_10px_#F97316]"></div>
              <h2 className="text-2xl font-heading font-black">Challenge</h2>
            </div>

            <TiltCard className="h-[calc(100%-3rem)] rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#1A143A] to-[#0D0B1A] border border-[#7C3AED]/30 shadow-[0_10px_40px_rgba(124,58,237,0.15)] relative cursor-pointer group">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 group-hover:opacity-40 transition-opacity"></div>

              <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22C55E]"></div>
                <span className="text-xs font-bold text-green-400">248 Online</span>
              </div>

              <div className="p-8 flex flex-col h-full justify-between relative z-10">
                <div>
                  <div className="w-16 h-16 bg-[#7C3AED]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#7C3AED]/50 group-hover:scale-110 transition-transform" style={{ boxShadow: '0 0 0 3px rgba(124,58,237,0.3), 0 0 20px rgba(124,58,237,0.2)' }}>
                    <Zap size={32} className="text-[#A855F7] lightning-flicker" fill="currentColor" />
                  </div>
                  <div className="inline-flex items-center gap-1 bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                    <Star size={12} fill="currentColor" /> +50 XP per win
                  </div>
                  <h3 className="text-3xl font-heading font-black mb-3">Word Battle</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
                    Face off against opponents globally in a fast-paced vocabulary showdown.
                  </p>
                </div>

                <div>
                  <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5 text-center">
                    <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Next Battle In</p>
                    <p className="font-mono text-2xl text-white font-black tracking-widest">{countdown}</p>
                  </div>
                  <button className="relative overflow-hidden group/btn w-full py-4 rounded-xl text-white font-black text-lg transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(124,58,237,0.5)] border-none" style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <span className="relative z-10">ENTER ARENA</span>
                  </button>
                </div>
              </div>
            </TiltCard>
          </div>

        </div>
      </main>

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-[#12102A] border border-[#F97316]/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 rounded-2xl flex items-center gap-4 toast-slide z-50">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#F97316] to-[#EC4899] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <Flame size={24} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Streak Protected!</h4>
            <p className="text-xs text-[#94A3B8]">You've hit your daily goal today.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="ml-4 text-gray-500 hover:text-white transition-colors">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}