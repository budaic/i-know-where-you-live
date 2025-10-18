import axios from 'axios';
import { Subject, Profile, ProfileResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createProfiles = async (subjects: Subject[], sessionId?: string): Promise<ProfileResponse> => {
  const response = await api.post<ProfileResponse>('/profiles/create', { subjects, sessionId });
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

// Session management APIs
export const getAllSessions = async (): Promise<any[]> => {
  const response = await api.get('/profiles/sessions');
  return response.data.sessions;
};

export const getSession = async (sessionId: string): Promise<any> => {
  const response = await api.get(`/profiles/sessions/${sessionId}`);
  return response.data;
};

export const recoverSession = async (sessionId: string): Promise<any> => {
  const response = await api.post(`/profiles/sessions/${sessionId}/recover`);
  return response.data;
};

export default api;

