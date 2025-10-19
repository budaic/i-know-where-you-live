# Complete Setup Guide

This guide will walk you through setting up the OSINT Profiler from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm installed
- **Git** installed
- **Accounts and API keys** for:
  - [OpenAI](https://platform.openai.com/) - For AI-powered query generation and summarization
  - [Supabase](https://supabase.com/) - For database storage
  - [Exa.ai](https://exa.ai/) - For web search

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd i-know-where-you-live
```

## Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

## Step 3: Get API Keys

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new secret key
4. Copy the key (starts with `sk-`)

### Exa API Key
1. Go to [exa.ai](https://exa.ai/) and sign up/log in
2. Navigate to your dashboard at [dashboard.exa.ai](https://dashboard.exa.ai/)
3. Generate an API key
4. Copy the key


### Supabase Credentials
1. Go to [supabase.com](https://supabase.com/)
2. Create a new project
3. Wait for the project to finish setting up (2-3 minutes)
4. Go to Settings → API
5. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ`)

## Step 4: Set Up Supabase Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase-setup.sql` from this project
4. Paste into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"
7. Go to **Table Editor** to verify:
   - ✅ `profiles` table exists
   - ✅ `sources` table exists

## Step 5: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` and add your API keys:

```env
# OpenAI (required)
OPENAI_API_KEY=sk-...

# Exa Search (required)
EXASEARCH_API_KEY=your_exa_api_key

# Supabase (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Optional
PORT=3001
```


## Step 6: Start the Application

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

## Step 7: Verify Setup

### Check Backend Health
```bash
curl http://localhost:3001/health
```
Should return: `{"status":"ok"}`

### Test the Application
1. In the browser, enter:
   - **Name:** Your own name (start with yourself!)
   - **Context:** Where you work or study
2. Click "Create Profile"
3. Wait 2-5 minutes for processing
4. Review the results!

## Troubleshooting

### "Missing environment variables" warning
- Ensure all required API keys are in `.env` file
- Check that `.env` is in the root directory
- Restart the backend server after updating `.env`

### "ECONNREFUSED" or network errors
- Make sure backend is running on port 3001
- Check `http://localhost:3001/health` returns `{"status":"ok"}`

### Database errors
- Verify Supabase credentials are correct
- Ensure the SQL schema has been run in Supabase SQL Editor
- Check that Row Level Security policies are properly set

### Exa search errors
- Verify your Exa API key is correct and has credits
- Check your Exa account usage limits
- Test Exa API directly if needed

### Rate limiting
- The application includes built-in delays to avoid rate limits
- If you hit rate limits, wait a few minutes and try again
- Consider reducing `maxDepth` to generate fewer queries

## Next Steps

Once it's working:
- Try different subjects with varying context
- Experiment with different max_depth values
- Review the code to understand the architecture
- Read the development guide for contributing

## Getting Help

1. Check the [troubleshooting guide](docs/troubleshooting.md)
2. Verify all API keys are active and have credits/quota
3. Check browser console and terminal for error messages
4. Review the logs for specific error details

Happy profiling! Remember to use responsibly and ethically.
