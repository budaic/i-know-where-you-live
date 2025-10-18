import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import profilesRouter from './routes/profiles';

// Validate configuration
validateConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/profiles', profilesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});

