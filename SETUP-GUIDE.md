# Quick Setup Guide

This is a step-by-step guide to get the OSINT Profiler running quickly.

## Step 1: Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed

## Step 2: Get API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### Supabase
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Go to Settings → API
4. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` `public` key (long string starting with `eyJ`)

### Browserbase
1. Go to https://www.browserbase.com/
2. Sign up / Log in
3. Go to Settings → API Keys
4. Create new key (starts with `bb_`)

## Step 3: Install and Configure

```bash
# 1. Clone and navigate
git clone <repo-url>
cd i-know-where-you-live

# 2. Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Create environment file
cp env.example .env

# 4. Edit .env with your API keys
nano .env  # or use your favorite editor
```

## Step 4: Set Up Database

1. Open your Supabase project: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Click "New Query"
3. Copy-paste the entire contents of `supabase-setup.sql`
4. Click "Run"
5. Verify tables created: Go to Table Editor, you should see `profiles` and `sources`

## Step 5: Verify MCP Setup

The Exa and Browserbase MCP servers should already be configured in your Cursor environment. To verify:

```bash
# Install Smithery CLI if not already installed
npm install -g @smithery/cli

# Login to Smithery
smithery login
```

## Step 6: Run the Application

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see: `Server running on port 3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Browser should open to: `http://localhost:3000`

## Step 7: Test It Out

1. In the browser, enter:
   - **Name:** Your own name (start with yourself!)
   - **Context:** Where you work or study
   - **Max Depth:** 4 (for testing)

2. Click "Create Profile"

3. Wait 2-5 minutes for processing

4. Review the results!

## Common Issues

### "Missing environment variables"
- Check that `.env` exists in the root directory
- Verify all 5 variables are filled in
- Restart the backend server

### "ECONNREFUSED" or network errors
- Make sure backend is running on port 3001
- Check `http://localhost:3001/health` returns `{"status":"ok"}`

### Database errors
- Verify you ran `supabase-setup.sql` in Supabase
- Check your SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify RLS policies are enabled in Supabase

### Browserbase errors
- Confirm your Browserbase API key is valid
- Check you have credits in your Browserbase account
- Try the simple fallback by temporarily commenting out Browserbase calls

## Next Steps

Once it's working:
- Try different subjects with varying context
- Experiment with different max_depth values
- Review the code to understand the architecture
- Read the full README.md for detailed documentation

## Getting Help

1. Check the Troubleshooting section in README.md
2. Verify all API keys are active and have credits/quota
3. Check browser console and terminal for error messages
4. Review the logs for specific error details

Happy profiling! Remember to use responsibly and ethically.

