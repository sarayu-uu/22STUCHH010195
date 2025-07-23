import React, { useEffect } from 'react';
import { Container, Box, Typography, Alert } from '@mui/material';
import { UrlShortenerForm } from '../components/UrlShortenerForm';
import { ShortenedUrlsList } from '../components/ShortenedUrlsList';
import { useUrlShortener } from '../hooks/useUrlShortener';
import { log } from '../utils/logger';

export const UrlShortenerPage: React.FC = () => {
  const {
    shortenedUrls,
    loading,
    error,
    shortenUrls,
    clearError,
    clearResults,
  } = useUrlShortener();

  useEffect(() => {
    log.info('page', 'URL Shortener page mounted');
    
    return () => {
      log.info('page', 'URL Shortener page unmounted');
    };
  }, []);

  useEffect(() => {
    if (error) {
      log.error('page', `URL Shortener page error: ${error.message}`);
    }
  }, [error]);

  const handleFormSubmit = async (urls: any[]) => {
    log.info('page', `URL Shortener form submitted with ${urls.length} URLs`);
    clearResults();
    await shortenUrls(urls);
  };

  const handleErrorDismiss = () => {
    log.debug('page', 'URL Shortener error dismissed');
    clearError();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            textAlign: 'center',
            mb: 4,
            fontWeight: 'bold',
            color: 'primary.main',
          }}
        >
          URL Shortener
        </Typography>
        
        <Typography
          variant="h6"
          component="p"
          sx={{
            textAlign: 'center',
            mb: 4,
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Transform your long URLs into short, manageable links. 
          Create up to 5 short URLs at once with custom expiration times and shortcodes.
        </Typography>

        {error && (
          <Alert
            severity="error"
            onClose={handleErrorDismiss}
            sx={{ mb: 3 }}
          >
            <strong>Error:</strong> {error.message}
            {error.details && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {error.details}
              </Typography>
            )}
          </Alert>
        )}

        <UrlShortenerForm
          onSubmit={handleFormSubmit}
          loading={loading}
          error={error?.message || null}
        />

        <ShortenedUrlsList urls={shortenedUrls} />
      </Box>
    </Container>
  );
};