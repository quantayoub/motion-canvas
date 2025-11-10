import type {TimingFunction} from '@quantmotion/core';
import type {OHLCData} from './candle';

/**
 * Candle animation configuration
 */
export interface CandleAnimation {
  index: number;
  toOHLC: Partial<OHLCData>;
  duration?: number;
  easing?: TimingFunction;
}

/**
 * Price morph animation
 */
export interface PriceMorphAnimation {
  candleIndex: number;
  from: Partial<OHLCData>;
  to: Partial<OHLCData>;
  duration: number;
  easing?: TimingFunction;
}

/**
 * Forward animation (add new candles)
 */
export interface ForwardAnimation {
  candles: OHLCData[];
  duration: number;
  stagger?: number; // Delay between candles
}

/**
 * Highlight animation
 */
export interface HighlightAnimation {
  indices: number[];
  color?: string;
  opacity?: number;
  duration?: number;
}

/**
 * Zoom animation
 */
export interface ZoomAnimation {
  targetPriceRange?: {min: number; max: number};
  targetCandleRange?: {start: number; end: number};
  duration: number;
  easing?: TimingFunction;
}

/**
 * Pan animation
 */
export interface PanAnimation {
  startIndex: number;
  endIndex: number;
  duration: number;
  easing?: TimingFunction;
}

/**
 * Reveal animation
 */
export interface RevealAnimation {
  indices: number[];
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  stagger?: number;
}

/**
 * Animation sequence
 */
export interface AnimationSequence {
  animations: (
    | CandleAnimation
    | ForwardAnimation
    | HighlightAnimation
    | ZoomAnimation
    | PanAnimation
    | RevealAnimation
  )[];
  parallel?: boolean;
}

/**
 * Animation timeline
 */
export interface AnimationTimeline {
  time: number;
  animation: CandleAnimation | ForwardAnimation | HighlightAnimation;
}

/**
 * Animation state
 */
export interface AnimationState {
  isAnimating: boolean;
  currentAnimation?: string;
  progress: number; // 0-1
}

/**
 * Animation callbacks
 */
export interface AnimationCallbacks {
  onStart?: () => void;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}
