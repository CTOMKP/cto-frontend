import axios from 'axios';
import { apiGet, apiPut } from '@/lib/apiClient';
import { LoginCredentials, SignUpCredentials, AuthResponse, User } from '../types/auth.types';
import { API_ENDPOINTS } from '../utils/constants';
import { handleApiError } from '../utils/helpers';
import { clearRewardData, getStoredRewardData, persistRewardData } from '../utils/rewardStorage';
import {
  clearSessionStorage,
  getAuthToken,
  PROFILE_AVATAR_URL_KEY,
  setAuthToken,
  USER_AVATAR_URL_KEY,
  USER_CREATED_KEY,
  USER_EMAIL_KEY,
  USER_ID_KEY,
  USER_NAME_KEY,
  WALLET_ID_KEY,
  clearAuthToken,
} from '@/lib/authSession';

class AuthService {
  private baseUrl: string;
  private isProduction: boolean;

  constructor() {
    this.baseUrl = API_ENDPOINTS.auth.base;
    // Use real auth if Circle API is configured (even in local development)
    this.isProduction = !!(process.env.REACT_APP_CIRCLE_API_KEY && 
                           process.env.REACT_APP_CIRCLE_APP_ID);
    
    if (this.isProduction) {
      console.log('Using production authentication services with Circle API.');
    } else {
      console.log('Circle API not configured - authentication will fail.');
    }
  }

  private getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private getToken(): string | null {
    return getAuthToken();
  }

  private setToken(token: string): void {
    setAuthToken(token);
  }

  private removeToken(): void {
    clearAuthToken();
  }

  private parseUpdatedUserFromResponse(body: unknown): User | null {
    if (!body || typeof body !== "object") return null;
    const o = body as Record<string, unknown>;
    if ("user" in o && o.user && typeof o.user === "object") {
      return o.user as User;
    }
    const nested = o.data;
    if (nested && typeof nested === "object") {
      const inner = nested as Record<string, unknown>;
      if ("user" in inner && inner.user && typeof inner.user === "object") {
        return inner.user as User;
      }
      if ("email" in inner && typeof inner.email === "string") {
        return nested as User;
      }
    }
    return null;
  }

  private applyUserProfileToStorage(profileData: User): void {
    if (profileData.id) localStorage.setItem(USER_ID_KEY, String(profileData.id));
    localStorage.setItem(USER_EMAIL_KEY, profileData.email);
    if (profileData.name) {
      localStorage.setItem(USER_NAME_KEY, profileData.name);
    } else if (Object.prototype.hasOwnProperty.call(profileData, "name")) {
      localStorage.removeItem(USER_NAME_KEY);
    }
    if (profileData.createdAt) {
      localStorage.setItem(USER_CREATED_KEY, profileData.createdAt);
    }
    if (profileData.walletId) {
      localStorage.setItem(WALLET_ID_KEY, profileData.walletId);
    }
    if (profileData.avatarUrl) {
      localStorage.setItem(USER_AVATAR_URL_KEY, profileData.avatarUrl);
      localStorage.setItem(PROFILE_AVATAR_URL_KEY, profileData.avatarUrl);
    }
    persistRewardData(profileData);
  }

  /**
   * Loads `/api/v1/auth/profile` via shared fetch client; persists snapshot to session storage.
   * Throws on HTTP failure (e.g. `ApiError` from `apiClient`) or invalid payload so TanStack Query can surface errors.
   */
  async fetchProfile(signal?: AbortSignal): Promise<User> {
    const body = await apiGet<{ data?: User }>(`/api/v1/auth/profile`, {
      signal,
      clearSessionOn401: true,
    });
    const profile = body?.data;
    if (!profile?.email) {
      throw new Error("Profile response is missing user email.");
    }

    this.applyUserProfileToStorage(profile);
    return profile;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
      
      // Use the simple login endpoint
      const response = await axios.post(
        `${backendUrl}/api/circle/users/login`,
        {
          userId: credentials.email,
          password: credentials.password
        }
      );
      
      console.log('🔍 Response received:', response.status, response.data);
      
      if (response.data.success) {
        // Login successful, store token and return user info
        const { token, user } = response.data;
        this.setToken(token);
        let profile: User | null = null;
        try {
          profile = await this.fetchProfile();
        } catch (e) {
          console.warn("Profile fetch after login failed; using login payload:", e);
        }
        const resolvedUser = profile ?? (user as User);
        
        return {
          user: resolvedUser,
          token,
          message: 'Login successful'
        };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('🚨 Login failed:', error);
      console.error('🚨 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        isAxiosError: axios.isAxiosError(error),
        hasResponse: axios.isAxiosError(error) ? !!error.response : false,
        hasRequest: axios.isAxiosError(error) ? !!error.request : false,
      });
      
      // Handle axios errors with specific status codes
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const { status, data } = error.response;
          console.error('🚨 Response error:', { status, data });
          
          switch (status) {
            case 400:
              throw new Error('Invalid request. Please check your input.');
            case 401:
              throw new Error('Invalid email or password. Please check your credentials.');
            case 404:
              throw new Error('User not found. Please check your email address.');
            case 500:
              throw new Error('Server error. Please try again later.');
            default:
              throw new Error(data?.error || `Login failed with status ${status}`);
          }
        } else if (error.request) {
          throw new Error('Unable to connect to server. Please check your internet connection.');
        } else {
          throw new Error('Login request failed. Please try again.');
        }
      }
      
      // Handle other types of errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to login: ${errorMessage}`);
    }
  }

  async signup(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      // Use our Circle backend for user creation
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
      
      const response = await axios.post(
        `${backendUrl}/api/circle/users`,
        {
          userId: credentials.email, // Use email as userId
          email: credentials.email,
          password: credentials.password
        }
      );
      
      console.log('🔍 Signup response received:', response.status, response.data);
      
      if (response.data.success) {
        // Account created successfully, but no token yet (user needs to login)
        // Store user info in localStorage for now
        localStorage.setItem(USER_EMAIL_KEY, credentials.email);
        localStorage.setItem(USER_CREATED_KEY, new Date().toISOString());
        
        const user: User = {
          id: credentials.email, // Use email as ID
          email: credentials.email,
          walletId: '', // Will be set when wallet is created
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return {
          user,
          token: '', // No token on signup - user must login
          message: 'Account created successfully. Please login to continue.'
        };
      } else {
        throw new Error(response.data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('🚨 Circle API failed:', error);
      console.error('🚨 Signup Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        isAxiosError: axios.isAxiosError(error),
        hasResponse: axios.isAxiosError(error) ? !!error.response : false,
        hasRequest: axios.isAxiosError(error) ? !!error.request : false,
        code: axios.isAxiosError(error) ? error.code : 'N/A',
      });
      
      // Check if this is a user already exists error (409 Conflict)
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw new Error('Account already exists. Please login instead.');
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create user with Circle: ${errorMessage}`);
    }
  }

  async logout(): Promise<void> {
    clearSessionStorage();
    clearRewardData();
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    
    if (!token) return null;

    try {
      return await this.fetchProfile();
    } catch {
      // Network / server error — use cached snapshot when possible
    }

    // Fallback to localStorage if profile fetch fails
    const email = localStorage.getItem(USER_EMAIL_KEY);
    if (!email) return null;

    return {
      id: email,
      email: email,
      walletId: localStorage.getItem(WALLET_ID_KEY) || '',
      name: localStorage.getItem(USER_NAME_KEY) || undefined,
      ...getStoredRewardData(),
      createdAt: localStorage.getItem(USER_CREATED_KEY) || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateUser(_userId: string, updates: Partial<User>): Promise<User> {
    const raw = await apiPut<unknown>(`/api/v1/auth/users/me`, updates, {
      clearSessionOn401: true,
    });
    const updatedUser = this.parseUpdatedUserFromResponse(raw);
    if (!updatedUser) {
      throw new Error("Invalid update profile response.");
    }
    if (updatedUser?.name) {
      localStorage.setItem(USER_NAME_KEY, updatedUser.name);
    } else if (Object.prototype.hasOwnProperty.call(updatedUser || {}, "name")) {
      localStorage.removeItem(USER_NAME_KEY);
    }
    if (updatedUser?.avatarUrl) {
      localStorage.setItem(USER_AVATAR_URL_KEY, updatedUser.avatarUrl);
      localStorage.setItem(PROFILE_AVATAR_URL_KEY, updatedUser.avatarUrl);
    }
    persistRewardData(updatedUser);
    return updatedUser;
  }

  async forgotPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
      
      const response = await axios.post(
        `${backendUrl}/api/circle/users/forgot-password`,
        {
          userId: userId,
          newPassword: newPassword
        }
      );
      
      if (!response.data.success) {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to reset password: ${errorMessage}`);
    }
  }

  async refreshToken(): Promise<{ access_token: string; expires_in: number }> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';
      const currentToken = this.getToken();
      
      if (!currentToken) {
        throw new Error('No token to refresh');
      }

      const response = await axios.post(
        `${backendUrl}/api/v1/auth/refresh`,
        {},
        { headers: this.getHeaders() }
      );

      if (response.data.access_token) {
        this.setToken(response.data.access_token);
        return response.data;
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.removeToken();
      throw error;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();
export default authService;
