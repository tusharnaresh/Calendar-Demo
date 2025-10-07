import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { REQUEST_TIMEOUT } from './constants';
import { StorageService } from './storage';

/**
 * Axios client with automatic token injection and retry logic
 */
class APIClient {
  private client: AxiosInstance;
  private retryConfig = {
    maxRetries: 2,
    retryDelay: 2000,
    retryOn401: true,
    retryOn5xx: true,
  };

  constructor() {
    this.client = axios.create({
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Serialize params to JSON strings if they're objects
        if (config.params) {
          const serializedParams: Record<string, any> = {};
          Object.entries(config.params).forEach(([key, value]) => {
            serializedParams[key] = 
              value && typeof value === 'object' 
                ? JSON.stringify(value) 
                : value;
          });
          config.params = serializedParams;
        }

        // Add authorization token
        if (config.headers.Authorization === 'ADD_TOKEN') {
          const accessToken = await StorageService.getAccessToken();
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          } else {
            throw new Error('No access token available');
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const config = error.config as InternalAxiosRequestConfig & { 
          __retryCount?: number 
        };

        if (!config) {
          return Promise.reject(error);
        }

        // Handle canceled requests
        if (axios.isCancel(error) || error.message === 'canceled') {
          return Promise.reject(new Error(`Request canceled: ${config.url}`));
        }

        const status = error.response?.status;
        config.__retryCount = config.__retryCount || 0;

        // Determine max retries based on status
        let maxRetry = 0;
        if (status === 401 && this.retryConfig.retryOn401) {
          maxRetry = 1;
        } else if (status >= 500 && status <= 599 && this.retryConfig.retryOn5xx) {
          maxRetry = this.retryConfig.maxRetries;
        }

        // If max retries exceeded, reject
        if (config.__retryCount >= maxRetry) {
          return Promise.reject(error);
        }

        config.__retryCount += 1;

        // Retry with delay
        const delay = status === 401 ? 5000 : this.retryConfig.retryDelay;
        
        // Refresh token on 401
        if (status === 401) {
          const accessToken = await StorageService.getAccessToken();
          if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.client.request(config);
      }
    );
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }
}

export const apiClient = new APIClient();
