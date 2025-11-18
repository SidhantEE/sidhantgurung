// Core data types for the quantitative trading platform

export interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData extends OHLCV {
  symbol: string;
  adjustedClose?: number;
}

export interface OptionData {
  symbol: string;
  underlying: string;
  strike: number;
  expiration: Date;
  type: 'call' | 'put';
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
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface BlackScholesInputs {
  spotPrice: number;
  strikePrice: number;
  timeToExpiration: number; // in years
  riskFreeRate: number;
  volatility: number;
  dividendYield?: number;
}

export interface OptionPricing {
  callPrice: number;
  putPrice: number;
  greeks: Greeks;
}

export interface TradingSignal {
  id: string;
  timestamp: Date;
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  strategy: string;
  entry: number;
  target?: number;
  stopLoss?: number;
  confidence: number; // 0-100
  metadata?: Record<string, any>;
}

export interface EquitySignal extends TradingSignal {
  positionSize: number;
  expectedReturn: number;
  riskRewardRatio: number;
}

export interface OptionsSignal extends TradingSignal {
  optionType: 'call' | 'put';
  strike: number;
  expiration: Date;
  contracts: number;
  maxLoss: number;
  maxGain: number;
  breakeven: number;
  impliedVolatility: number;
}

export interface ArbitrageOpportunity {
  id: string;
  timestamp: Date;
  type: 'put-call-parity' | 'box-spread' | 'conversion' | 'reversal';
  symbol: string;
  profitPerContract: number;
  roi: number;
  risk: 'low' | 'medium' | 'high';
  legs: OptionLeg[];
  description: string;
}

export interface OptionLeg {
  action: 'BUY' | 'SELL';
  type: 'call' | 'put' | 'stock';
  strike?: number;
  expiration?: Date;
  quantity: number;
  price: number;
}

export interface Trade {
  id: string;
  timestamp: Date;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  commission: number;
  slippage: number;
  strategyId: string;
  realizedPnL?: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averageEntry: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  strategyId: string;
}

export interface BacktestResult {
  strategyName: string;
  symbol: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageHoldingPeriod: number;
  trades: Trade[];
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  monthlyReturns: MonthlyReturn[];
}

export interface EquityPoint {
  timestamp: Date;
  equity: number;
  drawdown: number;
}

export interface DrawdownPoint {
  timestamp: Date;
  drawdown: number;
  drawdownPercent: number;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
  returnPercent: number;
}

export interface TechnicalIndicator {
  timestamp: Date;
  value: number;
  signal?: 'BUY' | 'SELL' | 'HOLD';
}

export interface BollingerBands {
  timestamp: Date;
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percentB: number;
}

export interface MovingAverage {
  timestamp: Date;
  sma: number;
  ema?: number;
}

export interface RSI {
  timestamp: Date;
  value: number;
  signal: 'OVERSOLD' | 'OVERBOUGHT' | 'NEUTRAL';
}

export interface IVRank {
  symbol: string;
  currentIV: number;
  ivRank: number; // 0-100
  ivPercentile: number; // 0-100
  historicalVolatility: number;
  ivHVSpread: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
}

export interface UnusualOptionsFlow {
  timestamp: Date;
  symbol: string;
  optionSymbol: string;
  type: 'call' | 'put';
  strike: number;
  expiration: Date;
  premium: number;
  volume: number;
  openInterest: number;
  volumeOIRatio: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  isUnusual: boolean;
}

export interface MarketRegime {
  timestamp: Date;
  regime: 'BULL' | 'BEAR' | 'SIDEWAYS' | 'HIGH_VOLATILITY' | 'LOW_VOLATILITY';
  confidence: number;
  vix: number;
  marketBreadth: number;
  trend: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
}

export interface RiskMetrics {
  valueAtRisk95: number; // 95% VaR
  valueAtRisk99: number; // 99% VaR
  conditionalVaR: number; // CVaR/Expected Shortfall
  beta: number;
  alpha: number;
  correlation: number;
  maxPositionSize: number;
  currentLeverage: number;
}

export type StrategyType =
  | 'mean-reversion'
  | 'momentum'
  | 'options-arbitrage'
  | 'iv-rank'
  | 'unusual-flow'
  | 'pairs-trading';

export interface Strategy {
  id: string;
  name: string;
  type: StrategyType;
  description: string;
  parameters: Record<string, any>;
  enabled: boolean;
  capital: number;
  maxPositions: number;
  riskPerTrade: number;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
}
