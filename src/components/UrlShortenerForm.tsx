import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { UrlSubmissionData, ValidationError } from '../types';
import { validationService } from '../utils/validation';
import { log } from '../utils/logger';

interface UrlShortenerFormProps {
  onSubmit: (urls: UrlSubmissionData[]) => void;
  loading: boolean;
  error: string | null;
}

interface UrlFormData extends UrlSubmissionData {
  id: string;
  errors: ValidationError[];
}

export const UrlShortenerForm: React.FC<UrlShortenerFormProps> = ({
  onSubmit,
  loading,
  error,
}) => {
  const [urlForms, setUrlForms] = useState<UrlFormData[]>([
    {
      id: '1',
      url: '',
      validityMinutes: 30,
      customShortCode: '',
      errors: [],
    },
  ]);

  const addUrlForm = useCallback(() => {
    if (urlForms.length >= 5) {
      log.warn('component', 'Attempted to add more than 5 URL forms');
      return;
    }

    const newForm: UrlFormData = {
      id: Date.now().toString(),
      url: '',
      validityMinutes: 30,
      customShortCode: '',
      errors: [],
    };

    setUrlForms(prev => [...prev, newForm]);
    log.info('component', `Added new URL form, total: ${urlForms.length + 1}`);
  }, [urlForms.length]);

  const removeUrlForm = useCallback((id: string) => {
    if (urlForms.length <= 1) {
      log.warn('component', 'Attempted to remove the last URL form');
      return;
    }

    setUrlForms(prev => prev.filter(form => form.id !== id));
    log.info('component', `Removed URL form ${id}, remaining: ${urlForms.length - 1}`);
  }, [urlForms.length]);

  const updateUrlForm = useCallback((id: string, field: keyof UrlSubmissionData, value: string | number) => {
    setUrlForms(prev =>
      prev.map(form => {
        if (form.id === id) {
          const updatedForm = { ...form, [field]: value };
          
          // Clear previous errors for this field
          updatedForm.errors = updatedForm.errors.filter(error => error.field !== field);
          
          // Validate the updated field
          let newError: ValidationError | null = null;
          if (field === 'url') {
            newError = validationService.validateUrl(value as string);
          } else if (field === 'validityMinutes') {
            newError = validationService.validateValidityMinutes(value as number);
          } else if (field === 'customShortCode') {
            newError = validationService.validateCustomShortCode(value as string);
          }
          
          if (newError) {
            updatedForm.errors.push(newError);
          }
          
          return updatedForm;
        }
        return form;
      })
    );
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    log.info('component', `Submitting ${urlForms.length} URLs for shortening`);
    
    // Validate all forms
    const validatedForms = urlForms.map(form => {
      const errors = validationService.validateUrlSubmission({
        url: form.url,
        validityMinutes: form.validityMinutes,
        customShortCode: form.customShortCode,
      });
      return { ...form, errors };
    });

    setUrlForms(validatedForms);

    // Check if any forms have errors
    const hasErrors = validatedForms.some(form => form.errors.length > 0);
    if (hasErrors) {
      log.warn('component', 'Form submission blocked due to validation errors');
      return;
    }

    // Filter out empty URLs
    const validUrls = validatedForms
      .filter(form => form.url.trim())
      .map(form => ({
        url: form.url,
        validityMinutes: form.validityMinutes,
        customShortCode: form.customShortCode || undefined,
      }));

    if (validUrls.length === 0) {
      log.warn('component', 'No valid URLs to submit');
      return;
    }

    onSubmit(validUrls);
  }, [urlForms, onSubmit]);

  const getFieldError = (formId: string, field: string): string | undefined => {
    const form = urlForms.find(f => f.id === formId);
    const error = form?.errors.find(e => e.field === field);
    return error?.message;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          URL Shortener
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {urlForms.map((form, index) => (
            <Card key={form.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      URL #{index + 1}
                    </Typography>
                    {urlForms.length > 1 && (
                      <IconButton
                        onClick={() => removeUrlForm(form.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Long URL"
                    placeholder="https://example.com/very-long-url"
                    value={form.url}
                    onChange={(e) => updateUrlForm(form.id, 'url', e.target.value)}
                    error={!!getFieldError(form.id, 'url')}
                    helperText={getFieldError(form.id, 'url')}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Validity (minutes)"
                    value={form.validityMinutes}
                    onChange={(e) => updateUrlForm(form.id, 'validityMinutes', parseInt(e.target.value) || 30)}
                    error={!!getFieldError(form.id, 'validityMinutes')}
                    helperText={getFieldError(form.id, 'validityMinutes') || 'Default: 30 minutes'}
                    inputProps={{ min: 1, max: 525600 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    placeholder="mycode123"
                    value={form.customShortCode}
                    onChange={(e) => updateUrlForm(form.id, 'customShortCode', e.target.value)}
                    error={!!getFieldError(form.id, 'customShortCode')}
                    helperText={getFieldError(form.id, 'customShortCode') || 'Alphanumeric only, 3-20 characters'}
                  />
                </Grid>
              </Grid>
            </Card>
          ))}

          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addUrlForm}
              disabled={urlForms.length >= 5}
              variant="outlined"
            >
              Add URL ({urlForms.length}/5)
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Shortening...' : 'Shorten URLs'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};