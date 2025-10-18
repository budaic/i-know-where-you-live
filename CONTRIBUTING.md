# Contributing to OSINT Profiler

Thank you for considering contributing to this educational project! This document provides guidelines for contributing.

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Use the tool ethically and legally
- Provide constructive feedback
- Focus on educational value

### Unacceptable Behavior

- Harassment or discrimination
- Misuse of the tool for malicious purposes
- Sharing sensitive personal information
- Violating privacy or legal boundaries

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Error messages and logs

### Suggesting Enhancements

1. Check existing feature requests
2. Describe the enhancement clearly
3. Explain the use case
4. Consider educational value

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/i-know-where-you-live.git
   cd i-know-where-you-live
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Test manually
   - Ensure no regressions
   - Test edge cases

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```
   
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request on GitHub.

### PR Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain what and why
- **Screenshots**: For UI changes
- **Testing**: Describe how you tested
- **Documentation**: Update if needed

## Development Setup

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

Quick start:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cp env.example .env
# Edit .env with your API keys
npm run dev
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Avoid `any` type
- Use interfaces for data structures
- Descriptive variable names
- Add JSDoc comments for public functions

Example:
```typescript
/**
 * Generates search queries for a subject
 * @param subject - Subject information including name and context
 * @returns Array of search queries with varying depths
 */
export async function generateSearchQueries(
  subject: Subject
): Promise<SearchQuery[]> {
  // Implementation
}
```

### React

- Functional components with hooks
- Props type definitions
- Meaningful component names
- Single responsibility principle

Example:
```typescript
interface ProfileCardProps {
  profile: Profile;
  onDelete: (id: string) => void;
}

export default function ProfileCard({ profile, onDelete }: ProfileCardProps) {
  // Implementation
}
```

### CSS (Tailwind)

- Use utility classes
- Responsive design
- Consistent spacing
- Accessible colors

## Testing

### Before Submitting PR

1. **Manual testing**
   - Test the feature end-to-end
   - Test error cases
   - Test with different inputs

2. **Check console**
   - No errors in browser console
   - No errors in terminal
   - Verify API responses

3. **Code review**
   - Review your own code
   - Remove debug statements
   - Check for TODOs

## Documentation

### When to Update Docs

- Adding new features
- Changing API endpoints
- Modifying configuration
- Adding dependencies
- Changing setup process

### Documentation Files

- **README.md** - Main documentation
- **SETUP-GUIDE.md** - Quick setup
- **DEVELOPMENT.md** - Development guide
- **MCP-SETUP.md** - MCP configuration
- Code comments - For complex logic

## Project Areas

### Areas Needing Contribution

1. **Performance Optimization**
   - Caching strategies
   - Batch processing improvements
   - Rate limit handling

2. **Error Handling**
   - Better error messages
   - Graceful degradation
   - Retry logic

3. **UI/UX Improvements**
   - Better loading states
   - Progress indicators
   - Accessibility features

4. **Documentation**
   - More examples
   - Video tutorials
   - Troubleshooting guides

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

6. **Security**
   - Input validation
   - Rate limiting
   - API key management

## Ethical Guidelines

This project is for educational purposes. When contributing:

1. **Prioritize privacy**
   - Don't include real personal data in examples
   - Use fictional examples in documentation
   - Implement features that protect privacy

2. **Add warnings**
   - Include ethical considerations
   - Warn about legal implications
   - Encourage responsible use

3. **Educational focus**
   - Emphasize learning objectives
   - Explain the "why" behind features
   - Consider implications of capabilities

## Review Process

1. **Automated checks**
   - Code compiles without errors
   - No linting errors

2. **Manual review**
   - Code quality
   - Follows guidelines
   - Tests adequately
   - Documentation updated

3. **Feedback**
   - Constructive and respectful
   - Specific suggestions
   - Questions for clarification

4. **Approval**
   - At least one approving review
   - All comments addressed
   - CI checks passing

## Getting Help

- **Questions**: Open a discussion
- **Bugs**: Open an issue
- **Ideas**: Start a discussion
- **Urgent**: Contact maintainers

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License (see [LICENSE](LICENSE)).

---

Thank you for contributing to OSINT Profiler! Your efforts help make this a better educational tool.

