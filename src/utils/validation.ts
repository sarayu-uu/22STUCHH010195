import { ValidationError, UrlSubmissionData } from '../types';
import { storageService } from './storage';
import { log } from './logger';

export class ValidationService {
  static validateUrl(url: string): ValidationError | null {
    if (!url.trim()) {
      log.warn('api', 'URL validation failed: empty URL');
      return { field: 'url', message: 'URL is required' };
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        log.warn('api', `URL validation failed: invalid protocol ${urlObj.protocol}`);
        return { field: 'url', message: 'URL must use HTTP or HTTPS protocol' };
      }
      return null;
    } catch (error) {
      log.warn('api', `URL validation failed: invalid format - ${url}`);
      return { field: 'url', message: 'Please enter a valid URL' };
    }
  }

  static validateValidityMinutes(minutes: number | undefined): ValidationError | null {
    if (minutes === undefined) return null;
    
    if (minutes < 1) {
      log.warn('api', `Validity validation failed: ${minutes} minutes too low`);
      return { field: 'validityMinutes', message: 'Validity must be at least 1 minute' };
    }
    
    if (minutes > 525600) { // 1 year in minutes
      log.warn('api', `Validity validation failed: ${minutes} minutes too high`);
      return { field: 'validityMinutes', message: 'Validity cannot exceed 1 year' };
    }
    
    return null;
  }

  static validateCustomShortCode(shortCode: string | undefined): ValidationError | null {
    if (!shortCode) return null;
    
    if (shortCode.length < 3) {
      log.warn('api', `ShortCode validation failed: ${shortCode} too short`);
      return { field: 'customShortCode', message: 'Custom shortcode must be at least 3 characters' };
    }
    
    if (shortCode.length > 20) {
      log.warn('api', `ShortCode validation failed: ${shortCode} too long`);
      return { field: 'customShortCode', message: 'Custom shortcode cannot exceed 20 characters' };
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(shortCode)) {
      log.warn('api', `ShortCode validation failed: ${shortCode} contains invalid characters`);
      return { field: 'customShortCode', message: 'Custom shortcode must be alphanumeric only' };
    }
    
    if (storageService.isShortCodeExists(shortCode)) {
      log.warn('api', `ShortCode validation failed: ${shortCode} already exists`);
      return { field: 'customShortCode', message: 'This shortcode is already taken' };
    }
    
    return null;
  }

  static validateUrlSubmission(data: UrlSubmissionData): ValidationError[] {
    const errors: ValidationError[] = [];
    
    const urlError = this.validateUrl(data.url);
    if (urlError) errors.push(urlError);
    
    const validityError = this.validateValidityMinutes(data.validityMinutes);
    if (validityError) errors.push(validityError);
    
    const shortCodeError = this.validateCustomShortCode(data.customShortCode);
    if (shortCodeError) errors.push(shortCodeError);
    
    if (errors.length > 0) {
      log.warn('api', `URL submission validation failed with ${errors.length} errors`);
    }
    
    return errors;
  }

  static validateUrlBatch(urls: UrlSubmissionData[]): { [index: number]: ValidationError[] } {
    const batchErrors: { [index: number]: ValidationError[] } = {};
    
    if (urls.length === 0) {
      log.warn('api', 'Batch validation failed: no URLs provided');
      batchErrors[0] = [{ field: 'batch', message: 'At least one URL is required' }];
      return batchErrors;
    }
    
    if (urls.length > 5) {
      log.warn('api', `Batch validation failed: ${urls.length} URLs exceeds limit`);
      batchErrors[0] = [{ field: 'batch', message: 'Maximum 5 URLs allowed at once' }];
      return batchErrors;
    }
    
    urls.forEach((urlData, index) => {
      const errors = this.validateUrlSubmission(urlData);
      if (errors.length > 0) {
        batchErrors[index] = errors;
      }
    });
    
    return batchErrors;
  }
}

export const validationService = ValidationService;