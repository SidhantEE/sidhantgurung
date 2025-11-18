# 📈 Professional Quant Trading Platform

A comprehensive quantitative trading platform featuring options arbitrage scanning, equity trading strategies, and advanced backtesting capabilities.

![Platform Architecture](https://img.shields.io/badge/Stack-Next.js%2015%20%7C%20TypeScript%20%7C%20Prisma-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

### Options Trading System
- **Put-Call Parity Arbitrage Scanner** - Detect synthetic stock mispricing opportunities
- **Box Spread Scanner** - Find risk-free arbitrage in options spreads
- **IV Rank Calculator** - Identify when options are cheap vs expensive historically
- **Unusual Options Flow Detector** - Track large institutional trades
- **Black-Scholes Pricing Engine** - Calculate theoretical option prices and Greeks

### Equity Trading System
- **Bollinger Band Mean Reversion** - Trade oversold/overbought conditions
- **Momentum Ranking System** - Identify and rank strongest trending stocks
- **MA Crossover Signals** - Golden Cross / Death Cross detection
- **Custom Indicator Library** - RSI, MACD, Stochastic, ATR, and more

### Backtesting Infrastructure
- **Comprehensive Backtest Engine** - Test strategies on historical data
- **Performance Metrics** - Sharpe ratio, Sortino ratio, max drawdown, win rate
- **Equity Curve Visualization** - Track portfolio value over time
- **Transaction Costs** - Includes commission and slippage modeling
- **Position Sizing** - Fixed, percentage-based, and Kelly Criterion

### Technical Analysis
- 20+ Technical Indicators
- Multiple timeframe support
- Volatility analysis
- Trend detection

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- Git

### Installation

```bash
# Clone the repository
cd quant-trading-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env and add your API keys:
# - ALPHA_VANTAGE_API_KEY (get free key at alphavantage.co)
# - POLYGON_API_KEY (optional, for options data)

# Initialize database
npm run prisma:generate
npm run prisma:push

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to see the platform.

---

## 📊 Demo & Testing

Run the comprehensive demo to see all features in action:

```bash
npm run backtest
```

This will:
1. Generate mock market data for multiple stocks
2. Run mean reversion strategy backtest
3. Run momentum strategy backtest
4. Scan for options arbitrage opportunities
5. Calculate IV Rank for stocks
6. Detect unusual options flow
7. Display comprehensive results

---

## 🎯 Usage Examples

### 1. Mean Reversion Strategy (Bollinger Bands)

```typescript
import { generateMockStockData } from '@/lib/data/stock-data';
import { generateMeanReversionSignals } from '@/lib/strategies/mean-reversion';

// Generate data
const data = generateMockStockData('AAPL', new Date('2024-01-01'), 252, 150);

// Generate signals
const signals = generateMeanReversionSignals(data, {
  period: 20,
  stdDevMultiplier: 2,
  oversoldThreshold: 0.2,
  overboughtThreshold: 0.8,
  exitAtMiddle: true,
  stopLossPercent: 2,
  targetPercent: 4,
});

// Execute trades based on signals
console.log(`Generated ${signals.length} trading signals`);
```

### 2. Options Arbitrage Scanning

```typescript
import { generateMockOptionsChain } from '@/lib/data/options-data';
import { scanPutCallParityArbitrage } from '@/lib/strategies/options-arbitrage';

// Get options chain
const options = generateMockOptionsChain('SPY', 480, 30);

// Scan for arbitrage
const opportunities = scanPutCallParityArbitrage(options, 480, {
  minProfitPerContract: 0.10,
  minROI: 5,
  maxDaysToExpiration: 60,
  riskFreeRate: 0.05,
  transactionCost: 0.65,
});

opportunities.forEach(opp => {
  console.log(`${opp.symbol}: $${opp.profitPerContract * 100} profit (${opp.roi}% ROI)`);
});
```

### 3. IV Rank Analysis

```typescript
import { analyzeIVRank } from '@/lib/strategies/iv-rank';

const ivRank = analyzeIVRank('TSLA', options, stockData);

console.log(`${ivRank.symbol} IV Rank: ${ivRank.ivRank}`);
console.log(`Recommendation: ${ivRank.recommendation} OPTIONS`);

if (ivRank.ivRank > 80) {
  console.log('High IV - Sell options (iron condors, credit spreads)');
} else if (ivRank.ivRank < 20) {
  console.log('Low IV - Buy options (long calls, puts, straddles)');
}
```

### 4. Backtesting

```typescript
import { EquityBacktester } from '@/lib/backtest/equity-backtest';

const backtester = new EquityBacktester({
  initialCapital: 100000,
  commission: 1.00,
  slippage: 0.001,
  positionSizing: 'percent-equity',
  positionSize: 10,
  maxPositions: 5,
  riskFreeRate: 0.02,
});

// Execute trades based on strategy signals
for (const signal of signals) {
  if (signal.type === 'BUY') {
    backtester.buy(signal.symbol, signal.entry, signal.timestamp, 'strategy-name');
  } else {
    backtester.sell(signal.symbol, signal.entry, signal.timestamp, 'strategy-name');
  }
}

// Generate results
const results = backtester.generateResults('My Strategy', 'AAPL', startDate, endDate);

console.log(`Total Return: ${results.totalReturnPercent.toFixed(2)}%`);
console.log(`Sharpe Ratio: ${results.sharpeRatio}`);
console.log(`Max Drawdown: ${results.maxDrawdownPercent.toFixed(2)}%`);
console.log(`Win Rate: ${results.winRate.toFixed(1)}%`);
```

---

## 📁 Project Structure

```
quant-trading-platform/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main dashboard
│   ├── options/
│   │   └── scanner/             # Options arbitrage scanner
│   ├── equities/
│   │   └── signals/             # Equity trading signals
│   ├── backtest/                # Backtesting interface
│   ├── risk/                    # Risk management
│   └── portfolio/               # Portfolio tracking
├── lib/
│   ├── strategies/              # Trading strategies
│   │   ├── mean-reversion.ts   # Bollinger Band strategy
│   │   ├── momentum.ts         # Momentum ranking
│   │   ├── options-arbitrage.ts # Options arbitrage
│   │   ├── iv-rank.ts          # IV Rank analysis
│   │   └── unusual-flow.ts     # Unusual flow detection
│   ├── indicators/              # Technical indicators
│   │   └── technical.ts        # SMA, EMA, BB, RSI, MACD, etc.
│   ├── options/                 # Options pricing
│   │   └── black-scholes.ts    # Black-Scholes model & Greeks
│   ├── backtest/                # Backtesting engines
│   │   └── equity-backtest.ts  # Equity backtesting
│   ├── data/                    # Data fetchers
│   │   ├── stock-data.ts       # Stock market data
│   │   └── options-data.ts     # Options chain data
│   ├── types/                   # TypeScript interfaces
│   └── utils.ts                 # Utility functions
├── components/                   # React components
├── prisma/
│   └── schema.prisma            # Database schema
├── scripts/
│   └── demo-backtest.ts         # Comprehensive demo
└── package.json
```

---

## 🧪 Strategies Explained

### Mean Reversion (Bollinger Bands)

**Theory:** Prices tend to revert to their average after extreme moves.

**Entry:** Buy when price touches lower Bollinger Band (oversold)
**Exit:** When price returns to middle band (20-day SMA)
**Stop Loss:** 2% below entry
**Risk:Reward:** Typically 2:1

**Best For:** Range-bound, sideways markets
**Win Rate:** 55-65%
**Holding Period:** 3-10 days

```typescript
// Signal Example:
// AAPL at $178 (lower band at $178.50)
// Entry: $178.20
// Target: $182.50 (middle band)
// Stop: $176.00
// R:R = 2:1
```

### Momentum (Trend Following)

**Theory:** Stocks with strong recent performance continue to outperform.

**Entry:** Buy top 10% of stocks by 20-day ROC when fast MA > slow MA
**Exit:** When fast MA crosses below slow MA or momentum turns negative
**Stop Loss:** 5% below entry

**Best For:** Trending, bull markets
**Win Rate:** 45-55%
**Holding Period:** 10-30 days
**Avg Return per Trade:** Higher than mean reversion

### Options Arbitrage

**Put-Call Parity:**
Exploits violations of C - P = S - K×e^(-rT)

**Example:**
- Call price: $6.00
- Put price: $5.50
- Stock: $180
- Strike: $180
- Days to expiration: 30

Theoretical C - P should be ≈ $0.37, but actual is $0.50
→ Arbitrage profit: $0.13 per contract ($13 profit)

**Box Spread:**
Combines bull call spread + bear put spread
Theoretical value = difference in strikes
If market price ≠ theoretical value → arbitrage

---

## 📊 Performance Metrics Explained

### Sharpe Ratio
```
Sharpe = (Return - Risk-Free Rate) / Volatility
```
- **> 1.0:** Good
- **> 2.0:** Excellent
- **> 3.0:** Exceptional

### Sortino Ratio
Like Sharpe, but only penalizes downside volatility
Better measure for non-normal returns

### Max Drawdown
Largest peak-to-trough decline
- Keep under **20%** for conservative strategies
- Professional funds target **< 15%**

### Profit Factor
```
Profit Factor = Gross Profit / Gross Loss
```
- **> 1.5:** Good
- **> 2.0:** Excellent

### Win Rate
Percentage of profitable trades
- Mean Reversion: 55-65%
- Momentum: 45-55%
- Arbitrage: 95%+ (but small profits)

---

## 🔧 Configuration

### API Keys

The platform supports multiple data providers:

1. **Alpha Vantage** (Free tier: 25 calls/day)
   - Sign up at [alphavantage.co](https://www.alphavantage.co/)
   - Get API key
   - Add to `.env`: `ALPHA_VANTAGE_API_KEY=your_key_here`

2. **Polygon.io** (For options data)
   - Sign up at [polygon.io](https://polygon.io/)
   - Add to `.env`: `POLYGON_API_KEY=your_key_here`

### Strategy Parameters

Edit strategy configs in `lib/strategies/*.ts`:

```typescript
// Mean Reversion
export const DEFAULT_MEAN_REVERSION_CONFIG = {
  period: 20,                    // Bollinger Band period
  stdDevMultiplier: 2,           // Number of std devs
  oversoldThreshold: 0.2,        // 20th percentile = oversold
  overboughtThreshold: 0.8,      // 80th percentile = overbought
  exitAtMiddle: true,            // Exit at middle band
  stopLossPercent: 2,            // 2% stop loss
  targetPercent: 4,              // 4% target (2:1 R/R)
};
```

---

## ⚠️ Risk Warnings

**IMPORTANT DISCLAIMERS:**

1. **Educational Purpose Only:** This platform is for learning and research. Not financial advice.

2. **No Guarantees:** Past performance ≠ future results. All strategies can lose money.

3. **Test Before Live Trading:** Always paper trade strategies extensively before using real money.

4. **Position Sizing:** Never risk more than 1-2% of your portfolio on a single trade.

5. **Options Risks:**
   - Options can expire worthless (100% loss)
   - Leverage amplifies both gains and losses
   - IV crush after earnings can destroy option value
   - Understand Greeks before trading

6. **Market Conditions:** Strategies perform differently in different market regimes (bull, bear, sideways).

7. **Slippage & Commissions:** Real-world costs can significantly impact profitability.

---

## 🎓 Learning Resources

### Books
- **Options:** "Option Volatility and Pricing" by Sheldon Natenberg
- **Quant Trading:** "Quantitative Trading" by Ernest Chan
- **Technical Analysis:** "Technical Analysis of the Financial Markets" by John Murphy
- **Risk Management:** "The New Trading for a Living" by Dr. Alexander Elder

### Concepts to Study
1. **Options Greeks:** Delta, Gamma, Theta, Vega, Rho
2. **Volatility:** Historical vs Implied, IV Rank, IV Percentile
3. **Risk Management:** Kelly Criterion, Position Sizing, Correlation
4. **Statistics:** Normal distribution, Standard deviation, Z-scores
5. **Backtesting:** Overfitting, Walk-forward analysis, Monte Carlo

---

## 🛠️ Development

### Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** SQLite (dev), PostgreSQL (prod)
- **ORM:** Prisma
- **State:** Zustand, React Query
- **Charts:** Recharts, Tremor
- **Testing:** Jest, React Testing Library

### Running Tests

```bash
npm run test
```

### Build for Production

```bash
npm run build
npm start
```

### Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Open Prisma Studio (DB GUI)
npm run prisma:studio
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- Black-Scholes model implementation based on original paper by Fischer Black and Myron Scholes
- Technical indicators follow definitions from Murphy's "Technical Analysis of the Financial Markets"
- Backtest engine inspired by QuantConnect and Zipline

---

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Check the docs in `/docs` directory
- Review example code in `/scripts/demo-backtest.ts`

---

## 🚀 Roadmap

**Upcoming Features:**

- [ ] Live data integration (WebSocket feeds)
- [ ] Machine learning regime detection
- [ ] Pairs trading strategies
- [ ] Portfolio optimization (Markowitz, Black-Litterman)
- [ ] Risk analytics dashboard (VaR, CVaR, stress testing)
- [ ] Multi-timeframe analysis
- [ ] Options strategy visualizations (payoff diagrams)
- [ ] Automated trade execution via broker APIs
- [ ] Mobile app (React Native)
- [ ] Social features (share strategies, leaderboards)

---

**Built with ❤️ for quantitative traders everywhere.**

**Remember:** The best strategy is the one you understand, can execute consistently, and fits your risk tolerance.

Happy Trading! 📈
