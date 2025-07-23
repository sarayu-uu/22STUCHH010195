import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Link,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { ShortenedUrl } from '../types';
import { log } from '../utils/logger';

interface ShortenedUrlsListProps {
  urls: ShortenedUrl[];
}

export const ShortenedUrlsList: React.FC<ShortenedUrlsListProps> = ({ urls }) => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const copyToClipboard = async (text: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({
        open: true,
        message: 'Short URL copied to clipboard!',
        severity: 'success',
      });
      log.info('component', `Short URL copied to clipboard: ${shortCode}`);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error',
      });
      log.error('component', `Failed to copy to clipboard: ${error}`);
    }
  };

  const openUrl = (url: string, shortCode: string) => {
    window.open(url, '_blank');
    log.info('component', `Opened original URL in new tab: ${shortCode}`);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
    return `${minutes}m remaining`;
  };

  const getShortUrl = (shortCode: string): string => {
    return `${window.location.origin}/${shortCode}`;
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (urls.length === 0) {
    return null;
  }

  return (
    <>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Shortened URLs
          </Typography>
          
          <List>
            {urls.map((url) => (
              <ListItem
                key={url.id}
                divider
                sx={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  py: 2,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" width="100%">
                  <Box flex={1} mr={2}>
                    <Typography variant="h6" component="div" gutterBottom>
                      <Link
                        href={`/${url.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        color="primary"
                      >
                        {getShortUrl(url.shortCode)}
                      </Link>
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        wordBreak: 'break-all',
                        mb: 1,
                      }}
                    >
                      {url.originalUrl}
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                      <Chip
                        icon={<ScheduleIcon />}
                        label={`Created: ${formatDate(url.createdAt)}`}
                        size="small"
                        variant="outlined"
                      />
                      
                      <Chip
                        label={getTimeRemaining(url.expiresAt)}
                        size="small"
                        color={url.isExpired ? 'error' : 'success'}
                        variant="outlined"
                      />
                      
                      <Chip
                        label={`${url.clicks.length} clicks`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Tooltip title="Copy short URL">
                      <IconButton
                        onClick={() => copyToClipboard(getShortUrl(url.shortCode), url.shortCode)}
                        size="small"
                        color="primary"
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Open original URL">
                      <IconButton
                        onClick={() => openUrl(url.originalUrl, url.shortCode)}
                        size="small"
                        color="secondary"
                      >
                        <LaunchIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                {url.isExpired && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    This short URL has expired and is no longer accessible.
                  </Alert>
                )}
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};