/**
 * API REFERENCE FILE
 * 
 * This file is kept for reference purposes.
 * We're using axios directly in components for simplicity and interview clarity.
 * 
 * This approach with centralized axios instance and interceptors is more scalable
 * for production apps, but for this project we keep it simple.
 */

import axios, { AxiosError } from 'axios';
import { serverUrl } from '../config/urls';

// Create axios instance
export const api = axios.create({
    baseURL: serverUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.message);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // Server error
            return error.response.data?.message || error.response.data?.error || 'Server error occurred';
        } else if (error.request) {
            // Network error
            return 'Network error. Please check your connection and try again.';
        }
    }
    return 'An unexpected error occurred. Please try again.';
};