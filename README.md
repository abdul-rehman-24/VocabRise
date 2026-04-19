# 🚀 VocabRise

**VocabRise** is a premium, high-fidelity vocabulary learning platform designed to make mastering English competitive, engaging, and highly interactive. Built with modern web technologies and a gorgeous SaaS-inspired UI, it transforms standard vocabulary learning into a rich, gamified experience.

![VocabRise Dashboard / Word Battle Showcase](https://via.placeholder.com/1200x600.png?text=VocabRise+Premium+Experience)

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS Animations (Glassmorphism & Gradients)
- **Icons:** Lucide React
- **Authentication:** NextAuth.js (Email + Google OAuth)
- **Database:** PostgreSQL + Prisma ORM
- **Media & Audio:** Web Audio API (Game Sounds) + Cloudinary (Images)

---

## ✨ Key Features & Capabilities

### ⚔️ Competitive Word Battles
A real-time 1v1 competitive arena to test your vocabulary against a bot or other players.
- **Dynamic Challenges:** Fill-in-the-blank, Antonym Attack, Odd One Out, Spell Duel, and Bluff Master.
- **Cinematic Experience:** Lightning-flashing arena background, multi-color depletion timers, and custom CSS animations (correct answer bounces, wrong answer shaking).
- **Audio Feedback:** Custom-generated Web Audio API sound effects (ticks, correct chimes, defeat tones, victory fanfares).
- **Rewards System:** Bouncing XP rewards and distinct victory/defeat screens with full stat breakdowns.

### 🏆 Global Leaderboard & Stats
See where you stand among learners worldwide.
- **Podium Showcase:** A cinematic Top 3 podium with glowing accents, floating animations, and custom 3D physical steps.
- **Rank Tracking:** Animated rank changes, row-specific highlighting, and a dynamic "Global Standing" summary panel mapping exactly how much XP is needed to beat the person above you.
- **Animated Counters:** All numbers (XP, Words Learned) roll-up on load for a premium feel.

### 🛂 Vocabulary Passport
A visual, collectible representation of your learning journey.
- **Digital Passport:** Complete with a realistic, embossed navy cover, custom golden seals, and dynamic page turning.
- **Visa Stamps:** Collect beautiful, customized stamps for distinct achievements (e.g., "The Orator", "The Grammarian", "Streak Master").
- **Shareability:** Integrated modal design allowing users to proudly share their achievements.

### 🎙️ AI-Powered Audio Lab
Perfect your pronunciation with real-time feedback.
- **Visual Soundwaves:** Animated SVG sine waves responding to audio input.
- **Practice Modes:** Cycle through vocabulary words, listen to native pronunciation, and record your voice to receive instant accuracy ratings.
- **Completion Screens:** Fun, confetti-burst success screens when completing daily audio sessions.

### 🌍 Community Feed & Voting
Engage with the VocabRise community in real-time.
- **Word Feed:** See what words others are learning, complete with like buttons and live active user indicators.
- **Word of the Week:** A dedicated voting page where the community decides the defining word of the week. Features custom candidate cards, elegant checkbox interactions, and live countdown timers.

### 👤 Premium Profiles
A central hub for your identity and progress.
- **Hero Banners:** Animated aurora gradient backgrounds and custom avatar rings.
- **Stat Cards:** 3-column glassmorphism grid with specific colored accents (Total XP, Best Streak, Words Mastered, etc.).
- **Timeline:** A color-coded "Recent Activity" timeline showcasing recent milestones.
- **Edit Modal:** A robust profile editor featuring live username availability checks, avatar color selection, and seamless toast notifications.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.17 or later)
- PostgreSQL Database (Local or Hosted)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/vocabrise.git
   cd vocabrise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the necessary keys:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/vocabrise"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   CLOUDINARY_URL="your-cloudinary-url"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) to view the application.*

---

## 🎨 Design System
VocabRise strictly adheres to a premium dark-mode aesthetic designed to maximize user engagement:
- **Base Backgrounds:** Deep Navy/Black (`#0D0B1A`, `#1A1A2E`)
- **Primary Accents:** Purple (`#7C3AED`, `#A855F7`), Pink (`#EC4899`)
- **Success/Warning/Danger:** Green (`#22C55E`), Gold (`#EAB308`), Red (`#EF4444`)
- **Typography:** `Plus Jakarta Sans` for bold, impactful headings; `Inter` for clean, readable body text.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#) if you want to contribute.

## 📄 License
This project is licensed under the MIT License.
