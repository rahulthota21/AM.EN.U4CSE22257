// File: src/App.tsx
import React, { useState } from 'react';
import {
  CssBaseline,
  ThemeProvider,
  Tab,
  Tabs,
  Box,
  useMediaQuery,
  Typography,
} from '@mui/material';
import '@fontsource/manrope';
import theme from './theme';
import StockPage from './pages/StockPage';
import CorrelationHeatmap from './pages/CorrelationHeatmap';

export default function App() {
  const [tab, setTab] = useState(0);
  const isMobile = useMediaQuery('(max-width:768px)');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Tab Bar */}
        <Box sx={{
          bgcolor: 'background.paper',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          zIndex: 10,
          position: 'sticky',
          top: 0,
        }}>
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: 16,
              }
            }}
          >
            <Tab label="📊 Stock Viewer" />
            <Tab label="🧊 Correlation Heatmap" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, p: 2 }}>
          {tab === 0 ? <StockPage /> : <CorrelationHeatmap />}
        </Box>

        {/* Footer */}
        <Box sx={{
          mt: 'auto',
          py: 2,
          textAlign: 'center',
          fontSize: 14,
          color: 'text.secondary'
        }}>
          Thank you!
        </Box>
      </Box>
    </ThemeProvider>
  );
}
