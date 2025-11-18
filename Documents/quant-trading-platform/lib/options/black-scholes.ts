/**
 * Black-Scholes Option Pricing Model
 *
 * Calculates theoretical option prices and Greeks for European-style options
 */

import { BlackScholesInputs, OptionPricing, Greeks } from '@/lib/types';

/**
 * Standard normal cumulative distribution function
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return x > 0 ? 1 - probability : probability;
}

/**
 * Standard normal probability density function
 */
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Calculate d1 and d2 for Black-Scholes formula
 */
function calculateD1D2(inputs: BlackScholesInputs): { d1: number; d2: number } {
  const { spotPrice, strikePrice, timeToExpiration, riskFreeRate, volatility, dividendYield = 0 } = inputs;

  const d1 = (Math.log(spotPrice / strikePrice) +
             (riskFreeRate - dividendYield + 0.5 * volatility * volatility) * timeToExpiration) /
             (volatility * Math.sqrt(timeToExpiration));

  const d2 = d1 - volatility * Math.sqrt(timeToExpiration);

  return { d1, d2 };
}

/**
 * Calculate European call option price using Black-Scholes
 */
export function calculateCallPrice(inputs: BlackScholesInputs): number {
  const { spotPrice, strikePrice, timeToExpiration, riskFreeRate, dividendYield = 0 } = inputs;

  if (timeToExpiration <= 0) {
    return Math.max(0, spotPrice - strikePrice);
  }

  const { d1, d2 } = calculateD1D2(inputs);

  const callPrice =
    spotPrice * Math.exp(-dividendYield * timeToExpiration) * normalCDF(d1) -
    strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2);

  return Math.max(0, callPrice);
}

/**
 * Calculate European put option price using Black-Scholes
 */
export function calculatePutPrice(inputs: BlackScholesInputs): number {
  const { spotPrice, strikePrice, timeToExpiration, riskFreeRate, dividendYield = 0 } = inputs;

  if (timeToExpiration <= 0) {
    return Math.max(0, strikePrice - spotPrice);
  }

  const { d1, d2 } = calculateD1D2(inputs);

  const putPrice =
    strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2) -
    spotPrice * Math.exp(-dividendYield * timeToExpiration) * normalCDF(-d1);

  return Math.max(0, putPrice);
}

/**
 * Calculate option Greeks
 */
export function calculateGreeks(inputs: BlackScholesInputs, optionType: 'call' | 'put'): Greeks {
  const { spotPrice, strikePrice, timeToExpiration, riskFreeRate, volatility, dividendYield = 0 } = inputs;

  if (timeToExpiration <= 0) {
    return {
      delta: optionType === 'call' ? (spotPrice > strikePrice ? 1 : 0) : (spotPrice < strikePrice ? -1 : 0),
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }

  const { d1, d2 } = calculateD1D2(inputs);
  const sqrtT = Math.sqrt(timeToExpiration);

  // Delta
  let delta: number;
  if (optionType === 'call') {
    delta = Math.exp(-dividendYield * timeToExpiration) * normalCDF(d1);
  } else {
    delta = -Math.exp(-dividendYield * timeToExpiration) * normalCDF(-d1);
  }

  // Gamma (same for calls and puts)
  const gamma = (Math.exp(-dividendYield * timeToExpiration) * normalPDF(d1)) /
                (spotPrice * volatility * sqrtT);

  // Theta (daily decay)
  let theta: number;
  const term1 = -(spotPrice * normalPDF(d1) * volatility * Math.exp(-dividendYield * timeToExpiration)) /
                (2 * sqrtT);

  if (optionType === 'call') {
    const term2 = riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2);
    const term3 = dividendYield * spotPrice * Math.exp(-dividendYield * timeToExpiration) * normalCDF(d1);
    theta = (term1 - term2 + term3) / 365; // Convert to daily
  } else {
    const term2 = riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2);
    const term3 = dividendYield * spotPrice * Math.exp(-dividendYield * timeToExpiration) * normalCDF(-d1);
    theta = (term1 + term2 - term3) / 365; // Convert to daily
  }

  // Vega (sensitivity to volatility, same for calls and puts)
  const vega = (spotPrice * Math.exp(-dividendYield * timeToExpiration) * normalPDF(d1) * sqrtT) / 100;

  // Rho (sensitivity to interest rate)
  let rho: number;
  if (optionType === 'call') {
    rho = (strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2)) / 100;
  } else {
    rho = -(strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2)) / 100;
  }

  return {
    delta: Number(delta.toFixed(4)),
    gamma: Number(gamma.toFixed(4)),
    theta: Number(theta.toFixed(4)),
    vega: Number(vega.toFixed(4)),
    rho: Number(rho.toFixed(4)),
  };
}

/**
 * Calculate both call and put prices with Greeks
 */
export function calculateOptionPricing(inputs: BlackScholesInputs): OptionPricing {
  const callPrice = calculateCallPrice(inputs);
  const putPrice = calculatePutPrice(inputs);
  const greeks = calculateGreeks(inputs, 'call'); // Greeks are similar, using call

  return {
    callPrice: Number(callPrice.toFixed(2)),
    putPrice: Number(putPrice.toFixed(2)),
    greeks,
  };
}

/**
 * Calculate implied volatility using Newton-Raphson method
 */
export function calculateImpliedVolatility(
  marketPrice: number,
  inputs: Omit<BlackScholesInputs, 'volatility'>,
  optionType: 'call' | 'put',
  maxIterations: number = 100,
  tolerance: number = 0.0001
): number {
  let volatility = 0.3; // Initial guess: 30%

  for (let i = 0; i < maxIterations; i++) {
    const fullInputs = { ...inputs, volatility };
    const theoreticalPrice = optionType === 'call'
      ? calculateCallPrice(fullInputs)
      : calculatePutPrice(fullInputs);

    const priceDiff = theoreticalPrice - marketPrice;

    if (Math.abs(priceDiff) < tolerance) {
      return Number(volatility.toFixed(4));
    }

    // Vega for Newton-Raphson
    const { d1 } = calculateD1D2(fullInputs);
    const vega = inputs.spotPrice * normalPDF(d1) * Math.sqrt(inputs.timeToExpiration);

    if (vega < 0.0001) {
      break; // Avoid division by very small number
    }

    volatility = volatility - priceDiff / vega;

    // Keep volatility in reasonable bounds
    volatility = Math.max(0.01, Math.min(5.0, volatility));
  }

  return Number(volatility.toFixed(4));
}

/**
 * Verify Put-Call Parity
 * C - P = S - K * e^(-rT)
 * Returns the arbitrage profit if parity is violated
 */
export function checkPutCallParity(
  callPrice: number,
  putPrice: number,
  spotPrice: number,
  strikePrice: number,
  timeToExpiration: number,
  riskFreeRate: number,
  dividendYield: number = 0
): { isViolated: boolean; arbitrageProfit: number; side: 'long' | 'short' | null } {
  const leftSide = callPrice - putPrice;
  const rightSide = spotPrice * Math.exp(-dividendYield * timeToExpiration) -
                    strikePrice * Math.exp(-riskFreeRate * timeToExpiration);

  const difference = leftSide - rightSide;
  const threshold = 0.10; // $0.10 threshold for transaction costs

  if (Math.abs(difference) < threshold) {
    return { isViolated: false, arbitrageProfit: 0, side: null };
  }

  return {
    isViolated: true,
    arbitrageProfit: Math.abs(difference),
    side: difference > 0 ? 'short' : 'long', // Short synthetic if C-P too high, long if too low
  };
}
