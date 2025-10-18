# MCP (Model Context Protocol) Setup Guide

This application uses MCP servers through Smithery to integrate with Exa.ai and Browserbase.

## What is MCP?

Model Context Protocol (MCP) is a standardized way for AI applications to connect to external tools and data sources. Smithery hosts MCP servers that provide access to various services.

## Prerequisites

- Node.js 18+
- Smithery CLI
- API keys for required services

## Installing Smithery CLI

```bash
npm install -g @smithery/cli
```

## Authentication

```bash
smithery login
```

This will open a browser window for you to authenticate.

## MCP Servers Used

### 1. Exa MCP Server

Exa provides semantic web search capabilities.

**Installation:**
```bash
npm install -g exa-mcp-server
```

**Configuration:**
The Exa MCP server is accessible through Smithery and should work without additional API keys when using Smithery's hosted version.

**In Code:**
The backend uses the `exa-js` package to interact with Exa:
```typescript
import Exa from 'exa-js';
const exaClient = new Exa(process.env.EXA_API_KEY);
```

### 2. Browserbase MCP Server

Browserbase provides browser automation and web scraping capabilities.

**Requirements:**
- Browserbase API key from https://browserbase.com
- Add to `.env`: `BROWSERBASE_API_KEY=bb_...`

**Configuration:**
Browserbase MCP is already integrated in Cursor. The backend connects to Browserbase using Playwright:

```typescript
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP(
  `wss://connect.browserbase.com?apiKey=${config.browserbaseApiKey}`
);
```

## Verifying MCP Setup

### Check Smithery Status

```bash
smithery status
```

### Test Exa Connection

You can test the Exa MCP server using the available tools in Cursor. The server provides:
- `web_search_exa` - Search the web
- `get_code_context_exa` - Get code context

### Test Browserbase Connection

From the backend, test Browserbase:

```bash
cd backend
npm run dev
```

Then make a test request to verify Browserbase connectivity.

## Alternative: Direct API Integration

If MCP servers are not working, the application can fall back to direct API calls:

### Exa Direct API

```typescript
const response = await fetch('https://api.exa.ai/search', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${EXA_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: 'search term' })
});
```

### Browserbase Direct API

```typescript
const browser = await chromium.connectOverCDP(
  `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}`
);
```

## Troubleshooting MCP

### "MCP server not found"

1. Verify Smithery is installed and authenticated
2. Check available servers: `smithery list`
3. Reinstall the specific MCP server

### "Connection refused" errors

1. Check your internet connection
2. Verify API keys are correct
3. Ensure Smithery is running: `smithery status`
4. Try restarting Smithery: `smithery restart`

### Exa authentication errors

- Exa through Smithery should work without additional keys
- If using direct API, get key from https://dashboard.exa.ai/

### Browserbase connection issues

- Verify your Browserbase API key is valid
- Check account has active credits
- Test connection: `curl "wss://connect.browserbase.com?apiKey=YOUR_KEY"`

## MCP in Cursor

Cursor has built-in MCP support. The MCP servers you've configured with Smithery are automatically available in Cursor.

To use MCP tools in Cursor:
1. Tools are available in the Cursor agent context
2. Can be invoked through function calls
3. Results are automatically returned to the AI

## Performance Optimization

### Rate Limiting

Both Exa and Browserbase have rate limits:

**Exa:**
- Free tier: Limited requests per month
- Paid: Higher limits

**Browserbase:**
- Concurrent sessions limited by plan
- Each session costs credits

### Caching

Consider implementing caching to reduce API calls:
- Cache search results for identical queries
- Store extracted content to avoid re-scraping
- Save OpenAI summaries

### Batch Processing

The backend implements batch processing with delays:
```typescript
// Small delay between requests
await new Promise(resolve => setTimeout(resolve, 500));
```

## Cost Management

### Estimated Costs per Profile

For a single profile with max_depth=6:
- **OpenAI**: ~7 API calls × $0.03/1K tokens = ~$0.10-0.50
- **Exa**: 7 searches × (free or $0.001/search)
- **Browserbase**: ~5-10 page loads × credits

**Total per profile: $0.15-1.00** depending on configuration

### Reducing Costs

1. Lower `max_depth` (fewer queries)
2. Implement result caching
3. Use Browserbase only when necessary
4. Batch multiple subjects together

## Advanced Configuration

### Custom MCP Servers

If you want to deploy your own MCP servers:

```bash
# Create new MCP server
npm create smithery@latest

# Deploy to Smithery
smithery deploy
```

### Environment-Specific Config

Development vs Production:
```bash
# Development - use local MCP
MCP_MODE=local

# Production - use Smithery hosted
MCP_MODE=smithery
```

## Resources

- [Smithery Documentation](https://smithery.ai/docs)
- [Exa API Docs](https://docs.exa.ai)
- [Browserbase Docs](https://docs.browserbase.com)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## Support

For MCP-specific issues:
1. Check Smithery status: `smithery status`
2. Review server logs: `smithery logs <server-name>`
3. Smithery Discord: https://discord.gg/smithery
4. Browserbase support: support@browserbase.com

