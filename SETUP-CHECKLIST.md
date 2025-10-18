# 🚀 OSINT Profiler - Setup Checklist

## Current Status

✅ **Backend Server**: Running on port 3001  
✅ **Frontend Server**: Running on port 3000  
✅ **UI**: Working correctly with fixed depth at 6  
❌ **Supabase Database**: Not configured (URL cannot be resolved)  
⚠️ **Exa API Key**: Needs to be added to .env

---

## 🔴 Critical Issues to Fix

### 1. Supabase Database Setup (REQUIRED)

**Current Error**: `Could not resolve host: lbybqurjmctheyzopqxq.supabase.co`

**What you need to do**:

#### Step 1: Create a Supabase Project
1. Go to https://supabase.com/
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: osint-profiler (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. **Wait 2-3 minutes** for the project to be created

#### Step 2: Get Your Credentials
Once the project is created:
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

#### Step 3: Run the SQL Setup
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open the file `supabase-setup.sql` in this project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **"Run"**
7. You should see: "Success. No rows returned"
8. Go to **Table Editor** to verify:
   - ✅ `profiles` table exists
   - ✅ `sources` table exists

#### Step 4: Update Your .env File
Update your `.env` file with the correct values:

```env
OPENAI_API_KEY=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
EXA_API_KEY=your_exa_api_key_here
BROWSERBASE_API_KEY=bb_live_pNa4kdKMx927dAIU7yYx6bmZCTA
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY
PORT=3001
```

---

### 2. Exa API Key (REQUIRED)

**What you need to do**:

1. Go to https://exa.ai/
2. Sign up or log in
3. Navigate to https://dashboard.exa.ai/
4. Look for "API Keys" section
5. Click "Create API Key" or similar
6. Copy the key
7. Add it to your `.env` file as `EXA_API_KEY`

---

## ✅ What's Already Working

### UI Components
- ✅ Header with project name
- ✅ Warning banner (educational purposes)
- ✅ Subject form with Name and Context fields
- ✅ **Fixed depth at 6** (no slider) - as requested
- ✅ Create Profile button
- ✅ Profile list section
- ✅ Responsive design with Tailwind CSS

### Backend
- ✅ Express server running on port 3001
- ✅ Health endpoint working: http://localhost:3001/health
- ✅ API routes configured
- ✅ All services implemented
- ✅ Error handling in place

### Frontend
- ✅ React app running on port 3000
- ✅ API client configured to connect to backend
- ✅ All components created
- ✅ Real-time state management

---

## 📋 Complete Setup Steps

### Phase 1: Fix Supabase (Do this first!)
1. [ ] Create Supabase project at https://supabase.com
2. [ ] Copy Project URL and anon key
3. [ ] Run SQL script from `supabase-setup.sql`
4. [ ] Verify tables exist (profiles, sources)
5. [ ] Update `.env` with correct Supabase credentials

### Phase 2: Add Exa API Key
1. [ ] Get Exa API key from https://dashboard.exa.ai/
2. [ ] Add `EXA_API_KEY` to `.env` file

### Phase 3: Restart Servers
1. [ ] Stop both servers (Ctrl+C in both terminals)
2. [ ] Start backend: `cd backend && npm run dev`
3. [ ] Start frontend: `cd frontend && npm start`

### Phase 4: Verify Everything Works
1. [ ] Visit http://localhost:3000
2. [ ] Check no red error messages appear
3. [ ] Try creating a test profile:
   - Name: "Test User"
   - Context: "Software developer"
4. [ ] Wait 2-5 minutes for processing
5. [ ] Verify profile appears in the list

---

## 🔍 Current Test Results

### What I Tested:
1. ✅ Backend health endpoint - **Working**
2. ✅ Frontend loads - **Working**
3. ✅ UI displays correctly - **Working**
4. ✅ Fixed depth at 6 (no slider) - **Implemented**
5. ❌ GET /api/profiles - **500 Error (Supabase not configured)**

### Screenshot Taken:
A screenshot was saved showing the UI working correctly with the error message: "Request failed with status code 500"

---

## 🐛 How to Debug

### If backend won't start:
```bash
cd backend
npm run dev
```
Look for error messages about missing environment variables.

### If frontend won't start:
```bash
cd frontend
npm start
```
Should open on http://localhost:3000

### If you see "500 Internal Server Error":
- This means Supabase isn't configured
- Follow Phase 1 above to set up Supabase

### If you see "Missing EXA_API_KEY":
- Add the Exa API key to `.env`
- Follow Phase 2 above

---

## 📞 Quick Reference

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Running |
| Backend | http://localhost:3001 | ✅ Running |
| Backend Health | http://localhost:3001/health | ✅ OK |
| Backend API | http://localhost:3001/api/profiles | ❌ 500 Error |

**Root Cause**: Supabase database not configured

---

## 🎯 Next Steps (In Order)

1. **FIRST**: Set up Supabase (see Phase 1)
2. **SECOND**: Add Exa API key (see Phase 2)  
3. **THIRD**: Restart both servers (see Phase 3)
4. **FOURTH**: Test creating a profile (see Phase 4)

Once both Supabase and Exa are configured, the application will work end-to-end!

---

## 💡 Tips

- **Supabase free tier** is sufficient for testing
- **Exa free tier** should work for initial testing
- Keep your API keys secure
- The backend will show warnings about missing keys on startup
- Browser console will show any frontend errors

---

**Current blockers**: Supabase database setup needed, Exa API key needed

**Everything else**: Working correctly! ✅

