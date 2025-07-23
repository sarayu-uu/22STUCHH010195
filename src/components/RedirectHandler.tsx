import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { Home as HomeIcon, Launch as LaunchIcon } from '@mui/icons-material';
import { useUrlRedirect } from '../hooks/useUrlRedirect';
import { log } from '../utils/logger';

export const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { loading, error, redirectToUrl, clearError } = useUrlRedirect();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!shortCode) {
      log.error('component', 'RedirectHandler: No shortcode provided');
      return;
    }

    log.info('component', `RedirectHandler: Processing shortcode ${shortCode}`);
    
    const handleRedirect = async () => {
      try {
        const url = await redirectToUrl(shortCode);
        if (url) {
          setRedirectUrl(url);
          log.info('component', `RedirectHandler: Redirect URL found ${url}`);
        }
      } catch (err) {
        log.error('component', `RedirectHandler: Failed to process shortcode ${shortCode}`);
      }
    };

    handleRedirect();
  }, [shortCode, redirectToUrl]);

  useEffect(() => {
    if (redirectUrl && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (redirectUrl && countdown === 0) {
      log.info('component', `RedirectHandler: Redirecting to ${redirectUrl}`);
      window.location.href = redirectUrl;
    }
  }, [redirectUrl, countdown]);

  const handleManualRedirect = () => {
    if (redirectUrl) {
      log.info('component', `RedirectHandler: Manual redirect to ${redirectUrl}`);
      window.location.href = redirectUrl;
    }
  };

  const handleGoHome = () => {
    log.info('component', 'RedirectHandler: User chose to go home');
    clearError();
  };

  if (!shortCode) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            Processing Short URL
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Please wait while we redirect you to your destination...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8 }}>
          <Card>
            <CardContent>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {error.type === 'expired' ? 'Link Expired' : 'Link Not Found'}
                </Typography>
                <Typography variant="body2">
                  {error.message}
                </Typography>
              </Alert>

              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                The short URL <strong>/{shortCode}</strong> is not available.
              </Typography>

              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  component="a"
                  href="/"
                >
                  Go to Homepage
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  if (redirectUrl) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8 }}>
          <Card>
            <CardContent>
              <Box textAlign="center">
                <Typography variant="h4" component="h1" gutterBottom>
                  Redirecting...
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3 }}>
                  You will be redirected to your destination in{' '}
                  <strong>{countdown}</strong> seconds.
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 3,
                    wordBreak: 'break-all',
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                  }}
                >
                  {redirectUrl}
                </Typography>

                <Box display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="contained"
                    startIcon={<LaunchIcon />}
                    onClick={handleManualRedirect}
                  >
                    Go Now
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    component="a"
                    href="/"
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return null;
};