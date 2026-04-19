'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface PostCardProps {
  post: {
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
  onLike?: () => void
  onDislike?: () => void
  onSave?: () => void
  isLiked?: boolean
  isDisliked?: boolean
  isSaved?: boolean
}

export default function PostCard({ 
  post, 
  onLike, 
  onDislike,
  onSave,
  isLiked = false,
  isDisliked = false,
  isSaved = false
}: PostCardProps) {
  const { data: session } = useSession()
  const [likeCount, setLikeCount] = useState(post.likesCount)
  const [dislikeCount, setDislikeCount] = useState(post.dislikesCount)
  const [liked, setLiked] = useState(isLiked)
  const [disliked, setDisliked] = useState(isDisliked)
  const [saved, setSaved] = useState(isSaved)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      })
      const data = await res.json()
      setLiked(data.liked)
      setDisliked(data.disliked)
      setLikeCount(data.likesCount)
      setDislikeCount(data.dislikesCount)
      onLike?.()
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDislike = async () => {
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/dislike`, {
        method: 'POST',
      })
      const data = await res.json()
      setLiked(data.liked)
      setDisliked(data.disliked)
      setLikeCount(data.likesCount)
      setDislikeCount(data.dislikesCount)
      onDislike?.()
    } catch (error) {
      console.error('Error disliking post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/save`, {
        method: 'POST',
      })
      const data = await res.json()
      setSaved(data.saved)
      onSave?.()
    } catch (error) {
      console.error('Error saving post:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  const userInitial = (post.user.name || 'U').charAt(0).toUpperCase()

  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
      {/* Header with user info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {userInitial}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{post.user.name || 'Anonymous'}</p>
          <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      {/* Word Section */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{post.word}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{post.definition}</p>
      </div>

      {/* Urdu Meaning */}
      {post.urduMeaning && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium mb-1">Urdu Meaning</p>
          <p className="text-gray-700 font-medium">{post.urduMeaning}</p>
        </div>
      )}

      {/* Example */}
      {post.example && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-2 border-gray-300">
          <p className="text-xs text-gray-500 font-medium mb-1">Example</p>
          <p className="text-gray-700 italic">"{post.example}"</p>
        </div>
      )}

      {/* Actions Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            liked
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h-2m0 0H10m2 0v2m0-2v-2m7 6a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={handleDislike}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            disliked
              ? 'bg-red-100 text-red-700'
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          <svg className="w-4 h-4" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H8m0 0H6m2 0v2m0-2v-2m7-6a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{dislikeCount}</span>
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            saved
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          } disabled:opacity-50`}
          title={saved ? 'Unsave word' : 'Save word'}
        >
          <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
          </svg>
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>

        <div className="ml-auto">
          <p className="text-xs text-gray-400">Posted by {post.user.name || 'Anonymous'}</p>
        </div>
      </div>
    </div>
  )
}
