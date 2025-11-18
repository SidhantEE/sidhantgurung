# 🚀 Quick Start: API Integration

Get IQuant working with real market data in under 5 minutes!

## Step 1: Get a Free API Key (2 minutes)

### Alpha Vantage (Recommended for Testing)

1. Go to: https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Click "GET FREE API KEY"
4. Copy the API key they send you

**You get**: 25 API calls per day (enough for testing!)

---

## Step 2: Add Your API Key (1 minute)

Create a file named `.env.local` in your project root:

```bash
# Create the file
touch .env.local

# Or on Windows:
type nul > .env.local
```

Add this line to `.env.local`:

```bash
ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE
```

Replace `YOUR_KEY_HERE` with the actual key from Step 1.

---

## Step 3: Restart Your App (30 seconds)

```bash
# Stop your dev server (Ctrl+C)
# Start it again:
npm run dev
```

---

## Step 4: Test It! (1 minute)

The app is already set up to use Alpha Vantage. Just use the functions in `lib/data/stock-data.ts`:

```tsx
import { fetchStockDataAlphaVantage } from '@/lib/data/stock-data';

// In your component or API route:
const data = await fetchStockDataAlphaVantage('AAPL');
console.log(data); // Real Apple stock data!
```

---

## ✅ You're Done!

You now have real market data flowing into IQuant!

---

## Next Steps

### Want Real-Time Data?

Upgrade to **Polygon.io** ($99/month):
1. Sign up: https://polygon.io/pricing
2. Add to `.env.local`:
   ```bash
   POLYGON_API_KEY=your_polygon_key
   ```

### Want Charts?

Install **TradingView Lightweight Charts** (FREE):
```bash
npm install lightweight-charts
```

Then use the component in `components/TradingViewChart.tsx`

---

## Example: Replace Mock Data

### Before (Mock Data):
```tsx
const mockData = [
  { symbol: 'AAPL', price: 180 },
  // ...
];
```

### After (Real Data):
```tsx
import { fetchStockDataAlphaVantage } from '@/lib/data/stock-data';

const realData = await fetchStockDataAlphaVantage('AAPL');
// Now you have real data!
```

---

## Troubleshooting

### "API key not found"
- Make sure `.env.local` is in the root folder (not in `/app`)
- Restart your dev server after adding the key

### "Rate limit exceeded"
- You're using the free tier (25 calls/day)
- Wait 24 hours or upgrade to a paid plan

### "No data returned"
- Check your API key is correct
- Make sure the stock symbol is valid (e.g., 'AAPL', not 'Apple')

---

## Free API Comparison

| Provider | Free Tier | Real-Time | Options Data |
|----------|-----------|-----------|--------------|
| Alpha Vantage | 25 calls/day | No (15min delay) | No |
| Finnhub | 60 calls/min | Yes | Limited |
| IEX Cloud | 50k msgs/month | No | No |
| Polygon.io | None | N/A | N/A |

**Recommendation**: Start with Alpha Vantage for testing, upgrade to Polygon.io for production.

---

## Need Help?

Check out the full guide: `API_INTEGRATION_GUIDE.md`
