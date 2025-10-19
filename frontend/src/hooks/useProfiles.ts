import { useState, useEffect } from 'react';
import { Profile, Subject, ProfileResponse } from '../types';
import { createProfiles, createProfilesRevamped, createProfilesRevampedWithDebug, getAllProfiles, deleteProfile as apiDeleteProfile } from '../services/api';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const createNewProfiles = async (subjects: Subject[], useRevampedSearch: boolean = false, useDebugInterface: boolean = false): Promise<ProfileResponse & { debugData?: any[] }> => {
    try {
      setLoading(true);
      setError(null);
      let response: ProfileResponse & { debugData?: any[] };
      
      if (useRevampedSearch && useDebugInterface) {
        response = await createProfilesRevampedWithDebug(subjects);
      } else if (useRevampedSearch) {
        response = await createProfilesRevamped(subjects);
      } else {
        response = await createProfiles(subjects);
      }
      
      await fetchProfiles(); // Refresh the list
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profiles';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      setError(null);
      await apiDeleteProfile(id);
      setProfiles(profiles.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
      throw err;
    }
  };

  return {
    profiles,
    loading,
    error,
    createProfiles: createNewProfiles,
    deleteProfile,
    refreshProfiles: fetchProfiles,
  };
}

