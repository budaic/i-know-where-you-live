import { Router, Request, Response } from 'express';
import {
  createProfile as dbCreateProfile,
  getProfileById,
  getAllProfiles,
  deleteProfile,
} from '../services/database';
import { executeMultiPhaseSearch } from '../services/searchOrchestrator';
import { generateProfileFromLog } from '../services/profileGeneratorV2';
import { ProfileRequest, ProfileResponse } from '../types';

const router = Router();

// Create new profile(s) using the redesigned 4-phase system
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
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Processing subject: ${subject.name}`);
        console.log(`Hard Context: ${subject.hardContext}`);
        console.log(`Soft Context: ${subject.softContext}`);
        console.log(`${'='.repeat(60)}\n`);

        // Execute 4-phase search
        const searchLog = await executeMultiPhaseSearch(
          subject.name,
          subject.hardContext,
          subject.softContext
        );

        // Generate profile from search log
        const profile = await generateProfileFromLog(searchLog);

        console.log('\n--- Saving to database ---');
        const savedProfile = await dbCreateProfile(profile);
        console.log(`Saved with ID: ${savedProfile.id}\n`);

        profiles.push(savedProfile);
      } catch (error) {
        console.error(`Error processing subject ${subject.name}:`, error);
        errors.push(
          `Error processing ${subject.name}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
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
      message: error instanceof Error ? error.message : 'Unknown error',
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
      message: error instanceof Error ? error.message : 'Unknown error',
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
      message: error instanceof Error ? error.message : 'Unknown error',
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
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

