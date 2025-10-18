import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import profilesRouterV2 from './routes/profilesV2';

// Validate configuration
validateConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Using V2 with 4-phase search system
app.use('/api/profiles', profilesRouterV2);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v2', system: '4-phase search' });
});

// Start server
app.listen(config.port, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`OSINT Profiler V2 - 4-Phase Search System`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Server running on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
  console.log(`API: http://localhost:${config.port}/api/profiles`);
  console.log(`${'='.repeat(60)}\n`);
});

