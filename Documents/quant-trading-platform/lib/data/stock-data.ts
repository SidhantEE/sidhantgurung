/**
 * Stock Data Fetchers
 *
 * Fetches stock market data from various sources
 */

import axios from 'axios';
import { StockData, OHLCV } from '@/lib/types';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetch daily stock data from Alpha Vantage
 */
export async function fetchStockDataAlphaVantage(
  symbol: string,
  outputSize: 'compact' | 'full' = 'compact'
): Promise<StockData[]> {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol,
        outputsize: outputSize,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const timeSeries = response.data['Time Series (Daily)'];

    if (!timeSeries) {
      throw new Error(`No data returned for ${symbol}`);
    }

    const stockData: StockData[] = [];

    for (const [date, values] of Object.entries(timeSeries)) {
      stockData.push({
        symbol,
        timestamp: new Date(date),
        open: parseFloat((values as any)['1. open']),
        high: parseFloat((values as any)['2. high']),
        low: parseFloat((values as any)['3. low']),
        close: parseFloat((values as any)['4. close']),
        adjustedClose: parseFloat((values as any)['5. adjusted close']),
        volume: parseInt((values as any)['6. volume']),
      });
    }

    // Sort by date ascending
    return stockData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  } catch (error: any) {
    console.error(`Error fetching stock data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Fetch intraday stock data from Alpha Vantage
 */
export async function fetchIntradayDataAlphaVantage(
  symbol: string,
  interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'
): Promise<StockData[]> {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval,
        outputsize: 'full',
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const timeSeries = response.data[`Time Series (${interval})`];

    if (!timeSeries) {
      throw new Error(`No intraday data returned for ${symbol}`);
    }

    const stockData: StockData[] = [];

    for (const [datetime, values] of Object.entries(timeSeries)) {
      stockData.push({
        symbol,
        timestamp: new Date(datetime),
        open: parseFloat((values as any)['1. open']),
        high: parseFloat((values as any)['2. high']),
        low: parseFloat((values as any)['3. low']),
        close: parseFloat((values as any)['4. close']),
        volume: parseInt((values as any)['5. volume']),
      });
    }

    return stockData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  } catch (error: any) {
    console.error(`Error fetching intraday data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Generate mock stock data for testing (realistic random walk)
 */
export function generateMockStockData(
  symbol: string,
  startDate: Date,
  days: number,
  initialPrice: number = 100,
  volatility: number = 0.02
): StockData[] {
  const data: StockData[] = [];
  let currentPrice = initialPrice;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Random daily return
    const dailyReturn = (Math.random() - 0.48) * volatility; // Slight upward bias
    currentPrice = currentPrice * (1 + dailyReturn);

    // Generate OHLC
    const open = currentPrice * (1 + (Math.random() - 0.5) * 0.005);
    const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.01);
    const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.01);
    const close = currentPrice;

    // Generate volume
    const baseVolume = 1000000;
    const volume = Math.floor(baseVolume * (0.8 + Math.random() * 0.4));

    data.push({
      symbol,
      timestamp: date,
      open,
      high,
      low,
      close,
      volume,
      adjustedClose: close,
    });
  }

  return data;
}

/**
 * Generate mock stock data with a specific pattern (for testing strategies)
 */
export function generateMockStockDataWithPattern(
  symbol: string,
  pattern: 'trending-up' | 'trending-down' | 'mean-reverting' | 'volatile',
  days: number = 252,
  initialPrice: number = 100
): StockData[] {
  const data: StockData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let currentPrice = initialPrice;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    let dailyReturn = 0;

    switch (pattern) {
      case 'trending-up':
        dailyReturn = 0.001 + (Math.random() - 0.3) * 0.015; // Upward trend with noise
        break;
      case 'trending-down':
        dailyReturn = -0.001 + (Math.random() - 0.7) * 0.015; // Downward trend with noise
        break;
      case 'mean-reverting':
        // Oscillate around initial price
        const deviation = (currentPrice - initialPrice) / initialPrice;
        dailyReturn = -deviation * 0.1 + (Math.random() - 0.5) * 0.02;
        break;
      case 'volatile':
        dailyReturn = (Math.random() - 0.5) * 0.05; // High volatility
        break;
    }

    currentPrice = currentPrice * (1 + dailyReturn);

    const open = currentPrice * (1 + (Math.random() - 0.5) * 0.005);
    const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.01);
    const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.01);
    const close = currentPrice;

    const baseVolume = 1000000;
    const volume = Math.floor(baseVolume * (0.8 + Math.random() * 0.4));

    data.push({
      symbol,
      timestamp: date,
      open,
      high,
      low,
      close,
      volume,
      adjustedClose: close,
    });
  }

  return data;
}

/**
 * Fetch current quote for a symbol
 */
export async function fetchQuote(symbol: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}> {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const quote = response.data['Global Quote'];

    if (!quote) {
      throw new Error(`No quote data for ${symbol}`);
    }

    return {
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
    };
  } catch (error: any) {
    console.error(`Error fetching quote for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Cache for API calls to avoid rate limiting
 */
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = dataCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const data = await fetcher();
  dataCache.set(key, { data, timestamp: Date.now() });

  return data;
}
