import {Node, Rect} from '@motion-canvas/2d';
import {Reference, createRef} from '@motion-canvas/core';
import type {AnimatedOHLC, CandleStyle, PriceScale} from '../types';

export interface CandleProps {
  ohlc: AnimatedOHLC;
  index: number;
  x: number;
  width: number;
  priceScale: PriceScale;
  style: CandleStyle;
}

/**
 * Individual candlestick component
 */
export class Candle {
  private bodyRef = createRef<Rect>();
  private upperWickRef = createRef<Rect>();
  private lowerWickRef = createRef<Rect>();
  private containerRef = createRef<Rect>();

  public constructor(
    private ohlc: AnimatedOHLC,
    private x: number,
    private width: number,
    private priceScale: PriceScale,
    private style: CandleStyle,
    private yOffset: number = 0, // Offset to convert from top-origin to center-origin
  ) {}

  /**
   * Render the candle
   */
  public render(parent: Node): Reference<Rect> {
    const bodyWidthRatio = this.style.bodyWidthRatio ?? 0.8;
    const bodyWidth = this.width * bodyWidthRatio;
    const wickWidth = this.style.wickWidth ?? 1;
    const wickColor = this.style.wickColor ?? '#737780';

    const isBullish = () => this.ohlc.close() >= this.ohlc.open();
    const bodyColor = () =>
      isBullish()
        ? (this.style.bullishColor ?? '#0ecb81')
        : (this.style.bearishColor ?? '#ea3943');

    // Calculate positions (priceToY returns Y where Y=0 is at top of chart)
    // Motion Canvas uses Y=0 at center, so we need to account for that
    const openY = () => this.priceScale.priceToY(this.ohlc.open());
    const closeY = () => this.priceScale.priceToY(this.ohlc.close());
    const highY = () => this.priceScale.priceToY(this.ohlc.high());
    const lowY = () => this.priceScale.priceToY(this.ohlc.low());

    // Body height and position
    const bodyTop = () => Math.min(openY(), closeY());
    const bodyBottom = () => Math.max(openY(), closeY());
    const bodyHeight = () => Math.abs(closeY() - openY());
    // For Motion Canvas, Y position is the center, so bodyCenterY is correct
    const bodyCenterY = () => (bodyTop() + bodyBottom()) / 2;

    // Upper wick - from high to body top
    const upperWickHeight = () => Math.max(0, bodyTop() - highY());
    // Y position is center of wick, so top + height/2
    const upperWickY = () => highY() + upperWickHeight() / 2;

    // Lower wick - from body bottom to low
    const lowerWickHeight = () => Math.max(0, lowY() - bodyBottom());
    // Y position is center of wick, so bottom + height/2
    const lowerWickY = () => bodyBottom() + lowerWickHeight() / 2;

    // Apply Y offset to convert from top-origin (priceToY) to center-origin (Motion Canvas)
    const applyYOffset = (y: () => number) => () => y() + this.yOffset;

    const container = (
      <Rect ref={this.containerRef} x={this.x} y={0}>
        {/* Upper wick - centered at x=0 (Rect origin is at center) */}
        <Rect
          ref={this.upperWickRef}
          width={wickWidth}
          height={() => upperWickHeight()}
          fill={wickColor}
          x={0}
          y={applyYOffset(upperWickY)}
        />

        {/* Body - centered at x=0 (Rect origin is at center) */}
        <Rect
          ref={this.bodyRef}
          width={bodyWidth}
          height={() => bodyHeight()}
          fill={() => bodyColor()}
          x={0}
          y={applyYOffset(bodyCenterY)}
        />

        {/* Lower wick - centered at x=0 (Rect origin is at center) */}
        <Rect
          ref={this.lowerWickRef}
          width={wickWidth}
          height={() => lowerWickHeight()}
          fill={wickColor}
          x={0}
          y={applyYOffset(lowerWickY)}
        />
      </Rect>
    );

    parent.add(container);

    return this.containerRef;
  }

  /**
   * Get body rect reference
   */
  public body(): Reference<Rect> {
    return this.bodyRef;
  }

  /**
   * Get upper wick rect reference
   */
  public upperWick(): Reference<Rect> {
    return this.upperWickRef;
  }

  /**
   * Get lower wick rect reference
   */
  public lowerWick(): Reference<Rect> {
    return this.lowerWickRef;
  }

  /**
   * Get container rect reference
   */
  public container(): Reference<Rect> {
    return this.containerRef;
  }

  /**
   * Update X position of the candle
   */
  public updateX(newX: number): void {
    this.x = newX;
    const container = this.containerRef();
    if (container) {
      container.x(newX);
    }
  }
}
