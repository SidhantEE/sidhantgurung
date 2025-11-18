'use client';

/**
 * TradingView Chart Component
 *
 * Example implementation using TradingView Lightweight Charts (FREE)
 * To use this, install: npm install lightweight-charts
 */

import { useEffect, useRef } from 'react';
// Uncomment when you install lightweight-charts:
// import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TradingViewChartProps {
  data: ChartData[];
  symbol: string;
}

export default function TradingViewChart({ data, symbol }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Uncomment when you install lightweight-charts:
  // const chartRef = useRef<IChartApi | null>(null);
  // const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Uncomment when you install lightweight-charts:
    /*
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: 'hsl(var(--card))' },
        textColor: 'hsl(var(--foreground))',
      },
      grid: {
        vertLines: { color: 'hsl(var(--border))' },
        horzLines: { color: 'hsl(var(--border))' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'hsl(var(--border))',
      },
      timeScale: {
        borderColor: 'hsl(var(--border))',
        timeVisible: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: 'hsl(var(--foreground))',
      downColor: 'hsl(var(--muted-foreground))',
      borderUpColor: 'hsl(var(--foreground))',
      borderDownColor: 'hsl(var(--muted-foreground))',
      wickUpColor: 'hsl(var(--foreground))',
      wickDownColor: 'hsl(var(--muted-foreground))',
    });

    // Convert data to lightweight-charts format
    const formattedData: CandlestickData[] = data.map(d => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(formattedData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
    */

    // Cleanup placeholder
    return () => {};
  }, [data]);

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
        <h3 className="text-lg font-semibold">{symbol}</h3>
      </div>
      <div ref={chartContainerRef} className="w-full" style={{ height: 400 }}>
        {/* Placeholder - Install lightweight-charts to see actual chart */}
        <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
          <div className="text-center">
            <p className="text-sm">Install TradingView Lightweight Charts to display chart</p>
            <code className="text-xs bg-[hsl(var(--muted))] px-2 py-1 rounded mt-2 inline-block">
              npm install lightweight-charts
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Installation Instructions:
 *
 * 1. Install the package:
 *    npm install lightweight-charts
 *
 * 2. Uncomment the imports and code above
 *
 * 3. Usage example:
 *
 *    import TradingViewChart from '@/components/TradingViewChart';
 *
 *    const chartData = [
 *      { time: '2024-01-01', open: 100, high: 105, low: 98, close: 103 },
 *      { time: '2024-01-02', open: 103, high: 108, low: 102, close: 107 },
 *      // ... more data
 *    ];
 *
 *    <TradingViewChart data={chartData} symbol="AAPL" />
 *
 * 4. For real data, fetch from your API and format accordingly
 */
