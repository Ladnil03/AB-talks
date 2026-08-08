import { CandidateProfile, InterviewRequest, InterviewResponse } from '../types/interview';

/**
 * Centralized API Base URL configuration.
 * Reads `VITE_API_BASE_URL` at Vite build/runtime. Normalizes trailing slashes and trims whitespace.
 * Falls back to 'http://localhost:8000' strictly for local dev when the env var is undefined.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL: string = (
  typeof rawBaseUrl === 'string' && rawBaseUrl.trim() !== ''
    ? rawBaseUrl.trim().replace(/\/+$/, '')
    : 'http://localhost:8000'
);

export async function fetchCandidates(): Promise<CandidateProfile[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/candidates`);
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.warn(`Could not fetch candidates from backend at ${API_BASE_URL}, falling back to defaults:`, err);
    return [];
  }
}

export async function sendInterviewTurn(payload: InterviewRequest): Promise<InterviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

