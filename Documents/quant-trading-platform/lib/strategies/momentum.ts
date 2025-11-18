/**
 * Momentum Trading Strategies
 *
 * Implements momentum-based trading strategies including ROC ranking
 */

import { StockData, EquitySignal } from '@/lib/types';
import { calculateROC, calculateSMA, calculateEMA } from '@/lib/indicators/technical';

export interface MomentumConfig {
  lookbackPeriod: number; // Period for calculating momentum (e.g., 20 days)
  topNPercent: number; // Top N% of stocks to buy (e.g., 10 for top 10%)
  bottomNPercent: number; // Bottom N% to short (e.g., 10 for bottom 10%)
  rebalancePeriod: number; // How often to rebalance (in days)
  fastMA: number; // Fast moving average period
  slowMA: number; // Slow moving average period
  minVolume: number; // Minimum average volume filter
}

export const DEFAULT_MOMENTUM_CONFIG: MomentumConfig = {
  lookbackPeriod: 20,
  topNPercent: 10,
  bottomNPercent: 10,
  rebalancePeriod: 5, // Weekly rebalancing
  fastMA: 50,
  slowMA: 200,
  minVolume: 100000,
};

export interface MomentumRanking {
  symbol: string;
  momentum: number; // ROC value
  rank: number; // 1 = highest momentum
  relativeStrength: number; // 0-100 percentile
  price: number;
  volume: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}

/**
 * Rank stocks by momentum (Rate of Change)
 */
export function rankStocksByMomentum(
  dataMap: Map<string, StockData[]>,
  config: MomentumConfig = DEFAULT_MOMENTUM_CONFIG
): MomentumRanking[] {
  const rankings: MomentumRanking[] = [];

  for (const [symbol, data] of dataMap) {
    if (data.length < config.lookbackPeriod) {
      continue;
    }

    // Calculate momentum (ROC)
    const prices = data.map((d) => d.close);
    const roc = calculateROC(prices, config.lookbackPeriod);

    const currentMomentum = roc[roc.length - 1];

    if (isNaN(currentMomentum)) {
      continue;
    }

    // Calculate average volume
    const avgVolume = data.slice(-20).reduce((sum, d) => sum + Number(d.volume), 0) / 20;

    // Filter by minimum volume
    if (avgVolume < config.minVolume) {
      continue;
    }

    rankings.push({
      symbol,
      momentum: currentMomentum,
      rank: 0, // Will be assigned after sorting
      relativeStrength: 0, // Will be calculated after sorting
      price: data[data.length - 1].close,
      volume: Number(data[data.length - 1].volume),
      signal: 'HOLD',
      confidence: 0,
    });
  }

  // Sort by momentum (descending)
  rankings.sort((a, b) => b.momentum - a.momentum);

  // Assign ranks and relative strength
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
    ranking.relativeStrength = ((rankings.length - index) / rankings.length) * 100;

    // Assign signals
    const topThreshold = Math.ceil(rankings.length * (config.topNPercent / 100));
    const bottomThreshold = rankings.length - Math.ceil(rankings.length * (config.bottomNPercent / 100));

    if (index < topThreshold) {
      ranking.signal = 'BUY';
      ranking.confidence = Math.min(100, 70 + (ranking.momentum * 2));
    } else if (index >= bottomThreshold) {
      ranking.signal = 'SELL';
      ranking.confidence = Math.min(100, 70 + Math.abs(ranking.momentum * 2));
    } else {
      ranking.signal = 'HOLD';
      ranking.confidence = 50;
    }
  });

  return rankings;
}

/**
 * Generate momentum signals with MA crossover confirmation
 */
export function generateMomentumSignals(
  data: StockData[],
  config: MomentumConfig = DEFAULT_MOMENTUM_CONFIG
): EquitySignal[] {
  const signals: EquitySignal[] = [];

  // Calculate indicators
  const prices = data.map((d) => d.close);
  const fastMA = calculateSMA(prices, config.fastMA);
  const slowMA = calculateSMA(prices, config.slowMA);
  const roc = calculateROC(prices, config.lookbackPeriod);

  let position: 'long' | null = null;
  let entryPrice = 0;

  for (let i = Math.max(config.fastMA, config.slowMA); i < data.length; i++) {
    const currentPrice = data[i].close;
    const prevFastMA = fastMA[i - 1];
    const prevSlowMA = slowMA[i - 1];
    const currentFastMA = fastMA[i];
    const currentSlowMA = slowMA[i];
    const currentROC = roc[i];

    // Skip if not enough data
    if (isNaN(currentFastMA) || isNaN(currentSlowMA) || isNaN(currentROC)) {
      continue;
    }

    // ENTRY SIGNAL: Golden Cross + Positive Momentum
    if (!position) {
      // Golden Cross: Fast MA crosses above Slow MA
      if (
        currentFastMA > currentSlowMA &&
        prevFastMA <= prevSlowMA &&
        currentROC > 0 // Positive momentum
      ) {
        const stopLoss = currentPrice * 0.95; // 5% stop loss
        const target = currentPrice * 1.15; // 15% target (3:1 R/R)

        const confidence = Math.min(100, 60 + currentROC * 1.5);

        signals.push({
          id: `${data[i].symbol}-${data[i].timestamp.getTime()}-BUY`,
          timestamp: data[i].timestamp,
          symbol: data[i].symbol,
          type: 'BUY',
          strategy: 'momentum-crossover',
          entry: currentPrice,
          target,
          stopLoss,
          confidence: Number(confidence.toFixed(0)),
          positionSize: 0,
          expectedReturn: 15,
          riskRewardRatio: 3,
          metadata: {
            fastMA: currentFastMA,
            slowMA: currentSlowMA,
            roc: currentROC,
            signal: 'golden-cross',
          },
        });

        position = 'long';
        entryPrice = currentPrice;
      }
    }

    // EXIT SIGNAL: Death Cross or negative momentum
    else if (position === 'long') {
      // Death Cross: Fast MA crosses below Slow MA
      if (
        currentFastMA < currentSlowMA &&
        prevFastMA >= prevSlowMA
      ) {
        signals.push({
          id: `${data[i].symbol}-${data[i].timestamp.getTime()}-SELL`,
          timestamp: data[i].timestamp,
          symbol: data[i].symbol,
          type: 'SELL',
          strategy: 'momentum-crossover',
          entry: currentPrice,
          confidence: 80,
          positionSize: 0,
          expectedReturn: ((currentPrice - entryPrice) / entryPrice) * 100,
          riskRewardRatio: 1,
          metadata: {
            signal: 'death-cross',
            entryPrice,
            pnlPercent: ((currentPrice - entryPrice) / entryPrice) * 100,
          },
        });

        position = null;
        entryPrice = 0;
      }
      // Also exit if momentum turns negative
      else if (currentROC < -5) {
        signals.push({
          id: `${data[i].symbol}-${data[i].timestamp.getTime()}-SELL`,
          timestamp: data[i].timestamp,
          symbol: data[i].symbol,
          type: 'SELL',
          strategy: 'momentum-crossover',
          entry: currentPrice,
          confidence: 75,
          positionSize: 0,
          expectedReturn: ((currentPrice - entryPrice) / entryPrice) * 100,
          riskRewardRatio: 1,
          metadata: {
            signal: 'negative-momentum',
            roc: currentROC,
            entryPrice,
            pnlPercent: ((currentPrice - entryPrice) / entryPrice) * 100,
          },
        });

        position = null;
        entryPrice = 0;
      }
    }
  }

  return signals;
}

/**
 * Analyze current momentum for a stock
 */
export function analyzeMomentum(
  data: StockData[],
  config: MomentumConfig = DEFAULT_MOMENTUM_CONFIG
): {
  currentPrice: number;
  momentum: number;
  fastMA: number;
  slowMA: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
  recommendation: string;
} {
  const prices = data.map((d) => d.close);
  const fastMA = calculateSMA(prices, config.fastMA);
  const slowMA = calculateSMA(prices, config.slowMA);
  const roc = calculateROC(prices, config.lookbackPeriod);

  const currentPrice = data[data.length - 1].close;
  const currentFastMA = fastMA[fastMA.length - 1];
  const currentSlowMA = slowMA[slowMA.length - 1];
  const currentMomentum = roc[roc.length - 1];

  let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let strength = 0;
  let recommendation = '';

  // Determine trend
  if (currentFastMA > currentSlowMA) {
    trend = 'BULLISH';
  } else if (currentFastMA < currentSlowMA) {
    trend = 'BEARISH';
  }

  // Determine signal
  if (trend === 'BULLISH' && currentMomentum > 5) {
    signal = 'BUY';
    strength = Math.min(100, 60 + currentMomentum);
    recommendation = `Strong bullish momentum (+${currentMomentum.toFixed(2)}% over ${config.lookbackPeriod} days). ` +
                    `Price is above both moving averages. Consider buying on pullbacks to the ${config.fastMA}-day MA at $${currentFastMA.toFixed(2)}.`;
  } else if (trend === 'BEARISH' && currentMomentum < -5) {
    signal = 'SELL';
    strength = Math.min(100, 60 + Math.abs(currentMomentum));
    recommendation = `Strong bearish momentum (${currentMomentum.toFixed(2)}% over ${config.lookbackPeriod} days). ` +
                    `Price is below both moving averages. Avoid buying or consider shorting.`;
  } else if (trend === 'BULLISH' && currentMomentum > 0) {
    signal = 'HOLD';
    strength = 50 + currentMomentum * 2;
    recommendation = `Moderate bullish trend. Momentum is positive but not strong. ` +
                    `Wait for confirmation with stronger momentum (> +5%) before buying.`;
  } else {
    signal = 'HOLD';
    strength = 30;
    recommendation = `Weak or no clear trend. Price is ${trend.toLowerCase()}. ` +
                    `Wait for clearer momentum signal before entering.`;
  }

  return {
    currentPrice,
    momentum: currentMomentum,
    fastMA: currentFastMA,
    slowMA: currentSlowMA,
    trend,
    signal,
    strength: Number(strength.toFixed(0)),
    recommendation,
  };
}

/**
 * Find the best momentum stocks from a universe
 */
export function findBestMomentumStocks(
  dataMap: Map<string, StockData[]>,
  topN: number = 10,
  config: MomentumConfig = DEFAULT_MOMENTUM_CONFIG
): MomentumRanking[] {
  const rankings = rankStocksByMomentum(dataMap, config);

  // Return top N with BUY signals
  return rankings
    .filter((r) => r.signal === 'BUY')
    .slice(0, topN);
}

/**
 * Backtest momentum strategy
 */
export function backtestMomentum(
  data: StockData[],
  config: MomentumConfig = DEFAULT_MOMENTUM_CONFIG
): {
  signals: EquitySignal[];
  stats: {
    totalSignals: number;
    buySignals: number;
    sellSignals: number;
    averageConfidence: number;
    averageHoldingPeriod: number;
  };
} {
  const signals = generateMomentumSignals(data, config);

  const buySignals = signals.filter((s) => s.type === 'BUY');
  const sellSignals = signals.filter((s) => s.type === 'SELL');

  const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / (signals.length || 1);

  // Calculate average holding period
  const holdingPeriods: number[] = [];
  let lastBuyDate: Date | null = null;

  for (const signal of signals) {
    if (signal.type === 'BUY') {
      lastBuyDate = signal.timestamp;
    } else if (signal.type === 'SELL' && lastBuyDate) {
      const holdingPeriod = (signal.timestamp.getTime() - lastBuyDate.getTime()) / (24 * 60 * 60 * 1000);
      holdingPeriods.push(holdingPeriod);
      lastBuyDate = null;
    }
  }

  const avgHoldingPeriod = holdingPeriods.length > 0
    ? holdingPeriods.reduce((sum, p) => sum + p, 0) / holdingPeriods.length
    : 0;

  return {
    signals,
    stats: {
      totalSignals: signals.length,
      buySignals: buySignals.length,
      sellSignals: sellSignals.length,
      averageConfidence: Number(avgConfidence.toFixed(0)),
      averageHoldingPeriod: Number(avgHoldingPeriod.toFixed(1)),
    },
  };
}
