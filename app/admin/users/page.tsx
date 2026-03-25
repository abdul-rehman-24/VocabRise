'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  name?: string
  email?: string
  role: string
  createdAt: string
  stats?: {
    totalXP: number
  }
}

export default function UsersManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching users:', err)
        setLoading(false)
      })
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (res.ok) {
        fetchUsers()
      }
    } catch (err) {
      console.error('Error updating user role:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading...</p>
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-zinc-100 hidden sm:inline">Admin Panel</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
              Overview
            </Link>
            <Link href="/admin/words" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
              Words
            </Link>
            <Link href="/admin/users" className="text-indigo-400 text-sm font-medium">
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Users Management</h1>
          <p className="text-zinc-400 text-lg">Manage user roles and permissions</p>
        </div>

        {/* USERS TABLE */}
        {loading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center">
            <p className="text-zinc-400">Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">XP</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Joined</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-white">{user.name || 'Anonymous'}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300">{user.stats?.totalXP || 0}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleRole(user.id, user.role)}
                          className={`text-sm font-medium transition-colors ${
                            user.role === 'ADMIN'
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-green-400 hover:text-green-300'
                          }`}
                        >
                          Make {user.role === 'ADMIN' ? 'User' : 'Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center">
            <p className="text-zinc-400">No users found</p>
          </div>
        )}
      </div>
    </main>
  )
}
