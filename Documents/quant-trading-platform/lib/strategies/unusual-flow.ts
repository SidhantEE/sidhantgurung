/**
 * Unusual Options Flow Detector
 *
 * Identifies unusual options activity that may indicate smart money positioning
 */

import { OptionData, UnusualOptionsFlow } from '@/lib/types';

export interface UnusualFlowConfig {
  minPremium: number; // Minimum premium to consider (e.g., $50,000)
  minVolumeOIRatio: number; // Minimum volume/OI ratio (e.g., 2.0)
  minVolume: number; // Minimum volume threshold
  sweepThreshold: number; // Multiple exchanges hit at once
}

export const DEFAULT_UNUSUAL_FLOW_CONFIG: UnusualFlowConfig = {
  minPremium: 50000,
  minVolumeOIRatio: 2.0,
  minVolume: 100,
  sweepThreshold: 3,
};

/**
 * Detect unusual options activity
 */
export function detectUnusualOptionsFlow(
  options: OptionData[],
  config: UnusualFlowConfig = DEFAULT_UNUSUAL_FLOW_CONFIG
): UnusualOptionsFlow[] {
  const unusualActivity: UnusualOptionsFlow[] = [];

  for (const option of options) {
    // Calculate premium (volume * price * 100 shares per contract)
    const midPrice = (option.bid + option.ask) / 2;
    const premium = Number(option.volume) * midPrice * 100;

    // Check if premium meets threshold
    if (premium < config.minPremium) {
      continue;
    }

    // Calculate volume/OI ratio
    const volumeOIRatio = Number(option.openInterest) > 0
      ? Number(option.volume) / Number(option.openInterest)
      : 0;

    // Check if volume is significant
    if (Number(option.volume) < config.minVolume) {
      continue;
    }

    // Determine if this is unusual
    const isUnusual =
      volumeOIRatio >= config.minVolumeOIRatio ||
      premium >= config.minPremium * 2 ||
      (Number(option.volume) > Number(option.openInterest) && premium >= config.minPremium);

    if (!isUnusual) {
      continue;
    }

    // Determine sentiment
    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';

    // High volume in calls = bullish
    // High volume in puts = bearish
    // But also consider if it's a buy or sell (we'll infer from bid/ask)

    const bidAskSpread = option.ask - option.bid;
    const lastVsAsk = Math.abs(option.last - option.ask);
    const lastVsBid = Math.abs(option.last - option.bid);

    // If last price is closer to ask, likely buyers (aggressive)
    const isBuy = lastVsAsk < lastVsBid;

    if (option.type === 'call' && isBuy) {
      sentiment = 'BULLISH';
    } else if (option.type === 'put' && isBuy) {
      sentiment = 'BEARISH';
    } else if (option.type === 'call' && !isBuy) {
      sentiment = 'BEARISH'; // Selling calls = bearish
    } else if (option.type === 'put' && !isBuy) {
      sentiment = 'BULLISH'; // Selling puts = bullish
    }

    unusualActivity.push({
      timestamp: new Date(),
      symbol: option.underlying,
      optionSymbol: option.symbol,
      type: option.type,
      strike: option.strike,
      expiration: option.expiration,
      premium: Number(premium.toFixed(0)),
      volume: option.volume,
      openInterest: option.openInterest,
      volumeOIRatio: Number(volumeOIRatio.toFixed(2)),
      sentiment,
      isUnusual: true,
    });
  }

  // Sort by premium descending
  return unusualActivity.sort((a, b) => b.premium - a.premium);
}

/**
 * Detect option sweeps (large order spread across multiple exchanges)
 */
export function detectOptionSweeps(
  unusualFlow: UnusualOptionsFlow[],
  timeWindowMinutes: number = 5
): UnusualOptionsFlow[] {
  // Group by symbol and time window
  const sweeps: UnusualOptionsFlow[] = [];

  // In a real implementation, we'd check if multiple exchanges were hit
  // For now, we'll identify very large single trades as potential sweeps

  for (const flow of unusualFlow) {
    // Consider it a sweep if:
    // 1. Very high premium (> $250k)
    // 2. High volume/OI ratio (> 5)
    // 3. Same strike/expiration as other recent trades

    if (
      flow.premium > 250000 &&
      flow.volumeOIRatio > 5
    ) {
      sweeps.push({
        ...flow,
        isUnusual: true,
      });
    }
  }

  return sweeps;
}

/**
 * Analyze unusual flow for a specific stock
 */
export function analyzeStockUnusualFlow(
  symbol: string,
  unusualFlow: UnusualOptionsFlow[]
): {
  symbol: string;
  totalPremium: number;
  callPremium: number;
  putPremium: number;
  netSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  largestTrade: UnusualOptionsFlow | null;
  summary: string;
} {
  const stockFlow = unusualFlow.filter((f) => f.symbol === symbol);

  if (stockFlow.length === 0) {
    return {
      symbol,
      totalPremium: 0,
      callPremium: 0,
      putPremium: 0,
      netSentiment: 'NEUTRAL',
      confidence: 0,
      largestTrade: null,
      summary: 'No unusual options activity detected.',
    };
  }

  const totalPremium = stockFlow.reduce((sum, f) => sum + f.premium, 0);
  const callPremium = stockFlow
    .filter((f) => f.type === 'call')
    .reduce((sum, f) => sum + f.premium, 0);
  const putPremium = stockFlow
    .filter((f) => f.type === 'put')
    .reduce((sum, f) => sum + f.premium, 0);

  const bullishPremium = stockFlow
    .filter((f) => f.sentiment === 'BULLISH')
    .reduce((sum, f) => sum + f.premium, 0);
  const bearishPremium = stockFlow
    .filter((f) => f.sentiment === 'BEARISH')
    .reduce((sum, f) => sum + f.premium, 0);

  // Determine net sentiment
  let netSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  const sentimentDiff = Math.abs(bullishPremium - bearishPremium);
  const sentimentRatio = sentimentDiff / totalPremium;

  if (sentimentRatio > 0.3) {
    netSentiment = bullishPremium > bearishPremium ? 'BULLISH' : 'BEARISH';
  }

  const confidence = Math.min(100, sentimentRatio * 200);

  // Find largest trade
  const largestTrade = stockFlow.reduce((largest, current) =>
    current.premium > largest.premium ? current : largest
  );

  // Generate summary
  const summary =
    `${stockFlow.length} unusual option trades detected with $${(totalPremium / 1000000).toFixed(2)}M in total premium. ` +
    `Calls: $${(callPremium / 1000000).toFixed(2)}M, Puts: $${(putPremium / 1000000).toFixed(2)}M. ` +
    `Net sentiment: ${netSentiment} (${confidence.toFixed(0)}% confidence). ` +
    `Largest trade: ${largestTrade.type.toUpperCase()} $${largestTrade.strike} strike expiring ${largestTrade.expiration.toLocaleDateString()} ` +
    `with $${(largestTrade.premium / 1000).toFixed(0)}k premium.`;

  return {
    symbol,
    totalPremium: Number(totalPremium.toFixed(0)),
    callPremium: Number(callPremium.toFixed(0)),
    putPremium: Number(putPremium.toFixed(0)),
    netSentiment,
    confidence: Number(confidence.toFixed(0)),
    largestTrade,
    summary,
  };
}

/**
 * Find stocks with most unusual activity
 */
export function findTopUnusualActivity(
  unusualFlow: UnusualOptionsFlow[],
  topN: number = 10
): Array<{
  symbol: string;
  totalPremium: number;
  tradeCount: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}> {
  // Group by symbol
  const symbolMap = new Map<string, UnusualOptionsFlow[]>();

  for (const flow of unusualFlow) {
    if (!symbolMap.has(flow.symbol)) {
      symbolMap.set(flow.symbol, []);
    }
    symbolMap.get(flow.symbol)!.push(flow);
  }

  // Calculate totals per symbol
  const results = Array.from(symbolMap.entries()).map(([symbol, flows]) => {
    const analysis = analyzeStockUnusualFlow(symbol, flows);

    return {
      symbol,
      totalPremium: analysis.totalPremium,
      tradeCount: flows.length,
      sentiment: analysis.netSentiment,
    };
  });

  // Sort by total premium
  return results.sort((a, b) => b.totalPremium - a.totalPremium).slice(0, topN);
}

/**
 * Detect dark pool activity indicators
 * (Large block trades that may not appear in regular flow)
 */
export function detectDarkPoolIndicators(
  unusualFlow: UnusualOptionsFlow[]
): UnusualOptionsFlow[] {
  // Dark pool indicators:
  // 1. Very large size (> $500k premium)
  // 2. Near or at-the-money
  // 3. Near-term expiration (< 30 days)
  // 4. Unusual volume spike (volume >> OI)

  return unusualFlow.filter((flow) => {
    const daysToExpiration = (flow.expiration.getTime() - Date.now()) / (24 * 60 * 60 * 1000);

    return (
      flow.premium > 500000 &&
      daysToExpiration < 30 &&
      flow.volumeOIRatio > 10
    );
  });
}

/**
 * Generate trading signals from unusual flow
 */
export function generateUnusualFlowSignals(
  unusualFlow: UnusualOptionsFlow[]
): Array<{
  symbol: string;
  signal: 'BUY' | 'SELL' | 'WATCH';
  confidence: number;
  reason: string;
  timeframe: string;
}> {
  const signals: Array<{
    symbol: string;
    signal: 'BUY' | 'SELL' | 'WATCH';
    confidence: number;
    reason: string;
    timeframe: string;
  }> = [];

  // Group by symbol
  const symbolMap = new Map<string, UnusualOptionsFlow[]>();

  for (const flow of unusualFlow) {
    if (!symbolMap.has(flow.symbol)) {
      symbolMap.set(flow.symbol, []);
    }
    symbolMap.get(flow.symbol)!.push(flow);
  }

  // Generate signals for each symbol
  for (const [symbol, flows] of symbolMap) {
    const analysis = analyzeStockUnusualFlow(symbol, flows);

    if (analysis.confidence < 50) {
      continue; // Not confident enough
    }

    // Determine timeframe based on expiration
    const avgDaysToExp = flows.reduce((sum, f) =>
      sum + (f.expiration.getTime() - Date.now()) / (24 * 60 * 60 * 1000), 0
    ) / flows.length;

    let timeframe = 'SHORT';
    if (avgDaysToExp > 60) {
      timeframe = 'LONG';
    } else if (avgDaysToExp > 30) {
      timeframe = 'MEDIUM';
    }

    let signal: 'BUY' | 'SELL' | 'WATCH' = 'WATCH';

    if (analysis.netSentiment === 'BULLISH' && analysis.confidence > 70) {
      signal = 'BUY';
    } else if (analysis.netSentiment === 'BEARISH' && analysis.confidence > 70) {
      signal = 'SELL';
    }

    signals.push({
      symbol,
      signal,
      confidence: analysis.confidence,
      reason: analysis.summary,
      timeframe,
    });
  }

  return signals.sort((a, b) => b.confidence - a.confidence);
}
