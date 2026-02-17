// src/services/api.ts

// Use the Render URL from .env, or fallback to localhost for development
const API_BASE_URL = 'https://github-repo-explorer-6pzn.onrender.com';

export const apiRequest = async (endpoint: string, method: string, body?: any) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }
  return response.json();
};