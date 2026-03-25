'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalWords: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalPosts: 0, totalWords: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // Debug: log session and role
    if (session) {
      console.log('[Admin] Session loaded:', {
        user: session.user?.email,
        role: session.user?.role,
      })
    }

    // If session loaded but user is not ADMIN, redirect
    if (session && status === 'authenticated' && session.user?.role !== 'ADMIN') {
      console.warn('[Admin] Access denied: user does not have ADMIN role')
      router.push('/dashboard')
    }
  }, [session, status, router])

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching stats:', err)
        setLoading(false)
      })
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <main className="min-h-screen bg-[#0F0F0F] text-zinc-100">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-zinc-100 hidden sm:inline">Admin Panel</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
              Overview
            </Link>
            <Link href="/admin/words" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
              Words
            </Link>
            <Link href="/admin/users" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
              Users
            </Link>
            <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
              Back to App
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400 text-lg">Manage your VocabRise platform</p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Users */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm font-medium">Total Users</p>
              <span className="text-2xl">👥</span>
            </div>
            {loading ? (
              <div className="h-8 bg-zinc-800 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            )}
            <p className="text-xs text-zinc-500 mt-2">Registered users</p>
          </div>

          {/* Total Posts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm font-medium">Total Posts</p>
              <span className="text-2xl">📝</span>
            </div>
            {loading ? (
              <div className="h-8 bg-zinc-800 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats.totalPosts}</p>
            )}
            <p className="text-xs text-zinc-500 mt-2">Community posts</p>
          </div>

          {/* Total Words */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm font-medium">Words of the Day</p>
              <span className="text-2xl">📚</span>
            </div>
            {loading ? (
              <div className="h-8 bg-zinc-800 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats.totalWords}</p>
            )}
            <p className="text-xs text-zinc-500 mt-2">Total words</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/words" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-center">
            Manage Words
          </Link>
          <Link href="/admin/users" className="bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-center">
            Manage Users
          </Link>
        </div>
      </div>
    </main>
  )
}
