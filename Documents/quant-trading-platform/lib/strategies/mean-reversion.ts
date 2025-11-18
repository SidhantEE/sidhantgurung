/**
 * Mean Reversion Trading Strategies
 *
 * Bollinger Band based mean reversion strategy
 */

import { StockData, EquitySignal, BollingerBands } from '@/lib/types';
import { calculateBollingerBands } from '@/lib/indicators/technical';

export interface MeanReversionConfig {
  period: number; // Lookback period for moving average
  stdDevMultiplier: number; // Number of standard deviations for bands
  oversoldThreshold: number; // %B threshold for oversold (e.g., 0.2 = 20%)
  overboughtThreshold: number; // %B threshold for overbought (e.g., 0.8 = 80%)
  exitAtMiddle: boolean; // Exit when price returns to middle band
  stopLossPercent: number; // Stop loss as percentage
  targetPercent: number; // Profit target as percentage
}

export const DEFAULT_MEAN_REVERSION_CONFIG: MeanReversionConfig = {
  period: 20,
  stdDevMultiplier: 2,
  oversoldThreshold: 0.2,
  overboughtThreshold: 0.8,
  exitAtMiddle: true,
  stopLossPercent: 2,
  targetPercent: 4,
};

/**
 * Generate mean reversion signals using Bollinger Bands
 */
export function generateMeanReversionSignals(
  data: StockData[],
  config: MeanReversionConfig = DEFAULT_MEAN_REVERSION_CONFIG
): EquitySignal[] {
  const signals: EquitySignal[] = [];

  // Calculate Bollinger Bands
  const prices = data.map((d) => d.close);
  const bollingerBands = calculateBollingerBands(prices, config.period, config.stdDevMultiplier);

  // Add timestamps to Bollinger Bands
  bollingerBands.forEach((bb, i) => {
    if (i < data.length) {
      bb.timestamp = data[i].timestamp;
    }
  });

  let position: 'long' | 'short' | null = null;
  let entryPrice = 0;
  let entryBB: BollingerBands | null = null;

  for (let i = config.period; i < data.length; i++) {
    const currentPrice = data[i].close;
    const bb = bollingerBands[i];

    // Skip if not enough data
    if (isNaN(bb.percentB)) {
      continue;
    }

    // ENTRY SIGNALS
    if (!position) {
      // Oversold - Buy Signal
      if (bb.percentB <= config.oversoldThreshold && currentPrice <= bb.lower) {
        const stopLoss = currentPrice * (1 - config.stopLossPercent / 100);
        const target = config.exitAtMiddle ? bb.middle : currentPrice * (1 + config.targetPercent / 100);

        // Calculate confidence based on how oversold
        const confidence = Math.min(100, (1 - bb.percentB) * 150);

        signals.push({
          id: `${data[i].symbol}-${data[i].timestamp.getTime()}-BUY`,
          timestamp: data[i].timestamp,
          symbol: data[i].symbol,
          type: 'BUY',
          strategy: 'bollinger-mean-reversion',
          entry: currentPrice,
          target,
          stopLoss,
          confidence: Number(confidence.toFixed(0)),
          positionSize: 0, // Will be calculated by backtester
          expectedReturn: ((target - currentPrice) / currentPrice) * 100,
          riskRewardRatio: Math.abs((target - currentPrice) / (currentPrice - stopLoss)),
          metadata: {
            percentB: bb.percentB,
            bandwidth: bb.bandwidth,
            upperBand: bb.upper,
            middleBand: bb.middle,
            lowerBand: bb.lower,
          },
        });

        position = 'long';
        entryPrice = currentPrice;
        entryBB = bb;
      }

      // Overbought - Sell Signal (for shorting, if enabled)
      // Note: Most retail traders don't short, so this is commented out
      // Uncomment if you want to enable short selling
      /*
      else if (bb.percentB >= config.overboughtThreshold && currentPrice >= bb.upper) {
        const stopLoss = currentPrice * (1 + config.stopLossPercent / 100);
        const target = config.exitAtMiddle ? bb.middle : currentPrice * (1 - config.targetPercent / 100);

        signals.push({
          id: `${data[i].symbol}-${data[i].timestamp.getTime()}-SELL`,
          timestamp: data[i].timestamp,
          symbol: data[i].symbol,
          type: 'SELL',
          strategy: 'bollinger-mean-reversion',
          entry: currentPrice,
          target,
          stopLoss,
          confidence: Math.min(100, bb.percentB * 150),
          positionSize: 0,
          expectedReturn: ((currentPrice - target) / currentPrice) * 100,
          riskRewardRatio: Math.abs((currentPrice - target) / (stopLoss - currentPrice)),
        });

        position = 'short';
        entryPrice = currentPrice;
        entryBB = bb;
      }
      */
    }

    // EXIT SIGNALS
    else if (position === 'long') {
      // Exit if price returns to middle band
      if (config.exitAtMiddle && currentPrice >= bb.middle) {
        signals.push({
          id: `${data[i].symbol}-${data[i].timestamp.getTime()}-SELL`,
          timestamp: data[i].timestamp,
          symbol: data[i].symbol,
          type: 'SELL',
          strategy: 'bollinger-mean-reversion',
          entry: currentPrice,
          confidence: 80,
          positionSize: 0,
          expectedReturn: 0,
          riskRewardRatio: 1,
          metadata: {
            reason: 'return-to-middle',
            entryPrice,
            pnlPercent: ((currentPrice - entryPrice) / entryPrice) * 100,
          },
        });

        position = null;
        entryPrice = 0;
        entryBB = null;
      }
    }
  }

  return signals;
}

/**
 * Calculate position size for mean reversion strategy
 */
export function calculateMeanReversionPositionSize(
  equity: number,
  riskPerTrade: number, // Percentage (e.g., 2 for 2%)
  entryPrice: number,
  stopLoss: number
): number {
  const riskAmount = equity * (riskPerTrade / 100);
  const riskPerShare = Math.abs(entryPrice - stopLoss);

  if (riskPerShare === 0) {
    return 0;
  }

  const shares = Math.floor(riskAmount / riskPerShare);
  return shares;
}

/**
 * Analyze mean reversion opportunities
 */
export function analyzeMeanReversionOpportunity(
  data: StockData[],
  config: MeanReversionConfig = DEFAULT_MEAN_REVERSION_CONFIG
): {
  currentPrice: number;
  bollingerBands: BollingerBands;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number; // 0-100
  recommendation: string;
} {
  const prices = data.map((d) => d.close);
  const bollingerBands = calculateBollingerBands(prices, config.period, config.stdDevMultiplier);

  const current = bollingerBands[bollingerBands.length - 1];
  const currentPrice = data[data.length - 1].close;

  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let strength = 0;
  let recommendation = '';

  if (isNaN(current.percentB)) {
    return {
      currentPrice,
      bollingerBands: current,
      signal: 'HOLD',
      strength: 0,
      recommendation: 'Insufficient data for analysis',
    };
  }

  // Oversold condition
  if (current.percentB <= config.oversoldThreshold) {
    signal = 'BUY';
    strength = Math.min(100, (1 - current.percentB) * 150);
    recommendation = `Strong oversold signal. Price is ${((1 - current.percentB) * 100).toFixed(1)}% below lower band. ` +
                    `Expected reversion to middle band at $${current.middle.toFixed(2)} (${(((current.middle - currentPrice) / currentPrice) * 100).toFixed(2)}% upside).`;
  }
  // Overbought condition
  else if (current.percentB >= config.overboughtThreshold) {
    signal = 'SELL';
    strength = Math.min(100, current.percentB * 150);
    recommendation = `Overbought signal. Price is ${((current.percentB - 0.5) * 200).toFixed(1)}% above middle band. ` +
                    `Consider taking profits or waiting for better entry.`;
  }
  // Neutral
  else {
    signal = 'HOLD';
    strength = Math.abs(current.percentB - 0.5) * 100;
    recommendation = `Price is within normal range (${(current.percentB * 100).toFixed(0)}th percentile of band). ` +
                    `Wait for price to reach oversold levels (< ${config.oversoldThreshold * 100}%) before buying.`;
  }

  return {
    currentPrice,
    bollingerBands: current,
    signal,
    strength: Number(strength.toFixed(0)),
    recommendation,
  };
}

/**
 * Backtest mean reversion strategy
 */
export function backtestMeanReversion(
  data: StockData[],
  config: MeanReversionConfig = DEFAULT_MEAN_REVERSION_CONFIG
): {
  signals: EquitySignal[];
  stats: {
    totalSignals: number;
    buySignals: number;
    sellSignals: number;
    averageConfidence: number;
    averageRiskReward: number;
  };
} {
  const signals = generateMeanReversionSignals(data, config);

  const buySignals = signals.filter((s) => s.type === 'BUY');
  const sellSignals = signals.filter((s) => s.type === 'SELL');

  const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
  const avgRR = signals
    .filter((s) => s.riskRewardRatio)
    .reduce((sum, s) => sum + s.riskRewardRatio, 0) / buySignals.length;

  return {
    signals,
    stats: {
      totalSignals: signals.length,
      buySignals: buySignals.length,
      sellSignals: sellSignals.length,
      averageConfidence: Number(avgConfidence.toFixed(0)),
      averageRiskReward: Number(avgRR.toFixed(2)),
    },
  };
}
