'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Navbar from '@/app/components/shared/Navbar'
import { Trophy, Book, GraduationCap, Flame, Star, Sparkles, Zap, ArrowRight, Play, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [scrollProgress, setScrollProgress] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)
  
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [countUsers, setCountUsers] = useState(0)
  const [countWords, setCountWords] = useState(0)
  const [countQuizzes, setCountQuizzes] = useState(0)

  const phrases = ["Level up your English", "Master new vocabulary", "Win Word Battles", "Speak with confidence"]

  // Live Typing Effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    const handleType = () => {
      const i = loopNum % phrases.length
      const fullText = phrases[i]

      setTypedText(isDeleting ? fullText.substring(0, typedText.length - 1) : fullText.substring(0, typedText.length + 1))

      setTypingSpeed(isDeleting ? 30 : 100)

      if (!isDeleting && typedText === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 2000)
      } else if (isDeleting && typedText === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      } else {
        timer = setTimeout(handleType, typingSpeed)
      }
    }

    timer = setTimeout(handleType, typingSpeed)
    return () => clearTimeout(timer)
  }, [typedText, isDeleting, loopNum, phrases, typingSpeed])

  // Scroll Progress & Intersection Observer
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scroll = `${totalScroll / windowHeight}`
      setScrollProgress(Number(scroll))
    }
    window.addEventListener('scroll', handleScroll)

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
          if (entry.target.id === 'stats-section') {
            setStatsVisible(true)
          }
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el))
    if (statsRef.current) observer.observe(statsRef.current)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  // Count up animation
  useEffect(() => {
    if (statsVisible) {
      const duration = 2000
      const steps = 60
      const stepTime = duration / steps
      
      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        const easeOutQuad = 1 - (1 - progress) * (1 - progress)
        
        setCountUsers(Math.floor(easeOutQuad * 10000))
        setCountWords(Math.floor(easeOutQuad * 50000))
        setCountQuizzes(Math.floor(easeOutQuad * 120000))
        
        if (currentStep >= steps) clearInterval(timer)
      }, stepTime)
      return () => clearInterval(timer)
    }
  }, [statsVisible])

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-white font-body overflow-x-hidden selection:bg-[var(--brand)] selection:text-white relative">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        :root {
          --font-heading: 'Plus Jakarta Sans', sans-serif;
          --font-body: 'Inter', sans-serif;
          --bg-primary: #0D0B1A;
          --brand: #7C3AED;
          --brand-bright: #A855F7;
          --pink: #EC4899;
        }

        .font-heading { font-family: var(--font-heading); }
        .font-body { font-family: var(--font-body); }

        /* Scroll Reveal */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }

        @keyframes neonBorder {
          0%, 100% { border-color: rgba(124, 58, 237, 0.4); box-shadow: 0 0 20px rgba(124, 58, 237, 0.2); }
          50% { border-color: rgba(168, 85, 247, 0.8); box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
        }
        .animate-neon { animation: neonBorder 3s infinite; }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(168, 85, 247, 0); }
        }
        .animate-pulse-glow { animation: pulseGlow 2s infinite; }

        @keyframes shimmerSweep {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: translateX(-100%) skewX(-15deg);
          transition: 0.5s;
        }
        .btn-shimmer:hover::after {
          animation: shimmerSweep 0.8s forwards;
        }

        @keyframes soundwave {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.0); }
        }
        .soundwave-bar { 
          width: 3px;
          height: 18px;
          background-color: #7C3AED;
          border-radius: 99px;
          animation: soundwave 0.6s ease-in-out infinite alternate;
          transform-origin: center;
        }
        .soundwave-bar:nth-child(1) { animation-delay: 0s; }
        .soundwave-bar:nth-child(2) { animation-delay: 0.2s; }
        .soundwave-bar:nth-child(3) { animation-delay: 0.4s; }

        @keyframes testimonialFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .aurora-bg {
          background: 
            radial-gradient(circle at 15% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(236, 72, 153, 0.15) 0%, transparent 50%);
          filter: blur(60px);
          position: absolute;
          inset: 0;
          z-index: 0;
          animation: aurora 10s ease-in-out infinite alternate;
        }
        @keyframes aurora {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(20px, -20px); }
        }

        .mesh-grid {
          background-size: 50px 50px;
          background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          position: absolute;
          inset: 0;
          z-index: 0;
        }
      `}} />

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[var(--brand)] via-[var(--brand-bright)] to-[var(--pink)] z-[200] transition-all duration-100" style={{ width: `${scrollProgress * 100}%` }} />

      <Navbar />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
          <div className="aurora-bg"></div>
          <div className="mesh-grid"></div>
          
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(124,58,237,0.1)] border border-[var(--brand)] text-[var(--brand-bright)] font-semibold text-sm mb-8 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                <Sparkles size={16} /> Welcome to the Future of Learning
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black leading-tight mb-6">
                Don't just learn. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] via-[var(--brand-bright)] to-[var(--pink)] min-h-[80px] inline-block">
                  {typedText}<span className="animate-pulse">|</span>
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-400 font-body mb-10 max-w-xl leading-relaxed">
                Join thousands of warriors conquering the English language. Play fast-paced vocabulary battles, track your mastery, and build a world-class lexicon.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
                <button 
                  onClick={() => router.push(session ? '/dashboard' : '/auth/signup')}
                  className="btn-shimmer relative overflow-hidden bg-gradient-to-r from-[var(--brand)] to-[var(--pink)] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-[0_10px_30px_rgba(168,85,247,0.4)] animate-pulse-glow flex items-center justify-center gap-2"
                >
                  ENTER THE ARENA <Zap size={20} />
                </button>
                <button 
                  onClick={() => router.push('/feed')}
                  className="px-8 py-4 rounded-2xl font-bold text-lg border border-gray-700 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-gray-500 transition-all flex items-center justify-center gap-2"
                >
                  Explore Feed
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-lg mx-auto lg:mx-0 reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand)] to-[var(--pink)] rounded-3xl blur-[80px] opacity-20 animate-pulse"></div>
              
              {/* Floating Game Card */}
              <div className="animate-float animate-neon bg-[#12102A]/80 backdrop-blur-xl border-2 border-[var(--brand)] rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(124,58,237,0.4)] relative z-10 overflow-hidden transform perspective-1000 rotate-y-[-5deg]">
                <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold font-heading">BOSS ROUND</div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-4xl font-heading font-black mb-2 text-white">Tenacious</h3>
                  <p className="text-gray-400 font-medium">Tending to keep a firm hold of something.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['Persistent', 'Yielding', 'Weak', 'Fragile'].map((word, i) => (
                    <div key={word} className={`p-4 rounded-xl text-center font-bold transition-all border ${i === 0 ? 'bg-[var(--brand)]/20 border-[var(--brand)] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] scale-105' : 'bg-white/5 border-gray-800 text-gray-400'}`}>
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section id="stats-section" ref={statsRef} className="pb-24 pt-8 relative z-10 bg-[#0A0815]">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="reveal-on-scroll bg-gradient-to-b from-[#7C3AED]/10 to-transparent p-8 rounded-3xl border border-gray-800 backdrop-blur-xl hover:scale-[1.02] hover:border-[#7C3AED]/50 transition-all text-center">
              <GraduationCap size={40} className="mx-auto text-[#7C3AED] mb-4" />
              <div className="text-5xl font-heading font-black mb-2">{countUsers.toLocaleString()}+</div>
              <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Active Learners</div>
            </div>
            <div className="reveal-on-scroll bg-gradient-to-b from-[#3B82F6]/10 to-transparent p-8 rounded-3xl border border-gray-800 backdrop-blur-xl hover:scale-[1.02] hover:border-[#3B82F6]/50 transition-all text-center" style={{ transitionDelay: '0.1s' }}>
              <Book size={40} className="mx-auto text-[#3B82F6] mb-4" />
              <div className="text-5xl font-heading font-black mb-2">{countWords.toLocaleString()}+</div>
              <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Words Mastered</div>
            </div>
            <div className="reveal-on-scroll bg-gradient-to-b from-[#F59E0B]/10 to-transparent p-8 rounded-3xl border border-gray-800 backdrop-blur-xl hover:scale-[1.02] hover:border-[#F59E0B]/50 transition-all text-center" style={{ transitionDelay: '0.2s' }}>
              <Trophy size={40} className="mx-auto text-[#F59E0B] mb-4" />
              <div className="text-5xl font-heading font-black mb-2">{countQuizzes.toLocaleString()}+</div>
              <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Quizzes Completed</div>
            </div>
          </div>
        </section>

        {/* FEATURED WORD SECTION */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--brand)]/10 via-[#0D0B1A] to-[#0D0B1A] z-0"></div>
          <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 reveal-on-scroll">
              <h2 className="text-4xl md:text-5xl font-heading font-black mb-6">Discover the Word of the Day</h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">Expand your vocabulary daily. Listen to native pronunciations, understand deep context, and challenge yourself with interactive exercises.</p>
              <div className="flex gap-2 mb-8">
                <div className="w-8 h-2 rounded-full bg-[var(--brand)]"></div>
                <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                <div className="w-2 h-2 rounded-full bg-gray-700"></div>
              </div>
              <button className="text-[var(--brand-bright)] font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-wider text-sm">
                View Full Archive <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="lg:w-1/2 w-full reveal-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="bg-[#12102A]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 relative hover:scale-[1.02] hover:border-[var(--brand)] transition-all duration-500 shadow-2xl overflow-hidden">
                <div className="absolute top-4 right-4 bg-orange-500/20 border border-orange-500/50 text-orange-400 px-3 py-1 rounded-full flex items-center gap-2 font-bold text-sm">
                  <Flame size={16} className="animate-pulse" /> 12 Day Streak
                </div>
                
                <div className="flex justify-between items-start mb-6 mt-4">
                  <div>
                    <span className="bg-[var(--brand)]/20 text-[var(--brand-bright)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Adjective</span>
                    <h3 className="text-5xl font-heading font-black mb-2 animate-[scaleUp_0.5s_ease-out]">Serendipity</h3>
                    <p className="text-gray-500 font-mono text-sm tracking-widest">/ser-uh n-DIP-i-tee/</p>
                  </div>
                  <button className="w-14 h-14 rounded-full bg-[var(--brand)] flex items-center justify-center text-white hover:bg-[var(--brand-bright)] hover:scale-110 transition-all shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                    <Play fill="currentColor" size={24} />
                  </button>
                </div>
                
                <div className="flex items-center gap-[4px] mb-8 bg-gray-900/50 p-4 rounded-xl w-max">
                  <div className="soundwave-bar"></div>
                  <div className="soundwave-bar"></div>
                  <div className="soundwave-bar"></div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest ml-3">Listen to Audio</span>
                </div>

                <p className="text-lg text-gray-300 font-medium mb-6">The occurrence and development of events by chance in a happy or beneficial way.</p>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 italic text-gray-400">
                  "Finding that rare book at a yard sale was pure <strong className="text-[var(--brand-bright)]">serendipity</strong>."
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-24 bg-[#0A0815] relative">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-center mb-16 reveal-on-scroll">Loved by Learners Worldwide</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Sarah L.", role: "Student, USA", flag: "🇺🇸", text: "VocabRise gamified my learning. I went from struggling with basic essays to writing eloquently. The Word Battles are addictive!" },
                { name: "Ahmed K.", role: "Professional, UAE", flag: "🇦🇪", text: "The pronunciation lab fixed my accent issues completely. I now speak with confidence in all my international business meetings." },
                { name: "Elena M.", role: "Teacher, Spain", flag: "🇪🇸", text: "I recommend this platform to all my ESL students. The UI is gorgeous, and the content is scientifically structured for retention." }
              ].map((t, i) => (
                <div 
                  key={i} 
                  className="reveal-on-scroll bg-[#12102A] p-8 rounded-3xl border border-gray-800 hover:border-gray-600 transition-all hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
                  style={{ 
                    transitionDelay: `${i * 0.1}s`,
                    animation: 'testimonialFloat 4s ease-in-out infinite',
                    animationDelay: `${i === 0 ? 0 : i === 1 ? 1.3 : 2.6}s`
                  }}
                >
                  <div className="flex gap-1 text-yellow-500 mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} fill="currentColor" size={16} />)}
                  </div>
                  <p className="text-gray-300 mb-8 leading-relaxed text-lg font-medium">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--brand)] to-[var(--pink)] flex items-center justify-center font-heading font-black text-xl">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{t.name}</h4>
                      <p className="text-sm text-gray-500">
                        {t.role} <span style={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif' }}>{t.flag}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D0B1A] via-[var(--brand)]/20 to-[#0D0B1A] z-0"></div>
          
          {/* Floating 3D elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-[var(--pink)]/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[var(--brand)]/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center reveal-on-scroll bg-[#12102A]/50 backdrop-blur-2xl border border-gray-800/50 p-12 md:p-20 rounded-[3rem] shadow-2xl">
            <h2 className="text-5xl md:text-6xl font-heading font-black mb-6">Ready to Master English?</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join 10,000+ warriors upgrading their vocabulary daily. It takes exactly 60 seconds to start.</p>
            
            <button 
              onClick={() => router.push('/auth/signup')}
              className="btn-shimmer relative overflow-hidden bg-gradient-to-r from-[var(--brand)] to-[var(--pink)] text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_10px_40px_rgba(168,85,247,0.4)] mb-6 flex items-center justify-center gap-3 mx-auto"
            >
              GET STARTED TODAY <ArrowRight size={24} />
            </button>
            <p className="text-gray-500 font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" /> Free forever • No credit card required
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 bg-[#0A0815] py-12 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--brand)] to-[var(--brand-bright)] flex items-center justify-center font-heading font-black text-white text-sm">VR</div>
            <span className="font-heading font-bold text-xl">VocabRise</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 VocabRise. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Discord</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
