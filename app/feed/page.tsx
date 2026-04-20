'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/app/components/shared/Navbar'

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

const getDifficulty = (word: string) => {
  if (word.length > 8) return { label: 'ADVANCED', class: 'badge-advanced', bg: 'rgba(255, 77, 109, 0.08)', color: 'var(--semantic-danger)', border: 'var(--semantic-danger)' }
  if (word.length > 5) return { label: 'INTERMEDIATE', class: 'badge-intermediate', bg: 'rgba(245, 166, 35, 0.08)', color: 'var(--semantic-warning)', border: 'var(--semantic-warning)' }
  return { label: 'BEGINNER', class: 'badge-beginner', bg: '#0d2218', color: '#00d68f', border: 'rgba(0,214,143,0.25)' }
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
  const [dislikedPosts, setDislikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'latest' | 'trending' | 'discussed' | 'saved'>('latest')
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
            // Format saved words as posts
            const formattedPosts = data.savedWords.map((w: any) => ({
              id: w.postId || w.id,
              word: w.word,
              definition: w.definition,
              urduMeaning: w.urduMeaning,
              example: w.example,
              likesCount: 0,
              dislikesCount: 0,
              createdAt: w.createdAt,
              user: {
                id: session?.user?.email || '',
                name: session?.user?.name || 'You',
                image: session?.user?.image || null,
              },
            }))
            setPosts(prev => [...prev, ...formattedPosts])
          } else {
            const formattedPosts = data.savedWords.map((w: any) => ({
              id: w.postId || w.id,
              word: w.word,
              definition: w.definition,
              urduMeaning: w.urduMeaning,
              example: w.example,
              likesCount: 0,
              dislikesCount: 0,
              createdAt: w.createdAt,
              user: {
                id: session?.user?.email || '',
                name: session?.user?.name || 'You',
                image: session?.user?.image || null,
              },
            }))
            setPosts(formattedPosts)
          }
          setPagination(data.pagination)
          setPage(pageNum)
        }
      } else {
        res = await fetch(`/api/posts?page=${pageNum}&limit=10&sort=${filterType}`)
        const data = await res.json()

        if (data.pagination) {
          if (isLoadMore) {
            setPosts(prev => [...prev, ...data.posts])
          } else {
            setPosts(data.posts)
          }
          setPagination(data.pagination)
          setPage(pageNum)
        } else {
          setPosts(Array.isArray(data) ? data : [])
        }
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

      await fetchPosts(1, filter)
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
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading feed...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="page-wrapper min-h-screen pb-12">
      <Navbar />

      <main className="max-w-[800px] mx-auto px-[24px] py-12">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-up">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--semantic-success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>Live</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
              Community <span style={{ background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Feed</span>
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-press"
            style={{
              background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '15px',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 4px 15px rgba(124,109,250,0.3)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Post a Word
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-10 border-b pb-6 animate-fade-up-delay" style={{ borderColor: 'var(--border)' }}>
          {(['Latest', 'Top Liked', 'Most Discussed'] as const).map(tab => {
            const tabValue = tab.toLowerCase().replace(' ', '') as any;
            const isActive = filter === tabValue || (filter === 'latest' && tab === 'Latest') || (filter === 'trending' && tab === 'Top Liked') || (filter === 'discussed' && tab === 'Most Discussed');
            
            return (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab === 'Top Liked' ? 'trending' : tab === 'Most Discussed' ? 'discussed' : 'latest')
                  setPage(1)
                  setPosts([])
                }}
                className="btn-press"
                style={{
                  padding: '6px 18px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: "'DM Sans'",
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1,2,3].map(i => <div key={i} className="skeleton w-full h-[200px]" style={{ borderRadius: '20px' }} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            No posts yet. Be the first to share a word!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post, idx) => {
              const diff = getDifficulty(post.word);
              
              return (
              <div 
                key={post.id} 
                className="card-hover" 
                style={{ 
                  animation: `fadeUp 0.6s ease forwards`, 
                  animationDelay: `${idx * 0.1}s`,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '24px',
                  marginBottom: '12px'
                }}
              >
                {/* Author Info */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-3 items-center">
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: getAvatarColor(post.user.name || 'A'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '16px',
                        fontFamily: 'var(--font-heading)'
                      }}
                    >
                      {post.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex items-center gap-2">
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 500, color: 'white' }}>
                        {post.user.name || 'Anonymous'}
                      </p>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <div style={{
                    background: diff.bg,
                    color: diff.color,
                    border: `1.5px solid ${diff.border}`,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {diff.label}
                  </div>
                </div>

                {/* Word and Content */}
                <div className="flex justify-between items-end mb-4">
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: 'white' }}>
                    {post.word}
                  </h3>
                  {post.urduMeaning && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 300, color: 'var(--brand-bright)', direction: 'rtl', marginLeft: 'auto' }}>
                      (Urdu: {post.urduMeaning})
                    </p>
                  )}
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px', color: 'var(--text-secondary)' }}>
                  {post.definition}
                </p>

                {post.example && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '0 8px 8px 0',
                      backgroundColor: 'rgba(124, 109, 250, 0.08)',
                      borderLeft: '2px solid var(--brand-bright)',
                      marginBottom: '20px',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    {post.example}
                  </div>
                )}

                <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="btn-press"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'var(--font-body)',
                      backgroundColor: likedPosts.has(post.id) ? 'rgba(255, 77, 109, 0.12)' : 'transparent',
                      border: likedPosts.has(post.id) ? '1px solid var(--semantic-danger)' : '1px solid var(--brand-border)',
                      color: likedPosts.has(post.id) ? 'var(--semantic-danger)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg
                      className={likedPosts.has(post.id) ? 'animate-[heartPop_0.3s_ease]' : ''}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {post.likesCount}
                  </button>

                  <button
                    onClick={() => handleDislike(post.id)}
                    className="btn-press"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'var(--font-body)',
                      backgroundColor: dislikedPosts.has(post.id) ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      border: dislikedPosts.has(post.id) ? '1px solid var(--semantic-info)' : '1px solid var(--brand-border)',
                      color: dislikedPosts.has(post.id) ? 'var(--semantic-info)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={dislikedPosts.has(post.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                    </svg>
                    {post.dislikesCount}
                  </button>

                  <button
                    className="btn-press"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: "'DM Sans'",
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Comment
                  </button>

                  <button
                    onClick={() => toggleSave(post.id)}
                    className="btn-press"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: "'DM Sans'",
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      color: savedPosts.has(post.id) ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginLeft: 'auto'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={savedPosts.has(post.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            )})}

            {/* Load More Button */}
            {pagination && pagination.page < pagination.pages && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => fetchPosts(page + 1, filter)}
                  disabled={loadingMore}
                  className="btn-press"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    padding: '12px 32px',
                    borderRadius: '50px',
                    color: 'white',
                    fontFamily: "'DM Sans'",
                    fontWeight: 500,
                    cursor: 'pointer',
                    opacity: loadingMore ? 0.6 : 1 
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="animate-fade-up"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-hover)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '520px',
                width: '100%',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'white' }}>
                Share a Word
              </h2>

              {error && (
                <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 77, 109, 0.1)', border: '1px solid rgba(255, 77, 109, 0.3)', fontSize: '14px', color: 'var(--red)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Word"
                    value={formData.word}
                    onChange={e => setFormData({ ...formData, word: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      fontFamily: "'DM Sans'",
                      fontSize: '15px',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,109,250,0.15)';
                      e.currentTarget.style.outline = 'none';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Definition"
                    value={formData.definition}
                    onChange={e => setFormData({ ...formData, definition: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      fontFamily: "'DM Sans'",
                      fontSize: '15px',
                      resize: 'none',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,109,250,0.15)';
                      e.currentTarget.style.outline = 'none';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Urdu Meaning (Optional)"
                    value={formData.urduMeaning}
                    onChange={e => setFormData({ ...formData, urduMeaning: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      fontFamily: "'DM Sans'",
                      fontSize: '15px',
                      direction: formData.urduMeaning ? 'rtl' : 'ltr'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,109,250,0.15)';
                      e.currentTarget.style.outline = 'none';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Example Sentence (Optional)"
                    value={formData.example}
                    onChange={e => setFormData({ ...formData, example: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      fontFamily: "'DM Sans'",
                      fontSize: '15px',
                      resize: 'none',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,109,250,0.15)';
                      e.currentTarget.style.outline = 'none';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setError('')
                    }}
                    className="btn-press"
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      padding: '16px',
                      borderRadius: '12px',
                      color: 'white',
                      fontFamily: "'DM Sans'",
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-press"
                    style={{
                      flex: 2,
                      background: 'linear-gradient(135deg, #7c6dfa, #e040fb)',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '12px',
                      color: 'white',
                      fontFamily: "'DM Sans'",
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: formLoading ? 0.7 : 1,
                      height: '52px'
                    }}
                  >
                    {formLoading ? 'Posting...' : 'Post Word'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}