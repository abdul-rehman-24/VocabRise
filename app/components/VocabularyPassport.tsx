'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Download, Share2, Calendar, Lock } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

// Collected word from API
interface CollectedWord {
  id: string;
  word: string;
  definition: string;
  category: string;
  difficulty: number;
  collectedAt: string;
}

// Available words to learn
interface AvailableWord {
  text: string;
  category: 'common' | 'advanced' | 'gre';
  definition: string;
  difficulty: number;
}

const availableWords: AvailableWord[] = [
  // Common words
  { text: 'Hello', category: 'common', definition: 'A greeting', difficulty: 1 },
  { text: 'Grateful', category: 'common', definition: 'Feeling thanks', difficulty: 2 },
  { text: 'Brave', category: 'common', definition: 'Courageous', difficulty: 2 },
  { text: 'Kind', category: 'common', definition: 'Showing good nature', difficulty: 1 },
  { text: 'Smart', category: 'common', definition: 'Intelligent', difficulty: 1 },
  { text: 'Happy', category: 'common', definition: 'Feeling joy', difficulty: 1 },
  { text: 'Bright', category: 'common', definition: 'Shining with light', difficulty: 2 },
  { text: 'Quick', category: 'common', definition: 'Fast', difficulty: 1 },
  { text: 'Strong', category: 'common', definition: 'Powerful', difficulty: 2 },
  { text: 'Gentle', category: 'common', definition: 'Soft and kind', difficulty: 2 },

  // Advanced words
  { text: 'Eloquent', category: 'advanced', definition: 'Fluent and persuasive', difficulty: 4 },
  { text: 'Resilient', category: 'advanced', definition: 'Able to recover', difficulty: 4 },
  { text: 'Candid', category: 'advanced', definition: 'Frank and honest', difficulty: 3 },
  { text: 'Verbose', category: 'advanced', definition: 'Using too many words', difficulty: 4 },
  { text: 'Lucid', category: 'advanced', definition: 'Clear and easy to understand', difficulty: 3 },
  { text: 'Pragmatic', category: 'advanced', definition: 'Practical and realistic', difficulty: 4 },
  { text: 'Nuanced', category: 'advanced', definition: 'With subtle differences', difficulty: 4 },
  { text: 'Fortuitous', category: 'advanced', definition: 'Happening by luck', difficulty: 4 },
  { text: 'Paradigm', category: 'advanced', definition: 'Model or pattern', difficulty: 4 },
  { text: 'Pungent', category: 'advanced', definition: 'Strong smell or taste', difficulty: 4 },

  // GRE words
  { text: 'Ephemeral', category: 'gre', definition: 'Lasting only a short time', difficulty: 5 },
  { text: 'Serendipity', category: 'gre', definition: 'Happy accident', difficulty: 5 },
  { text: 'Melancholy', category: 'gre', definition: 'Sad and pensive', difficulty: 5 },
  { text: 'Tenacious', category: 'gre', definition: 'Holding firmly', difficulty: 5 },
  { text: 'Ambiguous', category: 'gre', definition: 'Open to multiple meanings', difficulty: 5 },
  { text: 'Venerate', category: 'gre', definition: 'Regard with respect', difficulty: 5 },
  { text: 'Obfuscate', category: 'gre', definition: 'Make unclear', difficulty: 5 },
  { text: 'Pragmatic', category: 'gre', definition: 'Practical approach', difficulty: 5 },
];

interface MilestoneConfig {
  threshold: number;
  label: string;
  icon: string;
  color: string;
}

const milestones: MilestoneConfig[] = [
  { threshold: 10, label: 'Bronze Badge', icon: '🥉', color: '#CD7F32' },
  { threshold: 50, label: 'Silver Badge', icon: '🥈', color: '#C0C0C0' },
  { threshold: 100, label: 'Gold Badge', icon: '🥇', color: '#FFD700' },
  { threshold: 250, label: 'Platinum Badge', icon: '💎', color: '#E5E4E2' },
];

const rankLevels = ['Beginner', 'Explorer', 'Scholar', 'Master', 'Legend'];

interface PassportData {
  userName: string;
  joinedDate: string;
  collectedWords: CollectedWord[];
  totalWords: number;
  longestStreak: number;
  currentStreak: number;
}

export default function VocabularyPassport() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'cover' | 'stamps' | 'stats'>('cover');
  const [showShareCard, setShowShareCard] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'common' | 'advanced' | 'gre'>('all');
  const [isFlipping, setIsFlipping] = useState(false);
  const [addingWord, setAddingWord] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Load passport data
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const loadPassportData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/passport/words');
        if (!response.ok) throw new Error('Failed to fetch passport data');
        const data = await response.json();
        setPassportData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
        console.error('Error loading passport:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPassportData();
  }, [isAuthenticated, isLoading]);

  // Load html2canvas
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-var(--bg-base) flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-var(--text-primary) mb-2">Please sign in</div>
          <div className="text-var(--text-secondary)">to access your vocabulary passport</div>
        </div>
      </div>
    );
  }

  if (loading || !passportData) {
    return (
      <div className="min-h-screen bg-var(--bg-base) flex items-center justify-center">
        <div className="text-var(--text-primary)">Loading your passport...</div>
      </div>
    );
  }

  const handleFlip = (page: 'cover' | 'stamps' | 'stats') => {
    if (currentPage === page) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsFlipping(false);
    }, 600);
  };

  const addNewWord = async () => {
    try {
      setAddingWord(true);
      const collectedWordTexts = passportData.collectedWords.map(w => w.word.toLowerCase());
      const availableToAdd = availableWords.filter(w => !collectedWordTexts.includes(w.text.toLowerCase()));

      if (availableToAdd.length === 0) {
        alert('All available words already collected!');
        return;
      }

      const randomWord = availableToAdd[Math.floor(Math.random() * availableToAdd.length)];

      const response = await fetch('/api/passport/add-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: randomWord.text,
          definition: randomWord.definition,
          category: randomWord.category,
          difficulty: randomWord.difficulty,
        }),
      });

      if (!response.ok) throw new Error('Failed to add word');

      const newWord = await response.json();

      const oldCount = passportData.collectedWords.length;
      const newCount = oldCount + 1;

      setPassportData({
        ...passportData,
        collectedWords: [...passportData.collectedWords, newWord],
        totalWords: newCount,
      });

      // Check for milestone
      const newMilestone = milestones.find(m => m.threshold === newCount);
      if (newMilestone) {
        setCelebrationMessage(newMilestone.label);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      }
    } catch (err) {
      alert('Error adding word. Please try again.');
      console.error('Error:', err);
    } finally {
      setAddingWord(false);
    }
  };

  const getUnlockedMilestones = () => {
    return milestones.filter(m => passportData.totalWords >= m.threshold);
  };

  const getNextMilestone = () => {
    return milestones.find(m => passportData.totalWords < m.threshold);
  };

  const getRank = () => {
    const index = Math.floor(passportData.totalWords / 50);
    return rankLevels[Math.min(index, rankLevels.length - 1)];
  };

  const getFilteredWords = () => {
    if (activeCategory === 'all') return passportData.collectedWords;
    return passportData.collectedWords.filter(w => w.category === activeCategory);
  };

  const getCategoryCount = (category: string) => {
    return passportData.collectedWords.filter(w => w.category === category).length;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'common':
        return '#3B82F6'; // Blue
      case 'advanced':
        return '#A855F7'; // Purple
      case 'gre':
        return '#FFD700'; // Gold
      default:
        return '#6B7280'; // Gray
    }
  };

  const getTopWords = () => {
    return passportData.collectedWords.sort((a, b) => b.difficulty - a.difficulty).slice(0, 5);
  };

  const shareOnWhatsApp = () => {
    const text = `🎓 I've learned ${passportData.totalWords} new words on VocabRise! 
${getUnlockedMilestones().map(m => `${m.icon} ${m.label}`).join(' ')}

Join me in building my Vocabulary Passport! 📚`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`);
  };

  const copyAchievementText = () => {
    const text = `🎓 I've learned ${passportData.totalWords} words on VocabRise! ${getUnlockedMilestones().map(m => m.icon).join(' ')} #VocabRise #Learning`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Achievement text copied to clipboard!');
    });
  };

  const downloadAsImage = async () => {
    if (!shareCardRef.current || !(window as any).html2canvas) {
      alert('Please wait for the download tool to load');
      return;
    }

    try {
      const canvas = await (window as any).html2canvas(shareCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `vocab-passport-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Error generating image');
    }
  };

  const nextMilestone = getNextMilestone();
  const progressToNext = nextMilestone
    ? Math.round((passportData.totalWords / nextMilestone.threshold) * 100)
    : 100;

  const filteredWords = getFilteredWords();

  return (
    <div className="min-h-screen bg-var(--bg-base) p-4 md:p-8 pt-24">
      <style>{`
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(124, 109, 250, 0.1); }
          50% { box-shadow: 0 0 50px rgba(124, 109, 250, 0.2); }
        }

        @keyframes borderGlow {
          0%, 100% { border-color: rgba(124, 109, 250, 0.3); }
          50% { border-color: rgba(124, 109, 250, 0.6); }
        }

        @keyframes stampPop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes pillSlide {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        .card-glow {
          animation: cardGlow 3s ease-in-out infinite;
        }

        .border-glow {
          animation: borderGlow 2s ease-in-out infinite;
        }

        .stamp-pop {
          animation: stampPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .pill-slide {
          animation: pillSlide 0.3s ease-out;
        }

        /* Passport passport design */
        .passport-card {
          background: linear-gradient(135deg, rgba(124, 109, 250, 0.08) 0%, rgba(157, 81, 245, 0.04) 100%);
          border: 2px solid var(--brand-border);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .passport-card::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          width: 40px;
          height: 40px;
          border: 2px solid var(--brand-border);
          border-radius: 4px;
        }

        .passport-card::after {
          content: '';
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border: 2px solid var(--brand-border);
          border-radius: 4px;
        }

        .badge-shine {
          background: linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%);
          box-shadow: 0 0 20px rgba(124, 109, 250, 0.3);
        }

        .stat-card {
          background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card) 100%);
          border: 1px solid var(--brand-border);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--brand-bright);
          box-shadow: 0 0 30px rgba(124, 109, 250, 0.15);
        }

        .pill-badge {
          background: rgba(124, 109, 250, 0.12);
          border: 1px solid var(--brand-border);
          color: var(--brand-bright);
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .btn-passport-primary {
          background: linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(124, 109, 250, 0.3);
        }

        .btn-passport-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(124, 109, 250, 0.4);
        }

        .btn-passport-secondary {
          background: transparent;
          border: 2px solid var(--brand-border);
          color: var(--brand-bright);
          border-radius: 10px;
          padding: 10px 22px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-passport-secondary:hover {
          border-color: var(--brand-bright);
          background: rgba(124, 109, 250, 0.1);
        }
      `}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 style={{ fontFamily: 'var(--font-heading)' }} className="text-4xl md:text-5xl font-bold text-var(--text-primary) mb-2">
          Vocabulary Passport
        </h1>
        <p className="text-var(--text-secondary)">Build your word collection and unlock achievements</p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Passport Card */}
        <div className="lg:col-span-1">
          <div className="passport-card card-glow p-8 h-fit sticky top-24">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="badge-shine w-20 h-20 rounded-full flex items-center justify-center text-2xl border-2 border-var(--brand-bright)">
                VR
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6 border-b-2 border-var(--brand-dim) pb-4">
              <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-xl font-bold text-var(--text-primary) tracking-wider mb-1">
                VOCABULARY PASSPORT
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-var(--brand-bright) to-transparent mb-2"></div>
            </div>

            {/* Member Info */}
            <div className="text-center mb-6">
              <div className="text-sm text-var(--text-secondary) mb-1">Issued to</div>
              <div style={{ fontFamily: 'var(--font-heading)' }} className="text-lg font-bold text-var(--text-primary) mb-3">
                {passportData.userName || 'VocabRise Member'}
              </div>
              <div className="text-xs text-var(--text-muted) flex items-center justify-center gap-1">
                <Calendar size={12} />
                Joined {new Date(passportData.joinedDate).toLocaleDateString()}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-6 text-center text-xs">
              <div className="bg-var(--bg-surface) p-2 rounded">
                <div className="text-var(--brand-bright) font-bold text-lg">{passportData.totalWords}</div>
                <div className="text-var(--text-muted) text-xs">Words</div>
              </div>
              <div className="bg-var(--bg-surface) p-2 rounded">
                <div className="text-var(--semantic-success) font-bold text-lg">🔥</div>
                <div className="text-var(--text-muted) text-xs">Streak</div>
              </div>
              <div className="bg-var(--bg-surface) p-2 rounded">
                <div className="text-var(--semantic-gold) font-bold text-lg">★</div>
                <div className="text-var(--text-muted) text-xs">Level</div>
              </div>
            </div>

            {/* Valid Member Badge */}
            <div className="text-center mb-6">
              <div className="inline-block pill-badge">
                ✓ VALID MEMBER
              </div>
            </div>

            {/* Barcode Decoration */}
            <div className="flex justify-center gap-px mb-6 opacity-20">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-1 h-8 bg-var(--brand-bright)"></div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                className="btn-passport-primary w-full"
                onClick={() => setShowShareCard(true)}
              >
                Share Passport
              </button>
              <button
                className="btn-passport-secondary w-full"
                onClick={() => window.history.back()}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Word Collection */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="text-var(--text-muted) text-xs font-semibold mb-2">Total Words</div>
              <div style={{ fontFamily: 'var(--font-heading)' }} className="text-3xl font-bold text-var(--brand-bright)">
                {passportData.totalWords}
              </div>
            </div>

            <div className="stat-card">
              <div className="text-var(--text-muted) text-xs font-semibold mb-2">Current Streak</div>
              <div style={{ fontFamily: 'var(--font-heading)' }} className="text-3xl font-bold text-var(--semantic-streak)">
                {passportData.currentStreak}
              </div>
            </div>

            <div className="stat-card">
              <div className="text-var(--text-muted) text-xs font-semibold mb-2">Longest Streak</div>
              <div style={{ fontFamily: 'var(--font-heading)' }} className="text-3xl font-bold text-var(--semantic-warning)">
                {passportData.longestStreak}
              </div>
            </div>

            <div className="stat-card">
              <div className="text-var(--text-muted) text-xs font-semibold mb-2">Rank</div>
              <div style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl font-bold text-var(--semantic-gold)">
                {getRank()}
              </div>
            </div>
          </div>

          {/* Word Collection */}
          <div className="bg-var(--bg-surface) border-2 border-var(--brand-border) rounded-16 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: 'var(--font-heading)' }} className="text-xl font-bold text-var(--text-primary)">
                Learned Words
              </h3>
              <button
                onClick={addNewWord}
                disabled={addingWord}
                className="btn-passport-primary text-sm"
              >
                {addingWord ? 'Adding...' : '+ Add New'}
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-var(--brand-dim)">
              {(['all', 'common', 'advanced', 'gre'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-sm font-semibold rounded transition-all ${
                    activeCategory === cat
                      ? 'bg-var(--brand-bright) text-white'
                      : 'bg-transparent border border-var(--brand-border) text-var(--text-secondary) hover:border-var(--brand-bright)'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  {' '}({cat === 'all' ? passportData.totalWords : getCategoryCount(cat)})
                </button>
              ))}
            </div>

            {/* Word Pills */}
            <div className="flex flex-wrap gap-2">
              {getFilteredWords().map((word, index) => (
                <div key={word.id} className="pill-slide" style={{ animationDelay: `${index * 0.05}s` }}>
                  <button className="pill-badge hover:bg-var(--brand-dim) transition-colors">
                    {word.word}
                    <span className="ml-1 text-xs opacity-60">
                      {word.difficulty > 3 ? '★★★' : word.difficulty === 3 ? '★★' : '★'}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {getFilteredWords().length === 0 && (
              <div className="text-center py-8">
                <Lock size={24} className="mx-auto mb-2 text-var(--text-muted) opacity-50" />
                <div className="text-var(--text-muted) text-sm">No words in this category yet</div>
              </div>
            )}
          </div>

          {/* Unlocked Achievements */}
          <div className="bg-var(--bg-surface) border-2 border-var(--brand-border) rounded-16 p-6">
            <h3 style={{ fontFamily: 'var(--font-heading)' }} className="text-xl font-bold text-var(--text-primary) mb-6">
              Milestones Unlocked
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {milestones.map((milestone) => {
                const isUnlocked = passportData.totalWords >= milestone.threshold;
                return (
                  <div
                    key={milestone.threshold}
                    className="stamp-pop"
                    style={{ animationDelay: `${milestone.threshold * 0.1}s` }}
                  >
                    <div
                      className={`rounded-12 p-4 text-center border-2 transition-all ${
                        isUnlocked
                          ? 'bg-var(--brand-dim) border-var(--brand-bright) card-glow'
                          : 'bg-var(--bg-card) border-var(--brand-border) opacity-40'
                      }`}
                    >
                      <div className="text-3xl mb-2">{milestone.icon}</div>
                      <div className="text-xs font-bold text-var(--text-primary)">{milestone.label}</div>
                      {isUnlocked && (
                        <div className="text-xs text-var(--brand-bright) font-semibold mt-1">✓ Unlocked</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareCard && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-var(--bg-surface) border-2 border-var(--brand-border) rounded-16 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-var(--brand-dim)">
                <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl font-bold text-var(--text-primary)">
                  Share Achievement
                </h2>
                <button
                  onClick={() => setShowShareCard(false)}
                  className="text-var(--text-muted) hover:text-var(--text-primary) text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Preview Card */}
              <div
                ref={shareCardRef}
                className="passport-card p-8 mb-8 text-center border-2 border-var(--brand-bright)"
              >
                <div className="text-5xl mb-4">📚</div>
                <h3 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl font-bold text-var(--brand-bright) mb-4">
                  VocabRise Achievement
                </h3>
                <p className="text-var(--text-primary) text-lg font-semibold mb-6">
                  I've learned {passportData.totalWords} vocabularies!
                </p>

                {/* Badges */}
                <div className="flex justify-center gap-3 mb-6 flex-wrap">
                  {getUnlockedMilestones().map((milestone) => (
                    <div key={milestone.threshold} className="text-3xl">
                      {milestone.icon}
                    </div>
                  ))}
                </div>

                <p className="text-var(--text-secondary) text-sm">Join VocabRise - Build Your Vocabulary! 📖</p>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={shareOnWhatsApp}
                  className="btn-passport-primary flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> WhatsApp
                </button>
                <button
                  onClick={copyAchievementText}
                  className="btn-passport-primary flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> Copy Text
                </button>
                <button
                  onClick={downloadAsImage}
                  className="btn-passport-primary flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-var(--bg-surface) border-2 border-var(--brand-bright) rounded-16 p-12 text-center shadow-2xl animate-bounce card-glow">
            <div className="text-6xl mb-4">🎉</div>
            <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-3xl font-bold text-var(--text-primary) mb-2">
              Milestone Unlocked!
            </h2>
            <p className="text-xl text-var(--brand-bright)">{celebrationMessage}</p>
            <p style={{ fontFamily: 'var(--font-heading)' }} className="text-4xl mt-6 font-bold text-var(--semantic-gold)">
              {passportData.totalWords} Words
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
