'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Word {
  id: string
  word: string
  definition: string
  urduMeaning?: string
  example: string
  dayIndex: number
  difficulty: string
}

export default function WordsManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    urduMeaning: '',
    example: '',
    dayIndex: 11,
    difficulty: 'INTERMEDIATE',
  })
  const [submitting, setSubmitting] = useState(false)

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
    fetchWords()
  }, [])

  const fetchWords = () => {
    fetch('/api/admin/words')
      .then(res => res.json())
      .then(data => {
        setWords(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching words:', err)
        setLoading(false)
      })
  }

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchWords()
        setShowModal(false)
        setFormData({
          word: '',
          definition: '',
          urduMeaning: '',
          example: '',
          dayIndex: words.length > 0 ? Math.max(...words.map(w => w.dayIndex)) + 1 : 11,
          difficulty: 'INTERMEDIATE',
        })
      }
    } catch (err) {
      console.error('Error adding word:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteWord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return

    try {
      const res = await fetch(`/api/admin/words?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchWords()
      }
    } catch (err) {
      console.error('Error deleting word:', err)
    }
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
            <Link href="/admin/words" className="text-indigo-400 text-sm font-medium">
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Words Management</h1>
            <p className="text-zinc-400 text-lg">Manage words of the day</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
          >
            Add Word
          </button>
        </div>

        {/* WORDS TABLE */}
        {loading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center">
            <p className="text-zinc-400">Loading words...</p>
          </div>
        ) : words.length > 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Word</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Definition</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Day</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Difficulty</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {words.map((word) => (
                    <tr key={word.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-indigo-400">{word.word}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300 max-w-md truncate">{word.definition}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300">{word.dayIndex}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          word.difficulty === 'BEGINNER' ? 'bg-green-500/20 text-green-400' :
                          word.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {word.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteWord(word.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Delete
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
            <p className="text-zinc-400">No words found</p>
          </div>
        )}
      </div>

      {/* ADD WORD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Word</h2>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Word</label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={e => setFormData({ ...formData, word: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter word"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Definition</label>
                <textarea
                  value={formData.definition}
                  onChange={e => setFormData({ ...formData, definition: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter definition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Urdu Meaning</label>
                <input
                  type="text"
                  value={formData.urduMeaning}
                  onChange={e => setFormData({ ...formData, urduMeaning: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter Urdu meaning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Example</label>
                <input
                  type="text"
                  value={formData.example}
                  onChange={e => setFormData({ ...formData, example: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Enter example sentence"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Day Index</label>
                <input
                  type="number"
                  value={formData.dayIndex}
                  onChange={e => setFormData({ ...formData, dayIndex: parseInt(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option>BEGINNER</option>
                  <option>INTERMEDIATE</option>
                  <option>ADVANCED</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  {submitting ? 'Adding...' : 'Add Word'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
