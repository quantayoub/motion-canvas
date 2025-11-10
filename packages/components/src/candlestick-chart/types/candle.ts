import {Signal} from '@quantmotion/core';

/**
 * OHLC (Open, High, Low, Close) data for a single candle
 */
export interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: number;
  volume?: number;
}

/**
 * Animated OHLC data with signals for reactive updates
 */
export interface AnimatedOHLC {
  open: Signal<number>;
  high: Signal<number>;
  low: Signal<number>;
  close: Signal<number>;
  timestamp: number;
  volume?: Signal<number>;
}

/**
 * Candle styling configuration
 */
export interface CandleStyle {
  bullishColor?: string;
  bearishColor?: string;
  wickColor?: string;
  bodyWidthRatio?: number;
  wickWidth?: number;
}

/**
 * Candle state for animations
 */
export interface CandleState {
  isVisible: boolean;
  opacity: number;
  scale: number;
}

/**
 * Validation result for OHLC data
 */
export interface CandleValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Check if OHLC data is valid
 * Valid means: high \>= max(open, close) and low \<= min(open, close)
 */
export function isValidOHLC(ohlc: OHLCData): boolean {
  if (ohlc.high < Math.max(ohlc.open, ohlc.close)) {
    return false;
  }
  if (ohlc.low > Math.min(ohlc.open, ohlc.close)) {
    return false;
  }
  if (ohlc.high < ohlc.low) {
    return false;
  }
  return true;
}

/**
 * Validate OHLC data and return validation result
 */
export function validateOHLC(ohlc: OHLCData): CandleValidation {
  const errors: string[] = [];

  if (ohlc.high < Math.max(ohlc.open, ohlc.close)) {
    errors.push(
      `High (${ohlc.high}) must be >= max(open, close) (${Math.max(ohlc.open, ohlc.close)})`,
    );
  }
  if (ohlc.low > Math.min(ohlc.open, ohlc.close)) {
    errors.push(
      `Low (${ohlc.low}) must be <= min(open, close) (${Math.min(ohlc.open, ohlc.close)})`,
    );
  }
  if (ohlc.high < ohlc.low) {
    errors.push(`High (${ohlc.high}) must be >= Low (${ohlc.low})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create OHLC data with validation
 */
export function createOHLC(
  open: number,
  high: number,
  low: number,
  close: number,
  timestamp?: number,
  volume?: number,
): OHLCData {
  const ohlc: OHLCData = {
    open,
    high: Math.max(high, open, close), // Ensure high is at least max(open, close)
    low: Math.min(low, open, close), // Ensure low is at most min(open, close)
    close,
    timestamp,
    volume,
  };

  // Final validation
  if (ohlc.high < ohlc.low) {
    // If still invalid, swap them
    [ohlc.high, ohlc.low] = [ohlc.low, ohlc.high];
  }

  return ohlc;
}

/**
 * Get the body ratio (body height / total range)
 */
export function getCandleBodyRatio(ohlc: OHLCData): number {
  const bodyHeight = Math.abs(ohlc.close - ohlc.open);
  const totalRange = ohlc.high - ohlc.low;
  return totalRange > 0 ? bodyHeight / totalRange : 0;
}

/**
 * Check if candle is bullish (close \>= open)
 */
export function isBullish(ohlc: OHLCData | AnimatedOHLC): boolean {
  if ('close' in ohlc && typeof ohlc.close === 'number') {
    // OHLCData
    return ohlc.close >= ohlc.open;
  } else {
    // AnimatedOHLC
    return ohlc.close() >= ohlc.open();
  }
}

/**
 * Get color for candle based on bullish/bearish state
 */
export function getCandleColor(
  ohlc: OHLCData | AnimatedOHLC,
  bullishColor: string = '#0ecb81',
  bearishColor: string = '#ea3943',
): string {
  return isBullish(ohlc) ? bullishColor : bearishColor;
}
