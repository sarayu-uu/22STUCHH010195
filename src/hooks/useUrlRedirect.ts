import { useState, useCallback } from 'react';
import { AppError } from '../types';
import { urlService } from '../services/urlService';
import { log } from '../utils/logger';

interface UseUrlRedirectReturn {
  loading: boolean;
  error: AppError | null;
  redirectToUrl: (shortCode: string) => Promise<string | null>;
  clearError: () => void;
}

export const useUrlRedirect = (): UseUrlRedirectReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const redirectToUrl = useCallback(async (shortCode: string): Promise<string | null> => {
    try {
      log.info('hook', `useUrlRedirect: Attempting redirect for shortcode: ${shortCode}`);
      setLoading(true);
      setError(null);
      
      const originalUrl = await urlService.redirectToOriginal(shortCode);
      
      log.info('hook', `useUrlRedirect: Successful redirect to ${originalUrl}`);
      return originalUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      let errorType: AppError['type'] = 'unknown';
      
      if (errorMessage.includes('not found')) {
        errorType = 'validation';
      } else if (errorMessage.includes('expired')) {
        errorType = 'expired';
      }
      
      const appError: AppError = {
        type: errorType,
        message: errorMessage,
        details: `Failed to redirect shortcode: ${shortCode}`
      };
      
      setError(appError);
      log.error('hook', `useUrlRedirect: Error redirecting ${shortCode} - ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    log.debug('hook', 'useUrlRedirect: Error cleared');
  }, []);

  return {
    loading,
    error,
    redirectToUrl,
    clearError,
  };
};