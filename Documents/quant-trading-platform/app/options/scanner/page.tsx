'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';

// Mock data for demonstration
const mockArbitrageOpportunities = [
  {
    symbol: 'AAPL',
    type: 'Put-Call Parity',
    strike: 180,
    expiration: new Date('2025-02-21'),
    profit: 0.42,
    roi: 8.5,
    risk: 'Low',
    description: 'Synthetic long arbitrage opportunity on AAPL $180 strike',
  },
  {
    symbol: 'SPY',
    type: 'Box Spread',
    strike: 480,
    expiration: new Date('2025-02-14'),
    profit: 0.28,
    roi: 12.3,
    risk: 'Low',
    description: 'Box spread between $480-$485 strikes',
  },
];

const mockIVRankings = [
  {
    symbol: 'TSLA',
    currentIV: 92,
    ivRank: 94,
    ivPercentile: 96,
    historicalVol: 45,
    recommendation: 'SELL',
  },
  {
    symbol: 'NVDA',
    currentIV: 88,
    ivRank: 91,
    ivPercentile: 93,
    historicalVol: 50,
    recommendation: 'SELL',
  },
  {
    symbol: 'AAPL',
    currentIV: 18,
    ivRank: 12,
    ivPercentile: 15,
    historicalVol: 28,
    recommendation: 'BUY',
  },
];

const mockUnusualFlow = [
  {
    symbol: 'AAPL',
    optionSymbol: 'AAPL250221C180',
    type: 'CALL',
    strike: 180,
    expiration: new Date('2025-02-21'),
    premium: 2400000,
    volume: 5200,
    openInterest: 1200,
    sentiment: 'BULLISH',
  },
  {
    symbol: 'TSLA',
    optionSymbol: 'TSLA250214P240',
    type: 'PUT',
    strike: 240,
    expiration: new Date('2025-02-14'),
    premium: 1850000,
    volume: 3800,
    openInterest: 850,
    sentiment: 'BEARISH',
  },
];

export default function OptionsScanner() {
  const [activeTab, setActiveTab] = useState<'arbitrage' | 'iv-rank' | 'unusual-flow'>('arbitrage');
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
        <h1 className="text-3xl font-bold text-gray-900">Options Scanner</h1>
        <p className="mt-2 text-gray-600">
          Real-time options arbitrage, IV rank, and unusual flow detection
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('arbitrage')}
            className={`${
              activeTab === 'arbitrage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Arbitrage Opportunities
          </button>
          <button
            onClick={() => setActiveTab('iv-rank')}
            className={`${
              activeTab === 'iv-rank'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            IV Rank Scanner
          </button>
          <button
            onClick={() => setActiveTab('unusual-flow')}
            className={`${
              activeTab === 'unusual-flow'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Unusual Options Flow
          </button>
        </nav>
      </div>

      {/* Arbitrage Tab */}
      {activeTab === 'arbitrage' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Arbitrage Opportunities:</strong> Risk-free or low-risk trades exploiting price
              inefficiencies. Execute these quickly as they disappear fast.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strike / Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit/Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockArbitrageOpportunities.map((opp, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{opp.symbol}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                        {opp.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${opp.strike} / {formatDate(opp.expiration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(opp.profit * 100)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {formatPercent(opp.roi, 1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        opp.risk === 'Low'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {opp.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-medium">
                        Execute →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {mockArbitrageOpportunities.length} arbitrage opportunities
          </div>
        </div>
      )}

      {/* IV Rank Tab */}
      {activeTab === 'iv-rank' && (
        <div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>IV Rank:</strong> Shows where current implied volatility ranks historically (0-100).
              High IV Rank (80+) = Sell options. Low IV Rank (20-) = Buy options.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current IV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IV Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IV Percentile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Historical Vol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IV - HV Spread
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockIVRankings.map((iv, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{iv.symbol}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {iv.currentIV}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-bold ${
                          iv.ivRank > 80 ? 'text-red-600' :
                          iv.ivRank < 20 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {iv.ivRank}
                        </span>
                        <div className="ml-2 w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              iv.ivRank > 80 ? 'bg-red-500' :
                              iv.ivRank < 20 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${iv.ivRank}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {iv.ivPercentile}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {iv.historicalVol}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {iv.currentIV - iv.historicalVol > 0 ? '+' : ''}
                      {iv.currentIV - iv.historicalVol}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded ${
                        iv.recommendation === 'SELL'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {iv.recommendation} OPTIONS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {mockIVRankings.length} stocks with IV rank data
          </div>
        </div>
      )}

      {/* Unusual Flow Tab */}
      {activeTab === 'unusual-flow' && (
        <div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>Unusual Options Flow:</strong> Large premium trades that may indicate institutional
              or "smart money" positioning. Follow the money!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Option
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strike / Exp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume / OI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentiment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockUnusualFlow.map((flow, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{flow.symbol}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {flow.optionSymbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        flow.type === 'CALL'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {flow.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${flow.strike} / {formatDate(flow.expiration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-purple-600">
                        {formatCurrency(flow.premium / 1000)}K
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flow.volume.toLocaleString()} / {flow.openInterest.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded ${
                        flow.sentiment === 'BULLISH'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {flow.sentiment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {mockUnusualFlow.length} unusual option trades
          </div>
        </div>
      )}
    </div>
  );
}
