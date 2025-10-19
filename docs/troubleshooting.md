# Troubleshooting Guide

This guide covers common issues and their solutions.

## Setup Issues

### "Missing environment variables" warning

**Symptoms:**
- Backend shows warnings about missing API keys
- API calls fail with authentication errors

**Solutions:**
1. Check that `.env` exists in the root directory (not in `backend/`)
2. Verify all required variables are filled in:
   ```env
   OPENAI_API_KEY=sk-...
   EXASEARCH_API_KEY=your_exa_key
   BROWSERBASE_API_KEY=bb_...
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   ```
3. Restart the backend server after updating `.env`
4. Check for typos in variable names

### "ECONNREFUSED" or network errors

**Symptoms:**
- Frontend shows "Network Error" or "Connection refused"
- API calls fail to reach the backend

**Solutions:**
1. Ensure backend is running on port 3001:
   ```bash
   cd backend
   npm run dev
   ```
2. Check backend health:
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok"}`
3. Verify no other process is using port 3001:
   ```bash
   lsof -i :3001
   ```
4. Check CORS settings in backend if accessing from different origin

### Database connection errors

**Symptoms:**
- "Failed to get profiles" errors
- Supabase connection timeouts

**Solutions:**
1. Verify Supabase credentials in `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   ```
2. Test Supabase connection:
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```
3. Ensure the SQL schema has been run in Supabase SQL Editor
4. Check that Row Level Security policies are enabled
5. Verify your Supabase project is not paused

### Port conflicts

**Symptoms:**
- "Port 3000/3001 already in use" errors
- Servers won't start

**Solutions:**
1. Find processes using the ports:
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```
2. Kill the processes:
   ```bash
   kill -9 <PID>
   ```
3. Or use different ports by updating `.env`:
   ```env
   PORT=3002
   ```

## API Issues

### OpenAI API errors

**Symptoms:**
- "The model 'gpt-4' does not exist" errors
- OpenAI authentication failures

**Solutions:**
1. Verify your OpenAI API key is valid and has credits
2. Check if you have access to the model (some models require approval)
3. The system uses `gpt-5-nano` by default - ensure you have access
4. Check your OpenAI usage limits and billing

### Exa search errors

**Symptoms:**
- "ExaError: API key must be provided" errors
- Search requests fail

**Solutions:**
1. Verify `EXASEARCH_API_KEY` is set in `.env`
2. Check your Exa account has active credits
3. Test Exa API directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" https://api.exa.ai/search
   ```
4. Check your Exa account usage limits


### Rate limiting

**Symptoms:**
- "Rate limit exceeded" errors
- Requests are throttled

**Solutions:**
1. Wait a few minutes before retrying
2. Reduce `maxDepth` to generate fewer queries
3. Check your API usage limits:
   - OpenAI: Check usage dashboard
   - Exa: Check account limits
4. Implement longer delays between requests if needed

## Frontend Issues

### Frontend won't start

**Symptoms:**
- `npm start` fails
- React app won't load

**Solutions:**
1. Clear cache and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```
2. Check for port conflicts (React will prompt to use another port)
3. Verify Node.js version (requires 18+):
   ```bash
   node --version
   ```

### API connection refused

**Symptoms:**
- Frontend shows "API connection failed"
- Network requests fail

**Solutions:**
1. Ensure backend is running on port 3001
2. Check `REACT_APP_API_URL` in frontend `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```
3. Verify CORS settings in backend
4. Check browser console for specific error messages

### Build errors

**Symptoms:**
- `npm run build` fails
- TypeScript compilation errors

**Solutions:**
1. Check for TypeScript errors:
   ```bash
   cd frontend
   npx tsc --noEmit
   ```
2. Fix any type errors in the code
3. Clear build cache:
   ```bash
   rm -rf build
   npm run build
   ```

## Performance Issues

### Slow profile creation

**Symptoms:**
- Profile creation takes longer than 5 minutes
- Timeouts occur

**Solutions:**
1. Reduce `maxDepth` to 2-4 for faster results
2. Check API response times:
   - OpenAI: Should be < 10 seconds per request
   - Exa: Should be < 5 seconds per request
3. Monitor network connectivity
4. Check for rate limiting delays

### High memory usage

**Symptoms:**
- Server becomes unresponsive
- Out of memory errors

**Solutions:**
1. Restart the backend server periodically
2. Reduce batch sizes in configuration
3. Implement content length limits
4. Monitor memory usage with system tools

### Database performance

**Symptoms:**
- Slow database queries
- Connection timeouts

**Solutions:**
1. Check Supabase project status
2. Monitor database size and query performance
3. Add database indexes if needed
4. Consider upgrading Supabase plan for better performance

## Data Issues

### No results found

**Symptoms:**
- Profile creation completes but shows no sources
- Empty profile summaries

**Solutions:**
1. Try a more well-known subject first
2. Provide more specific context
3. Check if the subject has a significant online presence
4. Verify all API keys are working
5. Check search logs for specific errors

### Low quality results

**Symptoms:**
- Many irrelevant sources
- Poor profile summaries

**Solutions:**
1. Provide more specific context
2. Use lower `maxDepth` values (2-4)
3. Try different query formulations
4. Check if the subject name is too common

### Duplicate sources

**Symptoms:**
- Same URL appears multiple times
- Redundant information

**Solutions:**
1. This is handled automatically by the deduplication logic
2. If issues persist, check the search service implementation
3. Verify URL normalization is working correctly

## Debugging

### Enable verbose logging

Add debug logs to backend services:

```typescript
console.log('Processing subject:', subject.name);
console.log('Generated queries:', queries);
console.log('Search results:', results);
```

### Check specific services

Test individual services:

```bash
cd backend
node -e "require('./dist/services/queryGenerator').generateSearchQueries({name: 'Test', context: 'test'})"
```

### Monitor API calls

1. Check browser DevTools → Network tab
2. Monitor backend console for API call logs
3. Use API testing tools like Postman or Thunder Client

### Database debugging

Connect to Supabase and run queries:

```sql
-- Check recent profiles
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Check source counts
SELECT p.name, COUNT(s.id) as source_count
FROM profiles p
LEFT JOIN sources s ON p.id = s.profile_id
GROUP BY p.id, p.name;
```

## Getting Help

### Before asking for help

1. Check this troubleshooting guide
2. Verify all API keys are correct and have credits
3. Check browser console and terminal for error messages
4. Review the logs for specific error details
5. Try the basic setup steps again

### Information to provide

When reporting issues, include:

1. **Error messages** (exact text)
2. **Steps to reproduce** the issue
3. **Environment details**:
   - Operating system
   - Node.js version
   - Browser version
4. **Configuration**:
   - Which API keys are set
   - Environment variables (without sensitive values)
5. **Logs**:
   - Backend console output
   - Browser console errors
   - Network request failures

### Common solutions

Most issues can be resolved by:

1. **Restarting servers** after configuration changes
2. **Checking API keys** and account credits
3. **Verifying database setup** in Supabase
4. **Clearing caches** and reinstalling dependencies
5. **Checking network connectivity** and firewall settings

### Emergency fixes

If nothing else works:

1. **Reset environment**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

2. **Recreate Supabase project** and run setup SQL again

3. **Generate new API keys** for all services

4. **Check system resources** (memory, disk space, network)

Remember: Most issues are configuration-related and can be resolved by carefully following the setup guide and checking all API keys and credentials.
