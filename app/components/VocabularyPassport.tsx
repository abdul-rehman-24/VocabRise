'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Download, Share2, Globe, Sparkles, MapPin, Fingerprint, Lock, Shield, Award, Flame, CheckCircle, ChevronRight, MessageCircle } from 'lucide-react';

interface Word {
  id: string;
  word: string;
  definition: string;
  category: 'common' | 'advanced' | 'gre';
  difficulty: number;
}

const DEMO_WORDS: Word[] = [
  { id: '1', word: 'Hello', category: 'common', definition: 'A greeting', difficulty: 1 },
  { id: '2', word: 'Grateful', category: 'common', definition: 'Feeling thanks', difficulty: 2 },
  { id: '3', word: 'Brave', category: 'common', definition: 'Courageous', difficulty: 2 },
  { id: '4', word: 'Kind', category: 'common', definition: 'Showing good nature', difficulty: 1 },
  { id: '5', word: 'Smart', category: 'common', definition: 'Intelligent', difficulty: 1 },
  { id: '6', word: 'Happy', category: 'common', definition: 'Feeling joy', difficulty: 1 },
  { id: '7', word: 'Bright', category: 'common', definition: 'Shining with light', difficulty: 2 },
  { id: '8', word: 'Quick', category: 'common', definition: 'Fast', difficulty: 1 },
  { id: '9', word: 'Strong', category: 'common', definition: 'Powerful', difficulty: 2 },
  { id: '10', word: 'Gentle', category: 'common', definition: 'Soft and kind', difficulty: 2 },
  { id: '11', word: 'Eloquent', category: 'advanced', definition: 'Fluent and persuasive', difficulty: 4 },
  { id: '12', word: 'Resilient', category: 'advanced', definition: 'Able to recover', difficulty: 4 },
  { id: '13', word: 'Candid', category: 'advanced', definition: 'Frank and honest', difficulty: 3 },
  { id: '14', word: 'Verbose', category: 'advanced', definition: 'Using too many words', difficulty: 4 },
  { id: '15', word: 'Lucid', category: 'advanced', definition: 'Clear and easy to understand', difficulty: 3 },
  { id: '16', word: 'Pragmatic', category: 'advanced', definition: 'Practical and realistic', difficulty: 4 },
  { id: '17', word: 'Nuanced', category: 'advanced', definition: 'With subtle differences', difficulty: 4 },
  { id: '18', word: 'Fortuitous', category: 'advanced', definition: 'Happening by luck', difficulty: 4 },
  { id: '19', word: 'Ephemeral', category: 'gre', definition: 'Lasting only a short time', difficulty: 5 },
  { id: '20', word: 'Serendipity', category: 'gre', definition: 'Happy accident', difficulty: 5 },
  { id: '21', word: 'Melancholy', category: 'gre', definition: 'Sad and pensive', difficulty: 5 },
  { id: '22', word: 'Tenacious', category: 'gre', definition: 'Holding firmly', difficulty: 5 },
  { id: '23', word: 'Ambiguous', category: 'gre', definition: 'Open to multiple meanings', difficulty: 5 },
];

const AVAILABLE_WORDS: Word[] = [
  { id: '24', word: 'Paradigm', category: 'advanced', definition: 'Model or pattern', difficulty: 4 },
  { id: '25', word: 'Pungent', category: 'advanced', definition: 'Strong smell or taste', difficulty: 4 },
  { id: '26', word: 'Venerate', category: 'gre', definition: 'Regard with respect', difficulty: 5 },
  { id: '27', word: 'Obfuscate', category: 'gre', definition: 'Make unclear', difficulty: 5 },
  { id: '28', word: 'Meticulous', category: 'gre', definition: 'Showing great attention to detail', difficulty: 5 },
  { id: '29', word: 'Alacrity', category: 'gre', definition: 'Brisk and cheerful readiness', difficulty: 5 },
  { id: '30', word: 'Cacophony', category: 'gre', definition: 'A harsh, discordant mixture of sounds', difficulty: 5 },
];

const milestones = [
  { threshold: 10, label: 'Bronze', color: '#CD7F32', char: 'B' },
  { threshold: 25, label: 'Silver', color: '#C0C0C0', char: 'S' },
  { threshold: 50, label: 'Gold', color: '#FFD700', char: 'G' },
  { threshold: 100, label: 'Platinum', color: '#E5E4E2', char: 'P' },
];

const rankLevels = [
  { name: 'Beginner', next: 'Word Explorer' },
  { name: 'Word Explorer', next: 'Vocab Knight' },
  { name: 'Vocab Knight', next: 'Linguistic Master' },
  { name: 'Linguistic Master', next: 'Legend' },
  { name: 'Legend', next: 'Max Rank' }
];

export default function VocabularyPassport() {
  const [currentPage, setCurrentPage] = useState<'cover' | 'stamps' | 'stats'>('cover');
  const [isFlipping, setIsFlipping] = useState(false);
  const [collectedWords, setCollectedWords] = useState<Word[]>(DEMO_WORDS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'common' | 'advanced' | 'gre'>('all');
  const [showShareCard, setShowShareCard] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [tabChanging, setTabChanging] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<Word | null>(null);
  
  // Count up state
  const [displayStats, setDisplayStats] = useState({ words: 0, streak: 0, winRate: 0, sentences: 0 });

  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Lock body scroll when modals open
  useEffect(() => {
    if (showShareCard || selectedStamp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showShareCard, selectedStamp]);

  // Count up animation logic
  useEffect(() => {
    if (currentPage === 'stats') {
      let startTime: number | null = null;
      const duration = 1500;
      const target = { words: collectedWords.length, streak: 14, winRate: 92, sentences: 56 };
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        setDisplayStats({
          words: Math.floor(target.words * easeOutQuart),
          streak: Math.floor(target.streak * easeOutQuart),
          winRate: Math.floor(target.winRate * easeOutQuart),
          sentences: Math.floor(target.sentences * easeOutQuart)
        });
        
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [currentPage, collectedWords.length]);

  const handleFlip = (page: 'cover' | 'stamps' | 'stats') => {
    if (currentPage === page) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsFlipping(false);
    }, 600);
  };

  const changeTab = (tab: 'stamps' | 'stats') => {
    if (currentPage === tab) return;
    setTabChanging(true);
    setTimeout(() => {
      setCurrentPage(tab);
      setTabChanging(false);
    }, 300);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const addNewWord = () => {
    const collectedIds = collectedWords.map(w => w.id);
    const available = AVAILABLE_WORDS.filter(w => !collectedIds.includes(w.id));
    if (available.length === 0) {
      alert('You have collected all available demo words!');
      return;
    }
    const randomWord = available[Math.floor(Math.random() * available.length)];
    setCollectedWords([...collectedWords, randomWord]);
  };

  const rankIndex = Math.min(Math.floor(collectedWords.length / 20), rankLevels.length - 1);
  const currentRank = rankLevels[rankIndex];

  const filteredWords = activeCategory === 'all' 
    ? collectedWords 
    : collectedWords.filter(w => w.category === activeCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'common': return { border: '#06B6D4', text: '#06B6D4', bg: 'rgba(6,182,212,0.1)' };
      case 'advanced': return { border: '#A855F7', text: '#A855F7', bg: 'rgba(168,85,247,0.1)' };
      case 'gre': return { border: '#EAB308', text: '#EAB308', bg: 'rgba(234,179,8,0.1)' };
      default: return { border: '#94A3B8', text: '#94A3B8', bg: 'rgba(255,255,255,0.05)' };
    }
  };

  const unlockedMilestones = milestones.filter(m => collectedWords.length >= m.threshold);

  const shareOnWhatsApp = () => {
    const text = `🎓 I've mastered ${collectedWords.length} vocabulary words on VocabRise! \n\nJoin me in building my Vocabulary Passport! 📚`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const copyAchievementText = () => {
    const text = `🎓 I've mastered ${collectedWords.length} words on VocabRise! #VocabRise #Learning`;
    navigator.clipboard.writeText(text).then(() => alert('Achievement text copied to clipboard!'));
  };

  const downloadAsImage = async () => {
    if (!shareCardRef.current || !(window as any).html2canvas) return;
    try {
      const canvas = await (window as any).html2canvas(shareCardRef.current, { backgroundColor: '#0D0B1A', scale: 2 });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `vocab-passport.png`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const totalSlots = Math.max(25, Math.ceil(filteredWords.length / 5) * 5);
  const slots = Array.from({ length: totalSlots }).map((_, i) => filteredWords[i] || null);

  return (
    <div className="py-6 md:py-10 px-4 min-h-[calc(100vh-80px)] flex items-center justify-center font-body w-full relative bg-[#0D0B1A] overflow-hidden">
      
      {/* Background Floating Gold Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({length: 20}).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-[#EAB308]" style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.3 + 0.1,
            animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`
          }} />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatParticle { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes medalBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

        .globe-spin { animation: slowSpin 20s linear infinite; }
        .medal-bob { animation: medalBob 3s ease-in-out infinite; }

        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
        }

        .gold-emboss-text {
          background: linear-gradient(180deg, #FDF094 0%, #EAB308 50%, #A16207 100%);
          -webkit-background-clip: text;
          color: transparent;
          text-shadow: 0px 2px 10px rgba(234, 179, 8, 0.3);
          letter-spacing: 0.3em;
        }

        .passport-leather {
          background-color: #0F0B1E;
          background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
          box-shadow: inset 0 0 0 2px rgba(234, 179, 8, 0.4), inset 0 0 20px rgba(0,0,0,0.8), 0 20px 50px rgba(0,0,0,0.6);
        }

        .hologram-shimmer {
          background: radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.15) 0%, rgba(124,58,237,0.1) 20%, transparent 60%);
          mix-blend-mode: color-dodge;
        }

        .gold-gradient-btn {
          background: linear-gradient(135deg, #FDE047, #EAB308);
          color: #111; position: relative; overflow: hidden;
        }
        .gold-gradient-btn::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent);
          transform: skewX(-20deg); transition: 0s;
        }
        .gold-gradient-btn:hover::before { left: 150%; transition: 0.7s; }

        .ink-stamp {
          position: relative; backdrop-filter: blur(2px);
          mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='black' stroke-width='4' stroke-dasharray='4 2 8 2 15 3 6 2'/%3E%3C/svg%3E");
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='black' stroke-width='4' stroke-dasharray='4 2 8 2 15 3 6 2'/%3E%3C/svg%3E");
          border: 2px dashed currentColor;
        }
        .ink-splat {
          animation: splatAnim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes splatAnim {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .book-flip-out { animation: bookFlipOut 0.6s ease-in forwards; transform-style: preserve-3d; transform-origin: left center; }
        .book-flip-in { animation: bookFlipIn 0.6s ease-out forwards; transform-style: preserve-3d; transform-origin: left center; }
        @keyframes bookFlipOut { from { transform: rotateY(0deg) scale(1); opacity: 1; } to { transform: rotateY(-180deg) scale(0.9); opacity: 0; } }
        @keyframes bookFlipIn { from { transform: rotateY(-180deg) scale(0.9); opacity: 0; } to { transform: rotateY(0deg) scale(1); opacity: 1; } }

        .tab-transition-out { opacity: 0; transform: translateX(-10px); transition: all 0.3s; }
        .tab-transition-in { opacity: 1; transform: translateX(0); transition: all 0.3s; }
        
        .progress-fill { transition: width 1.5s cubic-bezier(0.1, 1, 0.3, 1); }

        .passport-scrollbar::-webkit-scrollbar { width: 4px; }
        .passport-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .passport-scrollbar::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.5); border-radius: 4px; }
        .passport-scrollbar::-webkit-scrollbar-thumb:hover { background: #7C3AED; }

        /* Modal Overlay Fixed Position */
        .modal-overlay-fixed {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          z-index: 9999; overflow-y: auto; background: rgba(0,0,0,0.85);
          display: flex; align-items: center; justify-content: center;
        }
        .modal-inner-card {
          position: relative; max-height: 90vh; overflow-y: auto; margin: auto;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent;
        }
        .modal-inner-card::-webkit-scrollbar { width: 4px; }
        .modal-inner-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

        .shimmer-badge {
          position: relative; overflow: hidden;
        }
        .shimmer-badge::after {
          content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent);
          transform: rotate(30deg) translateY(-50%) translateX(-100%);
          animation: badgeShimmer 3s infinite;
        }
        @keyframes badgeShimmer {
          0% { transform: rotate(30deg) translateY(-50%) translateX(-100%); }
          20% { transform: rotate(30deg) translateY(-50%) translateX(100%); }
          100% { transform: rotate(30deg) translateY(-50%) translateX(100%); }
        }
      `}} />

      <div className={`relative w-full max-w-5xl perspective-1000 ${isFlipping ? 'book-flip-out' : 'book-flip-in'}`}>
        
        {/* ========================================================= */}
        {/* SCREEN 1: PASSPORT COVER */}
        {/* ========================================================= */}
        {currentPage === 'cover' && (
          <div 
            onMouseMove={handleMouseMove}
            className="passport-leather w-full max-w-[400px] mx-auto aspect-[1/1.4] rounded-xl flex flex-col items-center justify-between p-12 text-center relative overflow-hidden group cursor-pointer"
            style={{ '--mx': `${mousePos.x}%`, '--my': `${mousePos.y}%` } as React.CSSProperties}
          >
            <div className="absolute inset-0 hologram-shimmer pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Corner Ornaments */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#EAB308] opacity-60 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#EAB308] opacity-60 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#EAB308] opacity-60 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#EAB308] opacity-60 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>

            <div className="mt-12 w-full relative z-10">
              <div className="relative w-28 h-28 mx-auto mb-10 group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 rounded-full bg-[#EAB308] opacity-20 animate-pulse blur-xl"></div>
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#EAB308] drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] globe-spin">
                  {/* Globe & Laurel Leaves Emblem */}
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
                  <ellipse cx="50" cy="50" rx="15" ry="30" fill="none" stroke="currentColor" strokeWidth="2" />
                  <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M50 20 L50 80" stroke="currentColor" strokeWidth="2" />
                  {/* Left Laurel */}
                  <path d="M20 70 Q 5 50 20 20" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 60 Q 25 55 20 45" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M15 50 Q 20 45 15 35" fill="none" stroke="currentColor" strokeWidth="1" />
                  {/* Right Laurel */}
                  <path d="M80 70 Q 95 50 80 20" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M80 60 Q 75 55 80 45" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M85 50 Q 80 45 85 35" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <h1 className="text-xl font-heading font-black gold-emboss-text uppercase mb-3">VocabRise</h1>
              <p className="text-[#EAB308] tracking-[0.2em] text-[10px] uppercase font-bold opacity-80 mb-6">Digital Learning Passport</p>
              
              <div className="text-white opacity-40 font-heading text-sm uppercase tracking-[0.3em] font-medium mt-8">
                Abdul Rehman
              </div>
            </div>

            <div className="w-full relative z-10 mt-auto pt-8">
              <button 
                onClick={(e) => { e.stopPropagation(); handleFlip('stamps'); }}
                className="w-full gold-gradient-btn px-8 py-4 rounded-xl font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                Open Passport <ChevronRight size={18} />
              </button>
              <div className="mt-8 font-mono text-[#EAB308] opacity-60 text-xs tracking-widest">ID: VR-2026</div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* INSIDE SPREAD */}
        {/* ========================================================= */}
        {currentPage !== 'cover' && (
          <div className="flex flex-col md:flex-row w-full bg-[#0D0B1A] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden min-h-[650px] relative border border-[rgba(255,255,255,0.05)]">
            
            {/* Center Book Fold Shadow */}
            <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.5)] to-transparent pointer-events-none z-50 hidden md:block"></div>

            {/* LEFT PANEL - IDENTITY */}
            <div className="flex-1 flex flex-col p-8 md:p-10 border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.05)] relative bg-[rgba(255,255,255,0.02)]">
              {/* Holographic Strip */}
              <div className="absolute left-4 top-10 bottom-10 w-2 bg-gradient-to-b from-[#7C3AED] via-[#06B6D4] to-[#EC4899] rounded-full opacity-30 blur-[2px]"></div>
              
              <div className="pl-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-white font-heading font-black text-xl uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint className="text-[#7C3AED]" /> Identification
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 mb-10">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-[#7C3AED] flex items-center justify-center relative overflow-hidden group cursor-pointer bg-gradient-to-br from-[rgba(124,58,237,0.2)] to-[rgba(236,72,153,0.1)] shadow-[0_0_16px_rgba(124,58,237,0.4)] shrink-0">
                    <span className="text-4xl font-heading font-black text-white group-hover:opacity-0 transition-opacity">A</span>
                    <div className="absolute inset-0 bg-[#7C3AED] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Add Photo</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-5">
                    <div>
                      <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Citizen Name</div>
                      <div className="font-heading text-2xl text-white font-bold border-b border-[rgba(124,58,237,0.5)] inline-block pb-1">Abdul Rehman</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Origin Node</div>
                      <div className="font-heading text-sm text-white flex items-center gap-2">
                        <MapPin size={14} className="text-[#06B6D4]" /> Global Network
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Issue Date</div>
                      <div className="font-mono text-sm text-white">2026.04.19</div>
                    </div>
                  </div>
                </div>

                <div className="mb-auto p-6 rounded-xl glass-card relative overflow-hidden">
                  <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <Shield size={14} /> Earned Badges
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {milestones.map(m => {
                      const unlocked = collectedWords.length >= m.threshold;
                      return (
                        <div key={m.threshold} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all relative group cursor-help ${unlocked ? 'border-[#EAB308] bg-[rgba(234,179,8,0.1)] shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] opacity-40'}`}>
                          {unlocked && <div className="absolute inset-0 rounded-full border border-[#EAB308] animate-ping opacity-20"></div>}
                          {unlocked ? (
                            <span className="font-bold text-lg" style={{ color: '#EAB308' }}>{m.char}</span>
                          ) : (
                            <Lock size={16} className="text-[#94A3B8]" />
                          )}
                          <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-[#1a1a2e] border border-[rgba(255,255,255,0.1)] text-white text-[10px] font-bold px-3 py-1.5 rounded whitespace-nowrap z-20">
                            {unlocked ? m.label : `Unlock at ${m.threshold} words`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Decorative Barcode */}
                <div className="w-full h-8 opacity-20 mb-4 flex gap-1 items-center mt-6">
                  {Array.from({length: 40}).map((_, i) => (
                    <div key={i} className="h-full bg-white" style={{ width: Math.random() * 4 + 1 + 'px' }}></div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowShareCard(true)} className="flex-1 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center gap-2 group">
                    <Share2 size={14} className="group-hover:rotate-12 group-hover:scale-110 transition-all" /> Share Card
                  </button>
                  <button onClick={() => handleFlip('cover')} className="px-6 py-3.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL - STAMPS / STATS */}
            <div className="flex-1 p-8 md:p-10 flex flex-col relative bg-[rgba(255,255,255,0.01)]">
              
              {/* Tab Navigation */}
              <div className="flex justify-between items-center mb-8 border-b border-[rgba(255,255,255,0.05)] pb-4">
                <h2 className="text-white font-heading font-black text-xl uppercase tracking-widest">
                  {currentPage === 'stamps' ? 'Word Stamps' : 'Travel Stats'}
                </h2>
                <div className="flex bg-[rgba(255,255,255,0.03)] p-1 rounded-xl border border-[rgba(255,255,255,0.05)]">
                  <button 
                    onClick={() => changeTab('stamps')} 
                    className={`text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-lg transition-all ${currentPage === 'stamps' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'}`}
                  >
                    Stamps
                  </button>
                  <button 
                    onClick={() => changeTab('stats')} 
                    className={`text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-lg transition-all ${currentPage === 'stats' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'}`}
                  >
                    Stats
                  </button>
                </div>
              </div>

              <div className={`flex-1 flex flex-col ${tabChanging ? 'tab-transition-out' : 'tab-transition-in'}`}>
                {currentPage === 'stamps' && (
                  <>
                    <div className="flex justify-between items-center gap-4 mb-8 w-full">
                      <div className="flex flex-nowrap gap-2 items-center overflow-x-auto pb-1 passport-scrollbar">
                        {(['all', 'common', 'advanced', 'gre'] as const).map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)} 
                            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all flex-shrink-0 ${
                              activeCategory === cat 
                                ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                                : 'border border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.3)]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={addNewWord} 
                        className="ml-auto text-[11px] font-bold uppercase tracking-widest border border-[#7C3AED] text-[#A855F7] px-3 py-1.5 rounded-full hover:bg-[rgba(124,58,237,0.1)] transition-all flex items-center gap-1 group active:scale-95 flex-shrink-0"
                      >
                        <Sparkles size={12} className="group-hover:rotate-180 transition-transform duration-500" /> Add Word
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 passport-scrollbar h-[350px]">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-6 pb-6">
                        {slots.map((word, idx) => {
                          const style = word ? getCategoryColor(word.category) : null;
                          const textLen = word ? word.word.length : 0;
                          const textSize = textLen > 9 ? 'text-[9px]' : 'text-xs';
                          
                          return (
                            <div 
                              key={idx} 
                              className={`w-full max-w-[80px] mx-auto aspect-square flex items-center justify-center relative group cursor-pointer ${word ? 'ink-splat' : ''}`}
                            >
                              {word && style ? (
                                <div 
                                  className="w-full h-full rounded-full flex flex-col items-center justify-center digital-stamp shadow-md transition-transform duration-300 group-hover:scale-110 p-1 bg-[rgba(255,255,255,0.02)]" 
                                  style={{ 
                                    borderColor: style.border,
                                    color: style.text,
                                    transform: `rotate(${(idx % 5) * 6 - 12}deg)`,
                                    borderWidth: '2px'
                                  }}
                                >
                                  <span className={`font-heading font-bold ${textSize} uppercase text-center leading-none px-1 break-words`}>
                                    {word.word}
                                  </span>
                                  <span className="text-[6px] font-mono mt-1 opacity-50 uppercase">{word.category}</span>
                                </div>
                              ) : (
                                <div className="w-full h-full rounded-full border-2 border-dashed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.01)] flex items-center justify-center">
                                  <Lock size={16} className="text-[#94A3B8] opacity-30" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {currentPage === 'stats' && (
                  <div className="flex-1 flex flex-col space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-6 border-[#EAB308] border-opacity-30 shadow-[0_0_20px_rgba(234,179,8,0.05)] text-center relative overflow-hidden">
                        <Award size={28} className="mx-auto text-[#EAB308] mb-3 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Collected Words</div>
                        <div className="text-4xl font-heading font-black text-white">{displayStats.words}</div>
                        {/* Sparkline Decor */}
                        <div className="w-16 h-4 mx-auto mt-3 flex items-end justify-center gap-1 opacity-50">
                          {[2,5,3,8,6,10].map((h, i) => <div key={i} className="w-1.5 bg-[#EAB308] rounded-t" style={{height: `${h*10}%`}}></div>)}
                        </div>
                      </div>
                      
                      <div className="glass-card p-6 border-[#F97316] border-opacity-30 shadow-[0_0_20px_rgba(249,115,22,0.05)] text-center relative overflow-hidden">
                        <Flame size={28} className="mx-auto text-[#F97316] mb-3 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse" />
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Longest Streak</div>
                        <div className="text-4xl font-heading font-black text-white">{displayStats.streak}</div>
                        <div className="text-[10px] text-[#F97316] mt-3 font-bold">ACTIVE 🔥</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-6 border-[#06B6D4] border-opacity-30 shadow-[0_0_20px_rgba(6,182,212,0.05)] text-center relative overflow-hidden">
                        <CheckCircle size={28} className="mx-auto text-[#06B6D4] mb-3 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Win Rate</div>
                        <div className="text-4xl font-heading font-black text-white">{displayStats.winRate}%</div>
                      </div>
                      
                      <div className="glass-card p-6 border-[#EC4899] border-opacity-30 shadow-[0_0_20px_rgba(236,72,153,0.05)] text-center relative overflow-hidden">
                        <MessageCircle size={28} className="mx-auto text-[#EC4899] mb-3 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-1">Sentences Used</div>
                        <div className="text-4xl font-heading font-black text-white">{displayStats.sentences}</div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-8 border-[#7C3AED] border-opacity-30 text-center relative overflow-hidden flex-1 flex flex-col justify-center">
                      <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-2">Current Rank</div>
                      <div className="text-[28px] font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899] mb-6 drop-shadow-sm whitespace-nowrap flex items-center justify-center gap-2">
                        <span className="text-2xl">⚔️</span> {currentRank.name}
                      </div>
                      
                      <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-[99px] h-[10px] mb-3 overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#EAB308] rounded-full progress-fill relative flex justify-end items-center" style={{ width: `${(collectedWords.length % 20) / 20 * 100}%` }}>
                          <div className="w-2 h-2 bg-[#EAB308] rounded-full shadow-[0_0_10px_rgba(234,179,8,1)] mr-1"></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-[#EAB308]">{20 - (collectedWords.length % 20)} words to next rank</span>
                        <span className="text-[#94A3B8]">Next: 🏆 {currentRank.next}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SHARE CARD MODAL */}
      {/* ========================================================= */}
      {showShareCard && (
        <div className="modal-overlay-fixed animate-fade-in" onClick={() => setShowShareCard(false)}>
          <div className="modal-inner-card bg-[#0D0B1A] border border-[rgba(255,255,255,0.1)] rounded-3xl max-w-md w-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowShareCard(false)} 
              className="sticky top-4 right-4 ml-auto text-[#94A3B8] hover:text-white p-2 bg-[rgba(255,255,255,0.05)] rounded-full z-20 transition-colors backdrop-blur-sm shadow-md"
            >
              ✕
            </button>
            
            <div className="p-6 pt-0">
              {/* Card to capture */}
              <div ref={shareCardRef} className="bg-gradient-to-br from-[#1A143A] via-[#0D0B1A] to-[#251B54] p-8 rounded-2xl border-2 border-[#EAB308] text-center mb-6 relative overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                {/* Aurora effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[rgba(124,58,237,0.3)] via-transparent to-transparent pointer-events-none"></div>
                
                {/* Corner Ornaments */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#EAB308] opacity-50"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#EAB308] opacity-50"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#EAB308] opacity-50"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#EAB308] opacity-50"></div>

                <div className="relative z-10">
                  {/* Brand Logo */}
                  <div className="w-14 h-14 mx-auto rounded-[14px] bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center mb-6 shadow-lg border border-[rgba(255,255,255,0.2)]">
                    <span className="text-white font-heading font-black text-xl tracking-tighter">VR</span>
                  </div>
                  
                  <div className="inline-block px-5 py-1.5 bg-[rgba(234,179,8,0.1)] border-2 border-[#EAB308] rounded-full mb-6 shimmer-badge shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <h3 className="text-[#EAB308] text-[10px] uppercase tracking-widest font-bold">Official Milestone</h3>
                  </div>

                  <p className="text-white text-3xl font-heading font-black mb-8 leading-tight">
                    I've mastered <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-5xl drop-shadow-sm">{collectedWords.length}</span><br/>
                    vocabulary words!
                  </p>
                  
                  {/* Custom SVG Medal */}
                  <div className="flex flex-col items-center justify-center mb-8 medal-bob">
                    <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-[0_5px_15px_rgba(234,179,8,0.4)]">
                      {/* Ribbon */}
                      <path d="M15 0 L30 30 L45 0 Z" fill="#EF4444" />
                      <path d="M10 0 L25 30 L15 0 Z" fill="#B91C1C" />
                      <path d="M50 0 L35 30 L45 0 Z" fill="#B91C1C" />
                      {/* Medal Body */}
                      <circle cx="30" cy="45" r="22" fill="url(#goldGrad)" />
                      <circle cx="30" cy="45" r="18" fill="#111" />
                      <path d="M30 32 L34 40 L43 41 L36 47 L38 56 L30 51 L22 56 L24 47 L17 41 L26 40 Z" fill="url(#goldGrad)" />
                      <defs>
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FDE047" />
                          <stop offset="50%" stopColor="#EAB308" />
                          <stop offset="100%" stopColor="#A16207" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="text-[#EAB308] font-bold tracking-widest text-sm uppercase mt-2">Bronze Scholar</div>
                    
                    <div className="text-white text-[11px] font-mono mt-3 flex items-center gap-2 bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)] shadow-inner">
                      <span>{collectedWords.length} Words</span>
                      <span className="text-[#7C3AED] text-lg leading-none">•</span>
                      <span>Lvl {rankIndex + 1}</span>
                      <span className="text-[#EAB308] text-lg leading-none">•</span>
                      <span>14 Day Streak</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#EAB308]/30 pt-4 flex items-center justify-center gap-2">
                    <Globe size={10} className="text-[#EAB308]" />
                    <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold">Powered by VocabRise.com</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sticky bottom-4 z-10 bg-[#0D0B1A] pt-2 pb-4">
                <button onClick={shareOnWhatsApp} className="flex items-center justify-center gap-2 bg-[#25D366] text-[#111] py-3.5 rounded-xl font-bold hover:bg-[#20bd5a] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(37,211,102,0.3)]">
                  <Share2 size={14} /> WhatsApp
                </button>
                <button onClick={copyAchievementText} className="flex items-center justify-center gap-2 bg-transparent border border-[rgba(255,255,255,0.1)] text-white py-3.5 rounded-xl font-bold hover:bg-[rgba(255,255,255,0.05)] hover:scale-[1.02] transition-all text-xs uppercase tracking-wider">
                  <Copy size={14} /> Copy
                </button>
                <button onClick={downloadAsImage} className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white py-3.5 rounded-xl font-bold hover:scale-[1.02] transition-all text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(236,72,153,0.4)]">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
