# OSINT Profiler Intelligence Tool

A powerful open-source intelligence system that profiles individuals using multiple data sources including LinkedIn, GitHub, and personal websites.

## Features

- **Terminal Interface**: Command-line style interface with full command history
- **Dual Input Methods**: Terminal commands or traditional form interface
- **Real-time Progress**: Live progress tracking during profile generation
- **Multiple Data Sources**: LinkedIn, GitHub, personal websites, and general web search
- **Intelligence Files**: Organized profile storage with expandable views
- **Session Recovery**: Automatic recovery of interrupted searches

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL or Supabase account
- Exa API key (for web search)

### 1. Clone and Install

```bash
git clone <repository-url>
cd i-know-where-you-live
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

#### Option A: Supabase (Recommended)
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema: `supabase-setup-v2.sql`
3. Get your database URL from Supabase dashboard

#### Option B: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `osint_profiler`
3. Run the SQL schema: `supabase-setup-v2.sql`

### 3. Environment Setup

Copy `env.example` to `.env` and fill in your credentials:

```bash
cp env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL=your_postgres_url_here

# Exa API (for web search)
EXA_API_KEY=your_exa_api_key_here

# Optional: Custom API URL
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Get Exa API Key

1. Sign up at [exa.ai](https://exa.ai)
2. Create an API key in your dashboard
3. Add it to your `.env` file

### 5. Start the Application

```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm start
```

Visit `http://localhost:3000` to use the application.

## Usage

### Terminal Commands

- `profile_target --name="John Smith" --hard-context="Software engineer at Google" --soft-context="Interested in AI"`
- `search` - Show traditional input form
- `cd /files` - Navigate to intelligence files
- `clear` - Clear terminal output
- `--help` - Show all available commands

### Traditional Form

Type `search` in the terminal to access the form interface with:
- Name field
- Hard context (required)
- Soft context (optional)

## Project Structure

```
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   └── utils/    # Helper functions
├── frontend/         # React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   └── services/   # API client
├── supabase-setup-v2.sql # Database schema
└── env.example      # Environment template
```

## API Endpoints

- `POST /api/profiles/create` - Create new profile
- `GET /api/profiles` - List all profiles
- `DELETE /api/profiles/:id` - Delete profile
- `GET /api/profiles/create/stream/:sessionId` - SSE for progress updates

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check database permissions

2. **Exa API Errors**
   - Verify your `EXA_API_KEY` is valid
   - Check API rate limits
   - Ensure API key has proper permissions

3. **Frontend Not Loading**
   - Check if backend is running on port 3001
   - Verify `REACT_APP_API_URL` in environment
   - Check browser console for errors

### Development

```bash
# Backend development
cd backend
npm run dev

# Frontend development
cd frontend
npm start

# Build for production
cd frontend
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Note

This tool is for educational and authorized research purposes only. Always ensure you have proper authorization before profiling individuals and comply with all applicable laws and regulations.