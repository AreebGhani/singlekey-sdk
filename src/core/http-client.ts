/**
 * HTTP client for making API requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { SingleKeyConfig, ErrorResponse } from '../types';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  APIError,
} from '../errors';

/**
 * Environment base URLs
 */
const ENVIRONMENT_URLS = {
  sandbox: 'https://sandbox.singlekey.com',
  production: 'https://platform.singlekey.com',
};

/**
 * HTTP client for SingleKey API
 */
export class HttpClient {
  private readonly axios: AxiosInstance;
  private readonly apiToken: string;
  private readonly debug: boolean;

  constructor(config: SingleKeyConfig) {
    this.apiToken = config.apiToken;
    this.debug = config.debug || false;

    const baseURL =
      config.baseUrl ||
      ENVIRONMENT_URLS[config.environment || 'production'];

    this.axios = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${this.apiToken}`,
      },
    });

    // Request interceptor for debugging
    if (this.debug) {
      this.axios.interceptors.request.use((request) => {
        console.log('[SingleKey SDK] Request:', {
          method: request.method?.toUpperCase(),
          url: request.url,
          data: request.data,
        });
        return request;
      });
    }

    // Response interceptor for debugging
    if (this.debug) {
      this.axios.interceptors.response.use(
        (response) => {
          console.log('[SingleKey SDK] Response:', {
            status: response.status,
            data: response.data,
          });
          return response;
        },
        (error) => {
          console.error('[SingleKey SDK] Error:', {
            status: error.response?.status,
            data: error.response?.data,
          });
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Make a PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Download binary data (for PDF downloads)
   */
  async download(url: string): Promise<{ data: Buffer; filename: string; contentType: string }> {
    try {
      const response: AxiosResponse<ArrayBuffer> = await this.axios.get(url, {
        responseType: 'arraybuffer',
      });

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : 'report.pdf';

      return {
        data: Buffer.from(response.data),
        filename,
        contentType: response.headers['content-type'] || 'application/pdf',
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Handle and transform Axios errors into SDK-specific errors
   */
  private handleError(error: AxiosError): Error {
    if (!error.response) {
      // Network error or timeout
      return new ServerError(`Network error: ${error.message}`);
    }

    const { status, data } = error.response;
    const errorData = data as ErrorResponse;
    const message = errorData?.detail || error.message;

    switch (status) {
      case 400:
        return new ValidationError(message, errorData?.errors || []);
      case 401:
        return new AuthenticationError(message);
      case 404:
        return new NotFoundError(message);
      case 429:
        return new RateLimitError(message);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, status);
      default:
        return new APIError(message, status, errorData);
    }
  }
}
