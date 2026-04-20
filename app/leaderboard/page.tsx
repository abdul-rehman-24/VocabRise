'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/app/components/shared/Navbar'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  image: string | null
  totalXP: number
  level: number
  wordsLearned: number
}

interface UserRank {
  rank: number
  totalXP: number
  level: number
  wordsLearned: number
}

// Consistent colors for avatars based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'linear-gradient(135deg, #7c6dfa, #9d51f5)',
    'linear-gradient(135deg, #00d68f, #00b377)',
    'linear-gradient(135deg, #f5a623, #e69110)',
    'linear-gradient(135deg, #ff4d6d, #d93855)',
    'linear-gradient(135deg, #5b8def, #3b70d4)',
    'linear-gradient(135deg, #e040fb, #b82ad0)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<UserRank | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/leaderboard?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setLeaderboard(data.leaderboard || [])
          if (data.userRank) {
            setUserRank(data.userRank)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching leaderboard:', err)
          setLoading(false)
        })
    }
  }, [session?.user?.id])

  if (status === 'loading') {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: "'DM Sans'" }}>Fetching leaderboard rankings...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="page-wrapper pb-12">
      <Navbar />

      <main className="max-w-[800px] mx-auto px-[24px] py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div 
            style={{
              display: 'inline-block',
              background: 'rgba(124,109,250,0.15)',
              color: 'var(--brand-bright)',
              border: '1px solid var(--brand-border)',
              borderRadius: '8px',
              fontSize: '11px',
              letterSpacing: '0.12em',
              padding: '6px 16px',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            GLOBAL RANKINGS
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: 'clamp(40px, 5vw, 56px)', 
            fontWeight: 800,
            marginBottom: '12px'
          }}>
            Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
            Compete with learners worldwide and claim your spot at the top
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="card p-12 flex items-center justify-center text-center border border-[var(--border)] rounded-[24px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
              <p style={{ color: 'var(--text-secondary)', fontFamily: "'DM Sans'" }}>Loading leaderboard...</p>
            </div>
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="animate-fade-up-delay">
            {/* PODIUM - Top 3 */}
            {topThree.length > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                  
                  {/* Rank 2 */}
                  {topThree.length >= 2 && (
                    <div className="order-2 md:order-1 card-hover" style={{ 
                      backgroundColor: 'linear-gradient(135deg, rgba(124,109,250,0.08), rgba(157,140,255,0.04))', 
                      border: '2px solid var(--brand-dim)', 
                      borderRadius: '20px', 
                      padding: '32px 24px', 
                      textAlign: 'center',
                      position: 'relative',
                      borderBottom: '3px solid var(--brand-bright)'
                    }}>
                      <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-bright)', color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(157,140,255,0.4)' }}>
                        2
                      </div>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: getAvatarColor(topThree[1]?.name || 'U'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '24px', margin: '16px auto 16px', border: '3px solid var(--brand-bright)', fontFamily: 'var(--font-heading)' }}>
                        {topThree[1]?.name?.charAt(0).toUpperCase()}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                        {topThree[1]?.name}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: 'var(--brand-bright)', marginBottom: '4px' }}>
                        {topThree[1]?.totalXP} XP
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>Level {topThree[1]?.level}</p>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {topThree.length >= 1 && (
                    <div className="order-1 md:order-2 card-hover transform md:-translate-y-4" style={{ 
                      background: 'linear-gradient(135deg, rgba(245,166,35,0.12), rgba(245,166,35,0.06))', 
                      border: '2px solid var(--semantic-gold)', 
                      borderRadius: '20px', 
                      padding: '40px 24px', 
                      textAlign: 'center',
                      position: 'relative',
                      borderBottom: '4px solid var(--semantic-gold)',
                      boxShadow: '0 12px 32px rgba(245,166,35,0.25)'
                    }}>
                      <div style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--semantic-gold)" stroke="var(--semantic-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px' }}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--semantic-gold)', color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245,166,35,0.5)' }}>
                          1
                        </div>
                      </div>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: getAvatarColor(topThree[0]?.name || 'U'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '32px', margin: '24px auto 16px', border: '4px solid var(--semantic-gold)', fontFamily: 'var(--font-heading)' }}>
                        {topThree[0]?.name?.charAt(0).toUpperCase()}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                        {topThree[0]?.name}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: 'var(--semantic-gold)', marginBottom: '4px' }}>
                        {topThree[0]?.totalXP} XP
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Level {topThree[0]?.level}</p>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {topThree.length >= 3 && (
                    <div className="order-3 md:order-3 card-hover" style={{ 
                      backgroundColor: 'linear-gradient(135deg, rgba(245,166,35,0.08), rgba(245,166,35,0.03))', 
                      border: '2px solid rgba(245,166,35,0.4)', 
                      borderRadius: '20px', 
                      padding: '32px 24px', 
                      textAlign: 'center',
                      position: 'relative',
                      borderBottom: '3px solid rgba(245,166,35,0.6)'
                    }}>
                      <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245,166,35,0.6)', color: 'var(--bg-primary)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,166,35,0.3)' }}>
                        3
                      </div>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: getAvatarColor(topThree[2]?.name || 'U'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '24px', margin: '16px auto 16px', border: '3px solid rgba(245,166,35,0.6)', fontFamily: 'var(--font-heading)' }}>
                        {topThree[2]?.name?.charAt(0).toUpperCase()}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                        {topThree[2]?.name}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: 'rgba(245,166,35,0.8)', marginBottom: '4px' }}>
                        {topThree[2]?.totalXP} XP
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>Level {topThree[2]?.level}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leaderboard List - 4+ */}
            {restOfLeaderboard.length > 0 && (
              <div className="flex flex-col gap-3">
                {restOfLeaderboard.map((entry, idx) => {
                  const isCurrentUser = session.user?.email === entry.userId

                  return (
                    <div
                      key={entry.rank}
                      className="card-hover flex items-center justify-between"
                      style={{
                        height: '72px',
                        padding: '0 24px',
                        borderRadius: '20px',
                        backgroundColor: isCurrentUser ? 'rgba(124, 109, 250, 0.08)' : 'var(--bg-card)',
                        border: isCurrentUser ? '1px solid var(--brand-border)' : '1px solid var(--border)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--text-muted)', width: '30px' }}>
                          {entry.rank}
                        </div>
                        
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: getAvatarColor(entry.name || 'U'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '18px',
                            fontFamily: 'var(--font-heading)',
                          }}
                        >
                          {entry.name?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-3">
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 500, color: 'white' }}>
                              {entry.name}
                            </p>
                            <span style={{ 
                              background: 'rgba(124,109,250,0.12)', 
                              border: '1px solid var(--brand-border)', 
                              color: 'var(--brand-bright)', 
                              borderRadius: '6px', 
                              padding: '3px 10px', 
                              fontSize: '12px',
                              fontFamily: 'var(--font-body)',
                              fontWeight: 500
                            }}>
                              Lvl {entry.level}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)', marginBottom: '2px' }}>
                            {entry.wordsLearned} words
                          </p>
                        </div>
                        <div>
                          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--brand-bright)' }}>
                            {entry.totalXP} XP
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* User Rank Card if Outside Top 10 */}
            {userRank && !leaderboard.some(entry => session.user?.email === entry.userId) && (
              <div className="mt-12 pt-8 border-t border-[var(--border)]">
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Your Global Standing
                </p>

                <div 
                  className="card p-6 flex items-center justify-between" 
                  style={{ 
                    backgroundColor: 'rgba(124, 109, 250, 0.08)', 
                    border: '1px solid var(--brand-border)',
                    borderRadius: '20px'
                  }}
                >
                  <div className="flex items-center gap-6">
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: 'var(--brand-bright)', width: '60px', textAlign: 'center' }}>
                      #{userRank.rank}
                    </div>

                    <div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                        Keep climbing!
                      </h3>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        You're ranked #{userRank.rank} globally. Keep learning to reach the top!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-8 text-right">
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: 'var(--brand-bright)' }}>
                        {userRank.totalXP}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>
                        XP
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-12 text-center border border-[var(--border)] rounded-[24px]">
            <p style={{ color: 'var(--text-secondary)', fontFamily: "'DM Sans'" }}>No leaderboard data available</p>
          </div>
        )}
      </main>
    </div>
  )
}
