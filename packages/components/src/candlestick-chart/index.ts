// Core components
export {Candle} from './core/Candle';
export {CandlestickChart} from './core/CandlestickChart';
export {Grid} from './core/Grid';

// Pattern generation
export {
  MeanReversion,
  PerlinNoise,
  RandomWalk,
  SeededRandom,
  generateBreakoutPattern,
  generatePattern,
  generateRangingPattern,
  generateRealisticPattern,
  generateReversalPattern,
  generateTrendingPattern,
  generateVolatilePattern,
  getPatternTypes,
  hasPattern,
  registerPattern,
} from './generators';

// Utilities
export {
  calculatePriceLevels,
  calculatePriceScale,
  calculateTimeScale,
  calculateVisibleRange,
  calculateZoomForPriceRange,
  formatPrice,
} from './utils/scaling';

export {
  createOHLC,
  getCandleBodyRatio,
  getCandleColor,
  isBullish,
  isValidOHLC,
  validateOHLC,
} from './types/candle';

// Types
export type {
  AnimatedOHLC,
  AnimationCallbacks,
  AnimationSequence,
  AnimationState,
  AnimationTimeline,
  AxisConfig,
  CandleAnimation,
  CandleState,
  CandleStyle,
  CandleValidation,
  ChartBounds,
  ChartConfig,
  ChartTheme,
  ChartViewport,
  ForwardAnimation,
  GridConfig,
  HighlightAnimation,
  OHLCData,
  PanAnimation,
  PatternConfig,
  PatternRecognitionResult,
  PatternType,
  PriceAxisConfig,
  PriceMorphAnimation,
  PriceScale,
  RevealAnimation,
  TechnicalPattern,
  TimeAxisConfig,
  TimeScale,
  ZoomAnimation,
} from './types';

// Constants
export {CHART_THEMES, getTheme} from './types/chart';

export {
  DEFAULT_GRID_CONFIG,
  DEFAULT_PRICE_AXIS_CONFIG,
  DEFAULT_TIME_AXIS_CONFIG,
} from './types/grid';

export {DEFAULT_PATTERN_CONFIG, TECHNICAL_PATTERNS} from './types/patterns';
