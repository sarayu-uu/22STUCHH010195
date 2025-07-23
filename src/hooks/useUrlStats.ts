import { useState, useEffect, useCallback } from 'react';
import { ShortenedUrl } from '../types';
import { urlService } from '../services/urlService';
import { log } from '../utils/logger';

interface UseUrlStatsReturn {
  urls: ShortenedUrl[];
  loading: boolean;
  refreshStats: () => void;
  getUrlByShortCode: (shortCode: string) => ShortenedUrl | undefined;
}

export const useUrlStats = (): UseUrlStatsReturn => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    try {
      log.info('hook', 'useUrlStats: Loading URL statistics');
      setLoading(true);
      
      const allUrls = urlService.getAllUrls();
      setUrls(allUrls);
      
      log.info('hook', `useUrlStats: Loaded ${allUrls.length} URLs`);
    } catch (error) {
      log.error('hook', `useUrlStats: Error loading statistics - ${error}`);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    log.info('hook', 'useUrlStats: Refreshing statistics');
    loadStats();
  }, [loadStats]);

  const getUrlByShortCode = useCallback((shortCode: string): ShortenedUrl | undefined => {
    const url = urls.find(u => u.shortCode === shortCode);
    if (url) {
      log.debug('hook', `useUrlStats: Found URL for shortcode ${shortCode}`);
    } else {
      log.warn('hook', `useUrlStats: No URL found for shortcode ${shortCode}`);
    }
    return url;
  }, [urls]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      log.debug('hook', 'useUrlStats: Auto-refreshing statistics');
      loadStats();
    }, 30000);

    return () => {
      clearInterval(interval);
      log.debug('hook', 'useUrlStats: Auto-refresh interval cleared');
    };
  }, [loadStats]);

  return {
    urls,
    loading,
    refreshStats,
    getUrlByShortCode,
  };
};