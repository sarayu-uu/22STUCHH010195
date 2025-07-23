import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  Link as LinkIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { log } from '../utils/logger';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string, pageName: string) => {
    log.info('component', `Navigation: User navigated to ${pageName}`);
    navigate(path);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar sx={{ px: 0 }}>
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <LinkIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => handleNavigation('/', 'Home')}
            >
              URL Shortener
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              color="inherit"
              startIcon={<LinkIcon />}
              onClick={() => handleNavigation('/', 'URL Shortener')}
              variant={isActive('/') ? 'outlined' : 'text'}
              sx={{
                borderColor: isActive('/') ? 'white' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Shortener
            </Button>

            <Button
              color="inherit"
              startIcon={<AnalyticsIcon />}
              onClick={() => handleNavigation('/statistics', 'Statistics')}
              variant={isActive('/statistics') ? 'outlined' : 'text'}
              sx={{
                borderColor: isActive('/statistics') ? 'white' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};