export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  expiresAt: Date;
  validityMinutes: number;
  clicks: ClickData[];
  isExpired: boolean;
}

export interface ClickData {
  timestamp: Date;
  referrer: string;
  userAgent: string;
  geolocation: GeolocationData;
}

export interface GeolocationData {
  country: string;
  city: string;
  ip: string;
}

export interface UrlSubmissionData {
  url: string;
  validityMinutes?: number;
  customShortCode?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AppError {
  type: 'validation' | 'expired' | 'collision' | 'network' | 'unknown';
  message: string;
  details?: string;
}