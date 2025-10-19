# Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                      (React + TypeScript)                        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ SubjectForm  │  │ ProfileCard  │  │ ProfileList  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │              API Client (Axios)                   │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP REST API
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                              │
│                  (Express + TypeScript)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │         API Routes (profiles.ts)                  │           │
│  │  POST /create  │ GET /:id │ GET / │ DELETE /:id  │           │
│  └──────────────────────────────────────────────────┘           │
│                              │                                    │
│                              ↓                                    │
│  ┌───────────────────── SERVICES ────────────────────┐          │
│  │                                                     │          │
│  │  ┌─────────────────┐        ┌─────────────────┐  │          │
│  │  │ Query Generator │───────→│  Search Service │  │          │
│  │  │   (OpenAI)      │        │   (Exa.js)      │  │          │
│  │  └─────────────────┘        └─────────────────┘  │          │
│  │           │                           │            │          │
│  │           ↓                           ↓            │          │
│  │  ┌─────────────────┐        ┌─────────────────┐  │          │
│  │  │   Summarizer    │←───────│Content Extractor│  │          │
│  │  │   (OpenAI)      │        │   (Exa.js)      │  │          │
│  │  └─────────────────┘        └─────────────────┘  │          │
│  │           │                                        │          │
│  │           ↓                                        │          │
│  │  ┌─────────────────┐        ┌─────────────────┐  │          │
│  │  │Profile Generator│───────→│    Database     │  │          │
│  │  │   (OpenAI)      │        │   (Supabase)    │  │          │
│  │  └─────────────────┘        └─────────────────┘  │          │
│  │                                                     │          │
│  └─────────────────────────────────────────────────────         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ OpenAI   │  │ Exa.ai   │  │ Supabase │     │
│  │ GPT-4    │  │  Search  │  │ Database │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│       ↑              ↑              ↑             │
│       │              │              │             │
│    Direct         Direct         Direct           │
│     API            API            API             │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Profile Creation Flow

```
1. USER INPUT
   ↓
   Subject: { name: "John Smith", context: "engineer at XYZ" }
   
2. QUERY GENERATION
   ↓
   Queries: [
     { depth: 0, query: "John Smith engineer XYZ github" },
     { depth: 1, query: "John Smith engineer XYZ linkedin" },
     { depth: 2, query: "John Smith XYZ" },
     ...
   ]
   
3. SEARCH EXECUTION (Parallel)
   ↓
   Results: [
     { url: "github.com/jsmith", depth: 0 },
     { url: "linkedin.com/in/jsmith", depth: 1 },
     ...
   ]
   
4. CONTENT EXTRACTION (Batch)
   ↓
   Contents: [
     { url: "...", content: "...", depth: 0 },
     ...
   ]
   
5. SUMMARIZATION (Batch)
   ↓
   Summaries: [
     { url: "...", summary: "...", depth: 0 },
     ...
   ]
   
6. PROFILE VERIFICATION
   ↓
   Verified Sources: [ sources about same person ]
   
7. PROFILE GENERATION
   ↓
   Profile: {
     name: "John Smith",
     aliases: ["jsmith", "john_s"],
     summary: "...",
     sources: [...]
   }
   
8. DATABASE STORAGE
   ↓
   Saved to Supabase
   
9. RETURN TO UI
   ↓
   Display Profile
```

## Service Architecture

### Backend Services

```
┌─────────────────────────────────────────────────────┐
│                  SERVICE LAYER                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  queryGenerator.ts                                   │
│  ├─ generateSearchQueries()                         │
│  ├─ generateFallbackQueries()                       │
│  └─ OpenAI API integration                          │
│                                                       │
│  searchService.ts                                    │
│  ├─ executeSearch()                                  │
│  ├─ executeSearchBatch()                            │
│  ├─ filterViableResults()                           │
│  ├─ deduplicateResults()                            │
│  └─ Exa.js integration                              │
│                                                       │
│  contentExtractor.ts                                 │
│  ├─ extractContent()                                 │
│  ├─ extractContentBatch()                           │
│  ├─ extractContentSimple() [fallback]              │
│  └─ Exa.js content extraction                       │
│                                                       │
│  summarizer.ts                                       │
│  ├─ summarizeSource()                               │
│  ├─ summarizeSourcesBatch()                         │
│  └─ OpenAI API integration                          │
│                                                       │
│  profileGenerator.ts                                 │
│  ├─ generateProfile()                               │
│  ├─ verifyAndFilterSources()                        │
│  ├─ createProfileSummary()                          │
│  └─ OpenAI API integration                          │
│                                                       │
│  database.ts                                         │
│  ├─ createProfile()                                  │
│  ├─ getProfileById()                                │
│  ├─ getAllProfiles()                                │
│  ├─ deleteProfile()                                 │
│  └─ Supabase integration                            │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Frontend Components

```
┌─────────────────────────────────────────────────────┐
│                 COMPONENT TREE                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  App.tsx (Root)                                      │
│  ├─ useProfiles() hook                              │
│  ├─ State management                                │
│  └─ Error handling                                  │
│      │                                               │
│      ├─ SubjectForm                                 │
│      │   ├─ Name input                              │
│      │   ├─ Context textarea                        │
│      │   ├─ Depth slider                            │
│      │   └─ Submit handler                          │
│      │                                               │
│      └─ ProfileList                                 │
│          └─ ProfileCard (multiple)                  │
│              ├─ Profile header                      │
│              ├─ Aliases display                     │
│              ├─ Summary text                        │
│              ├─ Delete button                       │
│              └─ SourcesList (expandable)            │
│                  └─ Sources grouped by depth        │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Database Schema

```sql
┌─────────────────────────────────────┐
│           PROFILES                   │
├─────────────────────────────────────┤
│ id              UUID PK              │
│ name            TEXT                 │
│ aliases         TEXT[]               │
│ profile_summary TEXT                 │
│ created_at      TIMESTAMP            │
└─────────────────────────────────────┘
           │
           │ 1:N
           │
           ↓
┌─────────────────────────────────────┐
│           SOURCES                    │
├─────────────────────────────────────┤
│ id              UUID PK              │
│ profile_id      UUID FK              │
│ url             TEXT                 │
│ site_summary    TEXT                 │
│ depth           INTEGER              │
│ created_at      TIMESTAMP            │
└─────────────────────────────────────┘

Indexes:
- idx_sources_profile_id
- idx_sources_depth
- idx_profiles_created_at
```

## API Endpoints

```
┌────────────────────────────────────────────────────┐
│              REST API ENDPOINTS                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  POST /api/profiles/create                         │
│  ├─ Body: { subjects: Subject[] }                 │
│  ├─ Process: Full pipeline                         │
│  └─ Response: { profiles, errors }                │
│                                                     │
│  GET /api/profiles                                 │
│  ├─ Query: None                                    │
│  └─ Response: Profile[]                           │
│                                                     │
│  GET /api/profiles/:id                             │
│  ├─ Params: { id: UUID }                          │
│  └─ Response: Profile                             │
│                                                     │
│  DELETE /api/profiles/:id                          │
│  ├─ Params: { id: UUID }                          │
│  └─ Response: { success: true }                   │
│                                                     │
│  GET /health                                       │
│  └─ Response: { status: "ok" }                    │
│                                                     │
└────────────────────────────────────────────────────┘
```

## Configuration

```
┌─────────────────────────────────────────────────────┐
│         ENVIRONMENT CONFIGURATION                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Required Variables:                                 │
│  ├─ OPENAI_API_KEY                                  │
│  ├─ EXASEARCH_API_KEY                               │
│  ├─ SUPABASE_URL                                    │
│  ├─ SUPABASE_ANON_KEY                               │
│  └─ PORT (optional, default: 3001)                  │
│                                                       │
│  Configurable Parameters:                            │
│  ├─ maxDepth: 6 (default)                           │
│  ├─ searchTimeout: 30s                              │
│  ├─ batchSize: 3-5                                  │
│  └─ rateLimitDelay: 500-2000ms                      │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────┐
│              SECURITY LAYERS                         │
├─────────────────────────────────────────────────────┤
│                                                       │
│  1. Environment Variables                            │
│     └─ API keys stored securely                     │
│                                                       │
│  2. Input Validation                                 │
│     └─ Sanitize user inputs                         │
│                                                       │
│  3. CORS Configuration                               │
│     └─ Restrict origins                             │
│                                                       │
│  4. Rate Limiting                                    │
│     └─ Built-in delays between requests             │
│                                                       │
│  5. Database Security (Supabase)                    │
│     ├─ Row Level Security                           │
│     ├─ Public policies (no auth)                    │
│     └─ Cascading deletes                            │
│                                                       │
│  6. Error Handling                                   │
│     └─ No sensitive data in error messages          │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Scaling Considerations

### Current Implementation
- **Concurrent Users**: Suitable for 1-10 users
- **Request Processing**: Sequential per user
- **Database**: Serverless (Supabase)
- **API Calls**: Rate-limited by external services

### Future Scaling Options

```
┌─────────────────────────────────────────────────────┐
│          POTENTIAL IMPROVEMENTS                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Backend:                                            │
│  ├─ Job queue (Bull/BullMQ)                         │
│  ├─ Redis caching                                   │
│  ├─ Worker processes                                │
│  └─ Load balancing                                  │
│                                                       │
│  Database:                                           │
│  ├─ Connection pooling                              │
│  ├─ Query optimization                              │
│  └─ Materialized views                              │
│                                                       │
│  Frontend:                                           │
│  ├─ Code splitting                                  │
│  ├─ Virtual scrolling                               │
│  └─ Service workers                                 │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────┐
│            ERROR HANDLING FLOW                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Service Level:                                      │
│  ├─ Try-catch blocks                                │
│  ├─ Fallback mechanisms                             │
│  └─ Error logging                                   │
│                                                       │
│  API Level:                                          │
│  ├─ HTTP status codes                               │
│  ├─ Error messages                                  │
│  └─ Partial success handling                        │
│                                                       │
│  Frontend Level:                                     │
│  ├─ Error state display                             │
│  ├─ User feedback                                   │
│  └─ Retry options                                   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Performance Characteristics

### Typical Profile Generation Time

```
Query Generation:      5-10 seconds
Search Execution:      10-30 seconds (depends on depth)
Content Extraction:    30-60 seconds (depends on sources)
Summarization:         20-40 seconds (depends on sources)
Profile Generation:    5-10 seconds
Database Storage:      1-2 seconds
──────────────────────────────────────
Total:                 ~2-5 minutes per profile
```

### Bottlenecks
1. **Content Extraction** - Exa.js content extraction
2. **API Rate Limits** - External service constraints
3. **OpenAI Processing** - Token processing time

### Optimization Strategies
- Parallel processing where possible
- Batch operations
- Content length limits
- Smart caching
- Reduced maxDepth for faster results

## Deployment Architecture

### Recommended Production Setup

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  Frontend (Vercel/Netlify)                          │
│       │                                               │
│       │ HTTPS                                        │
│       ↓                                               │
│  Load Balancer                                       │
│       │                                               │
│       ↓                                               │
│  Backend Server(s) (Railway/Render)                 │
│       │                                               │
│       ├─→ OpenAI API                                │
│       ├─→ Exa.ai API                                │
│       └─→ Supabase                                  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Technology Choices

### Why These Technologies?

**TypeScript**: Type safety, better DX, catches errors early
**Express**: Lightweight, flexible, well-documented
**React**: Component-based, large ecosystem, good tooling
**Supabase**: Easy setup, real-time, PostgreSQL-based
**Tailwind**: Rapid development, consistent design
**OpenAI**: Best-in-class LLM for text generation
**Exa.js**: Direct API integration for semantic search and content extraction

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Rotate API keys quarterly
- Review error logs weekly
- Monitor API usage daily
- Backup database weekly

### Monitoring Points
- API response times
- Error rates
- API quota usage
- Database size
- User activity

---

This architecture supports the educational goal of demonstrating OSINT capabilities while maintaining code quality, security, and scalability.