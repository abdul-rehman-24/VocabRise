'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [word, setWord] = useState<{
    id: string
    word: string
    definition: string
    urduMeaning: string | null
    example: string
    dayIndex: number
    difficulty: string
    createdAt: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/word-of-day')
      .then(res => res.json())
      .then(data => {
        setWord(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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

          {/* Right buttons */}
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/auth/signin')} className="border border-zinc-600 text-zinc-200 hover:border-indigo-500 hover:text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
              Sign In
            </button>
            <button onClick={() => router.push('/auth/signin')} className="btn-primary transition-all duration-200 hover:bg-indigo-500 hover:scale-105 active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-[#0F0F0F] py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-600/8 blur-[80px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 text-zinc-100 animate-fade-up">
            Master English
            <br />
            <span className="text-indigo-500">Vocabulary</span>
            <br />
            Every Single Day.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-up-delay">
            Join thousands of learners building their vocabulary through community, streaks, and daily challenges.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delay-2">
            <button onClick={() => router.push('/auth/signin')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 text-base sm:text-lg">
              Start Learning Free
            </button>
            <button className="border border-zinc-600 text-zinc-200 hover:border-zinc-400 px-8 py-3 rounded-lg font-medium transition-all duration-200 text-base sm:text-lg">
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-around items-center gap-8 sm:gap-0">
          <div className="text-center hover:scale-105 transition-transform duration-200 cursor-default">
            <p className="text-indigo-400 font-bold text-4xl tabular-nums">10,000+</p>
            <p className="text-sm text-zinc-500 mt-1">Words in library</p>
          </div>
          <div className="text-center hover:scale-105 transition-transform duration-200 cursor-default">
            <p className="text-indigo-400 font-bold text-4xl tabular-nums">5,000+</p>
            <p className="text-sm text-zinc-500 mt-1">Active learners</p>
          </div>
          <div className="text-center hover:scale-105 transition-transform duration-200 cursor-default">
            <p className="text-indigo-400 font-bold text-4xl tabular-nums">50,000+</p>
            <p className="text-sm text-zinc-500 mt-1">Quizzes taken</p>
          </div>
        </div>
      </section>

      {/* WORD OF THE DAY CARD */}
      <section className="bg-[#0F0F0F] py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-zinc-500 text-sm uppercase tracking-widest text-center mb-4">Featured Today</p>
          
          {loading ? (
            // Loading skeleton
            <div className="card border-t-4 border-t-indigo-600 p-8 sm:p-10 shadow-lg shadow-indigo-500/5 animate-pulse">
              <div className="inline-block mb-6">
                <div className="h-6 w-32 bg-zinc-800 rounded-full" />
              </div>
              <div className="h-16 w-48 bg-zinc-800 rounded-lg mb-6" />
              <div className="grid sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-zinc-800">
                <div>
                  <div className="h-4 w-32 bg-zinc-800 rounded mb-3" />
                  <div className="h-20 w-full bg-zinc-800 rounded" />
                </div>
                <div>
                  <div className="h-4 w-32 bg-zinc-800 rounded mb-3" />
                  <div className="h-20 w-full bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="mb-8">
                <div className="h-4 w-20 bg-zinc-800 rounded mb-3" />
                <div className="h-24 w-full bg-zinc-800 rounded" />
              </div>
              <div className="h-10 w-32 bg-zinc-800 rounded-lg" />
            </div>
          ) : word ? (
            // Word loaded successfully
            <div className="card border-t-4 border-t-indigo-600 p-8 sm:p-10 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
              {/* Badge */}
              <div className="inline-block mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-600/30">
                  ✨ Word of the Day
                </span>
              </div>

              {/* Word */}
              <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 mb-4">
                {word.word}
              </h2>

              {/* Meanings */}
              <div className="grid sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-zinc-800">
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    English Meaning
                  </h3>
                  <p className="text-lg text-zinc-100">
                    {word.definition}
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Urdu Meaning
                  </h3>
                  <p className="text-lg text-zinc-100 text-right leading-loose" dir="rtl">
                    {word.urduMeaning || 'Not available'}
                  </p>
                </div>
              </div>

              {/* Example */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Example
                </h3>
                <p className="text-base text-zinc-300 italic leading-relaxed bg-zinc-800/30 rounded-xl p-4">
                  "{word.example}"
                </p>
              </div>

              {/* Button */}
              <button className="w-full sm:w-auto btn-primary px-8 py-3 text-base font-semibold hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-200">
                Save to My List
              </button>
            </div>
          ) : (
            // No word available
            <div className="card border-t-4 border-t-indigo-600 p-8 sm:p-10 text-center">
              <p className="text-zinc-400">No word available today</p>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-[#0F0F0F] py-20 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Everything you need to learn faster
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Designed to help you master vocabulary with powerful features and community support.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Card 1 - Daily Words */}
            <div className="feature-card hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 group cursor-pointer animate-fade-up hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="h-0.5 w-0 bg-indigo-500 group-hover:w-full transition-all duration-500 mb-4 rounded-full" />
              <div className="w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                Daily Words
              </h3>
              <p className="text-zinc-400">
                A new word every single day, carefully curated to help you expand your vocabulary progressively.
              </p>
            </div>

            {/* Card 2 - Community Feed */}
            <div className="feature-card hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 group cursor-pointer animate-fade-up-delay hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="h-0.5 w-0 bg-indigo-500 group-hover:w-full transition-all duration-500 mb-4 rounded-full" />
              <div className="w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12v-2a9 9 0 00-12 0v2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                Community Feed
              </h3>
              <p className="text-zinc-400">
                Share discoveries, learn from others, and be part of a vibrant community of language learners.
              </p>
            </div>

            {/* Card 3 - Streaks & XP */}
            <div className="feature-card hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 group cursor-pointer animate-fade-up-delay-2 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="h-0.5 w-0 bg-indigo-500 group-hover:w-full transition-all duration-500 mb-4 rounded-full" />
              <div className="w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                Streaks & XP
              </h3>
              <p className="text-zinc-400">
                Stay motivated with daily streaks, earn XP points, and unlock achievements as you progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors duration-200 cursor-pointer">VocabRise</p>
          <p className="text-zinc-500 text-sm">Built for learners © 2025</p>
        </div>
      </footer>
    </main>
  )
}
