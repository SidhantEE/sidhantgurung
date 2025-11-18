/**
 * Equity Backtesting Engine
 *
 * Comprehensive backtesting framework for equity trading strategies
 */

import { StockData, Trade, BacktestResult, EquityPoint, DrawdownPoint, MonthlyReturn } from '@/lib/types';

export interface BacktestConfig {
  initialCapital: number;
  commission: number; // Per trade
  slippage: number; // As percentage (e.g., 0.001 = 0.1%)
  positionSizing: 'fixed' | 'percent-equity' | 'kelly';
  positionSize?: number; // Dollar amount for fixed, percentage for percent-equity
  maxPositions?: number;
  riskFreeRate?: number; // For Sharpe ratio calculation
}

export interface BacktestPosition {
  symbol: string;
  quantity: number;
  entryPrice: number;
  entryDate: Date;
  stopLoss?: number;
  target?: number;
}

export class EquityBacktester {
  private config: BacktestConfig;
  private cash: number;
  private equity: number;
  private positions: Map<string, BacktestPosition>;
  private trades: Trade[];
  private equityCurve: EquityPoint[];
  private peakEquity: number;
  private currentDrawdown: number;

  constructor(config: BacktestConfig) {
    this.config = {
      riskFreeRate: 0.02, // 2% default
      maxPositions: 10,
      ...config,
    };
    this.cash = config.initialCapital;
    this.equity = config.initialCapital;
    this.positions = new Map();
    this.trades = [];
    this.equityCurve = [];
    this.peakEquity = config.initialCapital;
    this.currentDrawdown = 0;
  }

  /**
   * Execute a buy order
   */
  buy(
    symbol: string,
    price: number,
    date: Date,
    strategyId: string,
    quantity?: number,
    stopLoss?: number,
    target?: number
  ): boolean {
    // Check if we already have a position
    if (this.positions.has(symbol)) {
      return false;
    }

    // Check max positions limit
    if (this.positions.size >= (this.config.maxPositions || 10)) {
      return false;
    }

    // Calculate quantity if not provided
    if (!quantity) {
      quantity = this.calculatePositionSize(price);
    }

    const cost = price * quantity;
    const totalCost = cost + this.config.commission;

    // Check if we have enough cash
    if (totalCost > this.cash) {
      return false;
    }

    // Execute trade
    this.cash -= totalCost;

    this.positions.set(symbol, {
      symbol,
      quantity,
      entryPrice: price,
      entryDate: date,
      stopLoss,
      target,
    });

    // Record trade
    const slippageCost = cost * this.config.slippage;
    this.trades.push({
      id: `${symbol}-${date.getTime()}-BUY`,
      timestamp: date,
      symbol,
      type: 'BUY',
      quantity,
      price: price * (1 + this.config.slippage), // Price with slippage
      commission: this.config.commission,
      slippage: slippageCost,
      strategyId,
      realizedPnL: -(this.config.commission + slippageCost),
    });

    return true;
  }

  /**
   * Execute a sell order
   */
  sell(
    symbol: string,
    price: number,
    date: Date,
    strategyId: string
  ): boolean {
    const position = this.positions.get(symbol);

    if (!position) {
      return false;
    }

    const proceeds = price * position.quantity;
    const netProceeds = proceeds - this.config.commission;
    const slippageCost = proceeds * this.config.slippage;

    this.cash += netProceeds - slippageCost;

    // Calculate P&L
    const costBasis = position.entryPrice * position.quantity;
    const realizedPnL = (price - position.entryPrice) * position.quantity -
                        this.config.commission * 2 - // Entry and exit commissions
                        slippageCost;

    // Record trade
    this.trades.push({
      id: `${symbol}-${date.getTime()}-SELL`,
      timestamp: date,
      symbol,
      type: 'SELL',
      quantity: position.quantity,
      price: price * (1 - this.config.slippage), // Price with slippage
      commission: this.config.commission,
      slippage: slippageCost,
      strategyId,
      realizedPnL,
    });

    // Remove position
    this.positions.delete(symbol);

    return true;
  }

  /**
   * Update equity and check stop losses/targets
   */
  updateEquity(currentPrices: Map<string, number>, date: Date): void {
    // Calculate current equity
    let positionsValue = 0;

    for (const [symbol, position] of this.positions) {
      const currentPrice = currentPrices.get(symbol);
      if (currentPrice) {
        positionsValue += currentPrice * position.quantity;

        // Check stop loss
        if (position.stopLoss && currentPrice <= position.stopLoss) {
          this.sell(symbol, currentPrice, date, 'stop-loss');
        }

        // Check target
        if (position.target && currentPrice >= position.target) {
          this.sell(symbol, currentPrice, date, 'target');
        }
      }
    }

    this.equity = this.cash + positionsValue;

    // Update peak and drawdown
    if (this.equity > this.peakEquity) {
      this.peakEquity = this.equity;
    }

    this.currentDrawdown = this.peakEquity - this.equity;

    // Record equity point
    this.equityCurve.push({
      timestamp: date,
      equity: this.equity,
      drawdown: this.currentDrawdown,
    });
  }

  /**
   * Calculate position size based on strategy
   */
  private calculatePositionSize(price: number): number {
    switch (this.config.positionSizing) {
      case 'fixed':
        return Math.floor((this.config.positionSize || 1000) / price);

      case 'percent-equity':
        const percent = this.config.positionSize || 10; // Default 10%
        const capital = this.equity * (percent / 100);
        return Math.floor(capital / price);

      case 'kelly':
        // Simplified Kelly criterion (would need win rate and avg win/loss)
        const kellyPercent = 5; // Conservative Kelly
        const kellyCapital = this.equity * (kellyPercent / 100);
        return Math.floor(kellyCapital / price);

      default:
        return Math.floor(1000 / price);
    }
  }

  /**
   * Get current positions
   */
  getPositions(): BacktestPosition[] {
    return Array.from(this.positions.values());
  }

  /**
   * Get all trades
   */
  getTrades(): Trade[] {
    return this.trades;
  }

  /**
   * Generate comprehensive backtest results
   */
  generateResults(
    strategyName: string,
    symbol: string,
    startDate: Date,
    endDate: Date
  ): BacktestResult {
    // Close any remaining positions at last price (would need to be passed in)
    // For now, we'll just calculate with current equity

    const totalReturn = this.equity - this.config.initialCapital;
    const totalReturnPercent = (totalReturn / this.config.initialCapital) * 100;

    // Calculate annualized return
    const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const annualizedReturn = (Math.pow(this.equity / this.config.initialCapital, 1 / years) - 1) * 100;

    // Separate winning and losing trades
    const winningTrades = this.trades.filter((t) => t.realizedPnL && t.realizedPnL > 0);
    const losingTrades = this.trades.filter((t) => t.realizedPnL && t.realizedPnL < 0);

    const totalWins = winningTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0));

    const winRate = (winningTrades.length / Math.max(this.trades.length / 2, 1)) * 100; // Divide by 2 for buy/sell pairs
    const profitFactor = totalWins / (totalLosses || 1);

    const averageWin = totalWins / (winningTrades.length || 1);
    const averageLoss = totalLosses / (losingTrades.length || 1);

    const largestWin = Math.max(...winningTrades.map((t) => t.realizedPnL || 0), 0);
    const largestLoss = Math.min(...losingTrades.map((t) => t.realizedPnL || 0), 0);

    // Calculate average holding period (in days)
    const holdingPeriods: number[] = [];
    const buyTrades = new Map<string, Date>();

    for (const trade of this.trades) {
      if (trade.type === 'BUY') {
        buyTrades.set(trade.symbol, trade.timestamp);
      } else if (trade.type === 'SELL') {
        const buyDate = buyTrades.get(trade.symbol);
        if (buyDate) {
          const holdingPeriod = (trade.timestamp.getTime() - buyDate.getTime()) / (24 * 60 * 60 * 1000);
          holdingPeriods.push(holdingPeriod);
          buyTrades.delete(trade.symbol);
        }
      }
    }

    const averageHoldingPeriod = holdingPeriods.length > 0
      ? holdingPeriods.reduce((sum, p) => sum + p, 0) / holdingPeriods.length
      : 0;

    // Calculate max drawdown
    const { maxDrawdown, maxDrawdownPercent } = this.calculateMaxDrawdown();

    // Calculate Sharpe and Sortino ratios
    const { sharpeRatio, sortinoRatio } = this.calculateRiskMetrics();

    // Generate drawdown curve
    const drawdownCurve: DrawdownPoint[] = this.equityCurve.map((point) => ({
      timestamp: point.timestamp,
      drawdown: point.drawdown,
      drawdownPercent: (point.drawdown / this.config.initialCapital) * 100,
    }));

    // Generate monthly returns
    const monthlyReturns = this.calculateMonthlyReturns();

    return {
      strategyName,
      symbol,
      startDate,
      endDate,
      initialCapital: this.config.initialCapital,
      finalCapital: this.equity,
      totalReturn,
      totalReturnPercent,
      annualizedReturn,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      maxDrawdownPercent,
      winRate,
      profitFactor,
      totalTrades: Math.floor(this.trades.length / 2), // Round trips
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      averageHoldingPeriod,
      trades: this.trades,
      equityCurve: this.equityCurve,
      drawdownCurve,
      monthlyReturns,
    };
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(): { maxDrawdown: number; maxDrawdownPercent: number } {
    let maxDrawdown = 0;
    let peak = this.config.initialCapital;

    for (const point of this.equityCurve) {
      if (point.equity > peak) {
        peak = point.equity;
      }
      const drawdown = peak - point.equity;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    const maxDrawdownPercent = (maxDrawdown / this.config.initialCapital) * 100;

    return { maxDrawdown, maxDrawdownPercent };
  }

  /**
   * Calculate risk-adjusted metrics
   */
  private calculateRiskMetrics(): { sharpeRatio: number; sortinoRatio: number } {
    if (this.equityCurve.length < 2) {
      return { sharpeRatio: 0, sortinoRatio: 0 };
    }

    // Calculate daily returns
    const returns: number[] = [];
    for (let i = 1; i < this.equityCurve.length; i++) {
      const dailyReturn = (this.equityCurve[i].equity - this.equityCurve[i - 1].equity) /
                          this.equityCurve[i - 1].equity;
      returns.push(dailyReturn);
    }

    // Average return
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Standard deviation
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Sharpe ratio (annualized)
    const riskFreeRateDaily = (this.config.riskFreeRate || 0.02) / 252;
    const excessReturn = avgReturn - riskFreeRateDaily;
    const sharpeRatio = stdDev !== 0 ? (excessReturn / stdDev) * Math.sqrt(252) : 0;

    // Sortino ratio (only downside deviation)
    const negativeReturns = returns.filter((r) => r < 0);
    const downsideVariance = negativeReturns.length > 0
      ? negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length
      : 0;
    const downsideDev = Math.sqrt(downsideVariance);
    const sortinoRatio = downsideDev !== 0 ? (excessReturn / downsideDev) * Math.sqrt(252) : 0;

    return {
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      sortinoRatio: Number(sortinoRatio.toFixed(2)),
    };
  }

  /**
   * Calculate monthly returns
   */
  private calculateMonthlyReturns(): MonthlyReturn[] {
    const monthlyReturns: MonthlyReturn[] = [];
    const monthlyEquity = new Map<string, { start: number; end: number }>();

    for (const point of this.equityCurve) {
      const key = `${point.timestamp.getFullYear()}-${point.timestamp.getMonth() + 1}`;

      if (!monthlyEquity.has(key)) {
        monthlyEquity.set(key, { start: point.equity, end: point.equity });
      } else {
        const current = monthlyEquity.get(key)!;
        current.end = point.equity;
      }
    }

    for (const [key, value] of monthlyEquity) {
      const [year, month] = key.split('-').map(Number);
      const monthReturn = value.end - value.start;
      const monthReturnPercent = (monthReturn / value.start) * 100;

      monthlyReturns.push({
        year,
        month,
        return: monthReturn,
        returnPercent: monthReturnPercent,
      });
    }

    return monthlyReturns.sort((a, b) => a.year - b.year || a.month - b.month);
  }
}

/**
 * Helper function to run a simple backtest
 */
export async function runBacktest(
  strategyName: string,
  data: StockData[],
  signals: Array<{ date: Date; action: 'BUY' | 'SELL'; price: number }>,
  config: BacktestConfig
): Promise<BacktestResult> {
  const backtester = new EquityBacktester(config);

  // Create price map for each date
  const pricesByDate = new Map<string, Map<string, number>>();

  for (const candle of data) {
    const dateKey = candle.timestamp.toDateString();
    if (!pricesByDate.has(dateKey)) {
      pricesByDate.set(dateKey, new Map());
    }
    pricesByDate.get(dateKey)!.set(candle.symbol, candle.close);
  }

  // Process signals
  for (const signal of signals) {
    const dateKey = signal.date.toDateString();
    const prices = pricesByDate.get(dateKey) || new Map();

    if (signal.action === 'BUY') {
      backtester.buy(data[0].symbol, signal.price, signal.date, strategyName);
    } else if (signal.action === 'SELL') {
      backtester.sell(data[0].symbol, signal.price, signal.date, strategyName);
    }

    backtester.updateEquity(prices, signal.date);
  }

  return backtester.generateResults(
    strategyName,
    data[0].symbol,
    data[0].timestamp,
    data[data.length - 1].timestamp
  );
}
