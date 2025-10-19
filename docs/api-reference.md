# API Reference

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-api-domain.com/api`

## Authentication

No authentication required. This is an open API for educational purposes.

## Endpoints

### Create Profiles

**POST** `/profiles/create`

Create new profile(s) from subjects.

#### Request Body

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

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subjects` | Array | Yes | Array of subject objects |
| `subjects[].name` | String | Yes | Full name of the subject |
| `subjects[].context` | String | Yes | Context to narrow the search |
| `subjects[].maxDepth` | Integer | No | Maximum search depth (default: 6) |

#### Response

```json
{
  "profiles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Smith",
      "aliases": ["jsmith", "john_s"],
      "profileSummary": "John Smith is an engineering student at SUTD...",
      "sources": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "url": "https://github.com/jsmith",
          "siteSummary": "GitHub profile showing engineering projects...",
          "depth": 0
        }
      ],
      "createdAt": "2025-01-18T10:30:00Z"
    }
  ],
  "errors": []
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `profiles` | Array | Successfully created profiles |
| `errors` | Array | Any errors that occurred |

#### Profile Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique profile identifier |
| `name` | String | Subject's name |
| `aliases` | Array | Discovered usernames/aliases |
| `profileSummary` | String | AI-generated comprehensive summary |
| `sources` | Array | Array of source objects |
| `createdAt` | ISO String | Creation timestamp |

#### Source Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique source identifier |
| `url` | String | Source URL |
| `siteSummary` | String | AI-generated summary of the source |
| `depth` | Integer | Search depth (0-6, lower = more specific) |

#### Error Response

```json
{
  "profiles": [],
  "errors": [
    {
      "subject": "John Smith",
      "error": "Failed to generate queries: OpenAI API error"
    }
  ]
}
```

### Get All Profiles

**GET** `/profiles`

Retrieve all profiles.

#### Response

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Smith",
    "aliases": ["jsmith", "john_s"],
    "profileSummary": "John Smith is an engineering student...",
    "sources": [...],
    "createdAt": "2025-01-18T10:30:00Z"
  }
]
```

### Get Profile by ID

**GET** `/profiles/:id`

Retrieve a specific profile by ID.

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Profile ID |

#### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Smith",
  "aliases": ["jsmith", "john_s"],
  "profileSummary": "John Smith is an engineering student...",
  "sources": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "url": "https://github.com/jsmith",
      "siteSummary": "GitHub profile showing engineering projects...",
      "depth": 0
    }
  ],
  "createdAt": "2025-01-18T10:30:00Z"
}
```

#### Error Response

```json
{
  "error": "Profile not found"
}
```

### Delete Profile

**DELETE** `/profiles/:id`

Delete a profile and all its sources.

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Profile ID |

#### Response

```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

#### Error Response

```json
{
  "error": "Profile not found"
}
```

### Health Check

**GET** `/health`

Check API health status.

#### Response

```json
{
  "status": "ok",
  "timestamp": "2025-01-18T10:30:00Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |

## Rate Limiting

The API includes built-in delays to respect external service rate limits:

- **OpenAI**: ~1-2 seconds between requests
- **Exa**: ~500ms between requests
- **Browserbase**: ~1 second between requests

## Example Usage

### cURL Examples

#### Create a Profile

```bash
curl -X POST http://localhost:3001/api/profiles/create \
  -H "Content-Type: application/json" \
  -d '{
    "subjects": [{
      "name": "Linus Torvalds",
      "context": "Creator of Linux operating system",
      "maxDepth": 4
    }]
  }'
```

#### Get All Profiles

```bash
curl http://localhost:3001/api/profiles
```

#### Get Specific Profile

```bash
curl http://localhost:3001/api/profiles/550e8400-e29b-41d4-a716-446655440000
```

#### Delete Profile

```bash
curl -X DELETE http://localhost:3001/api/profiles/550e8400-e29b-41d4-a716-446655440000
```

#### Health Check

```bash
curl http://localhost:3001/health
```

### JavaScript Examples

#### Create Profile

```javascript
const response = await fetch('http://localhost:3001/api/profiles/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subjects: [{
      name: 'John Smith',
      context: 'software engineer at Google',
      maxDepth: 6
    }]
  })
});

const data = await response.json();
console.log(data.profiles);
```

#### Get All Profiles

```javascript
const response = await fetch('http://localhost:3001/api/profiles');
const profiles = await response.json();
console.log(profiles);
```

#### Delete Profile

```javascript
const response = await fetch('http://localhost:3001/api/profiles/550e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result.success);
```

## Data Types

### UUID Format

All IDs are UUIDs in the format: `550e8400-e29b-41d4-a716-446655440000`

### Timestamp Format

All timestamps are in ISO 8601 format: `2025-01-18T10:30:00Z`

### Depth Levels

Search depth levels indicate query specificity:

- **0-2**: Most specific queries (e.g., "John Smith engineer Google github")
- **3-4**: Moderate specificity (e.g., "John Smith Google engineer")
- **5-6**: Broad queries (e.g., "John Smith engineer")

Lower depth = more reliable results, higher depth = more comprehensive results.

## Best Practices

### Request Optimization

1. **Use appropriate maxDepth**: Lower values (2-4) for faster, more focused results
2. **Provide good context**: More specific context leads to better results
3. **Batch requests**: Create multiple profiles in a single request when possible

### Error Handling

1. **Check for errors**: Always check the `errors` array in responses
2. **Handle timeouts**: Profile creation can take 2-5 minutes
3. **Retry logic**: Implement retry for transient failures

### Performance

1. **Monitor rate limits**: Watch for rate limit errors
2. **Cache results**: Store profiles locally to avoid re-creation
3. **Use pagination**: For large profile lists (future enhancement)

## Webhooks (Future Enhancement)

Webhooks may be added in future versions to notify when profile creation is complete:

```json
{
  "event": "profile.created",
  "data": {
    "profileId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed"
  }
}
```

## SDKs (Future Enhancement)

Official SDKs may be provided for:

- JavaScript/TypeScript
- Python
- Go
- PHP

## Support

For API questions or issues:

1. Check the [troubleshooting guide](troubleshooting.md)
2. Review error messages and status codes
3. Check server logs for detailed error information
4. Verify all required environment variables are set
