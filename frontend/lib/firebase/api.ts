import { ApiResponse, ApiError } from '@/types/api';
import { auth } from './config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Define a type for serializable data
type SerializableData = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined
  | SerializableData[]
  | { [key: string]: SerializableData };

// More specific type for request bodies
type RequestBody = Record<string, SerializableData> | SerializableData[];

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async waitForAuth(): Promise<void> {
    return new Promise((resolve) => {
      if (auth.currentUser) {
        resolve();
        return;
      }

      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          unsubscribe();
          resolve();
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        unsubscribe();
        resolve();
      }, 10000);
    });
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Wait for auth to be ready
    await this.waitForAuth();
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await user.getIdToken(true); // Force refresh
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw new Error('Failed to get authentication token');
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'API request failed';
      
      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      // Throw specific error for SSL issues
      if (errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
        throw new Error('Secure connection failed. Please try again.');
      }
      
      throw new Error(errorMessage);
    }

    const data: ApiResponse<T> = await response.json();
    return data.data || (data as T);
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const err = error as Error;
        lastError = err;
        
        // Don't retry if it's an auth error
        if (err.message.includes('not authenticated')) {
          throw err;
        }
        
        // Wait before retrying
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
        }
      }
    }
    
    throw lastError || new Error('Operation failed after multiple retries');
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.executeWithRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      return this.handleResponse<T>(response);
    });
  }

  // Type-safe POST with proper constraints
  async post<T, TData extends RequestBody = RequestBody>(
    endpoint: string, 
    data?: TData
  ): Promise<T> {
    return this.executeWithRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    });
  }

  // Type-safe PUT with proper constraints
  async put<T, TData extends RequestBody = RequestBody>(
    endpoint: string, 
    data?: TData
  ): Promise<T> {
    return this.executeWithRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.executeWithRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      return this.handleResponse<T>(response);
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);