# IQuant - API Integration Guide

This guide covers all the APIs you need to integrate to make IQuant fully functional with real market data.

## 📋 Current Status

The platform is currently using **mock data**. To make it production-ready, you'll need to integrate the following APIs:

---

## 🔑 Required APIs

### 1. **Stock Market Data** (Required)

#### Option A: Alpha Vantage (Free tier available)
- **Purpose**: Daily stock prices, historical data
- **Cost**: Free tier: 25 requests/day, Premium: $49.99/month
- **Sign up**: https://www.alphavantage.co/support/#api-key
- **Already integrated in**: `lib/data/stock-data.ts`

```bash
# Add to .env.local
ALPHA_VANTAGE_API_KEY=your_key_here
```

**Pros**: Free tier available, easy to use
**Cons**: Rate limits on free tier, delayed data

---

#### Option B: Polygon.io (Recommended)
- **Purpose**: Real-time & historical stock/options data
- **Cost**: Starter: $99/month, Developer: $249/month
- **Sign up**: https://polygon.io/pricing
- **Already integrated in**: `lib/data/options-data.ts`

```bash
# Add to .env.local
POLYGON_API_KEY=your_key_here
```

**Pros**: Real-time data, options chains, high rate limits
**Cons**: Paid only, no free tier

---

#### Option C: Finnhub (Good middle ground)
- **Purpose**: Real-time stock data, market news
- **Cost**: Free tier available, Pro: $59.99/month
- **Sign up**: https://finnhub.io/register
- **Integration needed**: Create new fetcher

```bash
# Add to .env.local
FINNHUB_API_KEY=your_key_here
```

**Pros**: Free tier, real-time data, good documentation
**Cons**: Limited options data on free tier

---

### 2. **Options Data** (Required for Options Arbitrage)

#### Option A: Polygon.io (Recommended)
- **Purpose**: Options chains, Greeks, IV data
- **Cost**: Developer plan: $249/month
- **Already integrated**: Yes (`lib/data/options-data.ts`)
- **Features**:
  - Real-time options quotes
  - Historical options data
  - Greeks calculations
  - Unusual options activity

---

#### Option B: Tradier
- **Purpose**: Options chains, stock data, brokerage API
- **Cost**: Free for market data with brokerage account
- **Sign up**: https://developer.tradier.com/
- **Integration needed**: Yes

```bash
# Add to .env.local
TRADIER_API_KEY=your_key_here
```

**Pros**: Free with account, real-time data, can execute trades
**Cons**: Requires brokerage account

---

#### Option C: CBOE DataShop
- **Purpose**: Official options data, volatility indices
- **Cost**: Enterprise pricing (expensive)
- **Sign up**: https://datashop.cboe.com/
- **Integration needed**: Yes

**Pros**: Official CBOE data, most accurate
**Cons**: Very expensive, enterprise only

---

### 3. **Market Data & Volatility** (Recommended)

#### VIX & Market Indices
- **Source**: Alpha Vantage or Polygon.io (already covered above)
- **Purpose**: VIX (volatility index), SPY, market indicators
- **Free Alternative**: Yahoo Finance (unofficial API)

---

### 4. **TradingView Integration** (Optional - For Charts)

**Important**: TradingView does **NOT** have a public API for data. However, you have several options:

#### Option A: TradingView Advanced Charts (Embedded)
- **Purpose**: Embed TradingView charts in your app
- **Cost**: Free for basic, $495-$995/month for advanced
- **Sign up**: https://www.tradingview.com/widget/
- **How to use**: Embed iframe widgets

```tsx
// Example TradingView Chart Widget
<div className="tradingview-widget-container">
  <iframe
    src="https://www.tradingview.com/widgetembed/?symbol=NASDAQ:AAPL&interval=D&theme=dark"
    width="100%"
    height="500"
  />
</div>
```

**Pros**: Beautiful charts, free basic version, no API needed
**Cons**: Embedded only, limited customization

---

#### Option B: TradingView Charting Library (Advanced)
- **Purpose**: Fully customizable charts in your app
- **Cost**: $995/month minimum
- **Sign up**: Contact TradingView sales
- **Integration**: Complex, requires license

**Pros**: Fully customizable, professional-grade
**Cons**: Very expensive, complex integration

---

#### Option C: Lightweight Charts by TradingView (Free!)
- **Purpose**: Open-source charting library
- **Cost**: FREE
- **Repo**: https://github.com/tradingview/lightweight-charts
- **Best for**: Custom charting with your own data

```bash
npm install lightweight-charts
```

**Pros**: Free, customizable, modern
**Cons**: You need to provide the data

---

### 5. **News & Sentiment** (Optional)

#### News API
- **Purpose**: Market news, sentiment analysis
- **Cost**: Free tier: 100 requests/day, Pro: $449/month
- **Sign up**: https://newsapi.org/

```bash
NEWSAPI_KEY=your_key_here
```

---

#### Alpha Vantage News
- **Purpose**: Financial news and sentiment
- **Cost**: Included in Alpha Vantage subscription
- **Already integrated**: Use same API key

---

## 🏗️ Recommended Setup for Different Budgets

### Budget: $0/month (Free Tier)
```bash
# Stock Data
ALPHA_VANTAGE_API_KEY=your_free_key

# Charts
# Use TradingView Lightweight Charts (free, open-source)

# Limitations
# - 25 requests/day
# - No real-time options data
# - 15-minute delayed data
```

**Best for**: Learning, development, backtesting

---

### Budget: $99-249/month (Starter)
```bash
# All market data (stocks + options)
POLYGON_API_KEY=your_key

# News (optional)
NEWSAPI_KEY=your_key
```

**Best for**: Personal trading, small-scale deployment

---

### Budget: $500+/month (Professional)
```bash
# Real-time market data
POLYGON_API_KEY=your_key

# Trading execution (optional)
TRADIER_API_KEY=your_key

# Advanced charts
# TradingView Charting Library license

# News & sentiment
NEWSAPI_KEY=your_key
```

**Best for**: Professional trading, commercial use

---

## 📝 How to Add API Keys

1. Create a `.env.local` file in the project root:

```bash
# Market Data
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
POLYGON_API_KEY=your_polygon_key

# Optional APIs
NEWSAPI_KEY=your_news_api_key
TRADIER_API_KEY=your_tradier_key
FINNHUB_API_KEY=your_finnhub_key

# Next.js public keys (if needed for client-side)
NEXT_PUBLIC_POLYGON_API_KEY=your_public_key
```

2. **Never commit `.env.local` to git** (already in `.gitignore`)

3. For production (Vercel, etc.), add environment variables in your hosting dashboard

---

## 🔧 Quick Integration Steps

### Step 1: Choose Your Data Provider

For beginners, I recommend starting with **Alpha Vantage (free)** for testing, then upgrading to **Polygon.io** when ready for production.

### Step 2: Get API Keys

1. Sign up at https://www.alphavantage.co/support/#api-key
2. Get your free API key
3. Add to `.env.local`

### Step 3: Test the Integration

```bash
# Create .env.local file
echo "ALPHA_VANTAGE_API_KEY=your_key_here" > .env.local

# Restart your dev server
npm run dev
```

### Step 4: Update Mock Data Usage

The codebase already has API integrations ready. You just need to:

1. Add API keys to `.env.local`
2. Replace mock data calls with real API calls in your components
3. Add error handling and loading states

---

## 🎯 Free Alternatives for Testing

### Yahoo Finance (Unofficial)
- Use `node-yahoo-finance2` package
- Free but unofficial (no guarantee)
- Good for testing

```bash
npm install yahoo-finance2
```

### IEX Cloud
- Free tier: 50,000 messages/month
- Sign up: https://iexcloud.io/
- Good for stock data

---

## 📊 Chart Integration Example

### Using TradingView Lightweight Charts (Free)

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function StockChart({ data }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chart.addCandlestickSeries();
    candlestickSeries.setData(data);

    return () => chart.remove();
  }, [data]);

  return <div ref={chartContainerRef} />;
}
```

---

## 🚀 Next Steps

1. **Start Free**: Get Alpha Vantage API key
2. **Test**: Integrate with existing codebase
3. **Upgrade**: Move to Polygon.io when ready for real-time data
4. **Charts**: Add TradingView Lightweight Charts (free)
5. **Deploy**: Add API keys to your production environment

---

## ⚠️ Important Notes

- **Rate Limits**: Always respect API rate limits
- **Caching**: Cache data to reduce API calls
- **Error Handling**: Always handle API errors gracefully
- **Security**: Never expose API keys in client-side code
- **Compliance**: Ensure you comply with exchange data agreements

---

## 📚 Useful Resources

- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [Polygon.io Docs](https://polygon.io/docs/stocks/getting-started)
- [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [Tradier API Docs](https://documentation.tradier.com/)

---

**Need help with integration?** Check out `lib/data/stock-data.ts` and `lib/data/options-data.ts` for examples of how to use these APIs.
