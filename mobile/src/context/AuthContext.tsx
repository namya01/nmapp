/**
 * Global Authentication & Session Context
 * Manages user authentication state, 45-day session management,
 * profile synchronization, and RBAC permission checks.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CommitteeMembership } from '../types';
import {
  api,
  storeTokens,
  clearTokens,
  getRefreshToken,
  setSessionExpiryListener
} from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  dismissSessionExpiry: () => void;
  hasCommitteeAccess: (committeeId?: string, departmentId?: string) => boolean;
  quickSwitchUser: (type: 'student' | 'committee_lead' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  // Initialize session on mount
  useEffect(() => {
    // Register 45-day session expiry listener
    setSessionExpiryListener(() => {
      setUser(null);
      setSessionExpired(true);
    });

    async function checkSession() {
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          // Attempt refresh
          const res = await api.auth.refresh(refreshToken);
          if (res.user) {
            setUser(res.user);
          }
        }
      } catch (err: any) {
        console.log('[Auth] No active session or session expired:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ username, password });
      await storeTokens(res.access_token, res.refresh_token);
      setUser(res.user);
      setSessionExpired(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.registerStep2(payload);
      await storeTokens(res.access_token, res.refresh_token);
      setUser(res.user);
      setSessionExpired(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = await getRefreshToken();
    try {
      await api.auth.logout(refreshToken);
    } catch (e) {
      // ignore
    } finally {
      await clearTokens();
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.users.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.warn('[Auth] Failed to refresh profile:', e);
    }
  };

  const dismissSessionExpiry = () => {
    setSessionExpired(false);
  };

  /**
   * RBAC Helper: Checks if authenticated user has permission to edit
   * a specific committee or department recap.
   */
  const hasCommitteeAccess = (committeeId?: string, departmentId?: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    if (!user.committee_memberships || user.committee_memberships.length === 0) {
      return false;
    }

    return user.committee_memberships.some((m: CommitteeMembership) => {
      if (departmentId && m.department_id === departmentId) return true;
      if (committeeId && m.committee_id === committeeId) return true;
      return false;
    });
  };

  /**
   * Fast switcher for easy testing of Student vs Committee Lead vs Admin roles
   */
  const quickSwitchUser = async (type: 'student' | 'committee_lead' | 'admin') => {
    if (type === 'student') {
      await login('rohan_student', 'Password123!');
    } else if (type === 'committee_lead') {
      await login('jane_events', 'Password123!');
    } else if (type === 'admin') {
      await login('admin', 'Password123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sessionExpired,
        login,
        register,
        logout,
        refreshProfile,
        dismissSessionExpiry,
        hasCommitteeAccess,
        quickSwitchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
