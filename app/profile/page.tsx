'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/app/components/shared/Navbar'

interface UserProfile {
  id: string
  name: string
  email: string
  image: string | null
  bio: string | null
  createdAt: string
  stats: {
    totalXP: number
    level: number
    currentStreak: number
    longestStreak: number
    wordsLearned: number
    lastActiveDate: string | null
  }
  posts: Array<{
    id: string
    word: string
    likesCount: number
    createdAt: string
  }>
  _count: {
    posts: number
    likes: number
    savedWords: number
  }
}

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

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
      })
      setLoading(false)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update profile')
        setSaving(false)
        return
      }

      await fetchProfile()
      setEditing(false)
    } catch (err) {
      setError('Failed to update profile')
      console.error('Error updating profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--brand-bright)' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  const userInitial = profile.name?.charAt(0).toUpperCase() || 'U'
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const avatarBg = getAvatarColor(profile.name || 'U')

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="page-wrapper pb-12">
      <Navbar />

      <main className="max-w-[800px] mx-auto px-[24px] py-12 pt-20">
        {/* Profile Header Card */}
        <div className="card p-10 mb-12 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden animate-fade-up" style={{ 
          background: 'linear-gradient(135deg, rgba(124,109,250,0.08), rgba(157,140,255,0.04))',
          border: '1px solid var(--brand-border)',
          boxShadow: '0 8px 32px rgba(124, 109, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          borderRadius: '28px'
        }}>
          {/* Decorative glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'var(--brand-bright)',
            opacity: 0.1,
            filter: 'blur(60px)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />

          {/* Avatar */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: avatarBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'var(--font-heading)',
              fontSize: '48px',
              fontWeight: 800,
              flexShrink: 0,
              border: '4px solid var(--brand-bright)',
              boxShadow: '0 0 32px rgba(124, 109, 250, 0.5)',
              position: 'relative',
              zIndex: 10
            }}
          >
            {userInitial}
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1, zIndex: 10, width: '100%' }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && (
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 77, 109, 0.1)', border: '1px solid var(--semantic-danger)', fontSize: '14px', color: 'var(--semantic-danger)', fontFamily: 'var(--font-body)' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      fontSize: '15px',
                      fontFamily: 'var(--font-body)'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--brand-bright)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,109,250,0.2)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      fontSize: '15px',
                      fontFamily: 'var(--font-body)',
                      resize: 'none',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--brand-bright)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,109,250,0.2)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    rows={3}
                    maxLength={500}
                    placeholder="Tell us about yourself..."
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-body)' }}>
                    {formData.bio.length}/500
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-press flex-1"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      opacity: saving ? 0.6 : 1 
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setError('')
                      setFormData({
                        name: profile.name || '',
                        bio: profile.bio || '',
                      })
                    }}
                    className="btn-press flex-1"
                    style={{
                      background: 'transparent',
                      color: 'white',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '14px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                      {profile.name}
                    </h1>
                    <span style={{
                      background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(124,109,250,0.3)'
                    }}>
                      Lvl {profile.stats.level}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-press"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      padding: '8px 16px',
                      borderRadius: '100px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    Edit Profile
                  </button>
                </div>

                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6, maxWidth: '100%', fontFamily: 'var(--font-body)' }}>
                  {profile.bio || 'No bio added yet. Tell the world about your vocabulary journey!'}
                </p>

                <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  Joined {joinDate}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-12">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '24px' }}>
            Statistics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            
            {/* Total XP */}
            <div className="card card-hover p-6 flex flex-col justify-between" style={{ height: '120px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Total XP
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--brand-bright)' }}>
                {profile.stats.totalXP}
              </p>
            </div>

            {/* Words Learned */}
            <div className="card card-hover p-6 flex flex-col justify-between" style={{ height: '120px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Words Mastered
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--semantic-success)' }}>
                {profile.stats.wordsLearned}
              </p>
            </div>

            {/* Current Streak */}
            <div className="card card-hover p-6 flex flex-col justify-between" style={{ height: '120px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Current Streak
              </p>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '24px' }}>🔥</span>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--semantic-streak)' }}>
                  {profile.stats.currentStreak}
                </p>
              </div>
            </div>

            {/* Best Streak */}
            <div className="card card-hover p-6 flex flex-col justify-between" style={{ height: '120px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Best Streak
              </p>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '24px' }}>🏆</span>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--semantic-gold)' }}>
                  {profile.stats.longestStreak}
                </p>
              </div>
            </div>

            {/* Posts */}
            <div className="card card-hover p-6 flex flex-col justify-between" style={{ height: '120px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Posts Shared
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'white' }}>
                {profile._count.posts}
              </p>
            </div>

            {/* Likes */}
            <div className="card card-hover p-6 flex flex-col justify-between" style={{ height: '120px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Likes Received
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--semantic-danger)' }}>
                {profile._count.likes}
              </p>
            </div>

            {/* Saved Words */}
            <div className="card card-hover p-6 flex flex-col justify-between" style={{ height: '120px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                Saved Words
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--semantic-info)' }}>
                {profile._count.savedWords}
              </p>
            </div>
            
          </div>
        </div>

        {/* Recent Posts Feed */}
        {profile.posts.length > 0 && (
          <div className="animate-fade-up-delay">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: 'white' }}>
                Recent Activity
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {profile.posts.map((post, idx) => (
                <div
                  key={post.id}
                  className="card-hover flex items-center justify-between"
                  style={{
                    height: '72px',
                    padding: '0 24px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(124,109,250,0.12)',
                      color: 'var(--brand-bright)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      📝
                    </div>
                    
                    <div className="flex flex-col">
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'white' }}>
                        Shared "{post.word}"
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--semantic-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {post.likesCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
