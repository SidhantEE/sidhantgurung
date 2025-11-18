# 🚀 Installation & Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd quant-trading-platform
npm install
```

This will install all required packages including:
- Next.js 15 + React 19
- TypeScript
- Prisma (database ORM)
- Recharts (charts)
- Tailwind CSS
- All trading libraries

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys (optional for demo):

```env
# API Keys (optional - mock data works without these)
ALPHA_VANTAGE_API_KEY=your_key_here  # Get free at alphavantage.co
POLYGON_API_KEY=your_key_here         # Optional for options data

# Database
DATABASE_URL="file:./dev.db"

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Step 3: Initialize Database

```bash
npm run prisma:generate
npm run prisma:push
```

### Step 4: Run the Platform

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser!

---

## Testing the Platform

### Run Demo Backtest

```bash
npm run backtest
```

This comprehensive demo will:
1. ✅ Generate mock market data
2. ✅ Run mean reversion strategy on AAPL
3. ✅ Run momentum strategy on NVDA
4. ✅ Scan for options arbitrage
5. ✅ Calculate IV Rank
6. ✅ Detect unusual options flow
7. ✅ Display full performance reports

Expected output:
```
🚀 QUANT TRADING PLATFORM - COMPREHENSIVE DEMO
================================================

📊 Generating Mock Market Data...
✓ AAPL: Generated 252 days of mean-reverting data
✓ MSFT: Generated 252 days of mean-reverting data
✓ TSLA: Generated 252 days of volatile data
✓ SPY: Generated 252 days of mean-reverting data
✓ NVDA: Generated 252 days of trending-up data

📈 MEAN REVERSION STRATEGY (Bollinger Bands)
─────────────────────────────────────────────
Testing on: AAPL (Mean-Reverting Pattern)
Total Signals: 24
Buy Signals: 12
Sell Signals: 12
Average Confidence: 73%
Average Risk:Reward: 2.05:1

📊 Backtest Results:
Total Return: $8,432.50 (8.43%)
Annualized Return: 8.43%
Sharpe Ratio: 1.65
Max Drawdown: -5.20%
Win Rate: 58.3%
Profit Factor: 1.85
Total Trades: 12

[... more output ...]
```

---

## Exploring the Platform

### 1. Main Dashboard
Navigate to [http://localhost:3001](http://localhost:3001)

Features:
- Portfolio overview
- Market summary (VIX, S&P 500, Put/Call ratio)
- Today's top signals
- Quick links to all modules

### 2. Options Scanner
Navigate to [http://localhost:3001/options/scanner](http://localhost:3001/options/scanner)

Tabs:
- **Arbitrage Opportunities:** Put-Call Parity, Box Spreads
- **IV Rank Scanner:** Find cheap/expensive options
- **Unusual Flow:** Track smart money

### 3. Equity Signals
Navigate to [http://localhost:3001/equities/signals](http://localhost:3001/equities/signals)

Strategies:
- **Mean Reversion:** Bollinger Band signals
- **Momentum:** Top trending stocks

### 4. Backtest Module
Navigate to [http://localhost:3001/backtest](http://localhost:3001/backtest)

Features:
- Test strategies on historical data
- View equity curves
- Analyze performance metrics

---

## Troubleshooting

### Port Already in Use

If port 3001 is taken, edit `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3002"  // Change to 3002 or any available port
  }
}
```

### Prisma Issues

```bash
# Reset database
rm prisma/dev.db
npm run prisma:push

# Regenerate client
npm run prisma:generate
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Ensure latest TypeScript
npm install typescript@latest --save-dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## Next Steps

### 1. Customize Strategies

Edit `lib/strategies/mean-reversion.ts`:

```typescript
export const DEFAULT_MEAN_REVERSION_CONFIG: MeanReversionConfig = {
  period: 20,                    // Change to 10 for faster signals
  stdDevMultiplier: 2,           // Change to 2.5 for wider bands
  oversoldThreshold: 0.2,        // Change to 0.15 for stricter entry
  overboughtThreshold: 0.8,
  exitAtMiddle: true,
  stopLossPercent: 2,
  targetPercent: 4,
};
```

### 2. Add Your Own Tickers

Edit the demo script to test on your stocks:

```typescript
const symbols = ['AAPL', 'MSFT', 'TSLA', 'YOUR_STOCK'];
```

### 3. Connect Real Data

Once you have Alpha Vantage API key:

```typescript
import { fetchStockDataAlphaVantage } from '@/lib/data/stock-data';

const data = await fetchStockDataAlphaVantage('AAPL', 'full');
// Use real data for backtesting!
```

### 4. Deploy to Production

**Vercel (Recommended):**

```bash
npm install -g vercel
vercel login
vercel
```

**Or any Node.js host:**

```bash
npm run build
npm start
```

---

## Getting API Keys (Free Tiers)

### Alpha Vantage (Stock Data)
1. Go to [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. Enter your email
3. Get instant API key
4. Free tier: 25 API calls/day

### Polygon.io (Options Data)
1. Go to [polygon.io](https://polygon.io/pricing)
2. Sign up for free tier
3. Get API key from dashboard
4. Free tier: Delayed data only

### Yahoo Finance (Alternative)
- No API key needed
- Use `yfinance` library
- Free and unlimited
- Less reliable than paid sources

---

## Performance Optimization

### For Development

```bash
# Run in production mode for faster performance
npm run build
npm start
```

### For Production

1. **Use PostgreSQL instead of SQLite:**
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/quantdb"
   ```

2. **Enable Caching:**
   - Add Redis for market data caching
   - Cache expensive calculations

3. **Optimize Bundle:**
   - Already configured with Next.js code splitting
   - Lazy load heavy components

---

## Support

Need help?
- 📖 Read the [README.md](README.md)
- 🐛 Check [Issues](https://github.com/your-repo/issues)
- 💬 Review code in `/scripts/demo-backtest.ts`
- 📊 Study examples in `/lib/strategies/`

---

## What's Included

✅ **Backend:**
- Black-Scholes options pricing engine
- 20+ technical indicators
- Comprehensive backtesting framework
- Multiple trading strategies
- Database schema & ORM

✅ **Frontend:**
- Next.js 15 web app
- Interactive dashboards
- Real-time data visualization
- Responsive design

✅ **Documentation:**
- Complete README
- Code comments
- Example scripts
- API documentation

✅ **Ready to Use:**
- No additional setup required
- Works with mock data out of the box
- Can connect real data when ready

---

**You're all set! Start exploring the platform at http://localhost:3001** 🎉
