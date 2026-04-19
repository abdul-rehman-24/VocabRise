'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Settings, ChevronLeft, ChevronRight, CheckCircle, XCircle, Play, Mic, Star } from 'lucide-react';

const WORD_DECK = [
  {
    word: 'Ephemeral',
    phonetic: 'ih-FEM-er-uhl',
    urdu: 'عارضی (Aarzi)',
    syllables: [
      { text: 'e', stress: false },
      { text: 'PHEM', stress: true },
      { text: 'er', stress: false },
      { text: 'al', stress: false }
    ],
    definition: 'Lasting for a very short time.',
    exampleSentence: 'The beauty of the sunset was ephemeral, fading almost as quickly as it appeared.',
    difficulty: 'Advanced'
  },
  {
    word: 'Serendipity',
    phonetic: 'ser-uh n-DIP-i-tee',
    urdu: 'حسن اتفاق (Husn-e-Ittifaq)',
    syllables: [
      { text: 'ser', stress: false },
      { text: 'en', stress: false },
      { text: 'DIP', stress: true },
      { text: 'i', stress: false },
      { text: 'ty', stress: false }
    ],
    definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
    exampleSentence: 'Finding that rare book at a yard sale was pure serendipity.',
    difficulty: 'Advanced'
  },
  {
    word: 'Eloquent',
    phonetic: 'EL-uh-kwuhnt',
    urdu: 'فصیح (Faseeh)',
    syllables: [
      { text: 'EL', stress: true },
      { text: 'o', stress: false },
      { text: 'quent', stress: false }
    ],
    definition: 'Fluent or persuasive in speaking or writing.',
    exampleSentence: 'She gave an eloquent speech that moved the entire audience to tears.',
    difficulty: 'Intermediate'
  },
  {
    word: 'Tenacious',
    phonetic: 'tuh-NEY-shuhs',
    urdu: 'ثابت قدم (Sabit Qadam)',
    syllables: [
      { text: 'te', stress: false },
      { text: 'NA', stress: true },
      { text: 'cious', stress: false }
    ],
    definition: 'Tending to keep a firm hold of something; clinging or adhering closely.',
    exampleSentence: 'His tenacious spirit helped him overcome every obstacle in his path.',
    difficulty: 'Advanced'
  },
  {
    word: 'Melancholy',
    phonetic: 'MEL-uhn-kol-ee',
    urdu: 'اداسی (Udasi)',
    syllables: [
      { text: 'MEL', stress: true },
      { text: 'an', stress: false },
      { text: 'cho', stress: false },
      { text: 'ly', stress: false }
    ],
    definition: 'A feeling of pensive sadness, typically with no obvious cause.',
    exampleSentence: 'A wave of melancholy washed over her as she looked at the old photographs.',
    difficulty: 'Intermediate'
  },
  {
    word: 'Resilient',
    phonetic: 'ri-ZIL-yuhnt',
    urdu: 'لچکدار (Lachakdar)',
    syllables: [
      { text: 're', stress: false },
      { text: 'SIL', stress: true },
      { text: 'i', stress: false },
      { text: 'ent', stress: false }
    ],
    definition: 'Able to withstand or recover quickly from difficult conditions.',
    exampleSentence: 'Children are incredibly resilient and can adapt to new environments quickly.',
    difficulty: 'Intermediate'
  }
];

export default function PronunciationFeature() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingSentence, setIsSpeakingSentence] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [slowMode, setSlowMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});
  const [quizUserTyped, setQuizUserTyped] = useState("");
  const [selfRatings, setSelfRatings] = useState<Record<number, string>>({});
  const [supported, setSupported] = useState(true);
  const [quizTimeLeft, setQuizTimeLeft] = useState(30);
  const [quizTimerActive, setQuizTimerActive] = useState(false);
  const [flashState, setFlashState] = useState<'none' | 'correct' | 'wrong'>('none');
  
  // New States for Completion Screen
  const [sessionComplete, setSessionComplete] = useState(false);
  const [xpLevel, setXpLevel] = useState(12);
  const [currentXp, setCurrentXp] = useState(148);

  const currentWord = WORD_DECK[currentCardIndex];

  const playSuccessChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playTone(523.25, now, 0.3); // C5
      playTone(659.25, now + 0.15, 0.3); // E5
      playTone(783.99, now + 0.3, 0.6); // G5
    } catch (e) {
      console.error(e);
    }
  };

  const completeSession = () => {
    setSessionComplete(true);
    playSuccessChime();
    setCurrentXp(prev => Math.min(200, prev + (quizMode ? quizScore * 10 : WORD_DECK.length * 5)));
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [quizMode, settingsOpen, currentCardIndex, sessionComplete]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('speechSynthesis' in window)) {
        setSupported(false);
        return;
      }
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoiceURI) {
          const defaultVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [selectedVoiceURI]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizMode && quizTimerActive && quizAnswers[currentCardIndex] === undefined && !sessionComplete) {
      if (quizTimeLeft > 0) {
        timer = setTimeout(() => setQuizTimeLeft(prev => prev - 1), 1000);
      } else {
        handleQuizSubmit(null as any, true);
      }
    }
    return () => clearTimeout(timer);
  }, [quizMode, quizTimerActive, quizTimeLeft, currentCardIndex, quizAnswers, sessionComplete]);

  useEffect(() => {
    setQuizUserTyped("");
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsSpeakingSentence(false);
    setFlashState('none');
    
    if (quizMode && quizAnswers[currentCardIndex] === undefined && !sessionComplete) {
      setQuizTimeLeft(30);
      setQuizTimerActive(true);
    } else {
      setQuizTimerActive(false);
    }
  }, [currentCardIndex, quizMode, sessionComplete]);

  const speak = (text: string, isSentence = false) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    
    if (isSentence) setIsSpeakingSentence(true);
    else setIsSpeaking(true);

    const playUtterance = (repeatCount: number) => {
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoiceURI) {
        const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (voice) utterance.voice = voice;
      }
      utterance.rate = slowMode ? 0.5 : speechRate;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        if (repeatCount > 1) {
          setTimeout(() => playUtterance(repeatCount - 1), 600);
        } else {
          setIsSpeaking(false);
          setIsSpeakingSentence(false);
        }
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsSpeakingSentence(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    playUtterance(!isSentence && repeatMode ? 3 : 1);
  };

  const handleQuizSubmit = (e: React.FormEvent | null, isTimeout = false) => {
    if (e) e.preventDefault();
    if (quizAnswers[currentCardIndex] !== undefined) return;
    
    const isCorrect = !isTimeout && quizUserTyped.toLowerCase().trim() === currentWord.word.toLowerCase();
    setQuizAnswers(prev => ({ ...prev, [currentCardIndex]: isCorrect }));
    setQuizTimerActive(false);
    
    if (isCorrect) {
      setQuizScore(s => s + 1);
      setFlashState('correct');
    } else {
      setFlashState('wrong');
    }
  };

  if (!supported) {
    return (
      <div className="p-8 text-center text-[#EF4444] border border-[#EF4444] bg-[rgba(239,68,68,0.1)] rounded-2xl">
        Your browser doesn't support the Web Speech API audio. Try updating Chrome, Edge, or Safari.
      </div>
    );
  }

  const completedCount = Object.keys(selfRatings).length;
  
  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
        }

        .header-bar {
          border-left: 4px solid #7C3AED;
          box-shadow: -4px 0 15px rgba(124,58,237,0.4);
        }

        .btn-quiz-mode {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-quiz-mode::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-20deg);
        }
        .btn-quiz-mode:hover::before {
          left: 150%;
          transition: all 0.7s ease;
        }
        .btn-quiz-mode.active {
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          color: white;
          box-shadow: 0 0 15px rgba(236,72,153,0.4);
          border: none;
        }

        .gear-icon { transition: transform 0.6s ease; }
        .gear-icon:hover { transform: rotate(360deg); }

        .btn-large-speaker {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #A855F7);
          display: flex; align-items: center; justify-content: center;
          color: white; cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(124,58,237,0.5);
          border: none; margin: 0 auto 20px;
        }
        .btn-large-speaker:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(124,58,237,0.7); }
        .btn-large-speaker:active { transform: scale(0.95); }

        .btn-large-speaker.speaking {
          animation: speakerPulse 1.5s infinite;
        }
        @keyframes speakerPulse {
          0% { box-shadow: 0 0 0 0 rgba(124,58,237,0.6); }
          70% { box-shadow: 0 0 0 20px rgba(124,58,237,0); }
          100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
        }

        .soundwave-container {
          display: flex; gap: 4px; justify-content: center; height: 24px; align-items: flex-end;
        }
        .soundwave-bar {
          width: 4px; background: #A855F7; border-radius: 2px;
          transform-origin: bottom; transform: scaleY(0.3);
        }
        .soundwave-bar.active { animation: soundwave 0.5s infinite alternate ease-in-out; }
        .soundwave-bar:nth-child(1) { animation-delay: 0.1s; }
        .soundwave-bar:nth-child(2) { animation-delay: 0.3s; }
        .soundwave-bar:nth-child(3) { animation-delay: 0.2s; }
        
        .example-box {
          border-left: 3px solid #7C3AED;
          box-shadow: -5px 0 15px rgba(124,58,237,0.2);
          background: rgba(255,255,255,0.03);
        }

        .syl-bubble {
          padding: 6px 16px; border-radius: 999px; cursor: pointer; transition: all 0.2s;
          position: relative;
        }
        .syl-bubble:hover { background: rgba(124,58,237,0.2); border-color: #7C3AED; }
        .syl-active {
          background: #7C3AED; color: white; font-weight: 700; transform: scale(1.1);
          box-shadow: 0 0 15px rgba(124,58,237,0.5); border: 1px solid #A855F7;
        }
        .syl-inactive {
          background: rgba(255,255,255,0.05); color: #94A3B8; border: 1px solid rgba(255,255,255,0.1);
        }
        .syl-stress-mark { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); font-weight: 900; color: #A855F7; }

        .quiz-badge {
          background: rgba(234,179,8,0.15); border: 1px solid rgba(234,179,8,0.4);
          color: #EAB308; border-radius: 99px; padding: 6px 16px; font-size: 13px; font-weight: 600;
          animation: quizBadgePulse 2s infinite alternate; display: inline-block;
        }
        .timer-bar {
          height: 4px; border-radius: 2px; margin-top: 12px; transition: width 1s linear, background-color 0.3s ease;
        }

        .quiz-input {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(124,58,237,0.3);
          border-radius: 12px; color: white; font-size: 16px; padding: 16px 20px; width: 100%;
          text-align: center; outline: none; transition: all 0.3s ease;
        }
        .quiz-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }

        .btn-submit {
          background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; font-weight: 700;
          padding: 14px 32px; border-radius: 12px; width: 100%; border: none; cursor: pointer;
          box-shadow: 0 0 20px rgba(124,58,237,0.4); transition: all 0.3s; position: relative; overflow: hidden;
        }
        .btn-submit::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent); transform: skewX(-20deg);
        }
        .btn-submit:hover:not(:disabled)::before { left: 150%; transition: all 0.7s; }
        .btn-submit:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 0 30px rgba(124,58,237,0.6); }
        .btn-submit.correct { background: #22C55E; box-shadow: 0 0 20px rgba(34,197,94,0.4); }

        .btn-audio-pulse {
          background: #1A143A; border: 1px solid rgba(124,58,237,0.5); color: white;
          border-radius: 12px; padding: 16px; width: 100%; font-weight: 600;
          display: flex; justify-content: center; align-items: center; gap: 8px;
          animation: audioPulse 2s infinite; transition: all 0.3s;
        }
        .btn-audio-pulse:hover { background: #251B54; }

        .flash-overlay {
          position: absolute; inset: 0; pointer-events: none; border-radius: 24px; z-index: 20; opacity: 0;
        }
        .flash-correct { animation: flashGreen 0.8s ease-out; }
        .flash-wrong { animation: flashRed 0.5s ease-out, shakeCard 0.4s ease-in-out; }
        
        @keyframes flashGreen {
          0% { background: rgba(34,197,94,0.2); opacity: 1; box-shadow: inset 0 0 50px rgba(34,197,94,0.5); }
          100% { opacity: 0; }
        }
        @keyframes flashRed {
          0% { background: rgba(239,68,68,0.15); opacity: 1; box-shadow: inset 0 0 50px rgba(239,68,68,0.4); }
          100% { opacity: 0; }
        }
        @keyframes shakeCard {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        /* Custom Toggle */
        .toggle-switch {
          position: relative; display: inline-block; width: 44px; height: 24px;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider-round {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 24px;
        }
        .slider-round:before {
          position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
          background-color: white; transition: .4s; border-radius: 50%;
        }
        input:checked + .slider-round { background-color: #7C3AED; }
        input:checked + .slider-round:before { transform: translateX(20px); }

        .nav-arrow {
          background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); border-radius: 50%;
          width: 50px; height: 50px; color: #A855F7; display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease; position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
        }
        .nav-arrow:hover:not(:disabled) {
          background: rgba(124,58,237,0.3); transform: translateY(-50%) scale(1.1); box-shadow: 0 0 15px rgba(124,58,237,0.3); color: white;
        }
        .nav-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
        .nav-arrow-left { left: 0px; } .nav-arrow-right { right: 0px; }
        @media (min-width: 640px) { .nav-arrow-left { left: -60px; } .nav-arrow-right { right: -60px; } }

        /* Speed slider */
        .custom-range {
          -webkit-appearance: none; width: 100%; height: 6px; background: rgba(255,255,255,0.1);
          border-radius: 4px; outline: none;
        }
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: white; border: 3px solid #7C3AED; cursor: pointer; transition: 0.2s;
        }
        .custom-range::-webkit-slider-thumb:hover { transform: scale(1.2); }

        /* Progress track */
        .prog-card {
          flex: 1; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 14px; transition: all 0.3s; border: 1px solid transparent;
        }
        .prog-completed { background: #7C3AED; color: white; border-color: #A855F7; }
        .prog-current { background: rgba(124,58,237,0.1); border-color: #7C3AED; color: #7C3AED; animation: pulseBorder 2s infinite; }
        .prog-upcoming { background: rgba(255,255,255,0.05); color: #64748B; border-color: rgba(255,255,255,0.1); }
        @keyframes pulseBorder {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
          50% { box-shadow: 0 0 0 4px rgba(124,58,237,0.3); }
        }

        .reveal-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.7s ease; will-change: opacity, transform; }
        .reveal-active { opacity: 1; transform: translateY(0); }
        
        /* Completion Screen Animations */
        .confetti-particle {
          position: absolute; width: 8px; height: 8px; border-radius: 4px;
          animation: confettiFall 3s ease-out forwards; opacity: 0;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-50px) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg) scale(0.5); opacity: 0; }
        }
        .trophy-glow { position: relative; }
        .trophy-glow::after {
          content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 120px; height: 120px; background: radial-gradient(circle, rgba(124,58,237,0.8) 0%, transparent 70%);
          z-index: -1; animation: pulseBorder 2s infinite;
        }
        .bounce-in { animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.1s both; }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .fade-slide-up { animation: fadeSlideUp 0.6s ease 0.3s both; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .banner-slide-down { animation: bannerSlideDown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s both; }
        @keyframes bannerSlideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card-pop { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        .xp-bar-fill { transition: width 1.5s ease-out; transition-delay: 1.0s; }
        .fade-in-delayed { animation: fadeSlideUp 0.6s ease 1.5s both; }
        .btn-secondary {
          background: transparent; border: 2px solid rgba(255,255,255,0.1); color: white;
          padding: 14px 32px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s;
        }
        .btn-secondary:hover { border-color: #A855F7; box-shadow: 0 0 15px rgba(124,58,237,0.3); }
      `}} />
      
      {/* Header controls */}
      <div className="reveal-on-scroll glass-card header-bar p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(124,58,237,0.2)] text-[#A855F7]">
            <Volume2 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">Pronunciation Lab</h2>
            <div className="text-xs text-[#94A3B8] font-medium flex gap-3 mt-1">
              <span>Words Today: <strong className="text-white">4</strong></span>
              <span className="text-gray-600">|</span>
              <span>Accuracy: <strong className="text-[#22C55E]">87%</strong></span>
              <span className="text-gray-600">|</span>
              <span>Streak: <strong className="text-[#EAB308]">🔥3</strong></span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setQuizMode(!quizMode); setSettingsOpen(false); }}
            className={`btn-quiz-mode px-5 py-2.5 rounded-xl font-bold text-sm ${quizMode ? 'active' : 'bg-[rgba(255,255,255,0.05)] text-white border border-[rgba(255,255,255,0.1)]'}`}
            disabled={sessionComplete}
          >
            {quizMode ? 'Exit Quiz Mode' : 'Quiz Mode'}
          </button>
          
          <button 
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`gear-icon p-2.5 rounded-xl transition-all border ${settingsOpen ? 'bg-[rgba(124,58,237,0.2)] text-[#A855F7] border-[#7C3AED]' : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] border-transparent hover:bg-[rgba(255,255,255,0.1)]'}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {settingsOpen && (
        <div className="reveal-on-scroll glass-card p-6 border-l-[3px] border-l-[#7C3AED]">
          <h3 className="text-[#A855F7] font-bold text-lg mb-4 pb-3 border-b border-[rgba(124,58,237,0.2)]">Speech Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-[#94A3B8] block">Voice</label>
              <div className="flex gap-2">
                <select 
                  value={selectedVoiceURI} 
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="bg-[#1a1a2e] border border-[rgba(124,58,237,0.3)] text-white rounded-[10px] px-4 py-3 w-full outline-none transition-all focus:border-[#7C3AED] focus:ring-[3px] focus:ring-[rgba(124,58,237,0.15)]"
                >
                  {availableVoices.length === 0 && <option style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Loading voices...</option>}
                  {availableVoices.map((v, i) => (
                    <option key={i} value={v.voiceURI} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>{v.name} ({v.lang})</option>
                  ))}
                </select>
                <button onClick={() => speak("Testing voice")} className="px-4 bg-[#7C3AED] hover:bg-[#A855F7] text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap">
                  Test Voice
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#94A3B8] block">Speed ({speechRate.toFixed(2)}x)</label>
                <div className="flex gap-1">
                  {[0.5, 0.75, 1.0, 1.25].map(rate => (
                    <button 
                      key={rate} onClick={() => setSpeechRate(rate)}
                      className={`text-xs px-2 py-1 rounded-full font-bold transition-all ${speechRate === rate ? 'bg-[#7C3AED] text-white' : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.1)]'}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
              <input 
                type="range" 
                min="0.5" max="2" step="0.25" 
                value={speechRate} 
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="custom-range"
                disabled={slowMode}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-3">
              <label className="toggle-switch">
                <input type="checkbox" checked={slowMode} onChange={(e) => { setSlowMode(e.target.checked); if (e.target.checked) setSpeechRate(0.5); }} />
                <span className="slider-round"></span>
              </label>
              <span className="text-sm text-white">Force Slow Mode</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="toggle-switch">
                <input type="checkbox" checked={repeatMode} onChange={(e) => setRepeatMode(e.target.checked)} />
                <span className="slider-round"></span>
              </label>
              <span className="text-sm text-white">Auto-repeat 3x</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Card Area */}
      <div className="relative reveal-on-scroll">
        {!sessionComplete && (
          <>
            <button 
              onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
              disabled={currentCardIndex === 0}
              className="nav-arrow nav-arrow-left hidden sm:flex"
            >
              <ChevronLeft size={28} />
            </button>
            
            <button 
              onClick={() => setCurrentCardIndex(Math.min(WORD_DECK.length - 1, currentCardIndex + 1))}
              disabled={currentCardIndex === WORD_DECK.length - 1}
              className="nav-arrow nav-arrow-right hidden sm:flex"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        <div className={`glass-card min-h-[450px] flex flex-col relative ${sessionComplete ? '' : 'p-8 sm:p-12'} transition-all duration-300 overflow-hidden`} style={{ transform: flashState === 'wrong' ? 'translateX(0)' : 'none' }}>
          
          {sessionComplete ? (
            <div className="flex flex-col items-center justify-center p-12 relative w-full min-h-[500px]">
              
              {/* Confetti Particles */}
              {Array.from({length: 50}).map((_, i) => (
                <div key={i} className="confetti-particle" style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#7C3AED', '#EC4899', '#EAB308', '#22C55E'][Math.floor(Math.random() * 4)],
                  animationDelay: `${Math.random() * 0.5}s`
                }}></div>
              ))}

              <div className="trophy-glow bounce-in mb-6 z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-[#EAB308] to-[#F59E0B] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                  <Star size={48} className="text-white drop-shadow-md" fill="white" />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-2 fade-slide-up text-center z-10">Practice Complete!</h2>
              <p className="text-[#94A3B8] text-lg font-medium mb-8 fade-slide-up z-10">You crushed it, Abdul!</p>

              <div className="bg-gradient-to-r from-[#F97316] to-[#EAB308] px-6 py-2 rounded-full font-bold text-white shadow-[0_4px_20px_rgba(249,115,22,0.3)] banner-slide-down mb-10 flex items-center gap-2 z-10">
                🔥 Streak Bonus! +5 XP Extra
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12 z-10">
                <div className="glass-card p-4 flex flex-col items-center border border-[rgba(34,197,94,0.3)] shadow-[0_0_20px_rgba(34,197,94,0.15)] stat-card-pop" style={{animationDelay: '0.7s'}}>
                  <div className="bg-[rgba(34,197,94,0.2)] p-2 rounded-full text-[#22C55E] mb-2"><CheckCircle size={20} /></div>
                  <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-1">Words Practiced</p>
                  <p className="text-white font-heading font-bold text-2xl">{WORD_DECK.length}/{WORD_DECK.length}</p>
                </div>
                <div className="glass-card p-4 flex flex-col items-center border border-[rgba(234,179,8,0.3)] shadow-[0_0_20px_rgba(234,179,8,0.15)] stat-card-pop" style={{animationDelay: '0.8s'}}>
                  <div className="bg-[rgba(234,179,8,0.2)] p-2 rounded-full text-[#EAB308] mb-2"><Star size={20} fill="currentColor"/></div>
                  <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-1">XP Earned</p>
                  <p className="text-[#EAB308] font-heading font-bold text-2xl">+{quizMode ? quizScore * 10 : WORD_DECK.length * 5}</p>
                </div>
                <div className="glass-card p-4 flex flex-col items-center border border-[rgba(124,58,237,0.3)] shadow-[0_0_20px_rgba(124,58,237,0.15)] stat-card-pop" style={{animationDelay: '0.9s'}}>
                  <div className="bg-[rgba(124,58,237,0.2)] p-2 rounded-full text-[#A855F7] mb-2"><Star size={20} /></div>
                  <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-1">Accuracy</p>
                  <p className="text-white font-heading font-bold text-2xl">{quizMode ? Math.round((quizScore/WORD_DECK.length)*100) : 100}%</p>
                </div>
              </div>

              <div className="w-full max-w-md mb-12 fade-slide-up z-10" style={{animationDelay: '1.0s'}}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-white font-bold text-sm">Level {xpLevel} <span className="text-[#94A3B8] font-normal mx-1">→</span> {xpLevel + 1}</span>
                  <span className="text-[#94A3B8] text-xs font-medium">{currentXp} / 200 XP</span>
                </div>
                <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-3 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full relative xp-bar-fill"
                    style={{ width: `${(currentXp / 200) * 100}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-[#EAB308] opacity-50 shadow-[5px_0_10px_rgba(234,179,8,0.8)]"></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md fade-in-delayed z-10">
                <button 
                  onClick={() => { setSessionComplete(false); setCurrentCardIndex(0); setQuizAnswers({}); setQuizScore(0); setSelfRatings({}); }}
                  className="btn-submit flex-1"
                >
                  Practice Again →
                </button>
                <button onClick={() => window.location.href = '/dashboard'} className="btn-secondary flex-1">
                  Back to Dashboard
                </button>
              </div>

            </div>
          ) : (
            <>
              <div className={`flash-overlay ${flashState === 'correct' ? 'flash-correct' : flashState === 'wrong' ? 'flash-wrong' : ''}`}></div>
              
              <div className="absolute top-6 right-6 bg-[rgba(124,58,237,0.15)] text-[#A855F7] border border-[#7C3AED] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {currentWord.difficulty}
              </div>

              {!quizMode ? (
                <div className="text-center w-full animate-fade-in flex flex-col items-center">
                  
                  <button 
                    onClick={() => speak(currentWord.word)}
                    className={`btn-large-speaker ${isSpeaking ? 'speaking' : ''}`}
                  >
                    <Volume2 size={40} />
                  </button>
                  
                  <div className="soundwave-container mb-6 h-6">
                    <div className={`soundwave-bar ${isSpeaking ? 'active' : ''}`}></div>
                    <div className={`soundwave-bar ${isSpeaking ? 'active' : ''}`}></div>
                    <div className={`soundwave-bar ${isSpeaking ? 'active' : ''}`}></div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {currentWord.syllables.map((syl, i) => (
                      <span 
                        key={i} 
                        className={`syl-bubble ${syl.stress ? 'syl-active' : 'syl-inactive'}`}
                        onClick={() => speak(syl.text)}
                      >
                        {syl.stress && <span className="syl-stress-mark">ˈ</span>}
                        {syl.text}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-5xl sm:text-6xl font-black font-heading tracking-tight text-white mb-2">
                    {currentWord.word}
                  </h1>
                  
                  <div className="flex flex-col items-center mb-8">
                    <p className="text-[#A855F7] font-mono text-lg tracking-widest bg-[rgba(124,58,237,0.1)] px-4 py-1 rounded-lg mb-2">
                      /{currentWord.phonetic}/
                    </p>
                    <button 
                      onClick={() => { 
                        setSelfRatings(prev => ({...prev, [currentCardIndex]: 'got-it'})); 
                        if (currentCardIndex === WORD_DECK.length - 1) completeSession();
                        else setCurrentCardIndex(currentCardIndex + 1); 
                      }} 
                      className="mt-4 px-4 py-1.5 text-xs font-bold rounded-full border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-white transition-all"
                    >
                      {currentCardIndex === WORD_DECK.length - 1 ? 'Complete Session' : 'Mark as Learned'}
                    </button>
                  </div>

                  <div className="w-full max-w-xl mx-auto text-left space-y-4">
                    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6">
                      <p className="text-white text-lg font-medium mb-2">{currentWord.definition}</p>
                      <p className="text-[#EC4899] font-heading font-medium">{currentWord.urdu}</p>
                    </div>
                    
                    <div className="example-box rounded-xl p-5 cursor-pointer group" onClick={() => speak(currentWord.exampleSentence, true)}>
                      <div className="flex items-start gap-3">
                        <button className={`mt-0.5 flex-shrink-0 p-1.5 rounded-full transition-all ${isSpeakingSentence ? 'bg-[#7C3AED] text-white animate-pulse' : 'bg-[rgba(255,255,255,0.1)] text-[#94A3B8] group-hover:bg-[rgba(124,58,237,0.2)] group-hover:text-[#A855F7]'}`}>
                          <Play size={14} fill={isSpeakingSentence ? 'currentColor' : 'none'} />
                        </button>
                        <p className={`text-[#94A3B8] italic text-lg transition-all ${isSpeakingSentence ? 'text-white' : ''}`}>
                          {currentWord.exampleSentence.split(new RegExp(`(${currentWord.word})`, 'i')).map((part, i) => 
                            part.toLowerCase() === currentWord.word.toLowerCase() 
                              ? <strong key={i} className="text-[#A855F7] font-bold">{part}</strong> 
                              : part
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center w-full max-w-md mx-auto animate-fade-in relative z-30">
                  
                  <div className="flex justify-between items-center mb-6">
                    <div className="quiz-badge m-0">Quiz Mode Active</div>
                    <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-full">
                      <Star size={14} className="text-[#EAB308]" fill="currentColor" />
                      <span className="font-bold text-sm text-white">Score: {quizScore}/5</span>
                    </div>
                  </div>
                  
                  {quizAnswers[currentCardIndex] === undefined && (
                    <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-1.5 mb-8 overflow-hidden">
                      <div className="h-full transition-all duration-1000 ease-linear" style={{ width: `${(quizTimeLeft/30)*100}%`, background: quizTimeLeft > 15 ? '#22C55E' : quizTimeLeft > 5 ? '#EAB308' : '#EF4444' }}></div>
                    </div>
                  )}
                  
                  <p className="text-xl text-white font-medium mb-8 p-6 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-inner">
                    "{currentWord.definition}"
                  </p>

                  <button onClick={() => speak(currentWord.word)} className="btn-audio-pulse mb-8 group">
                    <Volume2 size={24} className="group-hover:scale-110 transition-transform" />
                    {isSpeaking ? 'Playing...' : 'Play Audio to Guess'}
                  </button>

                  {quizAnswers[currentCardIndex] === undefined ? (
                    <form onSubmit={handleQuizSubmit} className="space-y-4">
                      <input 
                        type="text" 
                        value={quizUserTyped}
                        onChange={(e) => setQuizUserTyped(e.target.value)}
                        placeholder="Type the word you heard..."
                        className="quiz-input"
                        autoFocus
                      />
                      <button type="submit" disabled={!quizUserTyped.trim()} className="btn-submit">
                        Submit Answer
                      </button>
                    </form>
                  ) : (
                    <div className="animate-fade-in space-y-6">
                      {quizAnswers[currentCardIndex] ? (
                        <div className="flex flex-col items-center text-[#22C55E]">
                          <CheckCircle size={56} className="mb-3" />
                          <h3 className="text-3xl font-bold mb-2">Correct!</h3>
                          <p className="text-white text-lg">The word is <strong>{currentWord.word}</strong></p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-[#EF4444]">
                          <XCircle size={56} className="mb-3" />
                          <h3 className="text-3xl font-bold mb-2">Incorrect</h3>
                          <p className="text-[#94A3B8]">You typed: <span className="line-through">{quizUserTyped}</span></p>
                          <p className="text-white text-lg mt-2">The correct word is <strong className="text-[#7C3AED]">{currentWord.word}</strong></p>
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          if (currentCardIndex === WORD_DECK.length - 1) {
                            completeSession();
                          } else { setCurrentCardIndex(currentCardIndex + 1); }
                        }}
                        className={`btn-submit ${quizAnswers[currentCardIndex] ? 'correct' : ''}`}
                      >
                        {currentCardIndex === WORD_DECK.length - 1 ? 'Complete Session' : 'Next Word'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress Track */}
      {!sessionComplete && (
        <div className="reveal-on-scroll glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-[#94A3B8] font-bold uppercase tracking-widest">
              {quizMode ? 'Quiz Progress' : 'Practice Progress'}
            </p>
            <div className="flex items-center gap-1.5 bg-[rgba(234,179,8,0.15)] border border-[rgba(234,179,8,0.3)] px-3 py-1 rounded-full">
              <Star size={14} className="text-[#EAB308]" fill="currentColor"/>
              <span className="text-sm font-bold text-[#EAB308]">+{quizScore * 10 || completedCount * 5} XP Earned</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {WORD_DECK.map((deckWord, idx) => {
              let statusClass = 'prog-upcoming';
              if (quizMode) {
                if (quizAnswers[idx] !== undefined) statusClass = 'prog-completed';
                else if (currentCardIndex === idx) statusClass = 'prog-current';
              } else {
                if (selfRatings[idx] === 'got-it') statusClass = 'prog-completed';
                else if (currentCardIndex === idx) statusClass = 'prog-current';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentCardIndex(idx)}
                  className={`prog-card ${statusClass}`}
                  title={deckWord.word}
                >
                  {statusClass === 'prog-completed' ? <CheckCircle size={18} /> : (idx + 1)}
                </button>
              )
            })}
          </div>
        </div>
      )}

    </div>
  );
}
