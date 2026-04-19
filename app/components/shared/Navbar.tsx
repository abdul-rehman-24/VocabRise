'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

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

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    {
      label: 'Learn',
      dropdown: [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/pronunciation', label: 'Audio Lab' },
        { href: '/passport', label: 'Passport' },
      ]
    },
    { href: '/word-of-the-week', label: 'Vote' },
    { href: '/feed', label: 'Community Feed' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/quiz', label: 'Word Battle' },
  ]

  const isActive = (href: string) => pathname === href

  const userName = session?.user?.name || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const avatarBg = getAvatarColor(userName)

  return (
    <nav className="sticky top-0 z-[100]" style={{ 
      backgroundColor: 'rgba(13, 11, 26, 0.8)', 
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes borderPulse {
          0% { box-shadow: 0 0 0 0 rgba(124,58,237, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(124,58,237, 0); }
          100% { box-shadow: 0 0 0 0 rgba(124,58,237, 0); }
        }
        .avatar-pulse { animation: borderPulse 2s infinite; }
      `}} />
      <div className="max-w-[1400px] mx-auto px-[24px]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
          >
            <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              {/* Glowing animated background */}
              <div className="absolute inset-0 bg-[var(--gradient-primary)] rounded-xl blur-[10px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              
              {/* Glassmorphic container */}
              <div className="relative w-full h-full rounded-xl bg-[rgba(18,18,31,0.7)] border border-[rgba(124,109,250,0.4)] backdrop-blur-md flex items-center justify-center overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">
                {/* Edge lighting effects */}
                <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[var(--brand-bright)] to-transparent opacity-80"></div>
                <div className="absolute bottom-0 right-0 w-[1.5px] h-full bg-gradient-to-b from-transparent via-[#e040fb] to-transparent opacity-60"></div>
                
                {/* Diagonal sweep glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand)] via-transparent to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                
                {/* Text */}
                <span className="relative z-10 font-heading font-black text-[17px] tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-[var(--brand-bright)] drop-shadow-[0_2px_10px_rgba(124,109,250,0.8)]">
                  VR
                </span>
              </div>
            </div>
            <span style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: 700, 
              fontSize: '24px',
              background: `linear-gradient(135deg, var(--text-primary), var(--brand-bright))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px'
            }} className="hidden lg:block">
              VocabRise
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden lg:flex items-center gap-1 relative">
            {navLinks.map(link => {
              if (link.dropdown) {
                return (
                  <div key={link.label} className="group relative px-4 py-2">
                    <button
                      className="flex items-center gap-1 relative transition-all duration-300"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {link.label}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-180 transition-transform"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {/* Active Indicator Underline */}
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--brand-bright)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-[rgba(13,11,26,0.95)] backdrop-blur-xl border border-[var(--border)] shadow-[0_10px_40px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
                      {link.dropdown.map(sublink => (
                        <Link
                          key={sublink.href}
                          href={sublink.href}
                          className="block px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(124,109,250,0.1)] transition-colors"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {sublink.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 relative rounded-xl transition-all group duration-300"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: isActive(link.href) ? 600 : 500,
                    fontSize: '14px',
                    color: isActive(link.href) ? 'white' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.href)) {
                      if (e.currentTarget instanceof HTMLElement) {
                        e.currentTarget.style.color = 'var(--brand-bright)';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.href)) {
                      if (e.currentTarget instanceof HTMLElement) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }
                  }}
                >
                  {link.label}
                  {/* Active/Hover Underline */}
                  <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-[var(--brand-bright)] transition-transform origin-left ${isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                </Link>
              );
            })}
          </div>

          {/* Right Side: User Profile & Auth & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm transition-all hidden md:block px-4 py-2 rounded-lg hover:bg-[rgba(124,109,250,0.1)]"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  Sign Out
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="relative w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 avatar-pulse"
                  style={{
                    background: avatarBg,
                    color: 'white',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '16px',
                    fontWeight: 700,
                    border: `2px solid #7C3AED`,
                  }}
                >
                  {userInitial}
                  <div className="absolute -bottom-1 -right-1 bg-[#7C3AED] text-[9px] rounded-full w-4 h-4 flex items-center justify-center border border-[#0D0B1A] font-bold text-white shadow-sm z-10">
                    12
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-[14px] px-3 py-2 transition-all rounded-lg hover:bg-[rgba(124,109,250,0.08)] hidden sm:block"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="btn-press text-[14px] transition-all hover:shadow-lg active:scale-95"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, var(--brand), #9d51f5)`,
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    boxShadow: `0 6px 20px var(--brand-glow)`,
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden absolute top-16 left-0 w-full border-t"
          style={{ 
            backgroundColor: 'rgba(7, 7, 15, 0.95)',
            backdropFilter: 'blur(24px)',
            borderColor: 'var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}
        >
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map(link => {
              if (link.dropdown) {
                return (
                  <div key={link.label} className="flex flex-col gap-1">
                    <div className="px-4 py-2 font-bold text-[var(--text-secondary)]">{link.label}</div>
                    {link.dropdown.map(sublink => (
                      <Link
                        key={sublink.href}
                        href={sublink.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-8 py-3 rounded-xl transition-all"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontWeight: isActive(sublink.href) ? 600 : 500,
                          fontSize: '16px',
                          color: isActive(sublink.href) ? 'white' : 'var(--text-secondary)',
                          background: isActive(sublink.href) ? 'rgba(124, 109, 250, 0.1)' : 'transparent',
                        }}
                      >
                        {sublink.label}
                      </Link>
                    ))}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href!}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: isActive(link.href!) ? 600 : 500,
                    fontSize: '16px',
                    color: isActive(link.href!) ? 'white' : 'var(--text-secondary)',
                    background: isActive(link.href!) ? 'rgba(124, 109, 250, 0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            {session && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="px-4 py-3 text-left rounded-xl transition-all"
                style={{ color: 'var(--semantic-danger)', fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
