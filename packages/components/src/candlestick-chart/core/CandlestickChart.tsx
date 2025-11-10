import {Node, Rect} from '@quantmotion/2d';
import {
  SimpleSignal,
  ThreadGenerator,
  TimingFunction,
  all,
  createRef,
  createSignal,
  easeInOutCubic,
} from '@quantmotion/core';
import type {
  AnimatedOHLC,
  ChartBounds,
  ChartConfig,
  ChartViewport,
  OHLCData,
  PriceScale,
  TimeScale,
} from '../types';
import {getTheme} from '../types/chart';
import {createAnimatedCandles} from '../utils/candles';
import {calculatePriceScale, calculateTimeScale} from '../utils/scaling';
import {Candle} from './Candle';
import {Grid} from './Grid';

/**
 * Main Candlestick Chart Component
 *
 * Provides complete control over chart rendering and animations
 */
export class CandlestickChart {
  // Core properties
  private container: Rect;
  private config: Required<ChartConfig>;

  // Data signals - fully controllable
  private candlesSignal: SimpleSignal<AnimatedOHLC[]>;
  private viewportSignal: SimpleSignal<ChartViewport>;

  // Scale calculations
  private priceScale: PriceScale;
  private timeScale: TimeScale;
  private bounds: ChartBounds;

  // Child components
  private gridRef = createRef<Rect>();
  private candleRefs: Map<number, Candle> = new Map();
  private contentRef = createRef<Rect>();

  public constructor(config: ChartConfig) {
    this.config = this.normalizeConfig(config);

    // Initialize signals
    this.candlesSignal = createSignal<AnimatedOHLC[]>([]);
    this.viewportSignal = createSignal<ChartViewport>(
      this.createDefaultViewport(),
    );

    // Calculate initial scales
    this.bounds = this.calculateBounds();
    this.priceScale = this.calculatePriceScale();
    this.timeScale = this.calculateTimeScale();
  }

  private normalizeConfig(config: ChartConfig): Required<ChartConfig> {
    const theme = getTheme('dark');

    return {
      data: config.data ?? [],
      startPrice: config.startPrice ?? 100,
      candleCount: config.candleCount ?? 50,
      width: config.width,
      height: config.height,
      x: config.x ?? 0,
      y: config.y ?? 0,
      padding: config.padding ?? 20,
      candleSpacing: config.candleSpacing ?? 4,
      candleWidth: config.candleWidth ?? 0, // 0 = auto
      backgroundColor: config.backgroundColor ?? theme.backgroundColor,
      backgroundOpacity: config.backgroundOpacity ?? 1,
      borderRadius: config.borderRadius ?? 8,
      candleStyle: config.candleStyle ?? {
        bullishColor: theme.bullishColor,
        bearishColor: theme.bearishColor,
        wickColor: theme.wickColor,
        bodyWidthRatio: 0.8,
        wickWidth: 1,
      },
      showGrid: config.showGrid ?? true,
      gridConfig: config.gridConfig ?? {},
      showPriceAxis: config.showPriceAxis ?? true,
      showTimeAxis: config.showTimeAxis ?? true,
      priceAxisWidth: config.priceAxisWidth ?? 80,
      timeAxisHeight: config.timeAxisHeight ?? 30,
      autoScale: config.autoScale ?? true,
      minPrice: config.minPrice,
      maxPrice: config.maxPrice,
      priceBuffer: config.priceBuffer ?? 0.05,
      visibleCandles: config.visibleCandles ?? config.candleCount ?? 50,
      startIndex: config.startIndex ?? 0,
      showCrosshair: config.showCrosshair ?? false,
      showVolume: config.showVolume ?? false,
      volumeHeight: config.volumeHeight ?? 0.2,
      animationDuration: config.animationDuration ?? 0.6,
      enableTransitions: config.enableTransitions ?? true,
    };
  }

  /**
   * Mount the chart to a view
   */
  public mount(view: Node, data?: OHLCData[]): Rect {
    // Use provided data or config data
    const candleData = data ?? this.config.data ?? [];

    if (candleData.length === 0) {
      throw new Error(
        'No candle data provided. Use data parameter or config.data',
      );
    }

    // Convert to animated candles
    const animatedCandles = createAnimatedCandles(candleData);
    this.candlesSignal(animatedCandles);

    // Update scales based on data
    this.updateScales();

    const containerRef = createRef<Rect>();

    view.add(
      <Rect
        ref={containerRef}
        width={this.config.width}
        height={this.config.height}
        x={this.config.x}
        y={this.config.y}
        fill={this.config.backgroundColor}
        opacity={this.config.backgroundOpacity}
        radius={this.config.borderRadius}
        clip
      >
        {/* Main chart content area */}
        <Rect
          ref={this.contentRef}
          width="100%"
          height="100%"
          padding={this.normalizePadding(this.config.padding)}
          y={0}
        >
          {/* Grid and candles will be added here */}
        </Rect>
      </Rect>,
    );

    this.container = containerRef();

    // Render grid if enabled
    if (this.config.showGrid) {
      const grid = new Grid(
        this.config.gridConfig,
        this.bounds,
        this.priceScale,
        this.timeScale,
      );
      grid.render(this.contentRef());
    }

    // Render candles
    this.renderCandles();

    return this.container;
  }

  /**
   * Render all candles in viewport
   * Updates X positions of existing candles and only renders new ones
   */
  private renderCandles() {
    const candles = this.candlesSignal();
    const viewport = this.viewportSignal();
    const contentContainer = this.contentRef();

    // Safety check: ensure content container exists
    if (!contentContainer) {
      console.warn(
        'CandlestickChart: contentRef not available, skipping render',
      );
      return;
    }

    // Remove only candles that are outside the new viewport (smart cleanup)
    this.candleRefs.forEach((candleComponent, index) => {
      if (index < viewport.startIndex || index >= viewport.endIndex) {
        const containerRef = candleComponent.container();
        const container = containerRef();
        if (container && container.parent()) {
          container.remove();
        }
        this.candleRefs.delete(index);
      }
    });

    // Update X positions of existing candles (critical for scrolling)
    this.candleRefs.forEach((candleComponent, index) => {
      if (index >= viewport.startIndex && index < viewport.endIndex) {
        const newXPos = this.timeScale.indexToX(index);
        candleComponent.updateX(newXPos);
      }
    });

    // Render visible candles that aren't already rendered
    const contentHeight = this.bounds.contentHeight;
    const yOffset = -contentHeight / 2;

    const startIdx = Math.max(0, viewport.startIndex);
    const endIdx = Math.min(candles.length, viewport.endIndex);

    for (let index = startIdx; index < endIdx; index++) {
      // Skip if already rendered (we updated its position above)
      if (this.candleRefs.has(index)) continue;

      const candle = candles[index];
      if (!candle) continue;

      const xPos = this.timeScale.indexToX(index);
      const candleWidth = viewport.candleWidth || this.config.candleWidth || 10;

      const candleComponent = new Candle(
        candle,
        xPos,
        candleWidth,
        this.priceScale,
        this.config.candleStyle,
        yOffset,
      );

      this.candleRefs.set(index, candleComponent);
      candleComponent.render(contentContainer);
    }
  }

  /**
   * Calculate chart bounds
   */
  private calculateBounds(): ChartBounds {
    const padding = this.normalizePadding(this.config.padding);

    const x = this.config.x;
    const y = this.config.y;
    const width = this.config.width;
    const height = this.config.height;
    const priceAxisW = this.config.showPriceAxis
      ? this.config.priceAxisWidth
      : 0;
    const timeAxisH = this.config.showTimeAxis ? this.config.timeAxisHeight : 0;

    return {
      x,
      y,
      width,
      height,
      contentX: x + padding[3],
      contentY: y + padding[0],
      contentWidth: width - padding[1] - padding[3] - priceAxisW,
      contentHeight: height - padding[0] - padding[2] - timeAxisH,
    };
  }

  /**
   * Calculate price scale
   */
  private calculatePriceScale(): PriceScale {
    const candles = this.candlesSignal();

    if (candles.length === 0) {
      return {
        min: 0,
        max: 100,
        range: 100,
        pixelsPerUnit: 1,
        priceToY: p => p,
        yToPrice: y => y,
      };
    }

    return calculatePriceScale(
      candles.map(c => ({
        open: c.open(),
        high: c.high(),
        low: c.low(),
        close: c.close(),
      })),
      this.bounds.contentHeight,
      {
        autoScale: this.config.autoScale,
        minPrice: this.config.minPrice,
        maxPrice: this.config.maxPrice,
        buffer: this.config.priceBuffer,
      },
    );
  }

  /**
   * Calculate time scale
   */
  private calculateTimeScale(): TimeScale {
    const viewport = this.viewportSignal();
    const candles = this.candlesSignal();

    return calculateTimeScale(candles.length, this.bounds.contentWidth, {
      startIndex: viewport.startIndex,
      visibleCandles: this.config.visibleCandles,
      candleWidth: this.config.candleWidth || viewport.candleWidth,
      spacing: this.config.candleSpacing,
    });
  }

  /**
   * Update all scales based on current data
   */
  private updateScales(): void {
    this.bounds = this.calculateBounds();
    this.priceScale = this.calculatePriceScale();
    this.timeScale = this.calculateTimeScale();
  }

  /**
   * Create default viewport
   */
  private createDefaultViewport(): ChartViewport {
    const candleWidth = this.config.candleWidth || 10;

    return {
      startIndex: this.config.startIndex ?? 0,
      endIndex: this.config.visibleCandles ?? this.config.candleCount,
      minPrice: this.config.minPrice ?? 0,
      maxPrice: this.config.maxPrice ?? 200,
      candleWidth,
      candleSpacing: this.config.candleSpacing,
    };
  }

  private normalizePadding(
    padding: number | [number, number, number, number],
  ): [number, number, number, number] {
    if (typeof padding === 'number') {
      return [padding, padding, padding, padding];
    }
    return padding;
  }

  // =========================================================================
  // PUBLIC API - Developer Control
  // =========================================================================

  /**
   * Get the container rect
   */
  public getContainer(): Rect {
    return this.container;
  }

  /**
   * Get all candles
   */
  public getCandles(): AnimatedOHLC[] {
    return this.candlesSignal();
  }

  /**
   * Get specific candle by index
   */
  public getCandle(index: number): AnimatedOHLC | undefined {
    return this.candlesSignal()[index];
  }

  /**
   * Update a candle's OHLC values
   */
  public updateCandle(index: number, ohlc: Partial<OHLCData>): void {
    const candles = this.candlesSignal();
    if (index < 0 || index >= candles.length) return;

    const candle = candles[index];
    if (ohlc.open !== undefined) candle.open(ohlc.open);
    if (ohlc.high !== undefined) candle.high(ohlc.high);
    if (ohlc.low !== undefined) candle.low(ohlc.low);
    if (ohlc.close !== undefined) candle.close(ohlc.close);
    if (ohlc.volume !== undefined && candle.volume) {
      candle.volume(ohlc.volume);
    }
  }

  /**
   * Animate a candle's price (generator function for Motion Canvas)
   */
  public *animateCandle(
    index: number,
    toOHLC: Partial<OHLCData>,
    duration: number = this.config.animationDuration,
    easing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    const candle = this.getCandle(index);
    if (!candle) return;

    const animations: ThreadGenerator[] = [];

    if (toOHLC.open !== undefined) {
      animations.push(candle.open(toOHLC.open, duration, easing));
    }
    if (toOHLC.high !== undefined) {
      animations.push(candle.high(toOHLC.high, duration, easing));
    }
    if (toOHLC.low !== undefined) {
      animations.push(candle.low(toOHLC.low, duration, easing));
    }
    if (toOHLC.close !== undefined) {
      animations.push(candle.close(toOHLC.close, duration, easing));
    }

    yield* all(...animations);
  }

  /**
   * Add new candles (forward animation)
   */
  public *addCandles(newCandles: OHLCData[]): ThreadGenerator {
    const currentCandles = this.candlesSignal();
    const animatedNewCandles = createAnimatedCandles(newCandles);

    this.candlesSignal([...currentCandles, ...animatedNewCandles]);
    this.updateScales();

    // Re-render candles (in a real implementation, you'd animate opacity/scale)
    // For now, just update
    yield* all(/* Future: staggered animations */);
  }

  /**
   * Remove candles
   */
  public removeCandles(indices: number[]): void {
    const candles = this.candlesSignal();
    const filtered = candles.filter((_, i) => !indices.includes(i));
    this.candlesSignal(filtered);
    this.updateScales();
  }

  /**
   * Set all candle data at once
   * Use this sparingly as it re-renders everything
   */
  public setCandles(data: OHLCData[]): void {
    const animatedCandles = createAnimatedCandles(data);
    const oldLength = this.candlesSignal().length;
    this.candlesSignal(animatedCandles);
    this.updateScales();

    // Only re-render if we need to (new candles added or significant change)
    if (data.length > oldLength) {
      // Incremental add is more efficient
      this.addCandlesIncremental(data.slice(oldLength));
    } else {
      // Full re-render only if data was replaced
      this.renderCandles();
    }
  }

  /**
   * Add new candles incrementally without re-rendering existing ones
   * This is much more efficient for live charts
   */
  public addCandlesIncremental(newCandles: OHLCData[]): void {
    if (newCandles.length === 0) return;

    const currentCandles = this.candlesSignal();
    const animatedNewCandles = createAnimatedCandles(newCandles);
    const startIndex = currentCandles.length;

    // Add to signal
    this.candlesSignal([...currentCandles, ...animatedNewCandles]);

    // Update scales (non-blocking, just recalculates)
    this.updateScales();

    // Only render new candles that are in the viewport
    const viewport = this.viewportSignal();
    const contentContainer = this.contentRef();

    if (!contentContainer) {
      console.warn(
        'CandlestickChart: contentRef not available, skipping incremental render',
      );
      return;
    }

    const contentHeight = this.bounds.contentHeight;
    const yOffset = -contentHeight / 2;

    // Render only the new candles that are visible
    animatedNewCandles.forEach((candle, relativeIndex) => {
      const absoluteIndex = startIndex + relativeIndex;

      // Only render if in viewport
      if (
        absoluteIndex >= viewport.startIndex &&
        absoluteIndex < viewport.endIndex
      ) {
        const xPos = this.timeScale.indexToX(absoluteIndex);
        const candleWidth =
          viewport.candleWidth || this.config.candleWidth || 10;

        const candleComponent = new Candle(
          candle,
          xPos,
          candleWidth,
          this.priceScale,
          this.config.candleStyle,
          yOffset,
        );

        this.candleRefs.set(absoluteIndex, candleComponent);
        candleComponent.render(contentContainer);
      }
    });

    // Update X positions of all existing candles (in case viewport shifted)
    // This ensures smooth scrolling
    this.candleRefs.forEach((candleComponent, index) => {
      if (index >= viewport.startIndex && index < viewport.endIndex) {
        const newXPos = this.timeScale.indexToX(index);
        candleComponent.updateX(newXPos);
      }
    });
  }

  /**
   * Get current viewport
   */
  public getViewport(): ChartViewport {
    return this.viewportSignal();
  }

  /**
   * Update viewport (for panning/zooming)
   * Optimized to only update what's necessary
   */
  public setViewport(viewport: Partial<ChartViewport>): void {
    const current = this.viewportSignal();
    const updatedViewport = {...current, ...viewport};

    // Calculate endIndex if startIndex changed
    if (viewport.startIndex !== undefined) {
      updatedViewport.endIndex =
        viewport.startIndex + this.config.visibleCandles;
    }

    // Only update if viewport actually changed
    const viewportChanged =
      updatedViewport.startIndex !== current.startIndex ||
      updatedViewport.endIndex !== current.endIndex;

    if (viewportChanged) {
      this.viewportSignal(updatedViewport);
      this.updateScales();
      // Smart re-render: only updates what's needed
      this.renderCandles();
    }
  }

  /**
   * Get price scale
   */
  public getPriceScale(): PriceScale {
    return this.priceScale;
  }

  /**
   * Get time scale
   */
  public getTimeScale(): TimeScale {
    return this.timeScale;
  }

  /**
   * Static factory method for easier usage
   */
  public static mount(
    view: Node,
    config: ChartConfig,
    data?: OHLCData[],
  ): CandlestickChart {
    const chart = new CandlestickChart(config);
    chart.mount(view, data);
    return chart;
  }
}
