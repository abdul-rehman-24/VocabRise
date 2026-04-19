'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/app/components/shared/Navbar'
import { Camera, Calendar, Edit2, Zap, BookOpen, Flame, Trophy, MessageSquare, Heart, Bookmark, Activity, Medal, Lock, X, Globe, Target, Save, CheckCircle2, Swords } from 'lucide-react'

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)
  
  useEffect(() => {
    setHasMounted(true)
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  if (!hasMounted) return <span>{value}</span>;
  return <span>{count.toLocaleString()}</span>
}

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

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    country: 'Pakistan 🇵🇰',
    learningGoal: '10 words'
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

  useEffect(() => {
    if (editing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [editing]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        username: '@' + (data.name?.replace(/\s+/g, '_').toLowerCase() || 'user'),
        bio: data.bio || '',
        country: 'Pakistan 🇵🇰',
        learningGoal: '10 words'
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
        body: JSON.stringify({ name: formData.name, bio: formData.bio }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update profile')
        setSaving(false)
        return
      }

      await fetchProfile()
      setToast(true)
      setTimeout(() => {
        setToast(false)
        setEditing(false)
      }, 1500)
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0D0B1A] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[rgba(124,58,237,0.3)] border-t-[#7C3AED] animate-spin"></div>
      </div>
    )
  }

  if (!session || !profile) return null

  const userInitial = profile.name?.charAt(0).toUpperCase() || 'U'
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  // Mock Activity Timeline
  const recentActivity = [
    { type: 'word', text: 'Learned word: Ephemeral', time: '2h ago', color: '#7C3AED' },
    { type: 'lab', text: 'Completed Audio Lab session', time: '1d ago', color: '#22C55E' },
    { type: 'streak', text: '3-day streak achieved!', time: '1d ago', color: '#F97316' },
    { type: 'rank', text: 'Ranked #4 on Leaderboard', time: '2d ago', color: '#EAB308' },
    { type: 'save', text: 'Saved word: Serendipity', time: '3d ago', color: '#06B6D4' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0B1A] font-body text-white relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes aurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes shimmerSweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .aurora-bg { background: linear-gradient(45deg, #7C3AED, #A855F7, #EC4899); background-size: 200% 200%; animation: aurora 10s ease infinite; }
        .section-fade { opacity: 0; animation: slideInUp 0.6s ease-out forwards; }
      `}} />

      <Navbar />

      <div className="max-w-[900px] mx-auto pb-20">
        
        {/* ========================================================= */}
        {/* PROFILE HERO & CARD */}
        {/* ========================================================= */}
        <div className="w-full relative section-fade">
          {/* Banner */}
          <div className="w-full h-[160px] aurora-bg relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <button className="absolute top-4 right-4 bg-[rgba(0,0,0,0.5)] hover:bg-[rgba(0,0,0,0.7)] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-colors">
              <Camera size={14} /> Edit Cover
            </button>
          </div>

          {/* Profile Content */}
          <div className="px-6 sm:px-10 relative">
            
            {/* Avatar overlapping banner */}
            <div className="relative -mt-[48px] mb-4 flex justify-between items-end">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] border-[3px] border-[#EAB308] shadow-[0_0_16px_rgba(234,179,8,0.4)] flex items-center justify-center font-heading font-black text-[40px] text-white z-10 relative overflow-hidden">
                  {userInitial}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
              </div>
              
              <button onClick={() => setEditing(true)} className="mb-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[#7C3AED] hover:text-[#A855F7] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>

            {/* User Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[28px] font-heading font-bold text-white leading-tight">{profile.name}</h1>
                <span className="bg-[#7C3AED] text-white text-xs font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(124,58,237,0.3)]">
                  <Swords size={12} /> Lvl {profile.stats.level}
                </span>
              </div>
              
              <p className={`text-[15px] mb-3 ${profile.bio ? 'text-[#94A3B8]' : 'text-[#64748B] italic'}`}>
                {profile.bio || "No bio yet — click Edit Profile to add one"}
              </p>
              
              <div className="flex items-center gap-1.5 text-[#64748B] text-xs font-bold uppercase tracking-widest mb-6">
                <Calendar size={14} /> Joined {joinDate}
              </div>

              {/* Quick Stats Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#94A3B8] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3 w-fit">
                <span className="flex items-center gap-2">📚 <span className="text-white">{profile.stats.wordsLearned} Words</span></span>
                <span className="w-px h-4 bg-[rgba(255,255,255,0.1)]"></span>
                <span className="flex items-center gap-2">🔥 <span className="text-white">{profile.stats.currentStreak} Streak</span></span>
                <span className="w-px h-4 bg-[rgba(255,255,255,0.1)]"></span>
                <span className="flex items-center gap-2">⚔️ <span className="text-white">Lvl {profile.stats.level}</span></span>
                <span className="w-px h-4 bg-[rgba(255,255,255,0.1)]"></span>
                <span className="flex items-center gap-2">🏆 <span className="text-white">#4 Global</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-10 mt-10 flex flex-col gap-12">
          
          {/* ========================================================= */}
          {/* STATISTICS GRID */}
          {/* ========================================================= */}
          <div className="section-fade" style={{ animationDelay: '0.1s' }}>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-1 h-6 bg-[#7C3AED] rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>
              <div>
                <h2 className="text-[20px] font-heading font-bold text-white">Statistics</h2>
                <p className="text-[#94A3B8] text-[13px]">Your learning journey at a glance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Stat Card Template */}
              {[
                { label: 'Total XP', value: profile.stats.totalXP, sub: 'Keep earning!', icon: Zap, color: '#7C3AED' },
                { label: 'Words Mastered', value: profile.stats.wordsLearned, sub: 'Your mental library', icon: BookOpen, color: '#22C55E' },
                { label: 'Current Streak', value: profile.stats.currentStreak, sub: 'Days in a row', icon: Flame, color: '#F97316' },
                { label: 'Best Streak', value: profile.stats.longestStreak, sub: 'Personal record', icon: Trophy, color: '#EAB308' },
                { label: 'Posts Shared', value: profile._count.posts, sub: 'Community contributions', icon: MessageSquare, color: '#3B82F6' },
                { label: 'Likes Received', value: profile._count.likes, sub: 'Hearts from community', icon: Heart, color: '#EC4899' },
                { label: 'Saved Words', value: profile._count.savedWords, sub: 'Words bookmarked', icon: Bookmark, color: '#06B6D4', span: true },
              ].map((stat, i) => (
                <div key={i} className={`bg-[rgba(255,255,255,0.03)] border-[0.5px] border-[rgba(255,255,255,0.08)] rounded-[16px] p-[20px_24px] relative overflow-hidden group hover:scale-[1.02] transition-transform ${stat.span ? 'lg:col-span-3 lg:flex lg:justify-between lg:items-center' : ''}`}>
                  <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}` }}></div>
                  <div className={stat.span ? 'flex items-center gap-6' : ''}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] uppercase tracking-[0.08em] text-[#94A3B8] font-bold">{stat.label}</span>
                      {!stat.span && <stat.icon size={20} style={{ color: stat.color }} className="opacity-80 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-[32px] font-heading font-bold leading-none mb-1" style={{ color: stat.color }}>
                        <AnimatedCounter value={stat.value} />
                      </div>
                      <div className="text-[11px] text-[#64748B]">{stat.sub}</div>
                    </div>
                  </div>
                  {stat.span && <stat.icon size={40} style={{ color: stat.color }} className="opacity-20 absolute right-6 top-1/2 -translate-y-1/2" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* ========================================================= */}
            {/* RECENT ACTIVITY */}
            {/* ========================================================= */}
            <div className="section-fade" style={{ animationDelay: '0.2s' }}>
              <div className="mb-6 flex items-center gap-3">
                <div className="w-1 h-6 bg-[#22C55E] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <div>
                  <h2 className="text-[20px] font-heading font-bold text-white flex items-center gap-2"><Activity size={20}/> Recent Activity</h2>
                </div>
              </div>

              <div className="flex flex-col relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[rgba(255,255,255,0.05)]">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-4 relative py-3 pl-8 hover:bg-[rgba(124,58,237,0.05)] rounded-lg transition-colors group cursor-default">
                    <div className="absolute left-[6px] top-[18px] w-3 h-3 rounded-full border-[3px] border-[#0D0B1A]" style={{ backgroundColor: act.color }}></div>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-white font-medium group-hover:text-[#A855F7] transition-colors">{act.text}</span>
                      <span className="text-[11px] text-[#64748B] font-bold">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-[#A855F7] text-sm font-bold hover:text-white transition-colors">View All Activity →</button>
            </div>

            {/* ========================================================= */}
            {/* ACHIEVEMENTS / BADGES */}
            {/* ========================================================= */}
            <div className="section-fade" style={{ animationDelay: '0.3s' }}>
              <div className="mb-6 flex items-center gap-3">
                <div className="w-1 h-6 bg-[#EAB308] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                <div>
                  <h2 className="text-[20px] font-heading font-bold text-white flex items-center gap-2"><Medal size={20}/> Achievements</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Earned Badge */}
                <div className="bg-[rgba(234,179,8,0.05)] border border-[rgba(234,179,8,0.2)] rounded-2xl p-4 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    <BookOpen size={28} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-white mb-1">Bronze Scholar</span>
                  <span className="text-[10px] text-[#EAB308]">Learned 50 words</span>
                </div>

                {/* Locked Badge 1 */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col items-center text-center group relative cursor-help">
                  <div className="w-16 h-16 rounded-full bg-[#1A1A2E] flex items-center justify-center mb-3">
                    <Lock size={24} className="text-[#64748B]" />
                  </div>
                  <span className="text-sm font-bold text-[#64748B] mb-1">Silver Scholar</span>
                  <span className="text-[10px] text-[#475569]">Locked</span>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-[#7C3AED] text-white text-[10px] font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Earn 100 words to unlock
                  </div>
                </div>
              </div>
              <button className="mt-6 text-[#A855F7] text-sm font-bold hover:text-white transition-colors">View Passport →</button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================================= */}
      {editing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setEditing(false)}></div>
          
          <div className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-[#1a1730] rounded-[20px] shadow-2xl border border-[rgba(255,255,255,0.1)] flex flex-col animate-[slideInUp_0.25s_ease-out]">
            {/* Top Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#7C3AED]"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[rgba(255,255,255,0.05)]">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                <p className="text-[13px] text-[#94A3B8]">Update your public profile</p>
              </div>
              <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 flex flex-col gap-6">
              
              {/* Avatar Editor */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center font-heading font-black text-[40px] text-white mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  {userInitial}
                </div>
                <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-colors mb-4">
                  <Camera size={14} /> Change Avatar
                </button>
                <div className="flex gap-2">
                  {['#7C3AED', '#3B82F6', '#22C55E', '#F59E0B', '#EC4899', '#EF4444'].map(c => (
                    <button key={c} className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.2)] hover:scale-110 transition-transform" style={{ backgroundColor: c }}></button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-sm font-bold text-white">Display Name *</label>
                  <span className="text-xs text-[#64748B]">{formData.name.length}/50</span>
                </div>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} maxLength={50} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] transition-colors" />
              </div>

              {/* Username */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Username</label>
                <div className="relative">
                  <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] transition-colors" placeholder="@your_username" />
                  <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#22C55E]" />
                </div>
                <p className="text-xs text-[#64748B]">Used on leaderboard & community. <span className="text-[#22C55E]">Available</span></p>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-sm font-bold text-white">Bio <span className="text-[#64748B] font-normal">(Optional)</span></label>
                  <span className={`text-xs font-bold ${formData.bio.length > 480 ? 'text-[#EF4444]' : formData.bio.length > 400 ? 'text-[#F59E0B]' : 'text-[#64748B]'}`}>{formData.bio.length}/500</span>
                </div>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} maxLength={500} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] transition-colors min-h-[100px] resize-y" placeholder="Tell the VocabRise community about your vocabulary journey..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Country */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white">Country</label>
                  <div className="relative">
                    <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full appearance-none bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] transition-colors">
                      <option className="bg-[#1a1730]">Pakistan 🇵🇰</option>
                      <option className="bg-[#1a1730]">India 🇮🇳</option>
                      <option className="bg-[#1a1730]">USA 🇺🇸</option>
                      <option className="bg-[#1a1730]">UK 🇬🇧</option>
                    </select>
                    <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>

                {/* Goal */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white">Daily Goal</label>
                  <div className="relative">
                    <select value={formData.learningGoal} onChange={e => setFormData({...formData, learningGoal: e.target.value})} className="w-full appearance-none bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7C3AED] transition-colors">
                      <option className="bg-[#1a1730]">5 words</option>
                      <option className="bg-[#1a1730]">10 words</option>
                      <option className="bg-[#1a1730]">20 words</option>
                      <option className="bg-[#1a1730]">Custom</option>
                    </select>
                    <Target size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-3">
              <button onClick={handleSaveProfile} disabled={saving} className="relative overflow-hidden w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent -translate-x-full group-hover:animate-[shimmerSweep_1s_forwards]"></div>
                {saving ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : <><Save size={18} /> Save Changes</>}
              </button>
              <button onClick={() => setEditing(false)} className="w-full py-3 bg-transparent border border-[rgba(255,255,255,0.1)] text-white rounded-xl font-bold hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.05)] transition-colors">
                Cancel
              </button>
            </div>
            
            {/* Toast Notification */}
            {toast && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#22C55E] text-white px-4 py-2 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center gap-2 animate-[slideInUp_0.2s_ease-out]">
                <CheckCircle2 size={16} /> Profile Updated!
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
