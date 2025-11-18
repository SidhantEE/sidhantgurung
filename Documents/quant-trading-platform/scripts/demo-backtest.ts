/**
 * Comprehensive Demo Script
 *
 * Demonstrates all features of the Quant Trading Platform:
 * 1. Generate mock market data
 * 2. Run mean reversion strategy backtest
 * 3. Run momentum strategy backtest
 * 4. Scan for options arbitrage
 * 5. Calculate IV Rank
 * 6. Detect unusual flow
 * 7. Display results
 */

import { generateMockStockDataWithPattern } from '../lib/data/stock-data';
import { generateMockOptionsChain } from '../lib/data/options-data';
import { backtestMeanReversion } from '../lib/strategies/mean-reversion';
import { backtestMomentum } from '../lib/strategies/momentum';
import { EquityBacktester } from '../lib/backtest/equity-backtest';
import { scanPutCallParityArbitrage, scanBoxSpreadArbitrage } from '../lib/strategies/options-arbitrage';
import { analyzeIVRank } from '../lib/strategies/iv-rank';
import { detectUnusualOptionsFlow, analyzeStockUnusualFlow } from '../lib/strategies/unusual-flow';
import type { StockData } from '../lib/types';

console.log('🚀 QUANT TRADING PLATFORM - COMPREHENSIVE DEMO\n');
console.log('================================================\n');

// ============================================================================
// 1. GENERATE MARKET DATA
// ============================================================================

console.log('📊 Generating Mock Market Data...\n');

const symbols = ['AAPL', 'MSFT', 'TSLA', 'SPY', 'NVDA'];
const stockDataMap = new Map();

for (const symbol of symbols) {
  const pattern = symbol === 'SPY' ? 'mean-reverting' :
                  symbol === 'TSLA' ? 'volatile' :
                  symbol === 'NVDA' ? 'trending-up' : 'mean-reverting';

  const data = generateMockStockDataWithPattern(symbol, pattern, 252, 100);
  stockDataMap.set(symbol, data);

  console.log(`✓ ${symbol}: Generated ${data.length} days of ${pattern} data`);
}

console.log('\n');

// ============================================================================
// 2. BACKTEST MEAN REVERSION STRATEGY
// ============================================================================

console.log('📈 MEAN REVERSION STRATEGY (Bollinger Bands)\n');
console.log('─────────────────────────────────────────────\n');

const aaplData = stockDataMap.get('AAPL');
const { signals: mrSignals, stats: mrStats } = backtestMeanReversion(aaplData);

console.log(`Testing on: AAPL (Mean-Reverting Pattern)`);
console.log(`Total Signals: ${mrStats.totalSignals}`);
console.log(`Buy Signals: ${mrStats.buySignals}`);
console.log(`Sell Signals: ${mrStats.sellSignals}`);
console.log(`Average Confidence: ${mrStats.averageConfidence}%`);
console.log(`Average Risk:Reward: ${mrStats.averageRiskReward}:1`);

// Run full backtest
const backtester = new EquityBacktester({
  initialCapital: 100000,
  commission: 1.00,
  slippage: 0.001,
  positionSizing: 'percent-equity',
  positionSize: 20, // 20% per position
});

// Simulate trades
for (const signal of mrSignals) {
  const priceIdx = aaplData.findIndex((d: StockData) => d.timestamp.getTime() === signal.timestamp.getTime());

  if (priceIdx === -1) continue;

  if (signal.type === 'BUY') {
    backtester.buy(
      signal.symbol,
      signal.entry,
      signal.timestamp,
      'mean-reversion',
      undefined,
      signal.stopLoss,
      signal.target
    );
  } else if (signal.type === 'SELL') {
    backtester.sell(signal.symbol, signal.entry, signal.timestamp, 'mean-reversion');
  }

  // Update equity with current prices
  const currentPrices = new Map([[signal.symbol, aaplData[priceIdx].close]]);
  backtester.updateEquity(currentPrices, signal.timestamp);
}

const mrResults = backtester.generateResults(
  'Bollinger Band Mean Reversion',
  'AAPL',
  aaplData[0].timestamp,
  aaplData[aaplData.length - 1].timestamp
);

console.log(`\n📊 Backtest Results:`);
console.log(`Total Return: $${mrResults.totalReturn.toFixed(2)} (${mrResults.totalReturnPercent.toFixed(2)}%)`);
console.log(`Annualized Return: ${mrResults.annualizedReturn.toFixed(2)}%`);
console.log(`Sharpe Ratio: ${mrResults.sharpeRatio}`);
console.log(`Max Drawdown: -${mrResults.maxDrawdownPercent.toFixed(2)}%`);
console.log(`Win Rate: ${mrResults.winRate.toFixed(1)}%`);
console.log(`Profit Factor: ${mrResults.profitFactor.toFixed(2)}`);
console.log(`Total Trades: ${mrResults.totalTrades}`);

console.log('\n');

// ============================================================================
// 3. BACKTEST MOMENTUM STRATEGY
// ============================================================================

console.log('🚀 MOMENTUM STRATEGY (Trend Following)\n');
console.log('─────────────────────────────────────────────\n');

const nvdaData = stockDataMap.get('NVDA');
const { signals: momSignals, stats: momStats } = backtestMomentum(nvdaData);

console.log(`Testing on: NVDA (Trending Pattern)`);
console.log(`Total Signals: ${momStats.totalSignals}`);
console.log(`Buy Signals: ${momStats.buySignals}`);
console.log(`Sell Signals: ${momStats.sellSignals}`);
console.log(`Average Confidence: ${momStats.averageConfidence}%`);
console.log(`Average Holding Period: ${momStats.averageHoldingPeriod} days`);

console.log('\n💡 Sample Signal:');
if (momSignals.length > 0) {
  const sample = momSignals[0];
  console.log(`  ${sample.symbol} - ${sample.type} at $${sample.entry.toFixed(2)}`);
  console.log(`  Target: $${sample.target?.toFixed(2)}`);
  console.log(`  Stop Loss: $${sample.stopLoss?.toFixed(2)}`);
  console.log(`  Confidence: ${sample.confidence}%`);
}

console.log('\n');

// ============================================================================
// 4. OPTIONS ARBITRAGE SCANNER
// ============================================================================

console.log('💰 OPTIONS ARBITRAGE OPPORTUNITIES\n');
console.log('─────────────────────────────────────────────\n');

const underlyingPrice = 100;
const optionsChain = generateMockOptionsChain('AAPL', underlyingPrice, 30);

// Put-Call Parity
const pcpArbitrage = scanPutCallParityArbitrage(optionsChain, underlyingPrice, {
  minProfitPerContract: 0.05,
  minROI: 3,
  maxDaysToExpiration: 60,
  riskFreeRate: 0.05,
  transactionCost: 0.65,
});

console.log(`🎯 Put-Call Parity Violations Found: ${pcpArbitrage.length}\n`);

if (pcpArbitrage.length > 0) {
  const top = pcpArbitrage[0];
  console.log(`Top Opportunity:`);
  console.log(`  Symbol: ${top.symbol}`);
  console.log(`  Type: ${top.type}`);
  console.log(`  Profit per Contract: $${(top.profitPerContract * 100).toFixed(2)}`);
  console.log(`  ROI: ${top.roi.toFixed(2)}%`);
  console.log(`  Risk: ${top.risk}`);
  console.log(`  ${top.description}\n`);
}

// Box Spreads
const boxArbitrage = scanBoxSpreadArbitrage(optionsChain, {
  minProfitPerContract: 0.05,
  minROI: 3,
  maxDaysToExpiration: 60,
  riskFreeRate: 0.05,
  transactionCost: 0.65,
});

console.log(`📦 Box Spread Opportunities Found: ${boxArbitrage.length}\n`);

if (boxArbitrage.length > 0) {
  const top = boxArbitrage[0];
  console.log(`Top Opportunity:`);
  console.log(`  Symbol: ${top.symbol}`);
  console.log(`  Profit per Contract: $${(top.profitPerContract * 100).toFixed(2)}`);
  console.log(`  ROI: ${top.roi.toFixed(2)}%`);
  console.log(`  ${top.description}\n`);
}

console.log('\n');

// ============================================================================
// 5. IV RANK ANALYSIS
// ============================================================================

console.log('📊 IMPLIED VOLATILITY RANK ANALYSIS\n');
console.log('─────────────────────────────────────────────\n');

const tslaData = stockDataMap.get('TSLA');
const tslaOptions = generateMockOptionsChain('TSLA', tslaData[tslaData.length - 1].close, 30);
const ivRank = analyzeIVRank('TSLA', tslaOptions, tslaData);

console.log(`Symbol: ${ivRank.symbol}`);
console.log(`Current IV: ${ivRank.currentIV}%`);
console.log(`IV Rank: ${ivRank.ivRank} (${ivRank.ivPercentile}th percentile)`);
console.log(`Historical Volatility: ${ivRank.historicalVolatility}%`);
console.log(`IV - HV Spread: ${ivRank.ivHVSpread.toFixed(2)}%`);
console.log(`\n💡 Recommendation: ${ivRank.recommendation} OPTIONS`);

if (ivRank.ivRank > 80) {
  console.log(`\n✨ High IV environment - great for selling options (iron condors, credit spreads)`);
} else if (ivRank.ivRank < 20) {
  console.log(`\n✨ Low IV environment - great for buying options (long calls, puts, straddles)`);
}

console.log('\n');

// ============================================================================
// 6. UNUSUAL OPTIONS FLOW
// ============================================================================

console.log('🔍 UNUSUAL OPTIONS FLOW DETECTION\n');
console.log('─────────────────────────────────────────────\n');

const unusualFlow = detectUnusualOptionsFlow(tslaOptions, {
  minPremium: 10000, // Lower threshold for demo
  minVolumeOIRatio: 1.5,
  minVolume: 50,
  sweepThreshold: 3,
});

console.log(`Unusual Trades Detected: ${unusualFlow.length}\n`);

if (unusualFlow.length > 0) {
  const analysis = analyzeStockUnusualFlow('TSLA', unusualFlow);

  console.log(`${analysis.symbol} Unusual Flow Summary:`);
  console.log(`  Total Premium: $${(analysis.totalPremium / 1000000).toFixed(2)}M`);
  console.log(`  Calls: $${(analysis.callPremium / 1000000).toFixed(2)}M`);
  console.log(`  Puts: $${(analysis.putPremium / 1000000).toFixed(2)}M`);
  console.log(`  Net Sentiment: ${analysis.netSentiment} (${analysis.confidence}% confidence)`);
  console.log(`\n  ${analysis.summary}\n`);
}

console.log('\n');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('=' .repeat(60));
console.log('🎉 DEMO COMPLETE!\n');
console.log('This platform includes:');
console.log('  ✓ Black-Scholes Options Pricing & Greeks');
console.log('  ✓ Technical Indicators (Bollinger Bands, RSI, MACD, etc.)');
console.log('  ✓ Comprehensive Backtesting Engine');
console.log('  ✓ Mean Reversion Strategy (Bollinger Bands)');
console.log('  ✓ Momentum Strategy (Trend Following)');
console.log('  ✓ Put-Call Parity Arbitrage Scanner');
console.log('  ✓ Box Spread Arbitrage Scanner');
console.log('  ✓ IV Rank Calculator & Analysis');
console.log('  ✓ Unusual Options Flow Detection');
console.log('  ✓ Interactive Web Dashboard (Next.js)');
console.log('\n' + '='.repeat(60));
