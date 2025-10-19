# Development Guide

This guide covers development workflows, testing, and contribution guidelines.

## Development Environment Setup

### Required Tools

- Node.js 18+
- npm 9+
- Git
- Code editor (VS Code recommended)
- Postman or similar (for API testing)

### IDE Setup (VS Code)

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Thunder Client (API testing)

## Project Structure

```
i-know-where-you-live/
├── backend/                    # Express + TypeScript backend
│   ├── src/
│   │   ├── services/          # Business logic
│   │   │   ├── queryGenerator.ts      # OpenAI query generation
│   │   │   ├── searchService.ts       # Exa search
│   │   │   ├── contentExtractor.ts    # Browserbase scraping
│   │   │   ├── summarizer.ts          # OpenAI summarization
│   │   │   ├── profileGenerator.ts    # Profile creation
│   │   │   └── database.ts            # Supabase operations
│   │   ├── routes/
│   │   │   └── profiles.ts            # API endpoints
│   │   ├── types.ts                   # TypeScript interfaces
│   │   ├── config.ts                  # Configuration
│   │   └── index.ts                   # Server entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React + TypeScript frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── SubjectForm.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── SourcesList.tsx
│   │   │   └── ProfileList.tsx
│   │   ├── hooks/
│   │   │   └── useProfiles.ts
│   │   ├── services/
│   │   │   └── api.ts         # Axios API client
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── supabase-setup.sql         # Database schema
├── package.json               # Root workspace config
└── README.md
```

## Development Workflow

### Starting Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   - Backend changes: Server auto-reloads via `tsx watch`
   - Frontend changes: Hot reload via React Scripts

3. **Test your changes**
   - Manual testing via UI
   - API testing via Postman/Thunder Client
   - Check browser console for errors
   - Review terminal logs

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

## Testing

### Manual Testing

#### Backend API Testing

Test the `/api/profiles/create` endpoint:

```bash
curl -X POST http://localhost:3001/api/profiles/create \
  -H "Content-Type: application/json" \
  -d '{
    "subjects": [{
      "name": "John Smith",
      "context": "engineering student at SUTD",
      "maxDepth": 4
    }]
  }'
```

Test health check:
```bash
curl http://localhost:3001/health
```

Get all profiles:
```bash
curl http://localhost:3001/api/profiles
```

Get specific profile:
```bash
curl http://localhost:3001/api/profiles/<profile-id>
```

Delete profile:
```bash
curl -X DELETE http://localhost:3001/api/profiles/<profile-id>
```

### Frontend Testing

1. **Form Validation**
   - Try submitting empty form
   - Try different name formats
   - Adjust depth slider

2. **Profile Display**
   - Create a profile
   - Verify all fields display correctly
   - Check source grouping by depth
   - Test expand/collapse sources

3. **Error Handling**
   - Stop backend server, try creating profile
   - Create profile with invalid data
   - Check error messages display

### Integration Testing

End-to-end test flow:

1. Start both servers
2. Navigate to http://localhost:3000
3. Enter subject information:
   - Name: "Test User"
   - Context: "software developer"
   - Max Depth: 3
4. Submit form
5. Wait for processing (2-3 minutes)
6. Verify profile appears
7. Check sources are grouped by depth
8. Verify profile summary is generated
9. Test delete functionality

### Database Testing

Connect to Supabase and verify:

```sql
-- Check profiles table
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Check sources table
SELECT * FROM sources ORDER BY created_at DESC LIMIT 10;

-- Check source count by depth
SELECT depth, COUNT(*) FROM sources GROUP BY depth ORDER BY depth;

-- Check profiles with source counts
SELECT p.id, p.name, COUNT(s.id) as source_count
FROM profiles p
LEFT JOIN sources s ON p.id = s.profile_id
GROUP BY p.id, p.name;
```

## Debugging

### Backend Debugging

Add debug logs:
```typescript
console.log('Processing subject:', subject.name);
console.log('Generated queries:', queries);
console.log('Search results:', results);
```

Use debugger:
```typescript
debugger; // Add breakpoint
```

Check environment:
```typescript
console.log('Config:', config);
```

### Frontend Debugging

React DevTools:
- Install React Developer Tools browser extension
- Inspect component state and props

Console debugging:
```typescript
console.log('Profile data:', profile);
console.error('API Error:', error);
```

Network debugging:
- Open browser DevTools → Network tab
- Monitor API calls
- Check request/response payloads

## Common Issues

### Backend Issues

**Port already in use:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

**Environment variables not loading:**
- Check `.env` is in root directory
- Verify no typos in variable names
- Restart backend server after changes

**Database connection errors:**
- Verify Supabase credentials
- Check internet connection
- Test connection: `curl <SUPABASE_URL>/rest/v1/`

### Frontend Issues

**Port 3000 already in use:**
- React will prompt to use another port
- Or kill the process: `lsof -i :3000`

**API connection refused:**
- Ensure backend is running on port 3001
- Check CORS settings in backend
- Verify API_URL in frontend code

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Code Style

### TypeScript

- Use interfaces for data structures
- Enable strict mode
- Avoid `any` type
- Use descriptive variable names

### React

- Functional components with hooks
- Props destructuring
- Meaningful component names
- Keep components focused (single responsibility)

### CSS (Tailwind)

- Use utility classes
- Responsive design (mobile-first)
- Consistent spacing
- Accessible colors

## Performance Optimization

### Backend

1. **Implement caching**
   ```typescript
   const cache = new Map();
   if (cache.has(query)) {
     return cache.get(query);
   }
   ```

2. **Batch API calls**
   - Group multiple queries
   - Use Promise.all for parallel operations

3. **Rate limiting**
   - Add delays between API calls
   - Implement queue system

### Frontend

1. **Code splitting**
   ```typescript
   const ProfileCard = lazy(() => import('./ProfileCard'));
   ```

2. **Memoization**
   ```typescript
   const MemoizedComponent = React.memo(ProfileCard);
   ```

3. **Optimize re-renders**
   - Use useCallback for functions
   - Use useMemo for expensive computations

## Environment Variables

### Backend (.env in root)

```env
OPENAI_API_KEY=sk-...
BROWSERBASE_API_KEY=bb_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
PORT=3001
```

### Frontend

The frontend uses `REACT_APP_API_URL` to configure the backend URL.

Create `.env.local` in `frontend/`:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

For production:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Deployment

### Backend Deployment

Popular options:
- Railway
- Render
- Heroku
- AWS EC2

Steps:
1. Set environment variables
2. Build: `npm run build`
3. Start: `npm start`

### Frontend Deployment

Popular options:
- Vercel
- Netlify
- AWS S3 + CloudFront

Steps:
1. Update `REACT_APP_API_URL` to production API
2. Build: `npm run build`
3. Deploy `build/` directory

### Environment Configuration

Production `.env`:
```env
# Use production API keys
OPENAI_API_KEY=sk-prod-...
BROWSERBASE_API_KEY=bb-prod-...
SUPABASE_URL=https://prod.supabase.co
SUPABASE_ANON_KEY=prod-key...
PORT=3001
```

## Security Considerations

### API Keys

- Never commit `.env` files
- Use environment variables
- Rotate keys regularly
- Use different keys for dev/prod

### Rate Limiting

Implement on backend:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Input Validation

```typescript
if (!name || typeof name !== 'string') {
  return res.status(400).json({ error: 'Invalid name' });
}
```

### CORS

Configure properly:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Monitoring

### Logging

Implement structured logging:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Error Tracking

Consider integrating:
- Sentry
- LogRocket
- Rollbar

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### PR Guidelines

- Clear description of changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Follow code style guidelines

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## Support

For development questions:
1. Check this guide
2. Review relevant documentation
3. Search existing issues
4. Ask in discussions

Happy coding!
