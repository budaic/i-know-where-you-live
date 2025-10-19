# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-18

### Added
- Initial release of OSINT Profiler
- Backend API with Express and TypeScript
- React frontend with Tailwind CSS
- OpenAI integration for query generation and summarization
- Exa.ai integration for web search via MCP
- Browserbase integration for content extraction via MCP
- Supabase database for profile storage
- Multi-depth search query generation (0-6)
- Source reliability scoring based on depth
- Profile verification and generation
- Profile management (create, view, delete)
- Comprehensive documentation:
  - Main README with full setup instructions
  - Complete setup guide (SETUP.md)
  - Development guide (docs/development.md)
  - Architecture documentation (docs/architecture.md)
  - API reference (docs/api-reference.md)
  - Troubleshooting guide (docs/troubleshooting.md)
  - Backend-specific README
  - Frontend-specific README
- SQL schema for Supabase
- Environment configuration templates

### Features
- Automated multi-depth search query generation
- Web scraping with Exa.ai and Browserbase
- AI-powered content summarization
- Source verification to match same person
- Profile summary generation
- Source grouping by reliability (depth)
- Responsive UI with real-time updates
- Error handling and fallback mechanisms

### Technical
- TypeScript for type safety
- Monorepo structure with workspaces
- Service-based architecture
- RESTful API design
- React hooks for state management
- Tailwind CSS for styling
- Environment-based configuration

### Documentation
- Comprehensive setup instructions
- API endpoint documentation
- Architecture overview
- Troubleshooting guide
- Ethical use guidelines
- MCP server configuration guide
- Development workflow documentation

### Security
- Environment variable management
- Input validation
- Rate limiting implementation
- Row Level Security in Supabase
- CORS configuration

## [Unreleased]

### Planned Features
- Unit and integration tests
- Caching for API responses
- Progress tracking with WebSockets
- Export profiles to JSON/PDF
- Batch processing multiple subjects
- Advanced filtering and search
- Profile comparison
- Source credibility scoring
- User authentication (optional)
- Admin dashboard
- Analytics and statistics

### Planned Improvements
- Better error messages
- Retry logic for failed API calls
- Improved rate limit handling
- Performance optimizations
- Enhanced UI/UX
- More comprehensive logging
- Docker containerization
- CI/CD pipeline
- Automated testing

---

## Version History

### Version Numbering

- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backward compatible)
- **PATCH** version: Bug fixes (backward compatible)

### Release Notes

Release notes for each version include:
- New features
- Bug fixes
- Breaking changes
- Deprecations
- Security updates
- Performance improvements

---

[1.0.0]: https://github.com/username/i-know-where-you-live/releases/tag/v1.0.0
