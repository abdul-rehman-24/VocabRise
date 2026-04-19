'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import ModernPostCard from '@/app/components/feed/ModernPostCard'

interface Post {
  id: string
  word: string
  definition: string
  urduMeaning: string | null
  example: string | null
  likesCount: number
  dislikesCount: number
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

export default function CommunityWordsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [dislikedPosts, setDislikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'latest' | 'trending' | 'discussed' | 'saved'>('latest')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchSavedWords()
    }
  }, [status, router])

  useEffect(() => {
    fetchPosts(1, filter)
  }, [filter])

  const fetchSavedWords = async () => {
    try {
      const res = await fetch('/api/saved-words?page=1&limit=100')
      const data = await res.json()
      if (data.savedWords) {
        const savedIds = new Set(data.savedWords.map((w: any) => w.postId).filter(Boolean) as string[])
        setSavedPosts(savedIds)
      }
    } catch (error) {
      console.error('Error fetching saved words:', error)
    }
  }

  const fetchPosts = async (pageNum: number, filterType: 'latest' | 'trending' | 'discussed' | 'saved' = 'latest') => {
    try {
      const isLoadMore = pageNum > 1
      isLoadMore ? setLoadingMore(true) : setLoading(true)

      let res
      if (filterType === 'saved') {
        res = await fetch(`/api/saved-words?page=${pageNum}&limit=10`)
        const data = await res.json()
        if (data.savedWords) {
          if (isLoadMore) {
            setPosts(prev => [...prev, ...data.savedWords])
          } else {
            setPosts(data.savedWords)
          }
          setPagination(data.pagination)
          setPage(pageNum)
        }
      } else {
        res = await fetch(`/api/posts?page=${pageNum}&limit=10`)
        const data = await res.json()

        if (data.pagination) {
          if (isLoadMore) {
            setPosts(prev => [...prev, ...data.posts])
          } else {
            setPosts(data.posts)
          }
          setPagination(data.pagination)
          setPage(pageNum)
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (pagination && page < pagination.pages) {
      fetchPosts(page + 1, filter)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.liked) {
          setLikedPosts(prev => new Set([...prev, postId]))
          setDislikedPosts(prev => { const newSet = new Set(prev); newSet.delete(postId); return newSet })
        } else {
          setLikedPosts(prev => { const newSet = new Set(prev); newSet.delete(postId); return newSet })
        }
        setPosts(posts.map(post => post.id === postId ? { ...post, likesCount: data.likesCount, dislikesCount: data.dislikesCount } : post))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleDislike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/dislike`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.disliked) {
          setDislikedPosts(prev => new Set([...prev, postId]))
          setLikedPosts(prev => { const newSet = new Set(prev); newSet.delete(postId); return newSet })
        } else {
          setDislikedPosts(prev => { const newSet = new Set(prev); newSet.delete(postId); return newSet })
        }
        setPosts(posts.map(post => post.id === postId ? { ...post, dislikesCount: data.dislikesCount, likesCount: data.likesCount } : post))
      }
    } catch (error) {
      console.error('Error toggling dislike:', error)
    }
  }

  const toggleSave = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/save`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSavedPosts(prev => {
          const next = new Set(prev)
          if (data.saved) {
            next.add(postId)
          } else {
            next.delete(postId)
          }
          return next
        })
      }
    } catch (error) {
      console.error('Error saving word:', error)
    }
  }

  const filteredPosts = posts.filter(
    post =>
      post.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.definition.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading community words...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userInitial = (session.user?.name || 'U').charAt(0).toUpperCase()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">VR</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Vocab<span className="text-blue-600">Rise</span>
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/leaderboard"
                className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors hidden sm:block"
              >
                Leaderboard
              </Link>
              <Link
                href="/quiz"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Take Quiz
              </Link>
              <div className="w-px h-6 bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/profile')}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm hover:shadow-md transition-shadow"
                >
                  {userInitial}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Community Words</h1>
          <p className="text-gray-600">Discover words shared by the community and vote on your favorites</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['Latest', 'Top Liked', 'Most Discussed', 'Saved'] as const).map(tab => {
            const tabValue = tab.toLowerCase().replace(' ', '') as any
            const isActive = (tab === 'Latest' && filter === 'latest') ||
                           (tab === 'Top Liked' && filter === 'trending') ||
                           (tab === 'Most Discussed' && filter === 'discussed') ||
                           (tab === 'Saved' && filter === 'saved')
            
            return (
              <button
                key={tab}
                onClick={() => {
                  const newFilter = tab === 'Top Liked' ? 'trending' : tab === 'Most Discussed' ? 'discussed' : tab === 'Saved' ? 'saved' : 'latest'
                  setFilter(newFilter)
                  setPage(1)
                  setPosts([])
                }}
                className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isActive ? '#2563eb' : '#f3f4f6',
                  color: isActive ? 'white' : '#6b7280',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e5e7eb'
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search words or definitions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-lg border border-gray-200 animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-100 rounded mb-3"></div>
                <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 bg-white rounded-lg border border-gray-200 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747 10-4.5 10-10.747c0-5.502-4.5-10.747-10-10.747z"
              />
            </svg>
            <p className="text-gray-500 font-medium">No words found</p>
            <p className="text-gray-400 text-sm">Try different search terms or check back later</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {filteredPosts.map(post => (
                <ModernPostCard
                  key={post.id}
                  post={post}
                  isLiked={likedPosts.has(post.id)}
                  isDisliked={dislikedPosts.has(post.id)}
                  isSaved={savedPosts.has(post.id)}
                  onLike={() => handleLike(post.id)}
                  onDislike={() => handleDislike(post.id)}
                  onSave={() => toggleSave(post.id)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {pagination && page < pagination.pages && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More Words'}
                </button>
              </div>
            )}

            {/* Footer Info */}
            {pagination && (
              <div className="mt-8 text-center text-gray-500 text-sm">
                Showing {filteredPosts.length} of {pagination.total} words
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
