'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatPercent } from '@/lib/utils';

// Mock signals data
const mockMeanReversionSignals = [
  {
    symbol: 'AAPL',
    signal: 'BUY',
    entry: 178.20,
    target: 182.50,
    stopLoss: 176.00,
    confidence: 75,
    riskReward: 1.95,
    percentB: 0.15,
  },
  {
    symbol: 'MSFT',
    signal: 'BUY',
    entry: 405.30,
    target: 412.00,
    stopLoss: 402.00,
    confidence: 68,
    riskReward: 2.03,
    percentB: 0.18,
  },
];

const mockMomentumRankings = [
  {
    rank: 1,
    symbol: 'NVDA',
    momentum: 18.5,
    relativeStrength: 92,
    price: 725.40,
    signal: 'BUY',
    confidence: 88,
  },
  {
    rank: 2,
    symbol: 'META',
    momentum: 15.2,
    relativeStrength: 88,
    price: 385.20,
    signal: 'BUY',
    confidence: 82,
  },
  {
    rank: 3,
    symbol: 'AMD',
    momentum: 12.8,
    relativeStrength: 85,
    price: 165.50,
    signal: 'BUY',
    confidence: 78,
  },
];

export default function EquitySignals() {
  const [activeStrategy, setActiveStrategy] = useState<'mean-reversion' | 'momentum'>('mean-reversion');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daily Equity Signals</h1>
        <p className="mt-2 text-gray-600">
          Mean reversion and momentum signals for stock trading
        </p>
      </div>

      {/* Strategy Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveStrategy('mean-reversion')}
            className={`${
              activeStrategy === 'mean-reversion'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Mean Reversion (Bollinger Bands)
          </button>
          <button
            onClick={() => setActiveStrategy('momentum')}
            className={`${
              activeStrategy === 'momentum'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Momentum Rankings
          </button>
        </nav>
      </div>

      {/* Mean Reversion Tab */}
      {activeStrategy === 'mean-reversion' && (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Mean Reversion Strategy:</strong> Buy when price touches lower Bollinger Band
              (oversold), exit when price returns to middle band. Works best in range-bound markets.
            </p>
          </div>

          {/* Signal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockMeanReversionSignals.map((signal, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{signal.symbol}</h3>
                      <p className="text-green-100 text-sm">Bollinger Band Mean Reversion</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                        {signal.signal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Entry Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(signal.entry)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Target</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(signal.target)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Stop Loss</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(signal.stopLoss)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Risk:Reward</p>
                      <p className="text-lg font-bold text-blue-600">
                        {signal.riskReward.toFixed(2)}:1
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="text-sm font-bold text-gray-900">{signal.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>%B:</strong> {(signal.percentB * 100).toFixed(0)}% (Oversold)
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Price is {((1 - signal.percentB) * 100).toFixed(1)}% below lower Bollinger Band,
                      indicating strong oversold condition.
                    </p>
                  </div>

                  <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Execute Trade
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Showing {mockMeanReversionSignals.length} active mean reversion signals
          </div>
        </div>
      )}

      {/* Momentum Tab */}
      {activeStrategy === 'momentum' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Momentum Strategy:</strong> Buy the top 10% of stocks ranked by 20-day rate of
              change. Hold until momentum deteriorates. Works best in trending markets.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    20-Day Momentum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relative Strength
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockMomentumRankings.map((ranking) => (
                  <tr key={ranking.rank} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-blue-700">#{ranking.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{ranking.symbol}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(ranking.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {formatPercent(ranking.momentum, 1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-900 mr-2">
                          {ranking.relativeStrength}
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${ranking.relativeStrength}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-900 mr-2">
                          {ranking.confidence}%
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${ranking.confidence}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                        {ranking.signal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-medium">
                        Trade →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Strategy Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold text-gray-900">62.5%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Holding Period</p>
                  <p className="text-2xl font-bold text-gray-900">12 days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sharpe Ratio</p>
                  <p className="text-2xl font-bold text-gray-900">1.85</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Drawdown</p>
                  <p className="text-2xl font-bold text-red-600">-8.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
