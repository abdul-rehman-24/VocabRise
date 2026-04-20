'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/app/components/shared/Navbar'

interface Stats {
  totalXP: number
  level: number
  currentStreak: number
  wordsLearned: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [word, setWord] = useState<any>(null)
  const [wordLoading, setWordLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    wordsLearned: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const res = await fetch('/api/word-of-day')
        const data = await res.json()
        setWord(data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setWordLoading(false)
      }
    }
    fetchWord()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/user/stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error('Error:', err)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading') {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 mx-auto mb-4 animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <p style={{ color: 'var(--text-secondary)', fontFamily: "'DM Sans'" }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const userName = session.user?.name || 'User'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,'

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="page-wrapper min-h-screen">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-[24px] py-12">
        {/* Greeting */}
        <div className="mb-12 animate-fade-up">
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '24px', fontWeight: 400, color: 'var(--text-secondary)' }} className="mb-2">
            {greeting}
          </p>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '48px', 
            fontWeight: 800,
            background: `linear-gradient(135deg, var(--text-primary), var(--brand-bright))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }} className="mb-2">
            {userName.split(' ')[0]}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 400 }}>Keep learning and expanding your vocabulary</p>
        </div>

        {/* Stat Cards - Visually Distinct */}
        <div className="grid md:grid-cols-4 gap-6 mb-12 animate-fade-up-delay">
          {/* Streak Card */}
          <div
            className="card-hover group transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.12), rgba(255, 107, 53, 0.05))',
              border: '1px solid rgba(255, 107, 53, 0.25)',
              borderRadius: '20px',
              padding: '24px 28px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div style={{ fontFamily: "'DM Sans'", color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Current Streak
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
            </div>
            <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '40px', fontWeight: 800, color: '#ff6b35', marginBottom: '4px' }}>
              {stats.currentStreak}
            </p>
            <p style={{ fontFamily: "'DM Sans'", fontSize: '12px', color: '#ff6b35', opacity: 0.8 }}>Keep it going!</p>
          </div>

          {/* XP Card */}
          <div
            className="card-hover group transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 109, 250, 0.12), rgba(124, 109, 250, 0.05))',
              border: '1px solid rgba(124, 109, 250, 0.25)',
              borderRadius: '20px',
              padding: '24px 28px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 24px rgba(124, 109, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div style={{ fontFamily: "'DM Sans'", color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Total XP
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '40px', fontWeight: 800, color: 'var(--accent-bright)', marginBottom: '4px' }}>
              {stats.totalXP}
            </p>
            <p style={{ fontFamily: "'DM Sans'", fontSize: '12px', color: 'var(--accent-bright)', opacity: 0.8 }}>Earn more today</p>
          </div>

          {/* Words Card */}
          <div
            className="card-hover group transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 214, 143, 0.12), rgba(0, 214, 143, 0.05))',
              border: '1px solid rgba(0, 214, 143, 0.25)',
              borderRadius: '20px',
              padding: '24px 28px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 24px rgba(0, 214, 143, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div style={{ fontFamily: "'DM Sans'", color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Words Learned
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '40px', fontWeight: 800, color: 'var(--green)', marginBottom: '4px' }}>
              {stats.wordsLearned}
            </p>
            <p style={{ fontFamily: "'DM Sans'", fontSize: '12px', color: 'var(--green)', opacity: 0.8 }}>Your mental library</p>
          </div>

          {/* Level Card */}
          <div
            className="card-hover group transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.12), rgba(245, 166, 35, 0.05))',
              border: '1px solid rgba(245, 166, 35, 0.25)',
              borderRadius: '20px',
              padding: '24px 28px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 24px rgba(245, 166, 35, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div style={{ fontFamily: "'DM Sans'", color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Level
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '40px', fontWeight: 800, color: 'var(--gold)', marginBottom: '4px' }}>
              {stats.level}
            </p>
            <p style={{ fontFamily: "'DM Sans'", fontSize: '12px', color: 'var(--gold)', opacity: 0.8 }}>Progress is steady</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-3 gap-8 animate-fade-up-delay-2">
          {/* Word of Day */}
          <div className="lg:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '4px',
                  height: '28px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--accent)',
                }}
              />
              <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '24px', fontWeight: 800 }}>Word of the Day</h2>
            </div>

            {wordLoading ? (
              <div className="skeleton" style={{ height: '300px', borderRadius: '24px' }} />
            ) : word ? (
              <div
                className="w-full transition-all card-hover"
                style={{
                  background: 'linear-gradient(135deg, #12121f, #150e2a)',
                  border: '1px solid rgba(124, 109, 250, 0.15)',
                  borderRadius: '24px',
                  padding: '32px'
                }}
              >
                <div 
                  className="mb-6 inline-block"
                  style={{
                    background: 'rgba(124,109,250,0.15)',
                    color: 'var(--accent-bright)',
                    border: '1px solid rgba(124,109,250,0.3)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    padding: '4px 12px',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}
                >
                  TODAY'S CHALLENGE
                </div>

                <h3 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '52px', fontWeight: 800, marginBottom: '16px', color: 'white' }}>
                  {word.word}
                </h3>

                <p style={{ fontFamily: "'DM Sans'", fontSize: '16px', fontWeight: 400, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                  {word.definition}
                </p>

                <button
                  onClick={() => router.push('/word-of-the-day')}
                  style={{ fontFamily: "'DM Sans'", color: 'var(--accent-bright)', fontSize: '16px', fontWeight: 500 }}
                  className="hover:underline transition-all"
                >
                  Dive Deeper →
                </button>
              </div>
            ) : (
              <div className="card p-8 text-center" style={{ color: 'var(--text-secondary)', borderRadius: '24px' }}>
                Check back later for today's word.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>
              Quick Actions
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/quiz')}
                className="w-full btn-press flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, #7c6dfa, #9d51f5)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  boxShadow: '0 8px 32px rgba(124,109,250,0.35)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '18px', fontWeight: 600 }}>Start Quiz</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </button>

              {[
                { label: 'Community Feed', route: '/feed', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /> },
                { label: 'Leaderboard', route: '/leaderboard', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
                { label: 'My Profile', route: '/profile', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => router.push(item.route)}
                  className="w-full text-left flex items-center justify-between btn-press transition-colors"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '18px 24px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.borderColor = 'rgba(124, 109, 250, 0.4)';
                      e.currentTarget.style.background = 'rgba(18, 18, 31, 0.8)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget instanceof HTMLElement) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.background = 'rgba(32, 32, 48, 0.5)';
                    }
                  }}
                >
                  <span style={{ fontFamily: "'DM Sans'", fontSize: '15px', fontWeight: 500, color: 'white' }}>{item.label}</span>
                  <svg className="w-5 h-5 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
 