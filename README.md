# OSINT Profiler

A comprehensive OSINT (Open Source Intelligence) profiling application for educational purposes, demonstrating how easily personal information can be gathered from public online sources.

**⚠️ WARNING: This tool is for educational purposes only. Always respect privacy and obtain consent before researching individuals.**

## What It Does

The OSINT Profiler automates the process of gathering publicly available information about individuals from the internet. It demonstrates how much personal information is exposed online and highlights the importance of digital privacy.

### How It Works

1. **Query Generation**: Uses OpenAI to generate multiple search queries with varying specificity levels
2. **Web Search**: Executes searches using Exa.ai to find relevant sources
3. **Content Extraction**: Extracts content from discovered pages
4. **Summarization**: Creates concise summaries of each source using OpenAI
5. **Profile Generation**: Verifies and combines sources to create a comprehensive profile
6. **Storage**: Saves profiles and sources in Supabase database

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- API keys for OpenAI, Exa.ai, and Supabase

### 1. Clone and Install
```bash
git clone <repository-url>
cd i-know-where-you-live
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your API keys
```

### 3. Set Up Database
1. Create a Supabase project at [supabase.com](https://supabase.com/)
2. Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor
3. Add your Supabase credentials to `.env`

### 4. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit http://localhost:3000 to use the application.

## Usage

1. Enter a **Subject Name** (e.g., "John Smith")
2. Provide **Context** to narrow the search (e.g., "engineering student at SUTD")
3. Click **Create Profile**
4. Wait 2-5 minutes for processing
5. Review the generated profile with sources and summaries

## Features

- 🔍 Automated multi-depth search query generation
- 🌐 Web scraping with Exa.ai
- 🤖 AI-powered content summarization and verification
- 📊 Source reliability scoring
- 💾 Persistent storage with Supabase
- 🎨 Modern, responsive React frontend
- ⚡ Real-time progress updates

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Search**: Exa.ai
- **Browser Automation**: Browserbase

## Documentation

For detailed information, see:

- **[SETUP.md](SETUP.md)** - Complete setup guide
- **[docs/development.md](docs/development.md)** - Development workflow
- **[docs/architecture.md](docs/architecture.md)** - Technical architecture
- **[docs/api-reference.md](docs/api-reference.md)** - API documentation
- **[docs/troubleshooting.md](docs/troubleshooting.md)** - Common issues
- **[docs/changelog.md](docs/changelog.md)** - Version history
- **[backend/README.md](backend/README.md)** - Backend-specific details
- **[frontend/README.md](frontend/README.md)** - Frontend-specific details

## Ethical Considerations

This tool demonstrates the ease with which personal information can be gathered from public sources. It's crucial to:

- **Obtain consent** before profiling individuals
- **Respect privacy** and legal boundaries
- **Use responsibly** for educational or authorized purposes only
- **Understand implications** of OSINT capabilities
- **Protect data** - Securely handle any collected information

## License

This project is for educational purposes only. Use responsibly and ethically.

---

**Remember: With great power comes great responsibility. Use this tool ethically and legally.**