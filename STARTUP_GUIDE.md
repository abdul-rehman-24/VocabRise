# VocabRise - Quick Start Guide

## 🚀 Quick Start (Recommended)

### **Windows - Using Batch Files (Easiest)**

#### Option 1: Run Everything at Once
Double-click this file to set up database AND start the server:
- **`start-project.bat`** ← Start here! ⭐

#### Option 2: Run Separately
1. First, set up backend:
   ```
   Double-click: start-backend.bat
   ```
2. Then, start frontend (in a new window):
   ```
   Double-click: start-frontend.bat
   ```

---

### **Windows - Using PowerShell**

#### Option 1: Run Everything at Once
```powershel
```

#### Option 2: Run Separately
```powershell
# Setup backend
.\start-backend.ps1

# In another terminal, start frontend
.\start-frontend.ps1
```

**Note:** If you see an error about execution policy, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### **Mac / Linux - Using Terminal**

```bash
# Option 1: Run everything
npm run dev

# Option 2: Manual setup then run
npx prisma db push
npx prisma db seed
npm run dev
```

---

## 📋 What Each Script Does

| Script | Purpose |
|--------|---------|
| **start-project.bat** | ⭐ **RECOMMENDED** - Sets up database + starts dev server (all-in-one) |
| **start-project.ps1** | PowerShell version of above |
| **start-backend.bat** | Sets up database & Prisma (backend only) |
| **start-backend.ps1** | PowerShell version of backend setup |
| **start-frontend.bat** | Starts Next.js dev server (frontend only) |
| **start-frontend.ps1** | PowerShell version of frontend server |

---

## ✅ What Happens When You Run the Scripts

1. ✅ Checks if Node.js is installed
2. ✅ Installs npm dependencies (if needed)
3. ✅ Connects to local PostgreSQL database
4. ✅ Syncs Prisma schema with database
5. ✅ Seeds test data (5 test users, 10 vocabulary words)
6. ✅ Starts Next.js dev server on `http://localhost:3000`

---

## 🌐 Access Your App

After running the scripts, open these URLs:

| URL | Purpose |
|-----|---------|
| **http://localhost:3000** | VocabRise Web App ← Main app |
| **http://localhost:5555** | Prisma Studio (Database UI) |
| **http://localhost:3000/admin** | Admin Dashboard (if logged in as admin) |

---

## 👥 Test Accounts

5 test users are automatically created when you seed the database:

| Name | Email | XP | Level |
|------|-------|----|----|
| Ahmed Khan | ahmed@test.com | 320 | 4 |
| Sara Ali | sara@test.com | 280 | 3 |
| Usman Malik | usman@test.com | 210 | 3 |
| Fatima Sheikh | fatima@test.com | 150 | 2 |
| Ali Raza | ali@test.com | 90 | 1 |

You can also **login with your Google account** directly!

---

## 🔧 Manual Commands

If you prefer running commands manually in terminal:

```bash
# Install dependencies (one time)
npm install

# Setup database
npx prisma db push
npx prisma db seed

# Start dev server
npm run dev

# View database in UI
npx prisma studio

# Build for production
npm run build

# Start production server
npm run start
```

---

## 📚 Useful npm Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Check code style
npx prisma studio # Open database UI
npx prisma reset  # Reset entire database (⚠️ deletes all data)
```

---

## ❌ Troubleshooting

### **Port 3000 already in use**
```bash
# Kill process on port 3000 and restart
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### **PostgreSQL connection failed**
- Make sure PostgreSQL is running
- Check `.env` file has correct `DATABASE_URL`
- Default: `postgresql://postgres:rehmi131@localhost:5432/vocabrise`

### **Database tables not showing**
```bash
npx prisma db push --accept-data-loss
npx prisma generate
npx prisma db seed
```

### **Dependencies installation failed**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules
npm install
```

---

## 📝 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
DATABASE_URL="postgresql://postgres:rehmi131@localhost:5432/vocabrise"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-id"
GOOGLE_CLIENT_SECRET="your-secret"
```

---

## 🎯 Next Steps

1. **Run the project**: Double-click `start-project.bat` ⭐
2. **Open the app**: Visit http://localhost:3000
3. **Login**: Click "Sign In" → "Sign In with Google"
4. **Explore**: Check dashboard, word of the day, leaderboard, etc.
5. **Database**: Open http://localhost:5555 to view/edit data

---

## 📞 Help

If you encounter issues:
1. Check that PostgreSQL is running
2. Verify Node.js is installed: `node --version`
3. Try running: `npm run dev` in terminal for more error details
4. Check `.env.local` file has correct database credentials

Happy learning! 🚀
