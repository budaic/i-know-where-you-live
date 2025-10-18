# OSINT Profiler Backend

Express + TypeScript backend for the OSINT Profiler application.

## Architecture

### Services

- **queryGenerator.ts** - Generates search queries using OpenAI
- **searchService.ts** - Executes searches via Exa.ai
- **contentExtractor.ts** - Extracts content using Browserbase
- **summarizer.ts** - Summarizes sources using OpenAI
- **profileGenerator.ts** - Creates and verifies profiles
- **database.ts** - Supabase database operations

### Flow

1. Receive subject information via API
2. Generate multi-depth search queries
3. Execute searches and filter results
4. Extract content from viable sources
5. Summarize each source
6. Verify sources match same person
7. Generate comprehensive profile
8. Store in database

## Environment Variables

Create a `.env` file in the root directory (not in backend/):

```env
OPENAI_API_KEY=sk-...
BROWSERBASE_API_KEY=bb-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
PORT=3001
```

## API Endpoints

### POST /api/profiles/create

Create new profile(s).

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
  "profiles": [
    {
      "id": "uuid",
      "name": "John Smith",
      "aliases": ["jsmith", "john_s"],
      "profileSummary": "...",
      "sources": [...]
    }
  ],
  "errors": []
}
```

### GET /api/profiles

Get all profiles.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Smith",
    ...
  }
]
```

### GET /api/profiles/:id

Get specific profile by ID.

### DELETE /api/profiles/:id

Delete profile by ID.

### GET /health

Health check endpoint.

## Development

```bash
npm run dev
```

The server will auto-reload on file changes.

## Building

```bash
npm run build
npm start
```

## Configuration

Edit `src/config.ts` to change:
- Default max depth
- API timeouts
- Rate limiting parameters

## Error Handling

All services include try-catch blocks with fallbacks:
- Query generation falls back to template-based queries
- Content extraction falls back to search snippets
- Profile generation works with minimal data

## Performance

- Batch processing for multiple queries
- Delays between API calls to avoid rate limits
- Concurrent requests with Promise.all where appropriate
- Content length limits to reduce processing time

## Debugging

Enable verbose logging:
```typescript
console.log('Debug info:', data);
```

Check specific service:
```bash
cd backend
node -e "require('./dist/services/queryGenerator').generateSearchQueries({name: 'Test', context: 'test'})"
```

## Dependencies

- **express** - Web framework
- **@supabase/supabase-js** - Database client
- **openai** - OpenAI API client
- **exa-js** - Exa search client
- **playwright** - Browser automation
- **cors** - CORS middleware
- **dotenv** - Environment variables

## Learn More

- [Express.js Guide](https://expressjs.com/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Exa API Docs](https://docs.exa.ai/)
- [Playwright Docs](https://playwright.dev/)

