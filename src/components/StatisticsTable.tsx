import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Link,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Launch as LaunchIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { ShortenedUrl, ClickData } from '../types';
import { log } from '../utils/logger';

interface StatisticsTableProps {
  urls: ShortenedUrl[];
}

interface ExpandableRowProps {
  url: ShortenedUrl;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ url }) => {
  const [open, setOpen] = useState(false);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getShortUrl = (shortCode: string): string => {
    return `${window.location.origin}/${shortCode}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      log.info('component', `URL copied to clipboard: ${text}`);
    } catch (error) {
      log.error('component', `Failed to copy to clipboard: ${error}`);
    }
  };

  const openUrl = (urlToOpen: string) => {
    window.open(urlToOpen, '_blank');
    log.info('component', `Opened URL in new tab: ${urlToOpen}`);
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Box display="flex" alignItems="center" gap={1}>
            <Link
              href={`/${url.shortCode}`}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="primary"
            >
              {url.shortCode}
            </Link>
            <Tooltip title="Copy short URL">
              <IconButton
                size="small"
                onClick={() => copyToClipboard(getShortUrl(url.shortCode))}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: 300,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {url.originalUrl}
            </Typography>
            <Tooltip title="Open original URL">
              <IconButton
                size="small"
                onClick={() => openUrl(url.originalUrl)}
              >
                <LaunchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
        <TableCell>{formatDate(url.createdAt)}</TableCell>
        <TableCell>
          <Chip
            label={getTimeRemaining(url.expiresAt)}
            size="small"
            color={url.isExpired ? 'error' : 'success'}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={url.clicks.length}
            size="small"
            color="primary"
            variant="outlined"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Click History
              </Typography>
              {url.clicks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No clicks recorded yet.
                </Typography>
              ) : (
                <Table size="small" aria-label="clicks">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Referrer</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>User Agent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {url.clicks.map((click, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(click.timestamp)}</TableCell>
                        <TableCell>
                          {click.referrer === 'direct' ? (
                            <Chip label="Direct" size="small" variant="outlined" />
                          ) : (
                            <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {click.referrer}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {click.geolocation.city}, {click.geolocation.country}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {click.userAgent}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const StatisticsTable: React.FC<StatisticsTableProps> = ({ urls }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    log.debug('component', `Statistics table page changed to ${newPage}`);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    log.debug('component', `Statistics table rows per page changed to ${event.target.value}`);
  };

  const sortedUrls = [...urls].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const paginatedUrls = sortedUrls.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          URL Statistics
        </Typography>
        
        {urls.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No URLs have been shortened yet.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table aria-label="url statistics table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Short Code</TableCell>
                    <TableCell>Original URL</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Clicks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUrls.map((url) => (
                    <ExpandableRow key={url.id} url={url} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={urls.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};