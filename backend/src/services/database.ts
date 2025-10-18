import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { Profile, Source } from '../types';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Use service role key if available (bypasses RLS), otherwise use anon key
    const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
    supabaseClient = createClient(
      config.supabase.url,
      key
    );
  }
  return supabaseClient;
}

export async function createProfile(profile: Profile): Promise<Profile> {
  const supabase = getSupabaseClient();

  // Insert profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      name: profile.name,
      aliases: profile.aliases,
      profile_summary: profile.profileSummary,
    })
    .select()
    .single();

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  const profileId = profileData.id;

  // Insert sources
  if (profile.sources.length > 0) {
    const sourcesData = profile.sources.map((source) => ({
      profile_id: profileId,
      url: source.url,
      site_summary: source.siteSummary,
      depth: source.depth,
    }));

    const { error: sourcesError } = await supabase
      .from('sources')
      .insert(sourcesData);

    if (sourcesError) {
      throw new Error(`Failed to create sources: ${sourcesError.message}`);
    }
  }

  return getProfileById(profileId);
}

export async function getProfileById(id: string): Promise<Profile> {
  const supabase = getSupabaseClient();

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError) {
    throw new Error(`Failed to get profile: ${profileError.message}`);
  }

  const { data: sourcesData, error: sourcesError } = await supabase
    .from('sources')
    .select('*')
    .eq('profile_id', id)
    .order('depth', { ascending: true });

  if (sourcesError) {
    throw new Error(`Failed to get sources: ${sourcesError.message}`);
  }

  return {
    id: profileData.id,
    name: profileData.name,
    aliases: profileData.aliases || [],
    profileSummary: profileData.profile_summary,
    sources: sourcesData.map((source) => ({
      id: source.id,
      profileId: source.profile_id,
      url: source.url,
      siteSummary: source.site_summary,
      depth: source.depth,
      createdAt: new Date(source.created_at),
    })),
    createdAt: new Date(profileData.created_at),
  };
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = getSupabaseClient();

  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    throw new Error(`Failed to get profiles: ${profilesError.message}`);
  }

  const profiles: Profile[] = [];

  for (const profileData of profilesData) {
    const { data: sourcesData } = await supabase
      .from('sources')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('depth', { ascending: true });

    profiles.push({
      id: profileData.id,
      name: profileData.name,
      aliases: profileData.aliases || [],
      profileSummary: profileData.profile_summary,
      sources: (sourcesData || []).map((source) => ({
        id: source.id,
        profileId: source.profile_id,
        url: source.url,
        siteSummary: source.site_summary,
        depth: source.depth,
        createdAt: new Date(source.created_at),
      })),
      createdAt: new Date(profileData.created_at),
    });
  }

  return profiles;
}

export async function deleteProfile(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Delete sources first (foreign key constraint)
  const { error: sourcesError } = await supabase
    .from('sources')
    .delete()
    .eq('profile_id', id);

  if (sourcesError) {
    throw new Error(`Failed to delete sources: ${sourcesError.message}`);
  }

  // Delete profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (profileError) {
    throw new Error(`Failed to delete profile: ${profileError.message}`);
  }
}

