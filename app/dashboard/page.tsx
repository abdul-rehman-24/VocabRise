'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [word, setWord] = useState<any>(null)
  const [wordLoading, setWordLoading] = useState(true)
  const [stats, setStats] = useState({ totalXP: 0, level: 1, currentStreak: 0, wordsLearned: 0 })

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
        console.error('Error fetching stats:', err)
      }
    }
    
    fetchStats() // Fetch immediately
    
    // Poll every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userName = session.user?.name || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

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

          {/* Right section with user avatar */}
          <div className="flex items-center gap-4">
            <Link href="/feed" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
              Feed
            </Link>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center border border-indigo-500">
              <span className="text-white font-bold text-sm">{userInitial}</span>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-zinc-400 hover:text-red-400 text-sm transition-colors duration-200">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* WELCOME HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">{greeting}, {userName.split(' ')[0]}</h1>
          <p className="text-zinc-400 text-lg">Ready to learn today?</p>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Streak Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm font-medium">Current Streak</p>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.currentStreak} days</p>
            <p className="text-xs text-zinc-500 mt-2">Keep it going!</p>
          </div>

          {/* XP Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm font-medium">Total XP</p>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalXP} XP</p>
            <p className="text-xs text-zinc-500 mt-2">Earn more today</p>
          </div>

          {/* Words Learned Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm font-medium">Words Learned</p>
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.wordsLearned} words</p>
            <p className="text-xs text-zinc-500 mt-2">Start learning now</p>
          </div>

          {/* Quiz Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm font-medium">Level</p>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-white">Level {stats.level}</p>
            <p className="text-xs text-zinc-500 mt-2">Keep progressing</p>
          </div>
        </div>

        {/* WORD OF THE DAY */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Word of the Day</h2>
          {wordLoading ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center">
              <p className="text-zinc-400">Loading word...</p>
            </div>
          ) : word ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all duration-200">
              <h3 className="text-3xl font-bold text-indigo-400 mb-2">{word.word}</h3>
              <p className="text-zinc-300 mb-4 text-lg">{word.definition}</p>
              {word.urduMeaning && (
                <p className="text-zinc-400 text-sm mb-4 italic">Urdu: {word.urduMeaning}</p>
              )}
              {word.example && (
                <p className="text-zinc-400 text-sm mb-6 bg-zinc-800/50 rounded-lg p-3 italic">
                  "{word.example}"
                </p>
              )}
              <button className="text-indigo-500 hover:text-indigo-400 font-medium text-sm transition-colors">
                Learn More →
              </button>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center">
              <p className="text-zinc-400">No word available today</p>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => router.push('/quiz')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95">
            Start Quiz
          </button>
          <button onClick={() => router.push('/feed')} className="border border-zinc-700 text-zinc-200 hover:border-zinc-600 hover:text-zinc-100 font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95">
            Browse Feed
          </button>
          <button onClick={() => router.push('/leaderboard')} className="border border-zinc-700 text-zinc-200 hover:border-zinc-600 hover:text-zinc-100 font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95">
            Leaderboard
          </button>
        </div>
      </div>
    </main>
  )
}
 