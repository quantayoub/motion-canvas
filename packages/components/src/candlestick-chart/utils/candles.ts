import {createSignal} from '@quantmotion/core';
import type {AnimatedOHLC, OHLCData} from '../types/candle';

/**
 * Create animated candle data from static OHLC
 */
export function createAnimatedCandles(data: OHLCData[]): AnimatedOHLC[] {
  return data.map(candle => ({
    open: createSignal(candle.open),
    high: createSignal(candle.high),
    low: createSignal(candle.low),
    close: createSignal(candle.close),
    timestamp: candle.timestamp ?? Date.now(),
    volume: candle.volume ? createSignal(candle.volume) : undefined,
  }));
}
