import { useState, useCallback } from 'react';
import { ShortenedUrl, UrlSubmissionData, AppError } from '../types';
import { urlService } from '../services/urlService';
import { log } from '../utils/logger';

interface UseUrlShortenerReturn {
  shortenedUrls: ShortenedUrl[];
  loading: boolean;
  error: AppError | null;
  shortenUrls: (urls: UrlSubmissionData[]) => Promise<void>;
  clearError: () => void;
  clearResults: () => void;
}

export const useUrlShortener = (): UseUrlShortenerReturn => {
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const shortenUrls = useCallback(async (urls: UrlSubmissionData[]) => {
    try {
      log.info('hook', `useUrlShortener: Starting to shorten ${urls.length} URLs`);
      setLoading(true);
      setError(null);
      
      const results = await urlService.shortenUrls(urls);
      setShortenedUrls(results);
      
      log.info('hook', `useUrlShortener: Successfully shortened ${results.length} URLs`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      const appError: AppError = {
        type: 'validation',
        message: errorMessage,
        details: 'Failed to shorten URLs'
      };
      
      setError(appError);
      log.error('hook', `useUrlShortener: Error shortening URLs - ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    log.debug('hook', 'useUrlShortener: Error cleared');
  }, []);

  const clearResults = useCallback(() => {
    setShortenedUrls([]);
    log.debug('hook', 'useUrlShortener: Results cleared');
  }, []);

  return {
    shortenedUrls,
    loading,
    error,
    shortenUrls,
    clearError,
    clearResults,
  };
};