/**
 * Technical Indicators Library
 *
 * Implements common technical analysis indicators for trading strategies
 */

import { OHLCV, BollingerBands, MovingAverage, RSI, TechnicalIndicator } from '@/lib/types';

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result.push(sum / period);
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    if (i >= data.length) break;
    sum += data[i];
    result.push(NaN);
  }

  if (data.length < period) {
    return result;
  }

  result[period - 1] = sum / period;

  // Calculate remaining EMAs
  for (let i = period; i < data.length; i++) {
    const ema = (data[i] - result[i - 1]) * multiplier + result[i - 1];
    result.push(ema);
  }

  return result;
}

/**
 * Calculate Standard Deviation
 */
export function calculateStdDev(data: number[], period: number): number[] {
  const result: number[] = [];
  const sma = calculateSMA(data, period);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }

    let sumSquaredDiff = 0;
    for (let j = 0; j < period; j++) {
      const diff = data[i - j] - sma[i];
      sumSquaredDiff += diff * diff;
    }

    result.push(Math.sqrt(sumSquaredDiff / period));
  }

  return result;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBands[] {
  const sma = calculateSMA(prices, period);
  const stdDev = calculateStdDev(prices, period);
  const result: BollingerBands[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (isNaN(sma[i]) || isNaN(stdDev[i])) {
      result.push({
        timestamp: new Date(), // Will be set by caller
        upper: NaN,
        middle: NaN,
        lower: NaN,
        bandwidth: NaN,
        percentB: NaN,
      });
      continue;
    }

    const upper = sma[i] + stdDevMultiplier * stdDev[i];
    const lower = sma[i] - stdDevMultiplier * stdDev[i];
    const bandwidth = ((upper - lower) / sma[i]) * 100;
    const percentB = (prices[i] - lower) / (upper - lower);

    result.push({
      timestamp: new Date(),
      upper,
      middle: sma[i],
      lower,
      bandwidth,
      percentB,
    });
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): RSI[] {
  const result: RSI[] = [];
  const changes: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (i >= changes.length) break;
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // First RSI values are NaN
  for (let i = 0; i < period; i++) {
    result.push({
      timestamp: new Date(),
      value: NaN,
      signal: 'NEUTRAL',
    });
  }

  // Calculate RSI for remaining periods
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];

    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    let signal: 'OVERSOLD' | 'OVERBOUGHT' | 'NEUTRAL' = 'NEUTRAL';
    if (rsi < 30) signal = 'OVERSOLD';
    if (rsi > 70) signal = 'OVERBOUGHT';

    result.push({
      timestamp: new Date(),
      value: Number(rsi.toFixed(2)),
      signal,
    });
  }

  // Add one more to match price array length
  if (result.length < prices.length) {
    result.push(result[result.length - 1]);
  }

  return result;
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(ohlcv: OHLCV[], period: number = 14): number[] {
  const trueRanges: number[] = [];

  for (let i = 0; i < ohlcv.length; i++) {
    if (i === 0) {
      trueRanges.push(ohlcv[i].high - ohlcv[i].low);
      continue;
    }

    const highLow = ohlcv[i].high - ohlcv[i].low;
    const highClose = Math.abs(ohlcv[i].high - ohlcv[i - 1].close);
    const lowClose = Math.abs(ohlcv[i].low - ohlcv[i - 1].close);

    trueRanges.push(Math.max(highLow, highClose, lowClose));
  }

  return calculateEMA(trueRanges, period);
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macd: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macd.push(NaN);
    } else {
      macd.push(fastEMA[i] - slowEMA[i]);
    }
  }

  const signal = calculateEMA(macd.filter(v => !isNaN(v)), signalPeriod);

  // Pad signal array with NaN to match length
  const paddedSignal: number[] = [];
  let signalIndex = 0;
  for (let i = 0; i < macd.length; i++) {
    if (isNaN(macd[i])) {
      paddedSignal.push(NaN);
    } else {
      paddedSignal.push(signal[signalIndex] || NaN);
      signalIndex++;
    }
  }

  const histogram: number[] = [];
  for (let i = 0; i < macd.length; i++) {
    if (isNaN(macd[i]) || isNaN(paddedSignal[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macd[i] - paddedSignal[i]);
    }
  }

  return { macd, signal: paddedSignal, histogram };
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(
  ohlcv: OHLCV[],
  period: number = 14,
  smoothK: number = 3,
  smoothD: number = 3
): { k: number[]; d: number[] } {
  const k: number[] = [];

  for (let i = 0; i < ohlcv.length; i++) {
    if (i < period - 1) {
      k.push(NaN);
      continue;
    }

    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = 0; j < period; j++) {
      highestHigh = Math.max(highestHigh, ohlcv[i - j].high);
      lowestLow = Math.min(lowestLow, ohlcv[i - j].low);
    }

    const stochK = ((ohlcv[i].close - lowestLow) / (highestHigh - lowestLow)) * 100;
    k.push(stochK);
  }

  // Smooth %K
  const smoothedK = calculateSMA(k.filter(v => !isNaN(v)), smoothK);

  // Pad smoothed K
  const paddedK: number[] = [];
  let smoothedIndex = 0;
  for (let i = 0; i < k.length; i++) {
    if (isNaN(k[i])) {
      paddedK.push(NaN);
    } else {
      paddedK.push(smoothedK[smoothedIndex] || NaN);
      smoothedIndex++;
    }
  }

  // %D is SMA of smoothed %K
  const d = calculateSMA(paddedK.filter(v => !isNaN(v)), smoothD);

  // Pad %D
  const paddedD: number[] = [];
  let dIndex = 0;
  for (let i = 0; i < paddedK.length; i++) {
    if (isNaN(paddedK[i])) {
      paddedD.push(NaN);
    } else {
      paddedD.push(d[dIndex] || NaN);
      dIndex++;
    }
  }

  return { k: paddedK, d: paddedD };
}

/**
 * Calculate Rate of Change (ROC)
 */
export function calculateROC(prices: number[], period: number = 20): number[] {
  const result: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(NaN);
      continue;
    }

    const roc = ((prices[i] - prices[i - period]) / prices[i - period]) * 100;
    result.push(roc);
  }

  return result;
}

/**
 * Calculate Money Flow Index (MFI)
 */
export function calculateMFI(ohlcv: OHLCV[], period: number = 14): number[] {
  const result: number[] = [];
  const typicalPrices: number[] = [];
  const moneyFlows: number[] = [];

  // Calculate typical price and money flow
  for (let i = 0; i < ohlcv.length; i++) {
    const typicalPrice = (ohlcv[i].high + ohlcv[i].low + ohlcv[i].close) / 3;
    typicalPrices.push(typicalPrice);
    moneyFlows.push(typicalPrice * Number(ohlcv[i].volume));
  }

  for (let i = 0; i < ohlcv.length; i++) {
    if (i < period) {
      result.push(NaN);
      continue;
    }

    let positiveFlow = 0;
    let negativeFlow = 0;

    for (let j = 1; j <= period; j++) {
      if (typicalPrices[i - j + 1] > typicalPrices[i - j]) {
        positiveFlow += moneyFlows[i - j + 1];
      } else {
        negativeFlow += moneyFlows[i - j + 1];
      }
    }

    const moneyRatio = positiveFlow / negativeFlow;
    const mfi = 100 - (100 / (1 + moneyRatio));

    result.push(Number(mfi.toFixed(2)));
  }

  return result;
}

/**
 * Calculate historical volatility (annualized standard deviation of returns)
 */
export function calculateHistoricalVolatility(prices: number[], period: number = 20): number[] {
  const result: number[] = [];
  const returns: number[] = [];

  // Calculate log returns
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }

  // Calculate rolling standard deviation
  for (let i = 0; i < returns.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += returns[i - j];
    }
    const mean = sum / period;

    let sumSquaredDiff = 0;
    for (let j = 0; j < period; j++) {
      const diff = returns[i - j] - mean;
      sumSquaredDiff += diff * diff;
    }

    const variance = sumSquaredDiff / period;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized

    result.push(Number(volatility.toFixed(2)));
  }

  // Add NaN at beginning to match price array length
  result.unshift(NaN);

  return result;
}

/**
 * Detect moving average crossovers
 */
export function detectMACrossover(
  prices: number[],
  fastPeriod: number,
  slowPeriod: number
): ('GOLDEN_CROSS' | 'DEATH_CROSS' | 'NONE')[] {
  const fastMA = calculateSMA(prices, fastPeriod);
  const slowMA = calculateSMA(prices, slowPeriod);
  const signals: ('GOLDEN_CROSS' | 'DEATH_CROSS' | 'NONE')[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i === 0 || isNaN(fastMA[i]) || isNaN(slowMA[i]) || isNaN(fastMA[i - 1]) || isNaN(slowMA[i - 1])) {
      signals.push('NONE');
      continue;
    }

    // Golden Cross: fast crosses above slow
    if (fastMA[i] > slowMA[i] && fastMA[i - 1] <= slowMA[i - 1]) {
      signals.push('GOLDEN_CROSS');
    }
    // Death Cross: fast crosses below slow
    else if (fastMA[i] < slowMA[i] && fastMA[i - 1] >= slowMA[i - 1]) {
      signals.push('DEATH_CROSS');
    }
    else {
      signals.push('NONE');
    }
  }

  return signals;
}
