'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/app/components/shared/Navbar'
import { toast } from 'react-hot-toast'
import { Inbox, Search, Heart, ThumbsDown, MessageCircle, Bookmark, Share2, Play, Send, Check, X, Loader2 } from 'lucide-react'

interface Post {
  id: string
  word: string
  definition: string
  urduMeaning: string | null
  example: string | null
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'GRE'
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

const FLOATING_WORDS = ["RESILIENT", "ELOQUENT", "BRAVE", "LUCID", "TENACIOUS", "METICULOUS", "SERENDIPITY", "EPHEMERAL"];

const getAvatarColor = (name: string) => {
  const colors = [
    'linear-gradient(135deg, #7C3AED, #EC4899)',
    'linear-gradient(135deg, #06B6D4, #3B82F6)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
    'linear-gradient(135deg, #10B981, #059669)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'BEGINNER': return '#22C55E';
    case 'INTERMEDIATE': return '#EAB308';
    case 'ADVANCED': return '#A855F7';
    case 'GRE': return '#EF4444';
    default: return '#94A3B8';
  }
};

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
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [dislikedPosts, setDislikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'latest' | 'trending' | 'discussed' | 'following'>('latest')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    urduMeaning: '',
    example: '',
    difficulty: 'INTERMEDIATE',
  })

  // Scroll lock for modal
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  // Observer for feed cards
  const observer = useRef<IntersectionObserver | null>(null);
  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    if (!observer.current) {
      observer.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible-card');
            observer.current?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    }
    observer.current.observe(node);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    else if (status === 'authenticated') fetchSavedWords()
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

  const fetchPosts = async (pageNum: number, filterType: string = 'latest') => {
    try {
      const isLoadMore = pageNum > 1
      isLoadMore ? setLoadingMore(true) : setLoading(true)

      // Mock following filter to latest for now
      const apiFilter = filterType === 'following' ? 'latest' : filterType;
      
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10&sort=${apiFilter}`)
      const data = await res.json()

      if (data.pagination) {
        if (isLoadMore) setPosts(prev => [...prev, ...data.posts])
        else setPosts(data.posts)
        setPagination(data.pagination)
        setPage(pageNum)
      } else {
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
    if (formData.word.length > 50 || formData.definition.length > 200) return;
    
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

      setSubmitSuccess(true)
      setTimeout(() => {
        fetchPosts(1, filter)
        setFormData({ word: '', definition: '', urduMeaning: '', example: '', difficulty: 'INTERMEDIATE' })
        setShowModal(false)
        setSubmitSuccess(false)
        setFormLoading(false)
        toast.success('🎉 Word posted successfully!', { style: { background: '#111', color: '#fff', border: '1px solid #7C3AED' } })
      }, 1500)
    } catch (error) {
      setError('Failed to create post')
      setFormLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLikedPosts(prev => {
          const next = new Set(prev);
          data.liked ? next.add(postId) : next.delete(postId);
          return next;
        })
        setDislikedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        })
        setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: data.likesCount, dislikesCount: data.dislikesCount } : p))
      }
    } catch (error) {}
  }

  const handleDislike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/dislike`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setDislikedPosts(prev => {
          const next = new Set(prev);
          data.disliked ? next.add(postId) : next.delete(postId);
          return next;
        })
        setLikedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        })
        setPosts(posts.map(p => p.id === postId ? { ...p, dislikesCount: data.dislikesCount, likesCount: data.likesCount } : p))
      }
    } catch (error) {}
  }

  const toggleSave = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/save`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSavedPosts(prev => {
          const next = new Set(prev)
          data.saved ? next.add(postId) : next.delete(postId)
          return next
        })
        if (data.saved) toast.success('Word saved to Passport!', { icon: '🔖', style: { background: '#1a1a2e', color: '#fff', border: '1px solid #7C3AED' } })
      }
    } catch (error) {}
  }

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }

  const formatTimeAgo = (createdAt: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0D0B1A] pb-12">
        <Navbar />
        <main className="max-w-[800px] mx-auto flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-[#7C3AED] w-12 h-12" />
        </main>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#0D0B1A] text-white font-body pb-12 relative overflow-x-hidden">
      
      {/* Background Dot Grid & Floating Words */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.03 }}></div>
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden mask-fade-bottom">
        {FLOATING_WORDS.map((fw, i) => (
          <div key={i} className="absolute font-heading font-black text-white whitespace-nowrap opacity-[0.04]" 
               style={{ 
                 fontSize: `${Math.random() * 40 + 40}px`, 
                 top: `${Math.random() * 80}%`, 
                 animation: `driftLeft ${Math.random() * 30 + 30}s linear infinite`,
                 animationDelay: `-${Math.random() * 20}s` 
               }}>
            {fw}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        
        .mask-fade-bottom { mask-image: linear-gradient(to bottom, black 50%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); }
        @keyframes driftLeft { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }
        @keyframes pulseGreen { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes heartBounce { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        
        .live-dot { animation: pulseGreen 1.5s infinite; }
        .heart-bounce { animation: heartBounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent); transform: rotate(30deg) translateY(-50%) translateX(-100%); transition: 0s; }
        .shimmer-btn:hover::after { transform: rotate(30deg) translateY(-50%) translateX(100%); transition: 0.7s; }

        .feed-card { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
        .visible-card { opacity: 1; transform: translateY(0); }
        
        .urdu-text { font-family: 'Noto Nastaliq Urdu', serif; }
        
        /* Modal Scroll Lock */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; overflow-y: auto; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal-content { position: relative; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; margin: auto; border-radius: 20px; scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.5) transparent; }
        .modal-content::-webkit-scrollbar { width: 6px; }
        .modal-content::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.5); border-radius: 6px; }
        
        .modal-enter { animation: modalEnter 0.25s ease-out forwards; }
        @keyframes modalEnter { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}} />

      <Navbar />

      <main className="max-w-[720px] mx-auto px-4 py-10 relative z-10">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex items-center justify-center w-2 h-2">
                <div className="absolute w-full h-full rounded-full bg-[#22C55E] live-dot"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] relative z-10"></div>
              </div>
              <span className="text-[#22C55E] text-xs font-bold opacity-80">247 learners online</span>
            </div>
            <h1 className="font-heading text-4xl font-black text-white leading-tight">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899]">Feed</span>
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shimmer-btn bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            Post a Word
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['Latest', 'Top Liked', 'Most Discussed', 'Following'] as const).map(tab => {
              const tabValue = tab.toLowerCase().replace(' ', '') as any;
              const isActive = filter === tabValue || (filter === 'latest' && tab === 'Latest') || (filter === 'trending' && tab === 'Top Liked') || (filter === 'discussed' && tab === 'Most Discussed');
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setFilter(tab === 'Top Liked' ? 'trending' : tab === 'Most Discussed' ? 'discussed' : tab === 'Following' ? 'following' : 'latest')
                    setPage(1)
                    setPosts([])
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive 
                      ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                      : 'border border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)] hover:text-white bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search words, users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-11 pr-4 text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
            />
          </div>
        </div>

        {/* Posts Feed */}
        {loading && page === 1 ? (
          <div className="flex flex-col gap-4 mt-6">
            {[1,2,3].map(i => <div key={i} className="w-full h-48 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.05)] animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.05)] mt-6">
            <Inbox className="mx-auto mb-4 text-[#94A3B8] w-12 h-12" />
            <h3 className="font-heading text-xl font-bold text-white mb-2">No words found</h3>
            <p className="text-[#94A3B8] mb-6">Be the first to share a fascinating word with the community!</p>
            <button onClick={() => setShowModal(true)} className="px-6 py-2.5 rounded-full border border-[#7C3AED] text-[#A855F7] font-bold hover:bg-[rgba(124,58,237,0.1)] transition-colors">
              Share a Word
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            {posts.filter(p => p.word.toLowerCase().includes(searchQuery.toLowerCase()) || (p.user.name && p.user.name.toLowerCase().includes(searchQuery.toLowerCase()))).map((post, idx) => {
              const diffLevel = post.difficulty || 'INTERMEDIATE';
              const levelColor = getLevelColor(diffLevel);
              const isLiked = likedPosts.has(post.id);
              const isDisliked = dislikedPosts.has(post.id);
              const isSaved = savedPosts.has(post.id);
              
              return (
              <div 
                key={post.id} 
                ref={cardRef}
                className="feed-card bg-[rgba(255,255,255,0.03)] border-[0.5px] border-[rgba(255,255,255,0.08)] rounded-2xl p-5 sm:p-6 hover:border-[#7C3AED] hover:scale-[1.005] transition-all duration-300" 
              >
                {/* Author Info Top Row */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-3 items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold font-heading shadow-inner relative"
                      style={{ background: getAvatarColor(post.user.name || 'A') }}
                    >
                      <div className="absolute inset-[-2px] rounded-full border-2 opacity-50" style={{ borderColor: levelColor }}></div>
                      {post.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-base leading-none mb-1">{post.user.name || 'Anonymous'}</p>
                      <p className="text-xs text-[#94A3B8] leading-none">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <div 
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border"
                    style={{ color: levelColor, borderColor: levelColor, backgroundColor: `${levelColor}15` }}
                  >
                    {diffLevel}
                  </div>
                </div>

                {/* Word Display */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-[28px] font-extrabold text-white leading-none tracking-tight">
                      {post.word}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[rgba(124,58,237,0.15)] text-[#A855F7] uppercase tracking-wider border border-[rgba(124,58,237,0.3)]">
                      Vocabulary
                    </span>
                  </div>
                  
                  <p className="text-[15px] leading-[1.6] text-gray-200 mb-3">
                    {post.definition}
                  </p>
                  
                  {post.urduMeaning && (
                    <p className="text-[15px] text-[#EC4899] urdu-text flex justify-end items-center gap-2 mt-2">
                      <span className="text-xl">{post.urduMeaning}</span>
                      <span className="text-xs font-sans opacity-70 mb-1">:اردو</span>
                    </p>
                  )}
                </div>

                {post.example && (
                  <div className="relative bg-[rgba(255,255,255,0.02)] border-l-4 border-[#7C3AED] rounded-r-lg p-3 pl-4 mb-4 group cursor-pointer" onClick={() => playAudio(post.example!)}>
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[rgba(124,58,237,0.2)] text-[#A855F7] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play fill="currentColor" size={10} className="ml-0.5" />
                    </button>
                    <p className="text-[13px] text-[#94A3B8] italic font-medium pr-8 leading-relaxed">
                      "{post.example}"
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 mt-2 border-t border-[rgba(255,255,255,0.05)]">
                  <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isLiked ? 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]' : 'hover:bg-[rgba(255,255,255,0.05)] text-[#94A3B8]'}`}>
                    <Heart size={16} className={isLiked ? 'heart-bounce' : ''} fill={isLiked ? 'currentColor' : 'none'} />
                    {post.likesCount > 0 && post.likesCount}
                  </button>
                  <button onClick={() => handleDislike(post.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isDisliked ? 'bg-[rgba(59,130,246,0.15)] text-[#3B82F6]' : 'hover:bg-[rgba(255,255,255,0.05)] text-[#94A3B8]'}`}>
                    <ThumbsDown size={16} fill={isDisliked ? 'currentColor' : 'none'} />
                    {post.dislikesCount > 0 && post.dislikesCount}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[rgba(255,255,255,0.05)] text-[#94A3B8] transition-colors">
                    <MessageCircle size={16} />
                    0
                  </button>
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => toggleSave(post.id)} className={`p-2 rounded-full transition-colors ${isSaved ? 'text-[#A855F7]' : 'hover:bg-[rgba(255,255,255,0.05)] text-[#94A3B8]'}`}>
                      <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] text-[#94A3B8] transition-colors">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )})}

            {/* Load More Button */}
            {pagination && pagination.page < pagination.pages && (
              <div className="flex justify-center mt-4">
                <button onClick={() => fetchPosts(page + 1, filter)} disabled={loadingMore} className="px-6 py-2.5 rounded-full border border-[#7C3AED] text-[#A855F7] font-bold hover:bg-[rgba(124,58,237,0.1)] transition-colors disabled:opacity-50">
                  {loadingMore ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* SHARE A WORD MODAL */}
        {/* ======================================================= */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content bg-[#0D0B1A] border border-[rgba(124,58,237,0.5)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] modal-enter" onClick={e => e.stopPropagation()}>
              
              <div className="h-1 w-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] rounded-t-2xl"></div>
              
              <div className="p-6 sm:p-8">
                <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-[#94A3B8] hover:text-white p-2 bg-[rgba(255,255,255,0.05)] rounded-full transition-colors">
                  <X size={18} />
                </button>
                
                <h2 className="font-heading text-2xl font-bold text-white mb-1">Share a Word</h2>
                <p className="text-sm text-[#94A3B8] mb-6">Contribute to the community vocabulary</p>

                {error && (
                  <div className="mb-6 p-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-sm text-[#EF4444]">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-bold text-gray-300">Word <span className="text-[#EF4444]">*</span></label>
                      <span className={`text-xs ${formData.word.length > 50 ? 'text-[#EF4444]' : 'text-[#94A3B8]'}`}>{formData.word.length}/50</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Tenacious"
                      value={formData.word}
                      onChange={e => setFormData({ ...formData, word: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white text-lg font-bold placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-bold text-gray-300">Definition <span className="text-[#EF4444]">*</span></label>
                      <span className={`text-xs ${formData.definition.length > 200 ? 'text-[#EF4444]' : 'text-[#94A3B8]'}`}>{formData.definition.length}/200</span>
                    </div>
                    <textarea
                      placeholder="Clear and concise meaning..."
                      value={formData.definition}
                      onChange={e => setFormData({ ...formData, definition: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white text-base placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all resize-y min-h-[100px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-1.5">
                      Urdu Meaning <span className="text-xs text-[#94A3B8] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="اردو معنی"
                      value={formData.urduMeaning}
                      onChange={e => setFormData({ ...formData, urduMeaning: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white text-lg placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all urdu-text text-right"
                      dir="auto"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-1.5">
                      Example Sentence <span className="text-xs text-[#94A3B8] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="She was tenacious in pursuing her goals..."
                      value={formData.example}
                      onChange={e => setFormData({ ...formData, example: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-white text-base italic placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                    />
                    <p className="text-xs text-[#94A3B8] mt-1.5">Tip: Try to use the word naturally in a full sentence.</p>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-300 mb-2 block">Difficulty Level</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'GRE'] as const).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty: lvl })}
                          className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                            formData.difficulty === lvl 
                              ? 'bg-[#7C3AED] text-white border-[#7C3AED]' 
                              : 'bg-transparent text-[#94A3B8] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-white font-bold text-sm hover:border-[rgba(239,68,68,0.5)] hover:text-[#EF4444] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading || submitSuccess || formData.word.length > 50 || formData.definition.length > 200}
                      className="flex-[2] shimmer-btn bg-gradient-to-r from-[#7C3AED] to-[#EC4899] py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
                    >
                      {submitSuccess ? (
                        <><Check size={18} /> Posted!</>
                      ) : formLoading ? (
                        <><Loader2 size={18} className="animate-spin" /> Posting...</>
                      ) : (
                        <><Send size={16} /> Post Word</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}