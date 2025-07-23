import { ShortenedUrl, ClickData } from '../types';
import { log } from './logger';

const STORAGE_KEY = 'url_shortener_data';

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private constructor() {
    log.info('api', 'Storage service initialized');
  }

  saveUrl(url: ShortenedUrl): void {
    try {
      const existingData = this.getAllUrls();
      const updatedData = [...existingData.filter(u => u.id !== url.id), url];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      log.info('api', `URL saved to storage: ${url.shortCode}`);
    } catch (error) {
      log.error('api', `Failed to save URL to storage: ${error}`);
      throw new Error('Failed to save URL');
    }
  }

  getAllUrls(): ShortenedUrl[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const urls = JSON.parse(data);
      return urls.map((url: any) => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiresAt: new Date(url.expiresAt),
        clicks: url.clicks.map((click: any) => ({
          ...click,
          timestamp: new Date(click.timestamp)
        }))
      }));
    } catch (error) {
      log.error('api', `Failed to retrieve URLs from storage: ${error}`);
      return [];
    }
  }

  getUrlByShortCode(shortCode: string): ShortenedUrl | null {
    try {
      const urls = this.getAllUrls();
      const url = urls.find(u => u.shortCode === shortCode);
      
      if (url) {
        // Check if expired
        const now = new Date();
        if (now > url.expiresAt) {
          url.isExpired = true;
          this.saveUrl(url);
          log.warn('api', `Accessed expired URL: ${shortCode}`);
        }
      }
      
      return url || null;
    } catch (error) {
      log.error('api', `Failed to retrieve URL by shortcode: ${error}`);
      return null;
    }
  }

  addClick(shortCode: string, clickData: ClickData): void {
    try {
      const url = this.getUrlByShortCode(shortCode);
      if (url && !url.isExpired) {
        url.clicks.push(clickData);
        this.saveUrl(url);
        log.info('api', `Click recorded for ${shortCode}`);
      }
    } catch (error) {
      log.error('api', `Failed to record click: ${error}`);
    }
  }

  isShortCodeExists(shortCode: string): boolean {
    try {
      const urls = this.getAllUrls();
      return urls.some(url => url.shortCode === shortCode);
    } catch (error) {
      log.error('api', `Failed to check shortcode existence: ${error}`);
      return false;
    }
  }

  clearExpiredUrls(): void {
    try {
      const urls = this.getAllUrls();
      const now = new Date();
      const validUrls = urls.filter(url => now <= url.expiresAt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validUrls));
      log.info('api', `Cleared ${urls.length - validUrls.length} expired URLs`);
    } catch (error) {
      log.error('api', `Failed to clear expired URLs: ${error}`);
    }
  }
}

export const storageService = StorageService.getInstance();