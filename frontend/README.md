# OSINT Profiler Frontend

React + TypeScript frontend for the OSINT Profiler application.

## Environment Configuration

Create a `.env.local` file in this directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

For production, update the URL to your deployed backend:

```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Available Scripts

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

## Components

- **App.tsx** - Main application component with state management
- **SubjectForm.tsx** - Form for entering subject information
- **ProfileCard.tsx** - Displays individual profile with sources
- **SourcesList.tsx** - Lists sources grouped by depth/reliability
- **ProfileList.tsx** - Lists all saved profiles

## Customization

### Styling

This project uses Tailwind CSS. To customize:

1. Edit `tailwind.config.js`
2. Add custom colors, fonts, etc. in the `theme.extend` section
3. Use utility classes in components

### API Integration

The API client is in `src/services/api.ts`. To modify:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

## Learn More

- [React Documentation](https://react.dev/)
- [Create React App Documentation](https://create-react-app.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

