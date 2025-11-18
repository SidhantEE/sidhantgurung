'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatPercent, getValueColor } from '@/lib/utils';

// Mock data for demo (realistic values)
const mockPortfolio = {
  totalValue: 100000.00,
  cash: 25340.50,
  dailyPnL: 1250.75,
  dailyPnLPercent: 1.27,
};

const mockTopSignals = [
  {
    symbol: 'AAPL',
    type: 'Put-Call Parity',
    signal: 'BUY',
    confidence: 87,
    expectedProfit: 125.50,
  },
  {
    symbol: 'SPY',
    type: 'Mean Reversion',
    signal: 'BUY',
    confidence: 72,
    entry: 580.45,
  },
  {
    symbol: 'NVDA',
    type: 'High IV Rank',
    signal: 'SELL',
    confidence: 84,
    ivRank: 89,
  },
];

const mockMarketOverview = {
  vix: 16.42,
  vixChange: 0.35,
  spyPrice: 580.45,
  spyChange: 0.42,
  putCallRatio: 0.92,
};

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="px-6 py-8 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-[hsl(var(--muted-foreground))]">
          Professional quantitative trading platform with options arbitrage and equity strategies
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Value</p>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(mockPortfolio.totalValue)}
          </p>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Cash Available</p>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(mockPortfolio.cash)}
          </p>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Daily P&L</p>
          <p className={`mt-2 text-3xl font-bold ${getValueColor(mockPortfolio.dailyPnL)}`}>
            {formatCurrency(mockPortfolio.dailyPnL)}
          </p>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Daily Return</p>
          <p className={`mt-2 text-3xl font-bold ${getValueColor(mockPortfolio.dailyPnLPercent)}`}>
            {formatPercent(mockPortfolio.dailyPnLPercent)}
          </p>
        </div>
      </div>

      {/* Market Overview */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-xl font-bold">Market Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">VIX (Volatility Index)</p>
              <p className="text-2xl font-bold">
                {mockMarketOverview.vix}
                <span className={`ml-2 text-base ${getValueColor(mockMarketOverview.vixChange)}`}>
                  {formatPercent(mockMarketOverview.vixChange, 2)}
                </span>
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {mockMarketOverview.vix < 15 ? 'Low volatility' :
                 mockMarketOverview.vix < 25 ? 'Normal volatility' : 'High volatility'}
              </p>
            </div>

            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">S&P 500 (SPY)</p>
              <p className="text-2xl font-bold">
                {formatCurrency(mockMarketOverview.spyPrice)}
                <span className={`ml-2 text-base ${getValueColor(mockMarketOverview.spyChange)}`}>
                  {formatPercent(mockMarketOverview.spyChange, 2)}
                </span>
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {mockMarketOverview.spyChange > 0 ? 'Upward trend' : 'Downward trend'}
              </p>
            </div>

            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Put/Call Ratio</p>
              <p className="text-2xl font-bold">
                {mockMarketOverview.putCallRatio}
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {mockMarketOverview.putCallRatio > 1 ? 'Bearish sentiment' : 'Bullish sentiment'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Top Signals */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex justify-between items-center">
          <h2 className="text-xl font-bold">Today's Top Signals</h2>
          <Link
            href="/options/scanner"
            className="text-sm hover:underline font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {mockTopSignals.map((signal, idx) => (
            <div key={idx} className="p-6 hover:bg-[hsl(var(--accent))] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold">{signal.symbol}</span>
                    <span className="px-2.5 py-1 bg-[hsl(var(--muted))] text-xs font-medium rounded border border-[hsl(var(--border))]">
                      {signal.type}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded border ${
                      signal.signal === 'BUY'
                        ? 'bg-[hsl(var(--background))] border-[hsl(var(--foreground))]'
                        : 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]'
                    }`}>
                      {signal.signal}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {'expectedProfit' in signal && signal.expectedProfit !== undefined && `Expected profit: ${formatCurrency(signal.expectedProfit)} • `}
                    {'entry' in signal && signal.entry !== undefined && `Entry: ${formatCurrency(signal.entry)} • `}
                    {'ivRank' in signal && `IV Rank: ${signal.ivRank}`}
                  </p>
                </div>
                <div className="text-right ml-6">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Confidence</p>
                  <p className="text-2xl font-bold">{signal.confidence}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Options System */}
        <div className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-lg p-6 hover:border-[hsl(var(--foreground))] transition-colors">
          <h3 className="text-2xl font-bold mb-4">Options Arbitrage</h3>
          <p className="mb-6 text-[hsl(var(--muted-foreground))]">
            Scan for put-call parity violations, box spreads, and high IV opportunities
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm">
              <span className="w-1.5 h-1.5 bg-[hsl(var(--foreground))] rounded-full mr-3"></span>
              Put-Call Parity Scanner
            </li>
            <li className="flex items-center text-sm">
              <span className="w-1.5 h-1.5 bg-[hsl(var(--foreground))] rounded-full mr-3"></span>
              IV Rank Analysis
            </li>
            <li className="flex items-center text-sm">
              <span className="w-1.5 h-1.5 bg-[hsl(var(--foreground))] rounded-full mr-3"></span>
              Unusual Flow Detection
            </li>
          </ul>
          <Link
            href="/options/scanner"
            className="inline-block bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Launch Scanner →
          </Link>
        </div>

        {/* Equity System */}
        <div className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-lg p-6 hover:border-[hsl(var(--foreground))] transition-colors">
          <h3 className="text-2xl font-bold mb-4">Equity Strategies</h3>
          <p className="mb-6 text-[hsl(var(--muted-foreground))]">
            Mean reversion and momentum strategies for daily stock trading
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm">
              <span className="w-1.5 h-1.5 bg-[hsl(var(--foreground))] rounded-full mr-3"></span>
              Bollinger Band Mean Reversion
            </li>
            <li className="flex items-center text-sm">
              <span className="w-1.5 h-1.5 bg-[hsl(var(--foreground))] rounded-full mr-3"></span>
              Momentum Ranking
            </li>
            <li className="flex items-center text-sm">
              <span className="w-1.5 h-1.5 bg-[hsl(var(--foreground))] rounded-full mr-3"></span>
              MA Crossover Signals
            </li>
          </ul>
          <Link
            href="/equities/signals"
            className="inline-block bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            View Signals →
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/backtest"
          className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:border-[hsl(var(--foreground))] transition-all group"
        >
          <h4 className="text-lg font-bold mb-2 group-hover:underline">Backtesting Engine</h4>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Test strategies on historical data with comprehensive performance metrics
          </p>
        </Link>

        <Link
          href="/analytics"
          className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:border-[hsl(var(--foreground))] transition-all group"
        >
          <h4 className="text-lg font-bold mb-2 group-hover:underline">Analytics</h4>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Advanced analytics, risk metrics, and portfolio performance tracking
          </p>
        </Link>

        <Link
          href="/activity"
          className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:border-[hsl(var(--foreground))] transition-all group"
        >
          <h4 className="text-lg font-bold mb-2 group-hover:underline">Recent Activity</h4>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            View trade history, signal alerts, and system notifications
          </p>
        </Link>
      </div>
    </div>
  );
}
