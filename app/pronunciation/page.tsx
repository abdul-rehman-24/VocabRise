import Navbar from '@/app/components/shared/Navbar';
import PronunciationFeature from '@/app/components/PronunciationFeature';

export default function PronunciationPage() {
  return (
    <div className="min-h-screen bg-[#0D0B1A] relative overflow-hidden font-body text-white">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        :root {
          --font-heading: 'Plus Jakarta Sans', sans-serif;
          --font-body: 'Inter', sans-serif;
        }
        .font-heading { font-family: var(--font-heading); }
        .font-body { font-family: var(--font-body); }

        .bg-dot-grid {
          background-image: radial-gradient(rgba(124, 58, 237, 0.2) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.04;
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
        }

        .soundwave-bg {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }
        .soundwave-path {
          fill: none;
          stroke: #A855F7;
          stroke-width: 2;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: waveDraw 10s linear infinite;
        }
        @keyframes waveDraw {
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes radialPulse {
          0% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
          70% { box-shadow: 0 0 0 40px rgba(124,58,237,0); }
          100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
        }

        .hero-icon-glow {
          animation: radialPulse 2s infinite;
        }

        .slide-up-delay {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUpFade 0.8s ease forwards;
          animation-delay: 0.5s;
        }
        @keyframes slideUpFade {
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      <div className="bg-dot-grid"></div>
      
      {/* Animated Soundwave Background SVG */}
      <svg className="soundwave-bg" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path className="soundwave-path" d="M0,160 C320,300,420,0,720,160 C1020,320,1120,20,1440,160" />
        <path className="soundwave-path" d="M0,200 C250,50,550,250,720,160 C890,70,1190,270,1440,120" style={{ animationDirection: 'reverse', animationDuration: '15s', opacity: 0.5 }} />
      </svg>

      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
        <div className="mb-12 text-center flex flex-col items-center">
          
          <div className="w-16 h-16 bg-[#7C3AED] rounded-full flex items-center justify-center mb-6 hero-icon-glow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </div>

          <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(124,58,237,0.3)] backdrop-blur-md rounded-full px-5 py-2 text-sm font-semibold text-[#A855F7] mb-6 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
            🎙️ AI-Powered Pronunciation Lab
          </div>

          <h1 className="font-bold font-heading mb-4 overflow-visible" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
            <span className="block text-white">Perfect Your</span>
            <span className="block" style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Pronunciation
            </span>
          </h1>
          <p className="text-[#94A3B8] font-body text-lg max-w-2xl mx-auto mt-4 slide-up-delay">
            Listen to native speakers, master syllable stresses, and practice your speaking skills with our interactive pronunciation lab.
          </p>
        </div>

        <PronunciationFeature />
      </main>
    </div>
  );
}
