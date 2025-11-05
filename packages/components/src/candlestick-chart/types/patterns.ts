import type {OHLCData} from './candle';

/**
 * Pattern type
 */
export type PatternType =
  | 'random'
  | 'trending-up'
  | 'trending-down'
  | 'sideways'
  | 'ranging'
  | 'volatile'
  | 'breakout-up'
  | 'breakout-down'
  | 'reversal-bullish'
  | 'reversal-bearish';

/**
 * Pattern configuration
 */
export interface PatternConfig {
  candleCount: number;
  startPrice: number;
  volatility?: number; // 0-1
  volatilityDecay?: number; // 0-1, how volatility changes over time
  trend?: 'up' | 'down' | 'sideways' | 'random';
  trendStrength?: number; // 0-1
  seed?: number; // For reproducible patterns
  noiseLevel?: number; // 0-1
  includeVolume?: boolean;
  baseVolume?: number;
  volumeVariation?: number; // 0-1
  minPrice?: number;
  maxPrice?: number;
  allowGaps?: boolean;
}

/**
 * Default pattern configuration
 */
export const DEFAULT_PATTERN_CONFIG: Required<PatternConfig> = {
  candleCount: 50,
  startPrice: 100,
  volatility: 0.3,
  volatilityDecay: 0.95,
  trend: 'random',
  trendStrength: 0.5,
  seed: undefined,
  noiseLevel: 0.2,
  includeVolume: false,
  baseVolume: 1000000,
  volumeVariation: 0.3,
  minPrice: undefined,
  maxPrice: undefined,
  allowGaps: false,
};

/**
 * Pattern generator function
 */
export type PatternGenerator = (config: PatternConfig) => OHLCData[];

/**
 * Technical pattern recognition result
 */
export interface PatternRecognitionResult {
  pattern: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Technical patterns
 */
export const TECHNICAL_PATTERNS = [
  'bullish-engulfing',
  'bearish-engulfing',
  'hammer',
  'shooting-star',
  'doji',
  'morning-star',
  'evening-star',
] as const;

export type TechnicalPattern = (typeof TECHNICAL_PATTERNS)[number];
