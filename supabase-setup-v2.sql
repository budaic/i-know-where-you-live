-- OSINT Profiler V2 Database Schema Update
-- Run this script in your Supabase SQL Editor to add new columns for the redesigned system

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hard_context TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS soft_context TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS generated_context JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_logs JSONB;

-- Add new columns to sources table
ALTER TABLE sources ADD COLUMN IF NOT EXISTS relevancy_score INTEGER;
ALTER TABLE sources ADD COLUMN IF NOT EXISTS validation_reasoning TEXT;
ALTER TABLE sources ADD COLUMN IF NOT EXISTS confidence TEXT;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_sources_relevancy_score ON sources(relevancy_score DESC);
CREATE INDEX IF NOT EXISTS idx_sources_confidence ON sources(confidence);

-- Update comments for documentation
COMMENT ON COLUMN profiles.hard_context IS 'Context that must be true (certainties)';
COMMENT ON COLUMN profiles.soft_context IS 'Context that could be true (guidance)';
COMMENT ON COLUMN profiles.generated_context IS 'Accumulated knowledge from validated sources (LinkedIn, GitHub, Website, etc.)';
COMMENT ON COLUMN profiles.search_logs IS 'Logs from 4-phase search process (LinkedIn, GitHub, Website, General)';
COMMENT ON COLUMN sources.relevancy_score IS 'Validation score from 1-10';
COMMENT ON COLUMN sources.validation_reasoning IS 'Reasoning behind the validation score';
COMMENT ON COLUMN sources.confidence IS 'Confidence level: high, medium, or low';

