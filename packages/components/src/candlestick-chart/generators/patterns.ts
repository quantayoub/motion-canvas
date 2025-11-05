import type {OHLCData, PatternConfig, PatternType} from '../types';
import {DEFAULT_PATTERN_CONFIG} from '../types/patterns';
import {MeanReversion, PerlinNoise, RandomWalk, SeededRandom} from './random';

/**
 * Pattern generator registry
 */
const PATTERN_GENERATORS: Map<
  PatternType,
  (config: PatternConfig) => OHLCData[]
> = new Map();

/**
 * Register a custom pattern generator
 */
export function registerPattern(
  type: PatternType,
  generator: (config: PatternConfig) => OHLCData[],
): void {
  PATTERN_GENERATORS.set(type, generator);
}

/**
 * Get pattern types
 */
export function getPatternTypes(): PatternType[] {
  return Array.from(PATTERN_GENERATORS.keys());
}

/**
 * Check if pattern exists
 */
export function hasPattern(type: PatternType): boolean {
  return PATTERN_GENERATORS.has(type);
}

/**
 * Generate pattern
 */
export function generatePattern(
  type: PatternType,
  config: Partial<PatternConfig>,
): OHLCData[] {
  const fullConfig = {
    ...DEFAULT_PATTERN_CONFIG,
    ...config,
  } as Required<PatternConfig>;
  const generator = PATTERN_GENERATORS.get(type);

  if (!generator) {
    throw new Error(`Unknown pattern type: ${type}`);
  }

  return generator(fullConfig);
}

/**
 * Generate realistic market pattern
 */
export function generateRealisticPattern(
  config: Required<PatternConfig>,
): OHLCData[] {
  const candles: OHLCData[] = [];
  const rng = new SeededRandom(config.seed);
  const walk = new RandomWalk(config.startPrice, config.seed);
  const noise = new PerlinNoise(config.seed);

  let currentPrice = config.startPrice;
  let currentVolatility = config.volatility;

  for (let i = 0; i < config.candleCount; i++) {
    // Update volatility with decay
    currentVolatility *= config.volatilityDecay;

    // Add Perlin noise for smooth variations
    const noiseValue = noise.octave(i * 0.1, 4, 0.5);
    const trend =
      config.trend === 'up' ? 0.1 : config.trend === 'down' ? -0.1 : 0;
    const trendStrength = config.trendStrength;

    // Calculate price change
    const change = walk.step(
      trend * trendStrength,
      currentVolatility * (1 + noiseValue * config.noiseLevel),
    );

    currentPrice = change;

    // Clamp to bounds
    if (config.minPrice !== undefined) {
      currentPrice = Math.max(currentPrice, config.minPrice);
    }
    if (config.maxPrice !== undefined) {
      currentPrice = Math.min(currentPrice, config.maxPrice);
    }

    // Generate OHLC
    const open = i === 0 ? config.startPrice : candles[i - 1].close;
    const close = currentPrice + rng.normal(0, currentVolatility * 0.1);
    const high =
      Math.max(open, close) + Math.abs(rng.normal(0, currentVolatility * 0.3));
    const low =
      Math.min(open, close) - Math.abs(rng.normal(0, currentVolatility * 0.3));

    candles.push({
      open,
      high,
      low,
      close,
      timestamp: Date.now() + i * 60000, // 1 minute intervals
      volume: config.includeVolume
        ? config.baseVolume *
          (1 + rng.range(-config.volumeVariation, config.volumeVariation))
        : undefined,
    });
  }

  return candles;
}

/**
 * Generate trending pattern
 */
export function generateTrendingPattern(
  config: Required<PatternConfig>,
): OHLCData[] {
  const candles: OHLCData[] = [];
  const rng = new SeededRandom(config.seed);
  const direction =
    config.trend === 'up' ? 1 : config.trend === 'down' ? -1 : 0;
  const strength = config.trendStrength;

  let price = config.startPrice;

  for (let i = 0; i < config.candleCount; i++) {
    const open = i === 0 ? price : candles[i - 1].close;
    const trendChange = direction * strength * (0.5 + rng.next() * 0.5);
    const noise = rng.normal(0, config.volatility);
    const close = open + trendChange + noise;

    const wickSize = config.volatility * (0.2 + rng.next() * 0.3);
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;

    price = close;

    candles.push({
      open,
      high,
      low,
      close,
      timestamp: Date.now() + i * 60000,
    });
  }

  return candles;
}

/**
 * Generate ranging/sideways pattern
 */
export function generateRangingPattern(
  config: Required<PatternConfig>,
): OHLCData[] {
  const candles: OHLCData[] = [];
  const rng = new SeededRandom(config.seed);
  const meanReversion = new MeanReversion(
    config.startPrice,
    config.startPrice,
    config.seed,
  );

  for (let i = 0; i < config.candleCount; i++) {
    const open = i === 0 ? config.startPrice : candles[i - 1].close;
    const close = meanReversion.step(0.2, config.volatility);
    const wickSize = config.volatility * (0.3 + rng.next() * 0.4);
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;

    candles.push({
      open,
      high,
      low,
      close,
      timestamp: Date.now() + i * 60000,
    });
  }

  return candles;
}

/**
 * Generate volatile pattern
 */
export function generateVolatilePattern(
  config: Required<PatternConfig>,
): OHLCData[] {
  const candles: OHLCData[] = [];
  const rng = new SeededRandom(config.seed);
  let price = config.startPrice;

  for (let i = 0; i < config.candleCount; i++) {
    const open = i === 0 ? price : candles[i - 1].close;
    const volatility = config.volatility * (1.5 + rng.next() * 1.0); // High volatility
    const change = rng.normal(0, volatility);
    const close = open + change;

    const wickSize = volatility * (0.4 + rng.next() * 0.6);
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;

    price = close;

    candles.push({
      open,
      high,
      low,
      close,
      timestamp: Date.now() + i * 60000,
    });
  }

  return candles;
}

/**
 * Generate breakout pattern
 */
export function generateBreakoutPattern(
  config: Required<PatternConfig>,
): OHLCData[] {
  const candles: OHLCData[] = [];
  const rng = new SeededRandom(config.seed);
  const breakoutPoint = Math.floor(config.candleCount * 0.6);
  const direction = config.trend === 'up' ? 1 : -1;

  let price = config.startPrice;

  for (let i = 0; i < config.candleCount; i++) {
    const open = i === 0 ? price : candles[i - 1].close;

    let change: number;
    if (i < breakoutPoint) {
      // Consolidation phase
      change = rng.normal(0, config.volatility * 0.3);
    } else {
      // Breakout phase
      change = direction * config.trendStrength * (2 + rng.next() * 2);
    }

    const close = open + change;
    const wickSize = config.volatility * (0.2 + rng.next() * 0.3);
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;

    price = close;

    candles.push({
      open,
      high,
      low,
      close,
      timestamp: Date.now() + i * 60000,
    });
  }

  return candles;
}

/**
 * Generate reversal pattern
 */
export function generateReversalPattern(
  config: Required<PatternConfig>,
): OHLCData[] {
  const candles: OHLCData[] = [];
  const rng = new SeededRandom(config.seed);
  const reversalPoint = Math.floor(config.candleCount * 0.5);
  const initialDirection = config.trend === 'up' ? 1 : -1;

  let price = config.startPrice;

  for (let i = 0; i < config.candleCount; i++) {
    const open = i === 0 ? price : candles[i - 1].close;

    let change: number;
    if (i < reversalPoint) {
      // Initial trend
      change =
        initialDirection * config.trendStrength * (0.5 + rng.next() * 0.5);
    } else {
      // Reversal
      change = -initialDirection * config.trendStrength * (1 + rng.next() * 1);
    }

    const close = open + change;
    const wickSize = config.volatility * (0.2 + rng.next() * 0.3);
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;

    price = close;

    candles.push({
      open,
      high,
      low,
      close,
      timestamp: Date.now() + i * 60000,
    });
  }

  return candles;
}

// Register built-in patterns
registerPattern('random', generateRealisticPattern);
registerPattern('trending-up', config =>
  generateTrendingPattern({...config, trend: 'up'}),
);
registerPattern('trending-down', config =>
  generateTrendingPattern({...config, trend: 'down'}),
);
registerPattern('sideways', generateRangingPattern);
registerPattern('ranging', generateRangingPattern);
registerPattern('volatile', generateVolatilePattern);
registerPattern('breakout-up', config =>
  generateBreakoutPattern({...config, trend: 'up'}),
);
registerPattern('breakout-down', config =>
  generateBreakoutPattern({...config, trend: 'down'}),
);
registerPattern('reversal-bullish', config =>
  generateReversalPattern({...config, trend: 'down'}),
);
registerPattern('reversal-bearish', config =>
  generateReversalPattern({...config, trend: 'up'}),
);
