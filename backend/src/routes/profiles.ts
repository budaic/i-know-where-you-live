import { Router, Request, Response } from 'express';
import {
  createProfile as dbCreateProfile,
  getProfileById,
  getAllProfiles,
  deleteProfile,
} from '../services/database';
import { generateSearchQueries } from '../services/queryGenerator';
import {
  executeSearchBatch,
  filterViableResults,
  deduplicateResults,
} from '../services/searchService';
// import { extractContentBatch } from '../services/contentExtractor'; // Removed - using V2 implementation
import { summarizeSourcesBatch } from '../services/summarizer';
import { generateProfile } from '../services/profileGenerator';
import { ProfileRequest, ProfileResponse } from '../types';

const router = Router();

// Create new profile(s)
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { subjects }: ProfileRequest = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Invalid subjects array' });
    }

    const profiles = [];
    const errors = [];

    for (const subject of subjects) {
      try {
        console.log(`Processing subject: ${subject.name}`);

        // Step 1: Generate search queries
        console.log('  - Generating search queries...');
        const queries = await generateSearchQueries(subject);
        console.log(`  - Generated ${queries.length} queries`);

        // Step 2: Execute searches
        console.log('  - Executing searches...');
        const rawResults = await executeSearchBatch(queries);
        console.log(`  - Found ${rawResults.length} raw results`);

        // Filter and deduplicate
        const viableResults = filterViableResults(rawResults, subject.name);
        const uniqueResults = deduplicateResults(viableResults);
        console.log(`  - ${uniqueResults.length} viable unique results`);

        if (uniqueResults.length === 0) {
          errors.push(`No viable results found for ${subject.name}`);
          continue;
        }

        // Step 3: Extract content
        console.log('  - Extracting content...');
        // const contents = await extractContentBatch(uniqueResults); // Removed - using V2 implementation
        const contents: any[] = []; // Placeholder - this route is deprecated
        console.log(`  - Extracted ${contents.length} content sources`);

        // Step 4: Summarize sources
        console.log('  - Summarizing sources...');
        const summaries = await summarizeSourcesBatch(contents, subject.name);
        console.log(`  - Created ${summaries.length} summaries`);

        // Step 5: Generate profile
        console.log('  - Generating profile...');
        const profile = await generateProfile(subject, summaries);
        console.log(`  - Profile generated with ${profile.sources.length} sources`);

        // Step 6: Save to database
        console.log('  - Saving to database...');
        const savedProfile = await dbCreateProfile(profile);
        console.log(`  - Saved with ID: ${savedProfile.id}`);

        profiles.push(savedProfile);
      } catch (error) {
        console.error(`Error processing subject ${subject.name}:`, error);
        errors.push(`Error processing ${subject.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const response: ProfileResponse = {
      profiles,
      errors: errors.length > 0 ? errors : undefined,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /create endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get profile by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await getProfileById(id);
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(404).json({ 
      error: 'Profile not found',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all profiles
router.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = await getAllProfiles();
    res.json(profiles);
  } catch (error) {
    console.error('Error getting profiles:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete profile
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteProfile(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

