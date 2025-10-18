import axios from 'axios';
import { Subject, Profile, ProfileResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createProfiles = async (subjects: Subject[]): Promise<ProfileResponse> => {
  const response = await api.post<ProfileResponse>('/profiles/create', { subjects });
  return response.data;
};

export const getProfile = async (id: string): Promise<Profile> => {
  const response = await api.get<Profile>(`/profiles/${id}`);
  return response.data;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  const response = await api.get<Profile[]>('/profiles');
  return response.data;
};

export const deleteProfile = async (id: string): Promise<void> => {
  await api.delete(`/profiles/${id}`);
};

export default api;

