import React, { useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Link as LinkIcon,
  Mouse as ClickIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { StatisticsTable } from '../components/StatisticsTable';
import { useUrlStats } from '../hooks/useUrlStats';
import { log } from '../utils/logger';

export const StatisticsPage: React.FC = () => {
  const { urls, loading, refreshStats } = useUrlStats();

  useEffect(() => {
    log.info('page', 'Statistics page mounted');
    
    return () => {
      log.info('page', 'Statistics page unmounted');
    };
  }, []);

  const handleRefresh = () => {
    log.info('page', 'Statistics refresh requested by user');
    refreshStats();
  };

  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0);
  const activeUrls = urls.filter(url => !url.isExpired).length;
  const expiredUrls = urls.filter(url => url.isExpired).length;

  const stats = [
    {
      title: 'Total URLs',
      value: totalUrls,
      icon: <LinkIcon />,
      color: 'primary.main',
    },
    {
      title: 'Total Clicks',
      value: totalClicks,
      icon: <ClickIcon />,
      color: 'success.main',
    },
    {
      title: 'Active URLs',
      value: activeUrls,
      icon: <ScheduleIcon />,
      color: 'info.main',
    },
    {
      title: 'Expired URLs',
      value: expiredUrls,
      icon: <ScheduleIcon />,
      color: 'error.main',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
            }}
          >
            Statistics
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        <Typography
          variant="h6"
          component="p"
          sx={{
            mb: 4,
            color: 'text.secondary',
          }}
        >
          View detailed analytics for all your shortened URLs, including click tracking,
          referrer information, and geographic data.
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="h4"
                        component="div"
                        sx={{
                          fontWeight: 'bold',
                          color: stat.color,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {stat.title}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        color: stat.color,
                        opacity: 0.7,
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Statistics Table */}
        {loading && urls.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ py: 8 }}
          >
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading statistics...
            </Typography>
          </Box>
        ) : (
          <StatisticsTable urls={urls} />
        )}
      </Box>
    </Container>
  );
};