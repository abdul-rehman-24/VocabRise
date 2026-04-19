'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trophy, Clock, Heart, Zap, Target, Star, Check, X, User, Bot, Pencil, ArrowLeftRight, BookOpen, Swords, Share2, BarChart2, Minus } from 'lucide-react';

const playSound = (type: 'correct' | 'wrong' | 'win' | 'defeat' | 'tick') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'win') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'defeat') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    }
  } catch(e) {}
};

const WORDS = [
  {
    word: "Ephemeral", phonetic: "e-FEM-er-al", definition: "Lasting for a very short time", synonyms: ["Transient", "Fleeting", "Momentary"], antonym: "Permanent", partOfSpeech: "adjective", exampleSentence: "The beauty of the sunset was ______.", fakeDefinitions: ["Extremely large in size", "Relating to ancient history"], oddOneOutGroup: ["Transient", "Fleeting", "Eternal", "Momentary"], oddOneOutAnswer: "Eternal", synonymGrid: ["Transient","Fleeting","Momentary","Eternal","Verbose","Lucid","Brief","Lasting"], correctSynonyms: ["Transient","Fleeting","Momentary"]
  },
  {
    word: "Serendipity", phonetic: "ser-en-DIP-i-tee", definition: "The occurrence of events by chance in a happy way", synonyms: ["Chance", "Luck", "Fortuity"], antonym: "Misfortune", partOfSpeech: "noun", exampleSentence: "Finding that rare book at a yard sale was pure ______.", fakeDefinitions: ["A feeling of deep sadness", "The state of being calm"], oddOneOutGroup: ["Chance", "Luck", "Disaster", "Fortuity"], oddOneOutAnswer: "Disaster", synonymGrid: ["Chance","Luck","Fortuity","Disaster","Misery","Fate","Accident","Design"], correctSynonyms: ["Chance","Luck","Fortuity"]
  },
  {
    word: "Eloquent", phonetic: "EL-o-kwent", definition: "Fluent or persuasive in speaking or writing", synonyms: ["Articulate", "Expressive", "Fluent"], antonym: "Inarticulate", partOfSpeech: "adjective", exampleSentence: "The president gave an ______ speech that moved everyone.", fakeDefinitions: ["Large and heavy", "Hidden from public view"], oddOneOutGroup: ["Articulate", "Expressive", "Quiet", "Fluent"], oddOneOutAnswer: "Quiet", synonymGrid: ["Articulate","Expressive","Fluent","Quiet","Silent","Muted","Vocal","Clear"], correctSynonyms: ["Articulate","Expressive","Fluent"]
  },
  {
    word: "Tenacious", phonetic: "te-NAY-shus", definition: "Tending to keep a firm hold of something", synonyms: ["Persistent", "Determined", "Relentless"], antonym: "Yielding", partOfSpeech: "adjective", exampleSentence: "She was ______ in her pursuit of the championship.", fakeDefinitions: ["Easily broken or damaged", "Having a strong odor"], oddOneOutGroup: ["Persistent", "Determined", "Weak", "Relentless"], oddOneOutAnswer: "Weak", synonymGrid: ["Persistent","Determined","Relentless","Weak","Yielding","Soft","Firm","Strong"], correctSynonyms: ["Persistent","Determined","Relentless"]
  },
  {
    word: "Melancholy", phonetic: "MEL-an-kol-ee", definition: "A feeling of pensive sadness", synonyms: ["Sadness", "Sorrow", "Gloom"], antonym: "Joy", partOfSpeech: "noun", exampleSentence: "A deep ______ settled over him after the movie ended.", fakeDefinitions: ["A sweet-tasting fruit", "A type of musical instrument"], oddOneOutGroup: ["Sadness", "Sorrow", "Happiness", "Gloom"], oddOneOutAnswer: "Happiness", synonymGrid: ["Sadness","Sorrow","Gloom","Happiness","Joy","Cheer","Despair","Misery"], correctSynonyms: ["Sadness","Sorrow","Gloom"]
  },
  {
    word: "Resilient", phonetic: "ri-ZIL-yent", definition: "Able to withstand or recover quickly", synonyms: ["Tough", "Strong", "Hardy"], antonym: "Fragile", partOfSpeech: "adjective", exampleSentence: "The community proved to be ______ after the storm.", fakeDefinitions: ["Lacking courage", "Moving at a slow pace"], oddOneOutGroup: ["Tough", "Strong", "Fragile", "Hardy"], oddOneOutAnswer: "Fragile", synonymGrid: ["Tough","Strong","Hardy","Fragile","Weak","Brittle","Sturdy","Robust"], correctSynonyms: ["Tough","Strong","Hardy"]
  },
  {
    word: "Candid", phonetic: "KAN-did", definition: "Truthful and straightforward; frank", synonyms: ["Honest", "Frank", "Open"], antonym: "Deceitful", partOfSpeech: "adjective", exampleSentence: "Let me be perfectly ______ with you.", fakeDefinitions: ["Covered in sugar", "Hidden or concealed"], oddOneOutGroup: ["Honest", "Frank", "Liar", "Open"], oddOneOutAnswer: "Liar", synonymGrid: ["Honest","Frank","Open","Secret","Deceitful","Hidden","Direct","Blunt"], correctSynonyms: ["Honest","Frank","Open"]
  },
  {
    word: "Verbose", phonetic: "ver-BOHS", definition: "Using or expressed in more words than are needed", synonyms: ["Wordy", "Talkative", "Loquacious"], antonym: "Concise", partOfSpeech: "adjective", exampleSentence: "The legal document was overly ______.", fakeDefinitions: ["Brightly colored", "Having a smooth texture"], oddOneOutGroup: ["Wordy", "Talkative", "Silent", "Loquacious"], oddOneOutAnswer: "Silent", synonymGrid: ["Wordy","Talkative","Loquacious","Concise","Brief","Short","Chatty","Garrulous"], correctSynonyms: ["Wordy","Talkative","Loquacious"]
  }
];

const CHALLENGE_TYPES = ['LIGHTNING_BUZZ', 'SPELL_DUEL', 'ODD_ONE_OUT', 'FILL_THE_BLANK', 'ANTONYM_ATTACK', 'BLUFF_MASTER'];

export default function WordBattle() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'roundResult' | 'gameOver'>('intro');
  const [currentRound, setCurrentRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  
  const [roundType, setRoundType] = useState('');
  const [currentWord, setCurrentWord] = useState(WORDS[0]);
  
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerMax, setTimerMax] = useState(10);
  
  const [roundWinner, setRoundWinner] = useState<'player' | 'bot' | 'tie' | null>(null);
  const [roundXP, setRoundXP] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [wordsToReview, setWordsToReview] = useState<string[]>([]);
  
  const [botState, setBotState] = useState<'idle' | 'thinking' | 'wrong' | 'correct'>('idle');
  const [playerLocked, setPlayerLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealedCorrect, setRevealedCorrect] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentRoundRef = useRef(1);
  const roundTypeRef = useRef('');
  const playerScoreRef = useRef(0);
  const botScoreRef = useRef(0);
  const diffRef = useRef('MEDIUM');

  const [inputValue, setInputValue] = useState('');

  const startRound = (roundNum: number) => {
    let type = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)];
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    
    setCurrentWord(w);
    setRoundType(type);
    roundTypeRef.current = type;
    setCurrentRound(roundNum);
    currentRoundRef.current = roundNum;
    
    let maxT = diffRef.current === 'HARD' ? 6 : diffRef.current === 'MEDIUM' ? 10 : 15;
    if (type === 'SPELL_DUEL') maxT += 5;
    
    setTimeLeft(maxT);
    setTimerMax(maxT);
    setGamePhase('playing');
    setRoundWinner(null);
    setPlayerLocked(false);
    setSelectedOption(null);
    setRevealedCorrect(null);
    setInputValue('');
    setBotState('thinking');
    
    startTimer(maxT);
    simulateBot(type, w);
  };

  useEffect(() => {
    if (gamePhase !== 'playing' || timeLeft === null) return;
    if (timeLeft <= 4 && timeLeft > 0) playSound('tick');
    if (timeLeft === 0) handleTimeUp();
  }, [timeLeft, gamePhase]);

  const startTimer = (max: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(max);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const clearBot = () => {
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
  };

  const simulateBot = (type: string, word: any) => {
    clearBot();
    let delay = Math.random() * 2000 + (diffRef.current === 'HARD' ? 1000 : 2000);
    
    botTimeoutRef.current = setTimeout(() => {
      setBotState('idle');
      const winChance = diffRef.current === 'HARD' ? 0.8 : diffRef.current === 'MEDIUM' ? 0.5 : 0.2;
      const isCorrect = Math.random() < winChance;
      
      if (type !== 'SPELL_DUEL') {
        if (isCorrect) {
          endRound('bot', 0);
        } else {
          setBotState('wrong');
        }
      } else {
        if (isCorrect) endRound('bot', 0);
        else setBotState('wrong');
      }
    }, delay);
  };

  const handleTimeUp = () => {
    if (roundTypeRef.current === 'BLUFF_MASTER') {
      endRound('tie', 0);
    } else {
      endRound('bot', 0); // Time up counts as loss
    }
  };

  const getCorrectAnswer = () => {
    if (roundType === 'LIGHTNING_BUZZ' || roundType === 'BLUFF_MASTER') return currentWord.definition;
    if (roundType === 'ODD_ONE_OUT') return currentWord.oddOneOutAnswer;
    if (roundType === 'FILL_THE_BLANK') return currentWord.word;
    if (roundType === 'ANTONYM_ATTACK') return currentWord.antonym;
    return currentWord.word;
  };

  const endRound = (winner: 'player' | 'bot' | 'tie', xp: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    clearBot();
    setPlayerLocked(true);
    setRevealedCorrect(getCorrectAnswer());
    
    if (winner === 'player') {
      playSound('correct');
      setPlayerScore(p => p + 1);
      playerScoreRef.current += 1;
      setCorrectAnswersCount(p => p + 1);
    } else if (winner === 'bot') {
      playSound('wrong');
      setBotScore(p => p + 1);
      botScoreRef.current += 1;
      if (!wordsToReview.includes(currentWord.word)) {
        setWordsToReview(prev => [...prev, currentWord.word]);
      }
    } else {
      playSound('wrong');
    }
    
    setRoundWinner(winner);
    setRoundXP(xp);
    setTotalXP(p => p + xp);
    
    setTimeout(() => {
      setGamePhase('roundResult');
      if (winner === 'player') playSound('win');
      else if (winner === 'bot') playSound('defeat');
      
      setTimeout(() => {
        if (currentRoundRef.current < 5) {
          startRound(currentRoundRef.current + 1);
        } else {
          setGamePhase('gameOver');
          if (playerScoreRef.current > botScoreRef.current) playSound('win');
          else playSound('defeat');
        }
      }, 3000);
    }, 1500); // 1.5s delay to show correct answer before moving to result screen
  };

  const handleAnswerTap = (opt: string, isCorrect: boolean) => {
    if (playerLocked) return;
    setSelectedOption(opt);
    setPlayerLocked(true);
    
    // Simulate checking delay
    setTimeout(() => {
      if (isCorrect) endRound('player', 15 + Math.floor(timeLeft)); // Bonus for time
      else {
        endRound('bot', 0);
      }
    }, 600);
  };

  const handleSpellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerLocked) return;
    setSelectedOption(inputValue);
    setPlayerLocked(true);
    setTimeout(() => {
      if (inputValue.toLowerCase() === currentWord.word.toLowerCase()) {
        endRound('player', 20 + Math.floor(timeLeft));
      } else {
        endRound('bot', 0);
      }
    }, 600);
  };

  const renderGameplayOptions = () => {
    let options: string[] = [];
    if (roundType === 'LIGHTNING_BUZZ' || roundType === 'BLUFF_MASTER') {
      options = [currentWord.definition, ...currentWord.fakeDefinitions, "A type of modern architecture"].slice(0,4);
    } else if (roundType === 'ODD_ONE_OUT') {
      options = currentWord.oddOneOutGroup;
    } else if (roundType === 'FILL_THE_BLANK') {
      options = [currentWord.word, ...currentWord.synonyms].slice(0,4);
    } else if (roundType === 'ANTONYM_ATTACK') {
      options = [currentWord.antonym, ...currentWord.synonyms].slice(0,4);
    }

    // Stable shuffle for render using seeded approach or just keep it simple, but we need it stable during re-renders. 
    // We'll just sort them using a simple hash to keep it stable per word.
    options = options.sort((a,b) => a.length - b.length); 

    const correctAnswer = getCorrectAnswer();

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
        {options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          const isRevealedCorrect = revealedCorrect === opt;
          const isRevealedWrong = revealedCorrect && isSelected && opt !== revealedCorrect;
          
          let btnClass = "relative p-4 sm:p-5 rounded-xl font-bold text-[15px] sm:text-[16px] text-white transition-all transform flex items-center justify-between ";
          
          if (!revealedCorrect) {
            if (isSelected) {
              btnClass += "border-2 border-[#7C3AED] bg-[rgba(124,58,237,0.2)] scale-[1.02] ";
            } else {
              btnClass += "border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] hover:border-[#7C3AED] hover:bg-[rgba(124,58,237,0.15)] hover:scale-[1.02] cursor-pointer ";
            }
          } else {
            if (isRevealedCorrect) {
              btnClass += "border-2 border-[#22C55E] bg-[rgba(34,197,94,0.2)] scale-[1.05] shadow-[0_0_20px_rgba(34,197,94,0.3)] z-10 animate-bounce ";
            } else if (isRevealedWrong) {
              btnClass += "border-2 border-[#EF4444] bg-[rgba(239,68,68,0.15)] animate-[shake_0.4s_ease-in-out] ";
            } else {
              btnClass += "border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] opacity-50 ";
            }
          }

          return (
            <button 
              key={i} 
              disabled={playerLocked}
              onClick={() => handleAnswerTap(opt, opt === correctAnswer)} 
              className={btnClass}
              style={{ minHeight: '80px', textAlign: 'left' }}
            >
              <span>{opt}</span>
              {isSelected && !revealedCorrect && <Clock size={18} className="animate-spin text-[#7C3AED] shrink-0" />}
              {isRevealedCorrect && <Check size={20} className="text-[#22C55E] shrink-0" strokeWidth={3} />}
              {isRevealedWrong && <X size={20} className="text-[#EF4444] shrink-0" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    );
  };

  const getModeIcon = () => {
    if (roundType === 'FILL_THE_BLANK') return <Pencil size={14} />;
    if (roundType === 'ANTONYM_ATTACK') return <ArrowLeftRight size={14} />;
    return <BookOpen size={14} />;
  }

  // =========================================================================
  // SCREEN 1: PRE-MATCH
  // =========================================================================
  if (gamePhase === 'intro') {
    return (
      <div className="w-full min-h-screen bg-[#0D0B1A] relative overflow-hidden flex flex-col items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes lightningFlash { 0%, 100% { opacity: 0; } 5%, 15% { opacity: 0.15; filter: brightness(1.2); } 10% { opacity: 0.05; } }
          @keyframes electricFlicker { 0% { opacity: 0.7; } 50% { opacity: 1; filter: drop-shadow(0 0 30px #EAB308); } 100% { opacity: 0.8; } }
          @keyframes gradientMove { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
          .arena-grid { background-image: linear-gradient(rgba(124,58,237,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.1) 1px, transparent 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px); opacity: 0.4; }
          .shimmer-bg { background: linear-gradient(90deg, #7C3AED, #EC4899, #7C3AED); background-size: 200% auto; animation: gradientMove 2s linear infinite; }
        `}} />
        
        {/* Animated Storm Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-[#7C3AED] opacity-[0.05] blur-[150px]"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#EF4444] opacity-[0.05] blur-[150px]"></div>
          <div className="absolute inset-0 arena-grid"></div>
          {/* Lightning effect overlays */}
          <div className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none" style={{ animation: 'lightningFlash 4s infinite' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
          <Zap size={80} fill="#EAB308" className="text-[#EAB308] mb-4" style={{ animation: 'electricFlicker 0.15s infinite alternate' }} />
          
          <h1 className="text-5xl sm:text-6xl font-black mb-1 font-heading uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] text-center">
            Word Battle
          </h1>
          <p className="text-[#A855F7] font-bold text-[13px] tracking-[0.2em] uppercase mb-12 text-center">
            1v1 Multiplayer • Best of 5 Rounds
          </p>

          {/* VS Matchup Layout */}
          <div className="flex justify-between items-center w-full mb-12 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <Swords size={24} className="text-[#EAB308] mb-1 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
              <div className="text-[40px] font-black italic bg-clip-text text-transparent bg-gradient-to-br from-[#F59E0B] to-[#EF4444] animate-pulse">VS</div>
            </div>

            {/* Player Side */}
            <div className="flex flex-col items-center w-[40%]">
              <div className="bg-[#7C3AED] text-white text-[10px] font-black px-3 py-1 rounded-full mb-[-10px] z-10 shadow-lg">YOU</div>
              <div className="w-20 h-20 rounded-2xl bg-[rgba(124,58,237,0.2)] border-2 border-[#7C3AED] flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(124,58,237,0.5)] backdrop-blur-sm">
                <span className="font-heading font-black text-3xl text-white">A</span>
              </div>
              <p className="font-bold text-white uppercase tracking-widest text-sm mb-1">{session?.user?.name?.split(' ')[0] || 'Ahmed'}</p>
              <p className="text-[#94A3B8] text-[11px] font-bold">Lvl 8 • 8.8k XP</p>
            </div>

            {/* Bot Side */}
            <div className="flex flex-col items-center w-[40%]">
              <div className="bg-[#EF4444] text-white text-[10px] font-black px-3 py-1 rounded-full mb-[-10px] z-10 shadow-lg">BOT</div>
              <div className="w-20 h-20 rounded-2xl bg-[rgba(239,68,68,0.1)] border-2 border-[#EF4444] flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(239,68,68,0.5)] backdrop-blur-sm">
                <Bot size={40} className="text-[#EF4444]" />
              </div>
              <p className="font-bold text-white uppercase tracking-widest text-sm mb-1">VocabBot</p>
              <p className="text-[#EF4444] text-[11px] font-bold">Difficulty: {difficulty}</p>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="flex gap-2 mb-10 w-full justify-center">
            {['EASY', 'MEDIUM', 'HARD'].map(d => (
              <button 
                key={d} 
                onClick={() => { setDifficulty(d as any); diffRef.current = d; }}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  difficulty === d 
                    ? d === 'EASY' ? 'bg-[#22C55E] border-[#22C55E] text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                    : d === 'MEDIUM' ? 'bg-[#F59E0B] border-[#F59E0B] text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-[#EF4444] border-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-transparent border-[rgba(255,255,255,0.2)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.5)]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button onClick={() => { playSound('tick'); startRound(1); }} className="w-full h-[56px] shimmer-bg text-white rounded-xl font-black text-xl tracking-widest uppercase hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all flex items-center justify-center gap-3">
            <Zap size={24} fill="currentColor" /> START MATCH
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 4/5: GAME OVER (VICTORY / DEFEAT)
  // =========================================================================
  if (gamePhase === 'gameOver') {
    const isWin = playerScore > botScore;
    const finalXP = totalXP + (isWin ? 50 : 0);
    const accuracy = Math.round((correctAnswersCount / 5) * 100);

    return (
      <div className="w-full min-h-screen bg-[#0D0B1A] relative flex flex-col items-center pt-16 pb-10 px-4">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes rain { 0% { transform: translateY(-10vh); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(100vh); opacity: 0; } }
          @keyframes shine { 0% { filter: brightness(1); } 50% { filter: brightness(1.5) drop-shadow(0 0 30px #FDE047); } 100% { filter: brightness(1); } }
          @keyframes shakeText { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px) rotate(-1deg); } 75% { transform: translateX(5px) rotate(1deg); } }
          .confetti-layer { position: absolute; inset: 0; pointer-events: none; z-index: 50; }
        `}} />
        
        {/* Backgrounds */}
        {isMounted && !isWin && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[rgba(239,68,68,0.15)] via-transparent to-transparent"></div>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="absolute w-[1px] h-10 bg-[#EF4444]" style={{ left: `${Math.random() * 100}%`, animation: `rain ${Math.random() * 2 + 1}s linear infinite`, opacity: 0.2 }}></div>
            ))}
          </div>
        )}

        {isMounted && isWin && (
          <div className="confetti-layer">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="absolute w-2 h-2 rounded-sm" style={{
                left: `${Math.random() * 100}vw`, top: '-20px',
                backgroundColor: ['#EAB308', '#FDE047', '#D97706', '#22C55E', '#7C3AED', '#EC4899'][Math.floor(Math.random() * 6)],
                animation: `confettiFall ${Math.random() * 3 + 2}s linear ${Math.random() * 0.5}s both`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}></div>
            ))}
          </div>
        )}

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          
          {isWin ? (
            <Trophy size={100} className="text-[#EAB308] drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] mb-4" style={{ animation: 'shine 2s infinite' }} />
          ) : (
            <div className="relative mb-4 opacity-80">
              <Trophy size={100} className="text-[#64748B] drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
              <div className="absolute top-0 right-1/4 w-1 h-12 bg-[#0D0B1A] rotate-45"></div>
              <div className="absolute top-4 right-1/3 w-1 h-8 bg-[#0D0B1A] -rotate-12"></div>
            </div>
          )}

          <h1 className={`text-5xl font-heading font-black uppercase mb-2 text-center tracking-tight ${isWin ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#FDE047] to-[#EAB308] drop-shadow-lg' : 'text-transparent bg-clip-text bg-gradient-to-b from-[#EF4444] to-[#991B1B]'}`} style={{ animation: !isWin ? 'shakeText 0.5s ease-out' : '' }}>
            {isWin ? 'Victory!' : 'Defeat'}
          </h1>
          
          {isWin ? (
            <p className="text-[#94A3B8] font-medium mb-8">You defeated VocabBot!</p>
          ) : (
            <div className="text-center mb-8">
              <p className="text-[#7C3AED] text-[14px] italic font-bold">"Agli baar zaroor jeetein ge!"</p>
              <p className="text-[#94A3B8] text-xs">We will definitely win next time!</p>
            </div>
          )}

          {/* Score Display */}
          <div className="flex justify-center items-center gap-8 mb-8 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl py-6 px-10">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.2)] flex items-center justify-center mx-auto mb-2 text-white font-bold">A</div>
              <div className={`text-5xl font-heading font-black ${isWin ? 'text-[#EAB308]' : 'text-[#64748B]'}`}>{playerScore}</div>
            </div>
            <div className="text-3xl text-[var(--border-strong)] font-black">-</div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-[rgba(239,68,68,0.2)] flex items-center justify-center mx-auto mb-2"><Bot size={20} className="text-[#EF4444]" /></div>
              <div className={`text-5xl font-heading font-black ${!isWin ? 'text-[#EF4444]' : 'text-[#64748B]'}`}>{botScore}</div>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="w-full bg-[rgba(0,0,0,0.3)] rounded-2xl border border-[rgba(255,255,255,0.05)] p-5 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.05)]">
              <span className="text-[#94A3B8] text-sm font-bold">Rounds Won</span>
              <span className="text-white font-black">{playerScore}/5</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.05)]">
              <span className="text-[#94A3B8] text-sm font-bold">Correct Answers</span>
              <span className="text-white font-black">{correctAnswersCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.05)]">
              <span className="text-[#94A3B8] text-sm font-bold">Accuracy</span>
              <span className="text-white font-black">{accuracy}%</span>
            </div>
            <div className="flex justify-between items-center py-2 pt-4 mt-2">
              <div className="flex flex-col">
                <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest mb-1">Total XP Earned</span>
                {finalXP === 0 && <span className="text-[#EF4444] text-[10px]">Win rounds to earn XP! (Correct = +15, Win = +50)</span>}
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-3xl font-heading font-black ${finalXP > 0 ? 'text-[#EAB308]' : 'text-[#64748B]'}`}>+{finalXP}</span>
                {isWin && <span className="text-[#EAB308] text-[10px] bg-[rgba(234,179,8,0.1)] px-2 py-0.5 rounded font-bold mt-1 animate-bounce">+50 Bonus</span>}
              </div>
            </div>
          </div>

          {/* Words to review */}
          {!isWin && wordsToReview.length > 0 && (
            <div className="w-full mb-8">
              <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mb-3 text-center">Words to review</p>
              <div className="flex flex-wrap justify-center gap-2">
                {wordsToReview.map(w => (
                  <button key={w} onClick={() => router.push('/dashboard')} className="bg-[rgba(124,58,237,0.1)] border border-[#7C3AED] text-[#A855F7] px-4 py-2 rounded-full text-sm font-bold hover:bg-[#7C3AED] hover:text-white transition-colors">
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full">
            {isWin && (
              <button className="w-full py-4 bg-gradient-to-r from-[#F59E0B] to-[#EAB308] text-[#111] rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2">
                <Share2 size={20} /> Share Victory
              </button>
            )}
            <button onClick={() => { setPlayerScore(0); playerScoreRef.current=0; setBotScore(0); botScoreRef.current=0; setTotalXP(0); setCorrectAnswersCount(0); setWordsToReview([]); startRound(1); }} className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent -translate-x-full group-hover:animate-[shimmerSweep_1s_forwards]"></div>
              <Zap size={20} /> {isWin ? 'Play Again' : 'Rematch Bot'}
            </button>
            <button onClick={() => router.push('/dashboard')} className="w-full py-4 bg-transparent border border-[rgba(255,255,255,0.2)] text-white rounded-xl font-bold uppercase tracking-widest hover:border-[#7C3AED] hover:bg-[rgba(124,58,237,0.1)] transition-colors flex items-center justify-center gap-2">
              <BarChart2 size={20} /> Exit to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // BATTLE HUD + GAMEPLAY
  // =========================================================================
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0D0B1A] font-body text-white">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes timerShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
        @keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .blinking-cursor { border-bottom: 2px solid #A855F7; animation: cursorBlink 1s infinite; display: inline-block; width: 60px; height: 1.2em; vertical-align: bottom; }
      `}} />

      {/* TOP PROGRESS BAR */}
      <div className="w-full h-1 bg-[#1A1A2E] fixed top-0 z-[100]">
        <div 
          className="h-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${(timeLeft / timerMax) * 100}%`,
            backgroundColor: timeLeft > (timerMax/2) ? '#22C55E' : timeLeft > 3 ? '#EAB308' : '#EF4444'
          }}
        ></div>
      </div>

      {/* SCORE HEADER (BATTLE HUD) */}
      <div className="w-full bg-[#110e24] border-b border-[rgba(255,255,255,0.05)] px-4 py-4 sm:px-8 mt-1 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          
          {/* Left: YOU */}
          <div className="flex items-center gap-4 w-[120px]">
            <div className="hidden sm:flex flex-col items-end">
              <span className="bg-[#7C3AED] text-white text-[10px] font-black px-2 py-0.5 rounded mb-1">YOU</span>
              <span className="text-4xl font-heading font-black leading-none">{playerScore}</span>
            </div>
            <div className="flex sm:hidden items-center gap-2">
              <span className="text-3xl font-heading font-black leading-none">{playerScore}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.2)] border-2 border-[#7C3AED] flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-lg text-white">A</span>
            </div>
          </div>

          {/* Center: ROUND */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-[#A855F7] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-1">Round {currentRound} of 5</div>
            <div className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mb-2 hidden sm:block">Battle</div>
            <div className="flex gap-1.5 sm:gap-2">
              {Array.from({length: 5}).map((_, i) => {
                const pastRound = i + 1 < currentRoundRef.current;
                const isCurrent = i + 1 === currentRoundRef.current;
                // Since we don't store per-round history easily, we'll just mock colors based on score for visual sake.
                // 1 win = 1 dot filled.
                let status = 'upcoming';
                if (pastRound) {
                  if (i < playerScoreRef.current) status = 'won';
                  else status = 'lost';
                }
                if (isCurrent) status = 'current';

                return (
                  <div key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${
                    status === 'won' ? 'bg-[#7C3AED] border-[#7C3AED]' : 
                    status === 'lost' ? 'bg-[#EF4444] border-[#EF4444]' : 
                    status === 'current' ? 'bg-transparent border-[#EAB308] animate-pulse' : 
                    'bg-transparent border-[#334155]'
                  }`} />
                );
              })}
            </div>
          </div>

          {/* Right: BOT */}
          <div className="flex items-center gap-4 w-[120px] justify-end">
            <div className="w-10 h-10 rounded-full bg-[rgba(239,68,68,0.1)] border-2 border-[#EF4444] flex items-center justify-center shrink-0">
              <Bot size={20} className="text-[#EF4444]" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="bg-[#EF4444] text-white text-[10px] font-black px-2 py-0.5 rounded mb-1">VB</span>
              <span className="text-4xl font-heading font-black leading-none">{botScore}</span>
            </div>
            <div className="flex sm:hidden items-center gap-2">
              <span className="text-3xl font-heading font-black leading-none">{botScore}</span>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN GAME AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/* ROUND RESULT OVERLAY */}
        {gamePhase === 'roundResult' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-up">
            <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: roundWinner === 'player' ? 'rgba(34,197,94,0.05)' : roundWinner === 'bot' ? 'rgba(239,68,68,0.05)' : 'rgba(0,0,0,0.5)' }}></div>
            <div className={`relative z-10 w-full max-w-sm rounded-3xl p-8 text-center border-2 shadow-2xl ${
              roundWinner === 'player' ? 'bg-[#0D0B1A] border-[#22C55E]' : 
              roundWinner === 'bot' ? 'bg-[#0D0B1A] border-[#EF4444]' : 
              'bg-[#0D0B1A] border-[#F59E0B]'
            }`}>
              {roundWinner === 'player' && (
                <>
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-[bounce_0.5s_ease-out]">
                    <Check size={50} className="text-white" strokeWidth={3} />
                  </div>
                  <h2 className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] to-[#22C55E] mb-2 uppercase">YOU WON!</h2>
                  <div className="inline-block bg-[rgba(234,179,8,0.15)] border border-[#EAB308] text-[#EAB308] font-black text-xl px-4 py-1.5 rounded-full mb-4 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    +{roundXP} XP
                  </div>
                  <p className="text-[#94A3B8] font-bold">Keep it up! 🔥</p>
                </>
              )}
              {roundWinner === 'bot' && (
                <>
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.4)] relative">
                    <svg className="absolute w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                      <path d="M18 6L6 18" strokeDasharray="30" strokeDashoffset="0"><animate attributeName="stroke-dashoffset" from="30" to="0" dur="0.3s" fill="freeze" /></path>
                      <path d="M6 6L18 18" strokeDasharray="30" strokeDashoffset="0"><animate attributeName="stroke-dashoffset" from="30" to="0" dur="0.3s" begin="0.2s" fill="freeze" /></path>
                    </svg>
                  </div>
                  <h2 className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F87171] to-[#EF4444] mb-4 uppercase" style={{ animation: 'slideInUp 0.3s ease-out' }}>BOT WON</h2>
                  <div className="inline-flex items-center gap-2 bg-[rgba(124,58,237,0.1)] border border-[#7C3AED] text-[#A855F7] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase">
                    {getModeIcon()} {roundType.replace('_', ' ')}
                  </div>
                  <p className="text-[#94A3B8] text-sm">Correct answer was:</p>
                  <p className="text-white font-bold text-lg mb-6">{getCorrectAnswer()}</p>
                </>
              )}
              {roundWinner === 'tie' && (
                <>
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    <Minus size={50} className="text-white" strokeWidth={3} />
                  </div>
                  <h2 className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] mb-2 uppercase">DRAW</h2>
                  <p className="text-[#94A3B8] font-bold mb-6">Nobody scored.</p>
                </>
              )}

              <div className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                Next round starting <span className="flex gap-1"><span className="animate-pulse">3</span><span className="animate-pulse" style={{animationDelay:'0.3s'}}>.</span><span className="animate-pulse" style={{animationDelay:'0.6s'}}>.</span></span>
              </div>
            </div>
          </div>
        )}

        {/* GAMEPLAY CARD */}
        {gamePhase === 'playing' && (
          <div className="w-full max-w-3xl flex flex-col items-center animate-fade-up">
            
            {/* Mode Badge */}
            <div className="bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] text-[#A855F7] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.15)]">
              {getModeIcon()} {roundType.replace('_', ' ')}
            </div>

            {/* Question Area */}
            {roundType === 'FILL_THE_BLANK' && (
              <div className="text-center mb-10 w-full px-4">
                <div className="text-4xl sm:text-5xl font-heading font-medium leading-relaxed text-white relative inline-block">
                  <span className="text-[#7C3AED] absolute -left-8 -top-4 text-6xl opacity-50">"</span>
                  {currentWord.exampleSentence.replace('______', '')}
                  <span className="blinking-cursor"></span>
                  <span className="text-[#7C3AED] absolute -right-8 bottom-0 text-6xl opacity-50">"</span>
                </div>
              </div>
            )}
            
            {(roundType === 'ANTONYM_ATTACK' || roundType === 'LIGHTNING_BUZZ' || roundType === 'BLUFF_MASTER') && (
              <div className="text-center mb-10 w-full px-4">
                <h2 className="text-5xl sm:text-6xl font-heading font-black text-white mb-4 drop-shadow-md">{currentWord.word}</h2>
                <p className="text-[#94A3B8] text-lg font-medium">{
                  roundType === 'ANTONYM_ATTACK' ? "What is the opposite?" : 
                  roundType === 'LIGHTNING_BUZZ' ? "What does it mean?" : 
                  "Find the real definition"
                }</p>
              </div>
            )}

            {roundType === 'ODD_ONE_OUT' && (
              <div className="text-center mb-10 w-full px-4">
                <h2 className="text-3xl font-heading font-black text-white mb-2 uppercase tracking-widest text-[#EAB308]">Odd One Out</h2>
                <p className="text-[#94A3B8] text-lg font-medium">Which word doesn't belong?</p>
              </div>
            )}
            
            {roundType === 'SPELL_DUEL' && (
              <div className="text-center mb-10 w-full px-4">
                <p className="text-2xl text-white font-medium mb-8 leading-relaxed max-w-xl mx-auto">"{currentWord.definition}"</p>
                <form onSubmit={handleSpellSubmit} className="w-full max-w-md mx-auto flex flex-col gap-4">
                  <input 
                    type="text" autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={playerLocked}
                    className="w-full bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.1)] rounded-xl px-6 py-4 text-white text-2xl text-center font-bold focus:outline-none focus:border-[#7C3AED] focus:bg-[rgba(124,58,237,0.05)] transition-all disabled:opacity-50"
                    placeholder="Spell the word..."
                  />
                  <button type="submit" disabled={playerLocked || !inputValue.trim()} className="w-full bg-[#7C3AED] text-white py-4 rounded-xl font-black text-lg tracking-widest hover:bg-[#6D28D9] disabled:opacity-50 transition-colors">SUBMIT</button>
                </form>
              </div>
            )}

            {/* Answer Options */}
            {roundType !== 'SPELL_DUEL' && renderGameplayOptions()}

            {/* Thick Timer Bar */}
            <div className="w-full max-w-2xl mt-12 relative">
              <div className="w-full h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? 'animate-[timerShake_0.2s_infinite]' : ''}`}
                  style={{ 
                    width: `${(timeLeft / timerMax) * 100}%`,
                    backgroundColor: timeLeft > (timerMax/2) ? '#7C3AED' : timeLeft > 3 ? '#EAB308' : '#EF4444'
                  }}
                ></div>
              </div>
              <div className={`absolute right-0 -top-6 text-sm font-black ${timeLeft <= 3 ? 'text-[#EF4444] animate-pulse' : 'text-[#94A3B8]'}`}>
                {timeLeft}s
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
