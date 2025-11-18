/**
 * Options Arbitrage Strategies
 *
 * Implements various options arbitrage strategies including:
 * - Put-Call Parity
 * - Box Spreads
 * - Conversion/Reversal Arbitrage
 */

import { OptionData, ArbitrageOpportunity, OptionLeg } from '@/lib/types';
import { checkPutCallParity } from '@/lib/options/black-scholes';
import { findOption, getOptionMidPrice } from '@/lib/data/options-data';

export interface ArbitrageConfig {
  minProfitPerContract: number; // Minimum profit to consider (e.g., $0.10)
  minROI: number; // Minimum ROI percentage (e.g., 5%)
  maxDaysToExpiration: number; // Maximum days to expiration
  riskFreeRate: number; // Annual risk-free rate
  transactionCost: number; // Per-leg transaction cost
}

export const DEFAULT_ARBITRAGE_CONFIG: ArbitrageConfig = {
  minProfitPerContract: 0.10,
  minROI: 5,
  maxDaysToExpiration: 60,
  riskFreeRate: 0.05,
  transactionCost: 0.65, // Per option contract per side
};

/**
 * Scan for Put-Call Parity violations
 */
export function scanPutCallParityArbitrage(
  options: OptionData[],
  underlyingPrice: number,
  config: ArbitrageConfig = DEFAULT_ARBITRAGE_CONFIG
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  // Group options by strike and expiration
  const optionsByStrikeExp = new Map<string, { call?: OptionData; put?: OptionData }>();

  for (const option of options) {
    const key = `${option.strike}-${option.expiration.toISOString()}`;

    if (!optionsByStrikeExp.has(key)) {
      optionsByStrikeExp.set(key, {});
    }

    const pair = optionsByStrikeExp.get(key)!;

    if (option.type === 'call') {
      pair.call = option;
    } else {
      pair.put = option;
    }
  }

  // Check each pair for arbitrage
  for (const [key, pair] of optionsByStrikeExp) {
    if (!pair.call || !pair.put) {
      continue;
    }

    const call = pair.call;
    const put = pair.put;

    // Filter by expiration
    const daysToExpiration = (call.expiration.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    if (daysToExpiration > config.maxDaysToExpiration || daysToExpiration < 1) {
      continue;
    }

    const timeToExpiration = daysToExpiration / 365;

    // Get mid prices
    const callPrice = getOptionMidPrice(call);
    const putPrice = getOptionMidPrice(put);

    // Check put-call parity
    const parityCheck = checkPutCallParity(
      callPrice,
      putPrice,
      underlyingPrice,
      call.strike,
      timeToExpiration,
      config.riskFreeRate
    );

    if (!parityCheck.isViolated) {
      continue;
    }

    // Calculate profit after transaction costs
    const totalTransactionCost = config.transactionCost * 4; // 4 legs (buy/sell call, put, stock)
    const netProfit = parityCheck.arbitrageProfit - totalTransactionCost;

    if (netProfit < config.minProfitPerContract) {
      continue;
    }

    // Calculate ROI
    const capital = Math.max(callPrice, putPrice, underlyingPrice - call.strike);
    const roi = (netProfit / capital) * 100;

    if (roi < config.minROI) {
      continue;
    }

    // Build the arbitrage legs
    const legs: OptionLeg[] = [];

    if (parityCheck.side === 'long') {
      // Long synthetic stock: Buy call, sell put, sell stock (or short)
      legs.push({
        action: 'BUY',
        type: 'call',
        strike: call.strike,
        expiration: call.expiration,
        quantity: 1,
        price: callPrice,
      });
      legs.push({
        action: 'SELL',
        type: 'put',
        strike: put.strike,
        expiration: put.expiration,
        quantity: 1,
        price: putPrice,
      });
      legs.push({
        action: 'SELL',
        type: 'stock',
        quantity: 100,
        price: underlyingPrice,
      });
    } else {
      // Short synthetic stock: Sell call, buy put, buy stock
      legs.push({
        action: 'SELL',
        type: 'call',
        strike: call.strike,
        expiration: call.expiration,
        quantity: 1,
        price: callPrice,
      });
      legs.push({
        action: 'BUY',
        type: 'put',
        strike: put.strike,
        expiration: put.expiration,
        quantity: 1,
        price: putPrice,
      });
      legs.push({
        action: 'BUY',
        type: 'stock',
        quantity: 100,
        price: underlyingPrice,
      });
    }

    opportunities.push({
      id: `pcp-${call.underlying}-${key}`,
      timestamp: new Date(),
      type: 'put-call-parity',
      symbol: call.underlying,
      profitPerContract: Number(netProfit.toFixed(2)),
      roi: Number(roi.toFixed(2)),
      risk: netProfit > 0.50 ? 'low' : 'medium',
      legs,
      description: `Put-Call Parity violation on ${call.underlying} $${call.strike} strike expiring ${call.expiration.toLocaleDateString()}. ` +
                  `Expected profit: $${(netProfit * 100).toFixed(0)} (${roi.toFixed(1)}% ROI) with ${daysToExpiration.toFixed(0)} days to expiration.`,
    });
  }

  // Sort by ROI descending
  return opportunities.sort((a, b) => b.roi - a.roi);
}

/**
 * Scan for Box Spread arbitrage
 * A box spread is a combination of a bull call spread and a bear put spread
 */
export function scanBoxSpreadArbitrage(
  options: OptionData[],
  config: ArbitrageConfig = DEFAULT_ARBITRAGE_CONFIG
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  // Group options by expiration
  const optionsByExpiration = new Map<string, OptionData[]>();

  for (const option of options) {
    const key = option.expiration.toISOString();

    if (!optionsByExpiration.has(key)) {
      optionsByExpiration.set(key, []);
    }

    optionsByExpiration.get(key)!.push(option);
  }

  // For each expiration, find box spreads
  for (const [expKey, expirationOptions] of optionsByExpiration) {
    const strikes = [...new Set(expirationOptions.map((o) => o.strike))].sort((a, b) => a - b);

    // Need at least 2 strikes for a box spread
    if (strikes.length < 2) {
      continue;
    }

    // Try each combination of two strikes
    for (let i = 0; i < strikes.length - 1; i++) {
      for (let j = i + 1; j < strikes.length; j++) {
        const lowerStrike = strikes[i];
        const upperStrike = strikes[j];

        // Find the 4 options needed
        const lowerCall = findOption(expirationOptions, lowerStrike, 'call');
        const upperCall = findOption(expirationOptions, upperStrike, 'call');
        const lowerPut = findOption(expirationOptions, lowerStrike, 'put');
        const upperPut = findOption(expirationOptions, upperStrike, 'put');

        if (!lowerCall || !upperCall || !lowerPut || !upperPut) {
          continue;
        }

        // Calculate box spread value
        // Box = (Buy lower call + Sell upper call) + (Buy upper put + Sell lower put)
        const costOfBox =
          getOptionMidPrice(lowerCall) -
          getOptionMidPrice(upperCall) +
          getOptionMidPrice(upperPut) -
          getOptionMidPrice(lowerPut);

        const theoreticalValue = upperStrike - lowerStrike;

        // Calculate profit
        const profit = theoreticalValue - costOfBox;

        // Account for transaction costs (4 legs)
        const totalTransactionCost = config.transactionCost * 4;
        const netProfit = profit - totalTransactionCost;

        if (netProfit < config.minProfitPerContract) {
          continue;
        }

        // Calculate ROI
        const roi = (netProfit / costOfBox) * 100;

        if (roi < config.minROI) {
          continue;
        }

        const legs: OptionLeg[] = [
          {
            action: 'BUY',
            type: 'call',
            strike: lowerStrike,
            expiration: lowerCall.expiration,
            quantity: 1,
            price: getOptionMidPrice(lowerCall),
          },
          {
            action: 'SELL',
            type: 'call',
            strike: upperStrike,
            expiration: upperCall.expiration,
            quantity: 1,
            price: getOptionMidPrice(upperCall),
          },
          {
            action: 'BUY',
            type: 'put',
            strike: upperStrike,
            expiration: upperPut.expiration,
            quantity: 1,
            price: getOptionMidPrice(upperPut),
          },
          {
            action: 'SELL',
            type: 'put',
            strike: lowerStrike,
            expiration: lowerPut.expiration,
            quantity: 1,
            price: getOptionMidPrice(lowerPut),
          },
        ];

        const daysToExpiration = (lowerCall.expiration.getTime() - Date.now()) / (24 * 60 * 60 * 1000);

        opportunities.push({
          id: `box-${lowerCall.underlying}-${lowerStrike}-${upperStrike}-${expKey}`,
          timestamp: new Date(),
          type: 'box-spread',
          symbol: lowerCall.underlying,
          profitPerContract: Number(netProfit.toFixed(2)),
          roi: Number(roi.toFixed(2)),
          risk: 'low', // Box spreads are market-neutral
          legs,
          description: `Box spread on ${lowerCall.underlying} $${lowerStrike}/$${upperStrike} strikes expiring ${lowerCall.expiration.toLocaleDateString()}. ` +
                      `Expected profit: $${(netProfit * 100).toFixed(0)} (${roi.toFixed(1)}% ROI) with ${daysToExpiration.toFixed(0)} days to expiration. ` +
                      `This is a riskless arbitrage if executed at mid prices.`,
        });
      }
    }
  }

  return opportunities.sort((a, b) => b.roi - a.roi);
}

/**
 * Find the best arbitrage opportunities across all types
 */
export function findBestArbitrageOpportunities(
  options: OptionData[],
  underlyingPrice: number,
  config: ArbitrageConfig = DEFAULT_ARBITRAGE_CONFIG,
  maxResults: number = 10
): ArbitrageOpportunity[] {
  const allOpportunities: ArbitrageOpportunity[] = [
    ...scanPutCallParityArbitrage(options, underlyingPrice, config),
    ...scanBoxSpreadArbitrage(options, config),
  ];

  // Sort by ROI and return top N
  return allOpportunities
    .sort((a, b) => b.roi - a.roi)
    .slice(0, maxResults);
}

/**
 * Calculate the expected profit and risk for an arbitrage opportunity
 */
export function analyzeArbitrageOpportunity(
  opportunity: ArbitrageOpportunity
): {
  maxProfit: number;
  maxLoss: number;
  breakeven: number | null;
  requiredCapital: number;
  margin: number;
  annualizedReturn: number;
} {
  let maxProfit = opportunity.profitPerContract * 100; // Per contract
  let maxLoss = 0;
  let requiredCapital = 0;

  // Calculate based on leg types
  const buyLegs = opportunity.legs.filter((l) => l.action === 'BUY');
  const sellLegs = opportunity.legs.filter((l) => l.action === 'SELL');

  const capitalRequired = buyLegs.reduce((sum, leg) => {
    if (leg.type === 'stock') {
      return sum + leg.price * leg.quantity;
    } else {
      return sum + leg.price * 100; // Options are per 100 shares
    }
  }, 0);

  const creditReceived = sellLegs.reduce((sum, leg) => {
    if (leg.type === 'stock') {
      return sum + leg.price * leg.quantity;
    } else {
      return sum + leg.price * 100;
    }
  }, 0);

  requiredCapital = capitalRequired - creditReceived;

  // For box spreads and put-call parity, risk is minimal (near zero for true arbitrage)
  if (opportunity.type === 'box-spread' || opportunity.type === 'put-call-parity') {
    maxLoss = requiredCapital * 0.01; // Assume 1% slippage risk
  }

  // Calculate days to expiration for annualized return
  const expirationLeg = opportunity.legs.find((l) => l.expiration);
  const daysToExpiration = expirationLeg
    ? (expirationLeg.expiration!.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    : 30;

  const annualizedReturn = (maxProfit / requiredCapital) * (365 / daysToExpiration) * 100;

  return {
    maxProfit,
    maxLoss,
    breakeven: null, // Arbitrage has no breakeven, it's riskless
    requiredCapital,
    margin: requiredCapital * 0.5, // Assume 50% margin requirement
    annualizedReturn: Number(annualizedReturn.toFixed(2)),
  };
}
