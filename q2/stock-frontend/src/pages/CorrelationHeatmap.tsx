// File: src/pages/CorrelationHeatmap.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Tooltip,
  Paper,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import axios from 'axios';

const STOCKS = ['AAPL', 'GOOG', 'MSFT', 'META', 'AMZN', 'NVDA'];
const MINUTE_OPTIONS = [5, 10, 30, 60];

function getColor(correlation: number): string {
  const red = Math.round(255 * (1 - correlation));
  const green = Math.round(255 * correlation);
  return `rgb(${red}, ${green}, 100)`; // Red→Green
}

export default function CorrelationHeatmap() {
  const [minutes, setMinutes] = useState(30);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [meta, setMeta] = useState<Record<string, { avg: number; std: number }>>({});
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  const fetchCorrelation = async () => {
    const newMatrix: number[][] = [];
    const metaInfo: Record<string, { avg: number; std: number }> = {};

    setLoading(true);

    for (let i = 0; i < STOCKS.length; i++) {
      newMatrix[i] = [];
      for (let j = 0; j < STOCKS.length; j++) {
        if (i === j) {
          newMatrix[i][j] = 1;
          continue;
        }
        try {
          const res = await axios.get(
            `http://localhost:3001/stockcorrelation?minutes=${minutes}&ticker=${STOCKS[i]}&ticker=${STOCKS[j]}`
          );
          newMatrix[i][j] = res.data.correlation;

          for (const ticker of [STOCKS[i], STOCKS[j]]) {
            if (!metaInfo[ticker]) {
              const p = res.data.stocks[ticker].priceHistory.map((x: any) => x.price);
              const avg = res.data.stocks[ticker].averagePrice;
              const std = Math.sqrt(p.reduce((s: number, v: number) => s + (v - avg) ** 2, 0) / p.length);
              metaInfo[ticker] = { avg, std };
            }
          }
        } catch (e) {
          newMatrix[i][j] = 0;
        }
      }
    }

    setMatrix(newMatrix);
    setMeta(metaInfo);
    setLoading(false);
  };

  useEffect(() => {
    fetchCorrelation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        🧊 Correlation Heatmap
      </Typography>

      <TextField
        select
        label="Time Interval"
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value))}
        sx={{ mb: 4, minWidth: 150 }}
      >
        {MINUTE_OPTIONS.map((m) => (
          <MenuItem key={m} value={m}>{m} min</MenuItem>
        ))}
      </TextField>

      {loading ? (
        <Skeleton variant="rounded" height={300} />
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `80px repeat(${STOCKS.length}, 1fr)`,
              gap: 1,
              minWidth: 600,
            }}
          >
            <Box />
            {STOCKS.map((s) => (
              <Tooltip
                key={s}
                title={`Avg: ₹${meta[s]?.avg.toFixed(2)} | SD: ₹${meta[s]?.std.toFixed(2)}`}
              >
                <Box sx={{ textAlign: 'center', fontWeight: 600 }}>{s}</Box>
              </Tooltip>
            ))}
            {STOCKS.map((row, i) => (
              <React.Fragment key={i}>
                <Tooltip title={`Avg: ₹${meta[row]?.avg.toFixed(2)} | SD: ₹${meta[row]?.std.toFixed(2)}`}>
                  <Box sx={{ fontWeight: 600 }}>{row}</Box>
                </Tooltip>
                {STOCKS.map((col, j) => (
                  <Tooltip key={j} title={`Correlation: ${matrix[i]?.[j]?.toFixed(2)}`}>
                    <Box
                      sx={{
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 500,
                        borderRadius: 1,
                        border: '1px solid #e5e7eb',
                        bgcolor: getColor((matrix[i]?.[j] ?? 0 + 1) / 2),
                      }}
                    >
                      {i === j ? '—' : matrix[i]?.[j]?.toFixed(2)}
                    </Box>
                  </Tooltip>
                ))}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}

      <Paper sx={{ mt: 5, p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Legend: Color shifts from red (-1) → yellow (0) → green (+1)
        </Typography>
      </Paper>
    </Box>
  );
}
