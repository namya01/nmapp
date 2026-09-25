/**
 * API Client & Network Service
 * Handles base URLs, Bearer token injection, automatic 45-day session refresh,
 * and session expiry listeners for SessionExpiryModal.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Committee, Department, EventRecap, Tag, OcrVerificationResult } from '../types';

// Default backend API URL (supports local dev or custom backend)
export const API_BASE_URL = 'http://localhost:5000/api';

// In-memory token cache for high-speed access
let currentAccessToken: string | null = null;
let sessionExpiryCallback: (() => void) | null = null;

export function setSessionExpiryListener(cb: () => void) {
  sessionExpiryCallback = cb;
}

export async function getAccessToken(): Promise<string | null> {
  if (currentAccessToken) return currentAccessToken;
  try {
    currentAccessToken = await AsyncStorage.getItem('access_token');
  } catch {
    // web fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      currentAccessToken = window.localStorage.getItem('access_token');
    }
  }
  return currentAccessToken;
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('refresh_token');
  } catch {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('refresh_token');
    }
  }
  return null;
}

export async function storeTokens(accessToken: string, refreshToken: string) {
  currentAccessToken = accessToken;
  try {
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('refresh_token', refreshToken);
  } catch {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('access_token', accessToken);
      window.localStorage.setItem('refresh_token', refreshToken);
    }
  }
}

export async function clearTokens() {
  currentAccessToken = null;
  try {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  } catch {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');
    }
  }
}

/**
 * Core HTTP Request wrapper with auto-token and 45-day refresh handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err: any) {
    throw new Error('Network connection error: ' + err.message);
  }

  // Handle Token Expiry & Refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.access_token) {
          await storeTokens(refreshData.access_token, refreshToken);
          // Retry original request with fresh access token
          headers['Authorization'] = `Bearer ${refreshData.access_token}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh rejected (e.g. 45-day TTL expired!)
          await clearTokens();
          if (sessionExpiryCallback) {
            sessionExpiryCallback();
          }
          throw new Error(refreshData.error || 'Your 45-day security session has expired. Please sign in again.');
        }
      } catch (refreshErr) {
        await clearTokens();
        if (sessionExpiryCallback) {
          sessionExpiryCallback();
        }
        throw refreshErr;
      }
    } else {
      if (sessionExpiryCallback) {
        sessionExpiryCallback();
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err: any = new Error(errorMsg);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data as T;
}

// ======================== API Methods ========================

export const api = {
  // Auth & Onboarding
  auth: {
    registerStep1: (payload: { full_name: string; college_email: string; id_card_url?: string }) =>
      request<{ success: boolean; data: any }>('/auth/register/step1', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    verifyId: (payload: { id_card_url?: string; file_buffer?: string; college_email: string; customOcrText?: string }) =>
      request<{ success: boolean; verified: boolean; details: OcrVerificationResult }>('/auth/verify-id', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    registerStep2: (payload: {
      full_name: string;
      college_email: string;
      username: string;
      password: string;
      id_card_url?: string;
      role?: string;
    }) =>
      request<{
        success: boolean;
        access_token: string;
        refresh_token: string;
        expires_at: string;
        user: User;
      }>('/auth/register/step2', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    login: (credentials: { username: string; password: string }) =>
      request<{
        success: boolean;
        access_token: string;
        refresh_token: string;
        expires_at: string;
        user: User;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

    refresh: (refreshToken: string) =>
      request<{
        success: boolean;
        access_token: string;
        user: User;
        session_expires_at: string;
      }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken })
      }),

    logout: (refreshToken?: string | null) =>
      request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken })
      })
  },

  // User Profile
  users: {
    getMe: () => request<{ success: boolean; user: User }>('/users/me'),

    updateMe: (payload: { full_name?: string; tags?: (string | Tag)[] }) =>
      request<{ success: boolean; user: User }>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),

    uploadAvatar: (payload: { avatar_url?: string; file_name?: string }) =>
      request<{ success: boolean; avatar_url: string; user?: User }>('/users/me/avatar', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    uploadCv: (payload: { cv_url?: string; file_name?: string }) =>
      request<{ success: boolean; cv_url: string; cv_uploaded_at: string; user?: User }>('/users/me/cv', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    getTags: (type?: 'skill' | 'interest') =>
      request<{ success: boolean; count: number; tags: Tag[] }>(
        type ? `/users/tags?type=${type}` : '/users/tags'
      )
  },

  // Committees & Departments
  committees: {
    getAll: () => request<{ success: boolean; count: number; committees: Committee[] }>('/committees'),

    getDepartments: (committeeId: string) =>
      request<{ success: boolean; committee: Committee; departments: Department[] }>(
        `/committees/${committeeId}/departments`
      ),

    getDepartment: (departmentId: string) =>
      request<{ success: boolean; department: Department }>(`/committees/departments/${departmentId}`)
  },

  // Events & Recaps
  events: {
    getFeed: () => request<{ success: boolean; count: number; events: EventRecap[] }>('/events/feed'),

    getByCommittee: (committeeId: string) =>
      request<{ success: boolean; committee_id: string; events: EventRecap[] }>(
        `/events/committees/${committeeId}/events`
      ),

    getDetail: (eventId: string) =>
      request<{ success: boolean; event: EventRecap }>(`/events/${eventId}`),

    createEvent: (
      committeeId: string,
      payload: {
        title: string;
        event_date?: string;
        description: string;
        achievements?: string;
        stats?: Record<string, any>;
        media_urls?: string[];
      }
    ) =>
      request<{ success: boolean; message: string; event: EventRecap }>(
        `/events/committees/${committeeId}/events`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      ),

    addMedia: (eventId: string, media_url: string) =>
      request<{ success: boolean; media: any }>(`/events/${eventId}/media`, {
        method: 'POST',
        body: JSON.stringify({ media_url })
      })
  }
};
