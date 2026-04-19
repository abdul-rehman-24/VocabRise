'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/app/components/shared/Navbar'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [word, setWord] = useState<any>(null)
  const [wordLoading, setWordLoading] = useState(true)
  const [stats, setStats] = useState({
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
    fetch('/api/word-of-day')
      .then(res => res.json())
      .then(data => {
        setWord(data)
        setWordLoading(false)
      })
      .catch(() => setWordLoading(false))
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
            className="w-12 h-12 rounded-full border-4 border-t-[var(--accent)] mx-auto mb-4 animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const userName = session.user?.name || 'User'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="page-wrapper min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Greeting */}
        <div className="mb-12">
          <p style={{ fontFamily: "'DM Sans'", fontSize: '24px', fontWeight: 400, color: 'var(--text-secondary)' }} className="mb-2">
            {greeting}
          </p>
          <h1 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '48px', fontWeight: 800 }} className="gradient-text">
            {userName.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Keep learning and expanding your vocabulary</p>
        </div>

        {/* Stat Cards - Visually Distinct */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {/* Streak Card - Orange */}
          <div
            className="card p-8"
            style={{
              background: 'rgba(255, 107, 53, 0.08)',
              borderColor: 'rgba(255, 107, 53, 0.2)',
            }}
          >
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Current Streak
            </div>
            <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '40px', fontWeight: 800, color: '#ff6b35', marginBottom: '8px' }}>
              {stats.currentStreak}
            </p>
            <p style={{ fontSize: '12px', color: '#ff6b35' }}>Keep it going! 🔥</p>
          </div>

          {/* XP Card - Purple */}
          <div
            className="card p-8"
            style={{
              background: 'rgba(124, 109, 250, 0.08)',
              borderColor: 'rgba(124, 109, 250, 0.2)',
            }}
          >
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Total XP
            </div>
            <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '40px', fontWeight: 800, color: 'var(--accent-bright)', marginBottom: '8px' }}>
              {stats.totalXP}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--accent-bright)' }}>Earn more today ⭐</p>
          </div>

          {/* Words Card - Green */}
          <div
            className="card p-8"
            style={{
              background: 'rgba(0, 214, 143, 0.08)',
              borderColor: 'rgba(0, 214, 143, 0.2)',
            }}
          >
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Words Learned
            </div>
            <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '40px', fontWeight: 800, color: 'var(--green)', marginBottom: '8px' }}>
              {stats.wordsLearned}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--green)' }}>Your mental library 📚</p>
          </div>

          {/* Level Card - Gold */}
          <div
            className="card p-8"
            style={{
              background: 'rgba(245, 166, 35, 0.08)',
              borderColor: 'rgba(245, 166, 35, 0.2)',
            }}
          >
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Level
            </div>
            <p style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '40px', fontWeight: 800, color: 'var(--gold)', marginBottom: '8px' }}>
              {stats.level}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--gold)' }}>Progress is steady 📈</p>
          </div>
        </div>

        {/* Bottom Section: Word of Day + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-8">
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
              <div className="card p-8 skeleton" style={{ height: '300px' }} />
            ) : word ? (
              <div
                className="card p-8"
                style={{
                  background: 'linear-gradient(135deg, #12121f, #150e2a)',
                  borderColor: 'rgba(124, 109, 250, 0.15)',
                }}
              >
                <div className="badge badge-primary mb-4">Today's Challenge</div>

                <h3 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '52px', fontWeight: 800, marginBottom: '16px' }}>
                  {word.word}
                </h3>

                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                  {word.definition}
                </p>

                {word.example && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: '3px solid var(--accent)',
                      borderRadius: '0 12px 12px 0',
                      padding: '16px 20px',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      color: 'var(--text-muted)',
                      marginBottom: '16px',
                    }}
                  >
                    "{word.example}"
                  </div>
                )}

                <button
                  onClick={() => router.push('/word-of-the-day')}
                  style={{ color: 'var(--accent-bright)', fontSize: '14px', fontWeight: 500 }}
                  className="hover:underline transition-all"
                >
                  Dive Deeper →
                </button>
              </div>
            ) : (
              <div className="card p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                Check back later for today's word.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>
              Quick Actions
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/quiz')}
                className="w-full btn btn-primary p-5 text-left flex items-center justify-between"
              >
                <span style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '18px', fontWeight: 600 }}>Start Quiz</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>

              {['Community Words', 'Leaderboard', 'My Profile'].map((item, i) => (
                <button
                  key={i}
                  onClick={() =>
                    router.push(
                      item === 'Community Words'
                        ? '/community-words'
                        : item === 'Leaderboard'
                        ? '/leaderboard'
                        : '/profile'
                    )
                  }
                  className="w-full card p-4 text-left flex items-center justify-between hover:bg-[var(--bg-card-hover)]"
                >
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{item}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
