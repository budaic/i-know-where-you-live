# OSINT Profiler

A comprehensive OSINT (Open Source Intelligence) profiling application for educational purposes, demonstrating how easily personal information can be gathered from public online sources.

**⚠️ WARNING: This tool is for educational purposes only. Always respect privacy and obtain consent before researching individuals.**

## Overview

The OSINT Profiler automates the process of gathering publicly available information about individuals from the internet. It demonstrates how much personal information is exposed online and highlights the importance of digital privacy.

### How It Works

1. **Query Generation**: Uses OpenAI to generate multiple search queries with varying specificity levels (depths 0-6)
2. **Web Search**: Executes searches using Exa.ai to find relevant sources
3. **Content Extraction**: Uses Browserbase to extract content from discovered pages
4. **Summarization**: Creates concise summaries of each source using OpenAI
5. **Profile Generation**: Verifies and combines sources to create a comprehensive profile
6. **Storage**: Saves profiles and sources in Supabase database

## Features

- 🔍 Automated multi-depth search query generation
- 🌐 Web scraping with Exa.ai and Browserbase
- 🤖 AI-powered content summarization and verification
- 📊 Source reliability scoring based on depth
- 💾 Persistent storage with Supabase
- 🎨 Modern, responsive React frontend
- ⚡ Real-time progress updates

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Search**: Exa.ai (via Smithery MCP)
- **Browser Automation**: Browserbase (via Smithery MCP)
- **MCP**: Smithery for MCP server management

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm installed
- **Accounts and API keys** for:
  - [OpenAI](https://platform.openai.com/) - For AI-powered query generation and summarization
  - [Supabase](https://supabase.com/) - For database storage
  - [Browserbase](https://browserbase.com/) - For web content extraction
  - [Exa.ai](https://exa.ai/) - For web search (accessible via Smithery)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd i-know-where-you-live
```

### 2. Install Dependencies

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

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `supabase-setup.sql`:

```sql
-- Copy and paste the contents of supabase-setup.sql
```

4. Get your Supabase credentials:
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon/public` key

### 4. Set Up MCP Servers (Smithery)

The application uses Smithery to manage MCP servers for Exa and Browserbase.

#### Install Smithery CLI

```bash
npm install -g @smithery/cli
```

#### Authenticate with Smithery

```bash
smithery login
```

#### Configure MCP Servers

Exa and Browserbase MCP servers should already be installed in your Cursor environment. If not:

1. **Exa MCP**: Already accessible through Smithery without additional API keys
2. **Browserbase MCP**: Requires API key from [browserbase.com](https://browserbase.com/)

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=sk-...
EXA_API_KEY=your_exa_api_key
BROWSERBASE_API_KEY=bb_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
PORT=3001
```

### 6. API Key Setup Guide

#### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new secret key
4. Copy and paste into `.env`

#### Exa API Key
1. Go to [exa.ai](https://exa.ai/) and sign up/log in
2. Navigate to your dashboard at [dashboard.exa.ai](https://dashboard.exa.ai/)
3. Generate an API key
4. Copy and paste into `.env`
**Note**: Even when using Exa through Smithery MCP, a direct API key is required.

#### Browserbase API Key
1. Sign up at [browserbase.com](https://browserbase.com/)
2. Go to Settings → API Keys
3. Create a new API key
4. Copy and paste into `.env`

#### Supabase Credentials
1. In your Supabase project, go to Settings → API
2. Copy the `Project URL` and `anon public` key
3. Paste into `.env`

## Running the Application

### Development Mode

Start both backend and frontend servers:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Usage Guide

### Creating a Profile

1. Enter the **Subject Name** (e.g., "John Smith")
2. Provide **Context** to narrow the search (e.g., "engineering student at SUTD")
3. Adjust **Max Depth** (2-10):
   - Lower depth = more specific queries, more reliable results
   - Higher depth = broader queries, more results but potentially less relevant
4. Click **Create Profile**

### Understanding Results

**Depth Levels:**
- **Depth 0-2** (Green): Most specific queries, highest reliability
- **Depth 3-4** (Yellow): Moderate specificity, medium reliability  
- **Depth 5-6** (Orange): Broad queries, lower reliability

**Profile Components:**
- **Name**: Subject's primary name
- **Aliases**: Discovered usernames and alternative names
- **Profile Summary**: AI-generated comprehensive summary
- **Sources**: All discovered sources grouped by depth with individual summaries

## Project Structure

```
/
├── backend/                 # TypeScript backend
│   ├── src/
│   │   ├── services/       # Core business logic
│   │   │   ├── queryGenerator.ts
│   │   │   ├── searchService.ts
│   │   │   ├── contentExtractor.ts
│   │   │   ├── summarizer.ts
│   │   │   ├── profileGenerator.ts
│   │   │   └── database.ts
│   │   ├── routes/         # API routes
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── config.ts       # Configuration
│   │   └── index.ts        # Server entry point
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── SubjectForm.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── SourcesList.tsx
│   │   │   └── ProfileList.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── App.tsx        # Main component
│   └── package.json
│
├── supabase-setup.sql     # Database schema
├── env.example            # Environment template
├── package.json           # Root package.json
└── README.md              # This file
```

## Architecture Flow

```
User Input → Query Generation (OpenAI)
    ↓
Search Execution (Exa.ai via MCP)
    ↓
Content Extraction (Browserbase via MCP)
    ↓
Summarization (OpenAI)
    ↓
Profile Verification & Generation (OpenAI)
    ↓
Database Storage (Supabase)
    ↓
Display Results (React Frontend)
```

## API Endpoints

### `POST /api/profiles/create`
Create new profile(s) from subjects

**Request:**
```json
{
  "subjects": [
    {
      "name": "John Smith",
      "context": "engineering student at SUTD",
      "maxDepth": 6
    }
  ]
}
```

**Response:**
```json
{
  "profiles": [...],
  "errors": [...]
}
```

### `GET /api/profiles`
Get all profiles

### `GET /api/profiles/:id`
Get profile by ID

### `DELETE /api/profiles/:id`
Delete profile

## Troubleshooting

### "Missing environment variables" warning
- Ensure all required API keys are in `.env` file
- Check that `.env` is in the root directory
- Restart the backend server after updating `.env`

### Browserbase connection errors
- Verify your Browserbase API key is correct
- Check your Browserbase account has active credits
- Ensure the Browserbase MCP server is properly configured in Smithery

### Exa search errors
- Exa should work through Smithery without additional setup
- If issues persist, check Smithery MCP server status

### Database errors
- Verify Supabase credentials are correct
- Ensure the SQL schema has been run in Supabase SQL Editor
- Check that Row Level Security policies are properly set

### Rate limiting
- The application includes built-in delays to avoid rate limits
- If you hit rate limits, wait a few minutes and try again
- Consider reducing `maxDepth` to generate fewer queries

## Best Practices

1. **Start with specific context** - Better context leads to more reliable results
2. **Use lower maxDepth values** - Fewer, more specific queries often work better
3. **Respect rate limits** - Don't run too many profiles simultaneously
4. **Review sources** - Always verify information from multiple sources
5. **Privacy first** - Only research individuals with proper authorization

## Ethical Considerations

This tool demonstrates the ease with which personal information can be gathered from public sources. It's crucial to:

- **Obtain consent** before profiling individuals
- **Respect privacy** and legal boundaries
- **Use responsibly** for educational or authorized purposes only
- **Understand implications** of OSINT capabilities
- **Protect data** - Securely handle any collected information

## Contributing

This is an educational project. Contributions that improve privacy protection, accuracy, or educational value are welcome.

## License

This project is for educational purposes only. Use responsibly and ethically.

## Support

For issues or questions:
1. Check this README thoroughly
2. Review error messages and troubleshooting section
3. Verify all API keys and configurations
4. Check Supabase and MCP server status

---

**Remember: With great power comes great responsibility. Use this tool ethically and legally.**
