# OSINT Profiler V2 - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Checklist
- [ ] OpenAI API key
- [ ] Exa Search API key (EXASEARCH_API_KEY)
- [ ] Supabase project set up
- [ ] Node.js 18+ installed

### Step 1: Environment Setup

Create `.env` file in project root:

```bash
# OpenAI (required)
OPENAI_API_KEY=your_openai_api_key

# Exa Search (required)
EXASEARCH_API_KEY=your_exa_api_key

# Supabase (choose option 1 OR 2)
# Option 1: Full URL + anon key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Option 2: Project ID + service key (more flexible)
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Database Setup

1. Go to your Supabase project → SQL Editor
2. Run `supabase-setup.sql` (initial tables)
3. Run `supabase-setup-v2.sql` (V2 columns)

### Step 3: Install Dependencies

```bash
# Install all dependencies
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

### Step 4: Start Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Should see: "OSINT Profiler V2 - 4-Phase Search System"

# Terminal 2: Frontend
cd frontend
npm start
# Opens http://localhost:3000
```

### Step 5: Test the System

1. Open http://localhost:3000
2. Fill in the form:
   - **Name**: Test Subject
   - **Hard Context**: Software engineer at Google
   - **Soft Context**: Interested in machine learning
3. Click "Create Profile"
4. Watch the 4-phase search execute
5. Explore:
   - Show Context → see hard/soft/generated
   - Show Sources → see scores 6-10
   - Show Search Logs → see all 4 phases

---

## 🎯 What's Different in V2?

### Form Input
- **Before**: One "context" field
- **V2**: "Hard Context" (facts) + "Soft Context" (hints)

### Search Process
- **Before**: Multi-depth recursive queries
- **V2**: 4 targeted phases (LinkedIn → GitHub → Website → General)

### Validation
- **Before**: Basic matching
- **V2**: 1-10 scoring, only includes 6+

### Results
- **Before**: All sources shown
- **V2**: Only high-quality (6-10), with scores + confidence

### Transparency
- **Before**: Just final profile
- **V2**: Complete logs of all 4 phases visible

---

## 🔍 Understanding the UI

### Profile Card Sections

1. **Name & Aliases**
   - Subject name at top
   - Strict username aliases (no nicknames)

2. **Show Context** button
   - Hard Context (your input facts)
   - Soft Context (your input hints)
   - Generated Context (validated findings from LinkedIn/GitHub/Website)

3. **Profile Summary**
   - AI-generated comprehensive summary
   - Based only on high-quality sources

4. **Show Sources** button
   - All sources scored 6-10
   - Each shows:
     - Score badge (color-coded)
     - Confidence badge (high/medium/low)
     - Validation reasoning
     - Source summary
   - Sorted by score (best first)
   - Green highlight for top sources

5. **Show Search Logs** button
   - Phase 1: LinkedIn search
   - Phase 2: GitHub search
   - Phase 3: Website search
   - Phases 4-8: General queries
   - For each phase:
     - Query used
     - Results found
     - Validation scores
     - Selected profile (if any)
     - Context added

---

## 📊 Interpreting Scores

### Relevancy Scores (1-10)

| Score | Meaning | Action |
|-------|---------|--------|
| 9-10 | Highly confident match | ✅ Included (dark green) |
| 7-8 | Strong match | ✅ Included (green) |
| 6 | Probable match | ✅ Included (yellow) |
| 4-5 | Weak match | ❌ Rejected |
| 1-3 | Name only | ❌ Rejected |

### Confidence Levels

- **High** 🟢: Multiple context points match
- **Medium** 🟡: Some context matches
- **Low** 🔴: Minimal context match (usually 6-7 score)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check environment variables
cd backend
cat ../.env | grep -E "OPENAI|EXA|SUPABASE"

# Restart
pkill -f "npm run dev"
npm run dev
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules
npm install
npm start
```

### Database errors
1. Check Supabase credentials in `.env`
2. Verify tables exist (run both SQL files)
3. Check RLS policies are enabled

### "No results found"
- Check Exa API key is correct (EXASEARCH_API_KEY)
- Try a more well-known subject first
- Ensure hard context is accurate

### Low quality sources
- Make hard context more specific
- Add relevant soft context hints
- Try different query formulations

---

## 💡 Tips for Best Results

### Writing Good Context

**Hard Context** (must be true):
- ✅ "Software engineer at Microsoft"
- ✅ "PhD student at Stanford studying AI"
- ❌ "Might work in tech" (too vague)
- ❌ "Probably lives in California" (uncertain)

**Soft Context** (guidance):
- ✅ "Active on Twitter, interested in blockchain"
- ✅ "May have contributed to open source projects"
- ✅ "Possibly published research papers"

### Choosing Subjects

**Good candidates**:
- People with professional online presence
- Those with LinkedIn/GitHub profiles
- Public figures or academics

**Difficult candidates**:
- Private individuals with minimal online footprint
- Common names without distinguishing context
- People who actively manage their privacy

---

## 📈 Expected Performance

### Timing
- Phase 1 (LinkedIn): ~10-20 seconds
- Phase 2 (GitHub): ~10-20 seconds
- Phase 3 (Website): ~10-20 seconds
- Phase 4 (General): ~60-90 seconds (5 queries)
- **Total**: 2-3 minutes per profile

### API Calls
- OpenAI: ~20-30 calls per profile
- Exa Search: ~80 searches per profile
- Exa Contents: ~5-10 extractions per profile

### Results
- Sources found: 5-20 (only 6-10 scored)
- Phases with results: Usually 2-4 of 4
- Aliases: 0-5 (strict username format only)

---

## 🎓 Learning Outcomes

By using V2, you'll learn:

1. **OSINT Methodology**
   - Structured search phases
   - Context accumulation
   - Source validation

2. **AI Integration**
   - Validation with reasoning
   - Query generation
   - Content summarization

3. **Quality Assessment**
   - Scoring systems
   - Confidence metrics
   - Source reliability

4. **Transparency**
   - Complete logging
   - Visible decision-making
   - Audit trails

---

## 🚦 Status Check

Verify your system is working:

```bash
# Check backend
curl http://localhost:3001/health
# Should see: {"status":"ok","version":"v2","system":"4-phase search"}

# Check frontend
curl -I http://localhost:3000
# Should see: HTTP/1.1 200 OK

# Check database
# Go to Supabase → Table Editor → profiles
# Should see columns: hard_context, soft_context, generated_context, search_logs

# Check API integration
curl http://localhost:3001/api/profiles
# Should see: [] (empty array if no profiles yet)
```

All checks pass? **You're ready to go!** 🎉

---

## 📚 Next Steps

1. **Read**: `V2-REDESIGN-COMPLETE.md` for full technical details
2. **Test**: Create a profile for a well-known person
3. **Explore**: Click through all UI elements (Context, Sources, Logs)
4. **Experiment**: Try different context formulations
5. **Learn**: Study the search logs to understand the process

---

## 🤝 Need Help?

Check these files:
- `V2-REDESIGN-COMPLETE.md` - Full documentation
- `supabase-setup-v2.sql` - Database schema
- `backend/src/services/searchOrchestrator.ts` - Main search logic
- `frontend/src/components/SearchLogs.tsx` - Log visualization

Happy profiling! 🔍✨

