const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is up and running');
});
// this token is changing frequently
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDY1MjYwLCJpYXQiOjE3NDcwNjQ5NjAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjhmNjE0N2RhLTNiODItNDc2Yi05OTYwLWFkNmM5YWIyYTU3NCIsInN1YiI6ImFtLmVuLnU0Y3NlMjIyNTdAYW0uc3R1ZGVudHMuYW1yaXRhLmVkdSJ9LCJlbWFpbCI6ImFtLmVuLnU0Y3NlMjIyNTdAYW0uc3R1ZGVudHMuYW1yaXRhLmVkdSIsIm5hbWUiOiJ0aG90YSByYWh1bCIsInJvbGxObyI6ImFtLmVuLnU0Y3NlMjIyNTciLCJhY2Nlc3NDb2RlIjoiU3d1dUtFIiwiY2xpZW50SUQiOiI4ZjYxNDdkYS0zYjgyLTQ3NmItOTk2MC1hZDZjOWFiMmE1NzQiLCJjbGllbnRTZWNyZXQiOiJaRHpaZm1OdVpURHN2V05mIn0.tPHO4jV-8pfr05p8stdN4nEZyXrkqCDjv213BNII2Mo';
app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const { minutes, aggregation } = req.query;

  if (aggregation !== 'average') {
    return res.status(400).json({ error: 'Only average aggregation is supported' });
  }

  try {
    const response = await axios.get(
      `http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`,
      {
        headers: {
          Authorization: AUTH_TOKEN,
        },
      }
    );

    const prices = response.data;
    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(404).json({ error: 'No price data available' });
    }

    const average = prices.reduce((acc, item) => acc + item.price, 0) / prices.length;

    res.json({
      averageStockPrice: average,
      priceHistory: prices,
    });
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    res.status(500).json({ error: 'Failed to fetch stock prices' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/stockcorrelation', async (req, res) => {
  const { minutes, ticker } = req.query;
  if (!minutes || !ticker || !Array.isArray(ticker) || ticker.length !== 2) {
    return res.status(400).json({ error: 'Please provide exactly two tickers and minutes' });
  }

  try {
    const fetchPrices = async (symbol) => {
      const { data } = await axios.get(
        `http://20.244.56.144/evaluation-service/stocks/${symbol}?minutes=${minutes}`,
        { headers: { Authorization: AUTH_TOKEN } }
      );
      return data;
    };

    const [data1, data2] = await Promise.all([
      fetchPrices(ticker[0]),
      fetchPrices(ticker[1]),
    ]);

    if (!data1.length || !data2.length) {
      return res.status(404).json({ error: 'No price data for one or both tickers' });
    }

    // try exact timestamp alignment
    const map1 = new Map(data1.map(p => [p.lastUpdatedAt, p.price]));
    const map2 = new Map(data2.map(p => [p.lastUpdatedAt, p.price]));
    const common = [...map1.keys()].filter(t => map2.has(t));
    let p1 = common.map(t => map1.get(t));
    let p2 = common.map(t => map2.get(t));

    // fallback to index alignment if not enough common timestamps
    if (p1.length < 2) {
      const n = Math.min(data1.length, data2.length);
      p1 = data1.slice(0, n).map(p => p.price);
      p2 = data2.slice(0, n).map(p => p.price);
    }

    const mean = arr => arr.reduce((sum, v) => sum + v, 0) / arr.length;
    const stdDev = (arr, m) => Math.sqrt(arr.reduce((s, v) => s + (v - m)**2, 0) / arr.length);
    const m1 = mean(p1), m2 = mean(p2);
    const s1 = stdDev(p1, m1), s2 = stdDev(p2, m2);
    const cov = p1.reduce((s, v, i) => s + (v - m1)*(p2[i] - m2), 0) / p1.length;
    const corr = cov / (s1 * s2);

    res.json({
      correlation: +corr.toFixed(4),
      stocks: {
        [ticker[0]]: { averagePrice: m1, priceHistory: data1 },
        [ticker[1]]: { averagePrice: m2, priceHistory: data2 },
      }
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to calculate correlation' });
  }
});
