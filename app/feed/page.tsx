'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  word: string
  definition: string
  urduMeaning: string | null
  example: string | null
  likesCount: number
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function FeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    urduMeaning: '',
    example: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchPosts(1)
  }, [])

  const fetchPosts = async (pageNum: number) => {
    try {
      const isLoadMore = pageNum > 1
      isLoadMore ? setLoadingMore(true) : setLoading(true)
      
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10`)
      const data = await res.json()
      
      if (data.pagination) {
        // Handle paginated response
        if (isLoadMore) {
          setPosts(prev => [...prev, ...data.posts])
        } else {
          setPosts(data.posts)
        }
        setPagination(data.pagination)
        setPage(pageNum)
      } else {
        // Fallback for non-paginated response
        setPosts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      // Refresh posts from page 1
      await fetchPosts(1)
      setFormData({ word: '', definition: '', urduMeaning: '', example: '' })
      setShowModal(false)
    } catch (error) {
      setError('Failed to create post')
      console.error('Error creating post:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      if (res.ok) {
        const { liked, likesCount } = await res.json()
        if (liked) {
          setLikedPosts(prev => new Set([...prev, postId]))
        } else {
          setLikedPosts(prev => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        }
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, likesCount } : post
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatTimeAgo = (createdAt: string) => {
    const date = new Date(createdAt)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <main className="min-h-screen bg-[#0F0F0F] text-zinc-100">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-zinc-100 hidden sm:inline">VocabRise</span>
          </div>
          <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Community Feed</h1>
            <p className="text-zinc-400">Share and discover new words with the community</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 active:scale-95"
          >
            Post a Word
          </button>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center px-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-6">Share a Word</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Word</label>
                  <input
                    type="text"
                    placeholder="Enter word"
                    value={formData.word}
                    onChange={e => setFormData({ ...formData, word: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Definition</label>
                  <textarea
                    placeholder="Enter definition"
                    value={formData.definition}
                    onChange={e => setFormData({ ...formData, definition: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Urdu Meaning (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter Urdu meaning"
                    value={formData.urduMeaning}
                    onChange={e => setFormData({ ...formData, urduMeaning: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Example (Optional)</label>
                  <textarea
                    placeholder="Enter example sentence"
                    value={formData.example}
                    onChange={e => setFormData({ ...formData, example: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setError('') }}
                    className="flex-1 border border-zinc-700 text-zinc-200 hover:border-zinc-600 font-semibold py-2.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all"
                  >
                    {formLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* POSTS */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">No posts yet. Be the first to share a word!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {post.user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{post.user.name || 'Anonymous'}</p>
                    <p className="text-xs text-zinc-500">{formatTimeAgo(post.createdAt)}</p>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-indigo-400 mb-2">{post.word}</h3>
                <p className="text-zinc-300 mb-3">{post.definition}</p>
                {post.urduMeaning && (
                  <p className="text-zinc-400 text-sm mb-3 italic">Urdu: {post.urduMeaning}</p>
                )}
                {post.example && (
                  <p className="text-zinc-400 text-sm mb-4 bg-zinc-800/50 rounded-lg p-3 italic">
                    "{post.example}"
                  </p>
                )}
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    likedPosts.has(post.id) ? 'text-red-400' : 'text-zinc-400 hover:text-red-400'
                  }`}
                >
                  <span>{likedPosts.has(post.id) ? '❤️' : '🤍'}</span>
                  {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
                </button>
              </div>
            ))}
            
            {/* Load More Button */}
            {pagination && pagination.page < pagination.pages && (
              <div className="flex justify-center py-8">
                <button
                  onClick={() => fetchPosts(page + 1)}
                  disabled={loadingMore}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-8 rounded-xl transition-all"
                >
                  {loadingMore ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}