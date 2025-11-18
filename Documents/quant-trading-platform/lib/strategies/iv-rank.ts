/**
 * Implied Volatility Rank and Analysis
 *
 * Calculates IV Rank and identifies options trading opportunities based on volatility
 */

import { OptionData, IVRank, StockData } from '@/lib/types';
import { calculateHistoricalVolatility } from '@/lib/indicators/technical';

export interface IVRankConfig {
  lookbackPeriod: number; // Days to look back for IV history (e.g., 252 = 1 year)
  lowIVThreshold: number; // Percentile threshold for "cheap" (e.g., 20)
  highIVThreshold: number; // Percentile threshold for "expensive" (e.g., 80)
}

export const DEFAULT_IV_RANK_CONFIG: IVRankConfig = {
  lookbackPeriod: 252,
  lowIVThreshold: 20,
  highIVThreshold: 80,
};

/**
 * Calculate IV Rank for an option
 * IV Rank = (Current IV - IV Low) / (IV High - IV Low) * 100
 */
export function calculateIVRank(
  currentIV: number,
  historicalIVs: number[]
): { ivRank: number; ivPercentile: number } {
  if (historicalIVs.length === 0) {
    return { ivRank: 50, ivPercentile: 50 };
  }

  const ivLow = Math.min(...historicalIVs);
  const ivHigh = Math.max(...historicalIVs);

  // IV Rank
  const ivRank = ivHigh !== ivLow
    ? ((currentIV - ivLow) / (ivHigh - ivLow)) * 100
    : 50;

  // IV Percentile (what % of days had lower IV)
  const lowerIVDays = historicalIVs.filter((iv) => iv < currentIV).length;
  const ivPercentile = (lowerIVDays / historicalIVs.length) * 100;

  return {
    ivRank: Number(ivRank.toFixed(2)),
    ivPercentile: Number(ivPercentile.toFixed(2)),
  };
}

/**
 * Analyze IV for a stock and generate trading recommendations
 */
export function analyzeIVRank(
  symbol: string,
  options: OptionData[],
  stockData: StockData[],
  config: IVRankConfig = DEFAULT_IV_RANK_CONFIG
): IVRank {
  // Get ATM options to calculate current IV
  const atmOptions = getATMOptions(options, stockData[stockData.length - 1].close);

  if (atmOptions.length === 0) {
    return {
      symbol,
      currentIV: 0,
      ivRank: 50,
      ivPercentile: 50,
      historicalVolatility: 0,
      ivHVSpread: 0,
      recommendation: 'HOLD',
    };
  }

  // Average IV of ATM options
  const currentIV = atmOptions.reduce((sum, opt) => sum + opt.impliedVolatility, 0) / atmOptions.length;

  // Calculate historical volatility
  const prices = stockData.map((d) => d.close);
  const hvArray = calculateHistoricalVolatility(prices, 20);
  const historicalVolatility = hvArray[hvArray.length - 1] || 0;

  // For IV Rank, we need historical IV values
  // In a real system, this would come from a database
  // For now, we'll simulate it based on current IV with some variance
  const historicalIVs = simulateHistoricalIV(currentIV, config.lookbackPeriod);

  const { ivRank, ivPercentile } = calculateIVRank(currentIV, historicalIVs);

  // Calculate IV-HV spread
  const ivHVSpread = currentIV - historicalVolatility;

  // Generate recommendation
  let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

  if (ivRank < config.lowIVThreshold) {
    // Low IV = Buy options (they're cheap)
    recommendation = 'BUY';
  } else if (ivRank > config.highIVThreshold) {
    // High IV = Sell options (they're expensive)
    recommendation = 'SELL';
  }

  return {
    symbol,
    currentIV: Number(currentIV.toFixed(2)),
    ivRank: Number(ivRank.toFixed(2)),
    ivPercentile: Number(ivPercentile.toFixed(2)),
    historicalVolatility: Number(historicalVolatility.toFixed(2)),
    ivHVSpread: Number(ivHVSpread.toFixed(2)),
    recommendation,
  };
}

/**
 * Scan multiple stocks for IV Rank opportunities
 */
export function scanIVRankOpportunities(
  stockOptionsMap: Map<string, { options: OptionData[]; stockData: StockData[] }>,
  config: IVRankConfig = DEFAULT_IV_RANK_CONFIG
): IVRank[] {
  const results: IVRank[] = [];

  for (const [symbol, data] of stockOptionsMap) {
    const ivRank = analyzeIVRank(symbol, data.options, data.stockData, config);
    results.push(ivRank);
  }

  return results;
}

/**
 * Find best options to BUY (low IV)
 */
export function findLowIVOpportunities(
  stockOptionsMap: Map<string, { options: OptionData[]; stockData: StockData[] }>,
  config: IVRankConfig = DEFAULT_IV_RANK_CONFIG,
  topN: number = 10
): IVRank[] {
  const allRanks = scanIVRankOpportunities(stockOptionsMap, config);

  return allRanks
    .filter((rank) => rank.recommendation === 'BUY')
    .sort((a, b) => a.ivRank - b.ivRank)
    .slice(0, topN);
}

/**
 * Find best options to SELL (high IV)
 */
export function findHighIVOpportunities(
  stockOptionsMap: Map<string, { options: OptionData[]; stockData: StockData[] }>,
  config: IVRankConfig = DEFAULT_IV_RANK_CONFIG,
  topN: number = 10
): IVRank[] {
  const allRanks = scanIVRankOpportunities(stockOptionsMap, config);

  return allRanks
    .filter((rank) => rank.recommendation === 'SELL')
    .sort((a, b) => b.ivRank - a.ivRank)
    .slice(0, topN);
}

/**
 * Get ATM (at-the-money) options
 */
function getATMOptions(options: OptionData[], underlyingPrice: number): OptionData[] {
  // Find options within 2% of current price
  return options.filter((opt) => {
    const moneyness = Math.abs(opt.strike - underlyingPrice) / underlyingPrice;
    return moneyness < 0.02;
  });
}

/**
 * Simulate historical IV values (for demo purposes)
 * In production, this would come from a database
 */
function simulateHistoricalIV(currentIV: number, days: number): number[] {
  const historicalIVs: number[] = [];
  let iv = currentIV;

  for (let i = 0; i < days; i++) {
    // Random walk with mean reversion
    const change = (Math.random() - 0.5) * 0.05 * currentIV;
    const meanReversion = (currentIV - iv) * 0.02;
    iv += change + meanReversion;

    // Keep IV in reasonable bounds (10% to 200%)
    iv = Math.max(10, Math.min(200, iv));

    historicalIVs.push(iv);
  }

  return historicalIVs;
}

/**
 * Generate IV Rank strategy recommendations
 */
export function generateIVRankStrategy(
  ivRank: IVRank
): {
  strategy: string;
  action: string;
  rationale: string;
  suggestedTrades: string[];
} {
  let strategy = '';
  let action = '';
  let rationale = '';
  const suggestedTrades: string[] = [];

  if (ivRank.recommendation === 'BUY') {
    strategy = 'Long Volatility';
    action = 'BUY options (long premium)';
    rationale = `IV Rank is ${ivRank.ivRank} (${ivRank.ivPercentile}th percentile), indicating options are cheap relative to history. ` +
                `Current IV (${ivRank.currentIV}%) vs Historical Vol (${ivRank.historicalVolatility}%). ` +
                `This is a good time to buy options, as volatility is likely to expand.`;

    suggestedTrades.push('Buy ATM calls if bullish on the stock');
    suggestedTrades.push('Buy ATM puts if bearish on the stock');
    suggestedTrades.push('Buy straddles/strangles if expecting a big move in either direction');
    suggestedTrades.push('Avoid selling naked options (low premium received)');
  } else if (ivRank.recommendation === 'SELL') {
    strategy = 'Short Volatility';
    action = 'SELL options (short premium)';
    rationale = `IV Rank is ${ivRank.ivRank} (${ivRank.ivPercentile}th percentile), indicating options are expensive relative to history. ` +
                `Current IV (${ivRank.currentIV}%) vs Historical Vol (${ivRank.historicalVolatility}%). ` +
                `This is a good time to sell options, as volatility is likely to contract.`;

    suggestedTrades.push('Sell covered calls (if you own the stock)');
    suggestedTrades.push('Sell cash-secured puts (if you want to own the stock)');
    suggestedTrades.push('Sell iron condors (range-bound strategy)');
    suggestedTrades.push('Sell credit spreads (defined-risk premium collection)');
    suggestedTrades.push('Avoid buying options (expensive premium)');
  } else {
    strategy = 'Neutral';
    action = 'WAIT for better opportunity';
    rationale = `IV Rank is ${ivRank.ivRank} (${ivRank.ivPercentile}th percentile), which is in the middle range. ` +
                `Options are neither particularly cheap nor expensive. ` +
                `Wait for IV Rank to move below ${DEFAULT_IV_RANK_CONFIG.lowIVThreshold} (buy opportunities) ` +
                `or above ${DEFAULT_IV_RANK_CONFIG.highIVThreshold} (sell opportunities).`;

    suggestedTrades.push('Monitor for IV changes');
    suggestedTrades.push('Consider delta-neutral strategies (calendars, diagonals)');
    suggestedTrades.push('Focus on directional stock trades instead of options');
  }

  return {
    strategy,
    action,
    rationale,
    suggestedTrades,
  };
}

/**
 * Detect IV crush scenarios (e.g., before/after earnings)
 */
export function detectIVCrush(
  beforeIV: number,
  afterIV: number
): {
  crushOccurred: boolean;
  crushPercentage: number;
  severity: 'mild' | 'moderate' | 'severe';
  impact: string;
} {
  const crushPercentage = ((beforeIV - afterIV) / beforeIV) * 100;
  const crushOccurred = crushPercentage > 20; // 20% drop is significant

  let severity: 'mild' | 'moderate' | 'severe' = 'mild';
  if (crushPercentage > 50) {
    severity = 'severe';
  } else if (crushPercentage > 35) {
    severity = 'moderate';
  }

  let impact = '';
  if (crushOccurred) {
    impact = `IV dropped ${crushPercentage.toFixed(1)}% from ${beforeIV.toFixed(1)}% to ${afterIV.toFixed(1)}%. ` +
             `Long option holders lost significant value even if stock didn't move. ` +
             `Option sellers (credit spreads, iron condors) profited from the crush.`;
  } else {
    impact = `No significant IV crush detected. IV changed by only ${crushPercentage.toFixed(1)}%.`;
  }

  return {
    crushOccurred,
    crushPercentage: Number(crushPercentage.toFixed(2)),
    severity,
    impact,
  };
}
