import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Navigation } from './components/Navigation';
import { UrlShortenerPage } from './pages/UrlShortenerPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { RedirectHandler } from './components/RedirectHandler';
import { urlService } from './services/urlService';
import { log } from './utils/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  useEffect(() => {
    log.info('component', 'Application started');
    
    // Cleanup expired URLs on app start
    try {
      urlService.cleanupExpiredUrls();
      log.info('component', 'Initial cleanup of expired URLs completed');
    } catch (error) {
      log.error('component', `Failed to cleanup expired URLs on startup: ${error}`);
    }

    // Set up periodic cleanup every 5 minutes
    const cleanupInterval = setInterval(() => {
      try {
        urlService.cleanupExpiredUrls();
        log.debug('component', 'Periodic cleanup of expired URLs completed');
      } catch (error) {
        log.error('component', `Periodic cleanup failed: ${error}`);
      }
    }, 5 * 60 * 1000);

    // Handle app errors
    const handleError = (event: ErrorEvent) => {
      log.fatal('component', `Unhandled error: ${event.error?.message || event.message}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      log.fatal('component', `Unhandled promise rejection: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      clearInterval(cleanupInterval);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      log.info('component', 'Application cleanup completed');
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<UrlShortenerPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/:shortCode" element={<RedirectHandler />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;