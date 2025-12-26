import { apiClient } from '@/lib/api-client';
import { LoginCredentials, User, ApiResponse } from '@/types';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }
    
    return response.data;
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    }
  }

  static async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Token refresh failed');
    }
    
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user info');
    }
    
    return response.data;
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Profile update failed');
    }
    
    return response.data;
  }
}