import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export const config = {
  port: process.env.PORT || 3001,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  exaApiKey: process.env.EXASEARCH_API_KEY || process.env.EXA_API_KEY || '',
  browserbaseApiKey: process.env.BROWSERBASE_API_KEY || '',
  supabase: {
    url: process.env.SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  maxDepth: 6,
};

// Validate required environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'BROWSERBASE_API_KEY',
];

export function validateConfig() {
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(', ')}`
    );
    console.warn('Some features may not work correctly.');
  }
}

