/**
 * Options Data Fetchers
 *
 * Fetches options chain data from various sources
 */

import axios from 'axios';
import { OptionData } from '@/lib/types';
import { calculateImpliedVolatility, calculateGreeks } from '@/lib/options/black-scholes';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY || '';
const POLYGON_BASE_URL = 'https://api.polygon.io';

/**
 * Fetch options chain from Polygon.io
 */
export async function fetchOptionsChain(
  underlying: string,
  expirationDate?: string
): Promise<OptionData[]> {
  try {
    const url = `${POLYGON_BASE_URL}/v3/reference/options/contracts`;

    const params: any = {
      underlying_ticker: underlying,
      apiKey: POLYGON_API_KEY,
      limit: 1000,
    };

    if (expirationDate) {
      params.expiration_date = expirationDate;
    }

    const response = await axios.get(url, { params });

    const contracts = response.data.results || [];
    const optionsData: OptionData[] = [];

    for (const contract of contracts) {
      // Fetch current price for this option
      const priceData = await fetchOptionPrice(contract.ticker);

      optionsData.push({
        symbol: contract.ticker,
        underlying: contract.underlying_ticker,
        strike: contract.strike_price,
        expiration: new Date(contract.expiration_date),
        type: contract.contract_type === 'call' ? 'call' : 'put',
        bid: priceData?.bid || 0,
        ask: priceData?.ask || 0,
        last: priceData?.last || 0,
        volume: priceData?.volume || 0,
        openInterest: priceData?.openInterest || 0,
        impliedVolatility: priceData?.impliedVolatility || 0,
        delta: priceData?.delta,
        gamma: priceData?.gamma,
        theta: priceData?.theta,
        vega: priceData?.vega,
        rho: priceData?.rho,
      });
    }

    return optionsData;
  } catch (error: any) {
    console.error(`Error fetching options chain for ${underlying}:`, error.message);
    throw error;
  }
}

/**
 * Fetch option price data
 */
async function fetchOptionPrice(
  optionSymbol: string
): Promise<{
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
} | null> {
  try {
    const url = `${POLYGON_BASE_URL}/v2/last/trade/${optionSymbol}`;

    const response = await axios.get(url, {
      params: { apiKey: POLYGON_API_KEY },
    });

    // Note: This is simplified. In reality, you'd need to fetch quote data separately
    return {
      bid: response.data.results?.p || 0,
      ask: response.data.results?.p || 0,
      last: response.data.results?.p || 0,
      volume: response.data.results?.s || 0,
      openInterest: 0,
      impliedVolatility: 0,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generate mock options chain for testing
 */
export function generateMockOptionsChain(
  underlying: string,
  underlyingPrice: number,
  expirationDays: number = 30,
  riskFreeRate: number = 0.05
): OptionData[] {
  const optionsData: OptionData[] = [];
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + expirationDays);

  // Generate strikes around current price (80% to 120%)
  const strikeRange = [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2];
  const baseVolume = 1000;
  const baseOI = 5000;

  for (const strikeMultiplier of strikeRange) {
    const strike = Math.round(underlyingPrice * strikeMultiplier);
    const timeToExpiration = expirationDays / 365;

    // ATM options have higher IV, OTM have lower
    const moneyness = underlyingPrice / strike;
    const baseIV = 0.3; // 30% base IV
    const ivSkew = Math.abs(1 - moneyness) * 0.2;
    const impliedVolatility = baseIV + ivSkew + (Math.random() - 0.5) * 0.05;

    // Calculate theoretical prices using Black-Scholes
    const inputs = {
      spotPrice: underlyingPrice,
      strikePrice: strike,
      timeToExpiration,
      riskFreeRate,
      volatility: impliedVolatility,
    };

    // Import and calculate prices would go here
    // For now, simplified calculation
    const intrinsicValueCall = Math.max(0, underlyingPrice - strike);
    const intrinsicValuePut = Math.max(0, strike - underlyingPrice);

    const timeValue = strike * impliedVolatility * Math.sqrt(timeToExpiration) * 0.4;

    const callPrice = intrinsicValueCall + timeValue;
    const putPrice = intrinsicValuePut + timeValue;

    // Generate bid/ask spread (0.05-0.15)
    const spreadCall = callPrice * 0.02;
    const spreadPut = putPrice * 0.02;

    // Volume and OI decrease for OTM options
    const moneynessFactor = 1 - Math.abs(1 - moneyness) * 0.5;
    const volume = Math.floor(baseVolume * moneynessFactor * (0.5 + Math.random()));
    const openInterest = Math.floor(baseOI * moneynessFactor * (0.8 + Math.random() * 0.4));

    // Calculate Greeks (simplified)
    const callGreeks = calculateGreeks(inputs, 'call');
    const putGreeks = calculateGreeks(inputs, 'put');

    // Call option
    optionsData.push({
      symbol: `${underlying}${expiration.toISOString().split('T')[0]}C${strike}`,
      underlying,
      strike,
      expiration,
      type: 'call',
      bid: Number((callPrice - spreadCall).toFixed(2)),
      ask: Number((callPrice + spreadCall).toFixed(2)),
      last: Number(callPrice.toFixed(2)),
      volume: Math.round(volume),
      openInterest: Math.round(openInterest),
      impliedVolatility: Number((impliedVolatility * 100).toFixed(2)),
      delta: callGreeks.delta,
      gamma: callGreeks.gamma,
      theta: callGreeks.theta,
      vega: callGreeks.vega,
      rho: callGreeks.rho,
    });

    // Put option
    optionsData.push({
      symbol: `${underlying}${expiration.toISOString().split('T')[0]}P${strike}`,
      underlying,
      strike,
      expiration,
      type: 'put',
      bid: Number((putPrice - spreadPut).toFixed(2)),
      ask: Number((putPrice + spreadPut).toFixed(2)),
      last: Number(putPrice.toFixed(2)),
      volume: Math.floor(volume * 0.7), // Puts typically have lower volume
      openInterest: Math.floor(openInterest * 0.8),
      impliedVolatility: Number((impliedVolatility * 100).toFixed(2)),
      delta: putGreeks.delta,
      gamma: putGreeks.gamma,
      theta: putGreeks.theta,
      vega: putGreeks.vega,
      rho: putGreeks.rho,
    });
  }

  return optionsData;
}

/**
 * Generate mock options chain with specific IV characteristics
 */
export function generateMockOptionsWithIVPattern(
  underlying: string,
  underlyingPrice: number,
  ivScenario: 'low-iv' | 'high-iv' | 'iv-crush' | 'iv-spike',
  expirationDays: number = 30
): OptionData[] {
  const baseOptions = generateMockOptionsChain(underlying, underlyingPrice, expirationDays);

  return baseOptions.map((option) => {
    let ivMultiplier = 1;

    switch (ivScenario) {
      case 'low-iv':
        ivMultiplier = 0.5; // 50% of normal IV
        break;
      case 'high-iv':
        ivMultiplier = 2.0; // 200% of normal IV
        break;
      case 'iv-crush':
        // Higher IV for near-term, normal for far-term
        ivMultiplier = expirationDays < 15 ? 0.6 : 1.0;
        break;
      case 'iv-spike':
        // Lower IV for near-term, higher for far-term (fear of future event)
        ivMultiplier = expirationDays < 15 ? 1.0 : 1.5;
        break;
    }

    return {
      ...option,
      impliedVolatility: Number((option.impliedVolatility * ivMultiplier).toFixed(2)),
    };
  });
}

/**
 * Get options by expiration date
 */
export function filterOptionsByExpiration(
  options: OptionData[],
  minDays: number,
  maxDays: number
): OptionData[] {
  const now = new Date();

  return options.filter((option) => {
    const daysToExpiration = Math.floor(
      (option.expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysToExpiration >= minDays && daysToExpiration <= maxDays;
  });
}

/**
 * Get options by moneyness
 */
export function filterOptionsByMoneyness(
  options: OptionData[],
  underlyingPrice: number,
  moneynessRange: 'ITM' | 'ATM' | 'OTM'
): OptionData[] {
  return options.filter((option) => {
    const moneyness = underlyingPrice / option.strike;

    if (option.type === 'call') {
      if (moneynessRange === 'ITM') return moneyness > 1.02;
      if (moneynessRange === 'ATM') return moneyness >= 0.98 && moneyness <= 1.02;
      if (moneynessRange === 'OTM') return moneyness < 0.98;
    } else {
      // Put options
      if (moneynessRange === 'ITM') return moneyness < 0.98;
      if (moneynessRange === 'ATM') return moneyness >= 0.98 && moneyness <= 1.02;
      if (moneynessRange === 'OTM') return moneyness > 1.02;
    }

    return false;
  });
}

/**
 * Calculate mid price for an option
 */
export function getOptionMidPrice(option: OptionData): number {
  return (option.bid + option.ask) / 2;
}

/**
 * Get option by specific strike and type
 */
export function findOption(
  options: OptionData[],
  strike: number,
  type: 'call' | 'put',
  expiration?: Date
): OptionData | undefined {
  return options.find((option) => {
    const strikeMatch = Math.abs(option.strike - strike) < 0.01;
    const typeMatch = option.type === type;
    const expirationMatch = expiration
      ? option.expiration.toDateString() === expiration.toDateString()
      : true;

    return strikeMatch && typeMatch && expirationMatch;
  });
}
