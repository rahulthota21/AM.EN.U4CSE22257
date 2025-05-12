import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import axios from 'axios';

const PRELOAD_TICKERS = ['AAPL', 'GOOG', 'MSFT', 'META', 'AMZN'];
const minuteOptions = [5, 10, 30, 60];

export default function StockPage() {
  const theme = useTheme();
  const [ticker, setTicker] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [data, setData] = useState<any[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/stocks/${ticker}?minutes=${minutes}&aggregation=average`
      );
      setData(res.data.priceHistory);
      setAverage(res.data.averageStockPrice);
    } catch (err) {
      setData([]);
      setAverage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        📊 Stock Price Viewer
      </Typography>

      {/* Controls */}
      <Paper elevation={2} sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        p: 3,
        borderRadius: 3,
        mb: 4,
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)'
      }}>
        <TextField
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          select
          SelectProps={{ native: false }}
          fullWidth
          sx={{ minWidth: 150 }}
        >
          {PRELOAD_TICKERS.map((sym) => (
            <MenuItem key={sym} value={sym}>{sym}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Minutes"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          fullWidth
          sx={{ minWidth: 120 }}
        >
          {minuteOptions.map((min) => (
            <MenuItem key={min} value={min}>{min} min</MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          size="large"
          sx={{ px: 4 }}
          onClick={fetchData}
        >
          Load Data
        </Button>
      </Paper>

      {/* Chart or Loader */}
      {loading ? (
        <Skeleton variant="rounded" height={300} />
      ) : (
        data.length > 0 && (
          <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="h6" mb={2}>
              Price Chart — {ticker} ({minutes} min)
            </Typography>
            <Typography variant="body2" color="secondary" mb={2}>
              Average Price: ₹{average?.toFixed(2)}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="lastUpdatedAt"
                  tickFormatter={(v) => v.split('T')[1]?.slice(0, 5)}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        )
      )}
    </Box>
  );
}
