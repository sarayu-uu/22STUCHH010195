import { ShortenedUrl, UrlSubmissionData, ClickData, GeolocationData } from '../types';
import { storageService } from '../utils/storage';
import { validationService } from '../utils/validation';
import { log } from '../utils/logger';

export class UrlService {
  private static instance: UrlService;

  static getInstance(): UrlService {
    if (!UrlService.instance) {
      UrlService.instance = new UrlService();
    }
    return UrlService.instance;
  }

  private constructor() {
    log.info('api', 'URL service initialized');
  }

  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    do {
      result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (storageService.isShortCodeExists(result));
    
    return result;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async shortenUrl(data: UrlSubmissionData): Promise<ShortenedUrl> {
    try {
      log.info('api', `Attempting to shorten URL: ${data.url}`);
      
      const errors = validationService.validateUrlSubmission(data);
      if (errors.length > 0) {
        const errorMessages = errors.map(e => e.message).join(', ');
        log.error('api', `URL shortening failed validation: ${errorMessages}`);
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      const shortCode = data.customShortCode || this.generateShortCode();
      const validityMinutes = data.validityMinutes || 30;
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60 * 1000);

      const shortenedUrl: ShortenedUrl = {
        id: this.generateId(),
        originalUrl: data.url,
        shortCode,
        createdAt,
        expiresAt,
        validityMinutes,
        clicks: [],
        isExpired: false,
      };

      storageService.saveUrl(shortenedUrl);
      log.info('api', `URL shortened successfully: ${data.url} -> ${shortCode}`);
      
      return shortenedUrl;
    } catch (error) {
      log.error('api', `Failed to shorten URL: ${error}`);
      throw error;
    }
  }

  async shortenUrls(urls: UrlSubmissionData[]): Promise<ShortenedUrl[]> {
    try {
      log.info('api', `Attempting to shorten ${urls.length} URLs`);
      
      const batchErrors = validationService.validateUrlBatch(urls);
      if (Object.keys(batchErrors).length > 0) {
        const errorCount = Object.keys(batchErrors).length;
        log.error('api', `Batch URL shortening failed validation for ${errorCount} URLs`);
        throw new Error('Batch validation failed');
      }

      const results: ShortenedUrl[] = [];
      
      for (const urlData of urls) {
        try {
          const result = await this.shortenUrl(urlData);
          results.push(result);
        } catch (error) {
          log.error('api', `Failed to shorten individual URL in batch: ${urlData.url}`);
          throw error;
        }
      }

      log.info('api', `Successfully shortened ${results.length} URLs`);
      return results;
    } catch (error) {
      log.error('api', `Batch URL shortening failed: ${error}`);
      throw error;
    }
  }

  async redirectToOriginal(shortCode: string): Promise<string> {
    try {
      log.info('api', `Attempting to redirect shortcode: ${shortCode}`);
      
      const url = storageService.getUrlByShortCode(shortCode);
      
      if (!url) {
        log.warn('api', `Shortcode not found: ${shortCode}`);
        throw new Error('Short URL not found');
      }

      if (url.isExpired) {
        log.warn('api', `Attempted to access expired shortcode: ${shortCode}`);
        throw new Error('This short URL has expired');
      }

      // Record the click
      const clickData: ClickData = {
        timestamp: new Date(),
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        geolocation: await this.getMockGeolocation(),
      };

      storageService.addClick(shortCode, clickData);
      log.info('api', `Successful redirect: ${shortCode} -> ${url.originalUrl}`);
      
      return url.originalUrl;
    } catch (error) {
      log.error('api', `Redirect failed for shortcode ${shortCode}: ${error}`);
      throw error;
    }
  }

  private async getMockGeolocation(): Promise<GeolocationData> {
    // Mock geolocation data since we can't access real geolocation without user permission
    const mockLocations = [
      { country: 'United States', city: 'New York', ip: '192.168.1.1' },
      { country: 'United Kingdom', city: 'London', ip: '192.168.1.2' },
      { country: 'Germany', city: 'Berlin', ip: '192.168.1.3' },
      { country: 'France', city: 'Paris', ip: '192.168.1.4' },
      { country: 'Japan', city: 'Tokyo', ip: '192.168.1.5' },
    ];
    
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  }

  getAllUrls(): ShortenedUrl[] {
    try {
      const urls = storageService.getAllUrls();
      log.info('api', `Retrieved ${urls.length} URLs from storage`);
      return urls;
    } catch (error) {
      log.error('api', `Failed to retrieve URLs: ${error}`);
      return [];
    }
  }

  getUrlStats(shortCode: string): ShortenedUrl | null {
    try {
      const url = storageService.getUrlByShortCode(shortCode);
      if (url) {
        log.info('api', `Retrieved stats for shortcode: ${shortCode}`);
      } else {
        log.warn('api', `Stats requested for non-existent shortcode: ${shortCode}`);
      }
      return url;
    } catch (error) {
      log.error('api', `Failed to retrieve stats for ${shortCode}: ${error}`);
      return null;
    }
  }

  cleanupExpiredUrls(): void {
    try {
      storageService.clearExpiredUrls();
      log.info('api', 'Expired URLs cleanup completed');
    } catch (error) {
      log.error('api', `Failed to cleanup expired URLs: ${error}`);
    }
  }
}

export const urlService = UrlService.getInstance();