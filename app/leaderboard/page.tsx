'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-500/10 border-amber-500/30'
    if (rank === 2) return 'bg-gray-500/10 border-gray-500/30'
    if (rank === 3) return 'bg-orange-500/10 border-orange-500/30'
    return 'bg-zinc-900 border-zinc-800'
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-500 text-black'
    if (rank === 2) return 'bg-gray-400 text-black'
    if (rank === 3) return 'bg-orange-500 text-white'
    return 'bg-zinc-700 text-zinc-200'
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <main className="min-h-screen bg-[#0F0F0F] text-zinc-100">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-zinc-100 hidden sm:inline hover:text-indigo-400 transition-colors duration-200 cursor-pointer">VocabRise</span>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-zinc-400 text-lg">Top learners this week</p>
        </div>

        {/* LEADERBOARD TABLE */}
        {loading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center">
            <p className="text-zinc-400">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry) => {
              const isCurrentUser = session.user?.email === entry.userId
              const rankColor = getRankColor(entry.rank)
              const badgeColor = getRankBadgeColor(entry.rank)
              const emoji = getRankEmoji(entry.rank)
              const userInitial = entry.name.charAt(0).toUpperCase()

              return (
                <div
                  key={entry.rank}
                  className={`border rounded-xl p-4 transition-all duration-200 ${
                    isCurrentUser
                      ? 'bg-indigo-500/10 border-indigo-500/50'
                      : rankColor
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${badgeColor}`}>
                        {emoji || entry.rank}
                      </div>
                    </div>

                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center border border-zinc-600">
                        <span className="text-white font-bold text-sm">{userInitial}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{entry.name}</p>
                        {isCurrentUser && (
                          <p className="text-xs text-indigo-400">You</p>
                        )}
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className="flex-shrink-0">
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1">
                        <p className="text-xs font-medium text-zinc-300">Level {entry.level}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <p className="text-lg font-bold text-indigo-400">{entry.totalXP} XP</p>
                      <p className="text-xs text-zinc-400">{entry.wordsLearned} words</p>
                    </div>
                  </div>

                  {/* Mobile stats */}
                  <div className="flex gap-4 mt-3 sm:hidden text-sm">
                    <div>
                      <p className="text-indigo-400 font-semibold">{entry.totalXP} XP</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">{entry.wordsLearned} words</p>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* User Rank Card if Outside Top 10 */}
            {userRank && !leaderboard.some(entry => session.user?.email === entry.userId) && (
              <div className="mt-8 pt-8 border-t border-zinc-800">
                <p className="text-sm text-zinc-400 mb-4">Your Global Rank:</p>
                <div className="bg-indigo-500/10 border border-indigo-500/50 rounded-xl p-6 flex items-center gap-6">
                  <div className="flex-1">
                    <p className="text-4xl font-bold text-indigo-400">#{userRank.rank}</p>
                    <p className="text-sm text-zinc-400 mt-1">Global Rank</p>
                  </div>
                  <div className="flex gap-8 text-right">
                    <div>
                      <p className="text-xl font-bold text-white">{userRank.totalXP}</p>
                      <p className="text-xs text-zinc-400">Total XP</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">Level {userRank.level}</p>
                      <p className="text-xs text-zinc-400">Current Level</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{userRank.wordsLearned}</p>
                      <p className="text-xs text-zinc-400">Words Learned</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center">
            <p className="text-zinc-400">No leaderboard data available</p>
          </div>
        )}
      </div>
    </main>
  )
}
