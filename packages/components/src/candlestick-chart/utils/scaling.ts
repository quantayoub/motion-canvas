import type {OHLCData} from '../types/candle';
import type {PriceScale, TimeScale} from '../types/chart';

/**
 * Calculate price scale from OHLC data
 */
export function calculatePriceScale(
  candles: OHLCData[],
  height: number,
  options: {
    autoScale?: boolean;
    minPrice?: number;
    maxPrice?: number;
    buffer?: number; // 0-1, percentage padding
  } = {},
): PriceScale {
  const {autoScale = true, minPrice, maxPrice, buffer = 0.05} = options;

  let min: number;
  let max: number;

  if (autoScale && candles.length > 0) {
    // Find min/max from all candles
    min = Math.min(...candles.map(c => c.low));
    max = Math.max(...candles.map(c => c.high));

    // Apply buffer
    const range = max - min;
    min = min - range * buffer;
    max = max + range * buffer;
  } else {
    min = minPrice ?? 0;
    max = maxPrice ?? 200;
  }

  const range = max - min;
  const pixelsPerUnit = height / range;

  return {
    min,
    max,
    range,
    pixelsPerUnit,
    priceToY: (price: number) => {
      // Y=0 is at top, higher prices are higher Y values
      // But we want higher prices at top, so invert
      return height - (price - min) * pixelsPerUnit;
    },
    yToPrice: (y: number) => {
      // Invert the priceToY calculation
      return min + (height - y) / pixelsPerUnit;
    },
  };
}

/**
 * Calculate time scale
 */
export function calculateTimeScale(
  totalCandles: number,
  width: number,
  options: {
    startIndex?: number;
    visibleCandles?: number;
    candleWidth?: number;
    spacing?: number;
  } = {},
): TimeScale {
  const {
    startIndex = 0,
    visibleCandles = totalCandles,
    candleWidth = 0,
    spacing = 4,
  } = options;

  const endIndex = Math.min(startIndex + visibleCandles, totalCandles);
  const visibleCount = endIndex - startIndex;

  // Calculate candle width if auto
  const calculatedCandleWidth =
    candleWidth || (width - spacing * (visibleCount - 1)) / visibleCount;

  const pixelsPerCandle = calculatedCandleWidth + spacing;

  return {
    startIndex,
    endIndex,
    visibleCount,
    pixelsPerCandle,
    indexToX: (index: number) => {
      const relativeIndex = index - startIndex;
      return relativeIndex * pixelsPerCandle + calculatedCandleWidth / 2;
    },
    xToIndex: (x: number) => {
      return (
        Math.floor((x - calculatedCandleWidth / 2) / pixelsPerCandle) +
        startIndex
      );
    },
  };
}

/**
 * Calculate price levels for grid
 */
export function calculatePriceLevels(
  priceScale: PriceScale,
  count: number,
): number[] {
  const levels: number[] = [];
  const step = priceScale.range / (count - 1);

  for (let i = 0; i < count; i++) {
    levels.push(priceScale.min + step * i);
  }

  return levels;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return price.toFixed(decimals);
}

/**
 * Calculate zoom for price range
 */
export function calculateZoomForPriceRange(
  currentScale: PriceScale,
  targetMin: number,
  targetMax: number,
): PriceScale {
  const range = targetMax - targetMin;
  const buffer = range * 0.05; // 5% buffer

  return {
    ...currentScale,
    min: targetMin - buffer,
    max: targetMax + buffer,
    range: targetMax - targetMin + buffer * 2,
    pixelsPerUnit: currentScale.pixelsPerUnit,
    priceToY: (price: number) => {
      return currentScale.priceToY(price);
    },
    yToPrice: (y: number) => {
      return currentScale.yToPrice(y);
    },
  };
}

/**
 * Calculate visible range
 */
export function calculateVisibleRange(
  candles: OHLCData[],
  startIndex: number,
  endIndex: number,
): {min: number; max: number} {
  const visibleCandles = candles.slice(startIndex, endIndex);
  if (visibleCandles.length === 0) {
    return {min: 0, max: 100};
  }

  const min = Math.min(...visibleCandles.map(c => c.low));
  const max = Math.max(...visibleCandles.map(c => c.high));

  return {min, max};
}
