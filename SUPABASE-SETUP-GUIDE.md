# Supabase Setup Guide (Updated 2025)

## Getting Your Supabase Credentials

Supabase has updated their authentication. Here's how to get your credentials:

### Step 1: Create/Access Your Project

1. Go to https://supabase.com/
2. Sign in or create an account
3. Click "New Project" or select an existing project
4. Wait for the project to finish setting up (2-3 minutes)

### Step 2: Find Your Credentials

In your Supabase dashboard:

1. Click on your project
2. Go to **Settings** (gear icon in the left sidebar)
3. Click **API** in the settings menu

You'll find:

#### Project URL
- Look for "Project URL" or "API URL"
- Format: `https://YOUR-PROJECT-ID.supabase.co`
- Example: `https://lbybqurjmctheyzopqxq.supabase.co`

#### API Keys
You'll see two keys:

1. **anon/public key** (safe to use in browsers)
   - Labeled as "anon" or "public"
   - Starts with `eyJ...`
   - Use this in your `.env` as `SUPABASE_ANON_KEY`

2. **service_role key** (secret, server-only)
   - Labeled as "service_role"
   - Also starts with `eyJ...`
   - Bypasses Row Level Security
   - Use this if you want (optional) as `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Update Your .env File

Option A: Using anon key (recommended for testing):
```env
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your_anon_key_here
```

Option B: Using service role key (more permissive):
```env
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key_here
```

Option C: Using both (most flexible):
```env
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key_here
```

The code will automatically use service_role if available, otherwise anon key.

### Step 4: Run the SQL Setup

1. In your Supabase dashboard, click **SQL Editor** (in left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-setup.sql` from this project
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
6. You should see "Success. No rows returned"

### Step 5: Verify Tables Were Created

1. Click **Table Editor** (in left sidebar)
2. You should see two tables:
   - `profiles`
   - `sources`
3. Click on each to verify the columns exist

### Troubleshooting

#### Can't find Project URL
- Look under Settings → API
- It's usually shown at the top: "Project URL" or "API URL"
- Format is always: `https://[project-ref].supabase.co`

#### "fetch failed" or connection errors
- Verify the URL is correct (no typos)
- Make sure the project is fully initialized (not still setting up)
- Check your internet connection
- Try accessing the URL in your browser (should show a JSON response)

#### Row Level Security (RLS) Blocking Requests
If using the anon key and getting permission errors:
- Either use the service_role key instead (bypasses RLS)
- Or the SQL script already sets up permissive policies

#### Alternative: If you can't find the URL
If Supabase changed their UI and you can't find the URL, you can construct it:

1. Look for your "Project Reference" or "Project ID" 
2. It's usually visible in the URL when you're in your project
3. Format: `https://YOUR-PROJECT-ID.supabase.co`

### What Changed in 2025?

- Supabase still uses Project URL + API keys
- They now emphasize API keys more prominently
- Service role key can be used server-side for full access
- anon key is still available for client-side access with RLS

### Full .env Example

```env
# Required
OPENAI_API_KEY=sk-proj-...
BROWSERBASE_API_KEY=bb_live_...
EXASEARCH_API_KEY=your_exa_key_here

# Supabase (choose one of the key options)
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...     # Option 1: anon key
# OR
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Option 2: service role key
# OR both (code will prefer service_role)

PORT=3001
```

---

Once you've added these to your `.env` file, restart the backend server and it should connect successfully!

