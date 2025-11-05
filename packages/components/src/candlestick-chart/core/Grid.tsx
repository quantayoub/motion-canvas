import {Line, Node, Rect} from '@motion-canvas/2d';
import {Reference, createRef} from '@motion-canvas/core';
import type {ChartBounds, GridConfig, PriceScale, TimeScale} from '../types';
import {DEFAULT_GRID_CONFIG} from '../types/grid';
import {calculatePriceLevels} from '../utils/scaling';

export interface GridProps {
  config: GridConfig;
  bounds: ChartBounds;
  priceScale: PriceScale;
  timeScale: TimeScale;
}

/**
 * Grid component for chart background
 */
export class Grid {
  private containerRef = createRef<Rect>();

  public constructor(
    private config: GridConfig,
    private bounds: ChartBounds,
    private priceScale: PriceScale,
    private timeScale: TimeScale,
  ) {}

  /**
   * Render the grid
   */
  public render(parent: Node): Reference<Rect> {
    const gridConfig = {
      ...DEFAULT_GRID_CONFIG,
      ...this.config,
    } as Required<GridConfig>;

    const container = (
      <Rect
        ref={this.containerRef}
        x={this.bounds.contentX}
        y={this.bounds.contentY}
      >
        {/* Horizontal lines */}
        {gridConfig.horizontal.enabled &&
          this.renderHorizontalLines(gridConfig)}

        {/* Vertical lines */}
        {gridConfig.vertical.enabled && this.renderVerticalLines(gridConfig)}

        {/* Alternating rows */}
        {gridConfig.alternatingRows && this.renderAlternatingRows(gridConfig)}
      </Rect>
    );

    parent.add(container);
    return this.containerRef;
  }

  private renderHorizontalLines(config: Required<GridConfig>) {
    const levels = calculatePriceLevels(
      this.priceScale,
      config.horizontal.count,
    );

    return levels.map((price, index) => {
      const y = this.priceScale.priceToY(price);
      return (
        <Line
          key={`h-line-${index}`}
          points={() => [
            [0, y],
            [this.bounds.contentWidth, y],
          ]}
          stroke={config.horizontal.color}
          lineWidth={config.horizontal.lineWidth}
          opacity={config.horizontal.opacity}
        />
      );
    });
  }

  private renderVerticalLines(config: Required<GridConfig>) {
    const lines: JSX.Element[] = [];
    const interval = config.vertical.interval;

    for (
      let i = this.timeScale.startIndex;
      i < this.timeScale.endIndex;
      i += interval
    ) {
      const x = this.timeScale.indexToX(i);
      lines.push(
        <Line
          key={`v-line-${i}`}
          points={() => [
            [x, 0],
            [x, this.bounds.contentHeight],
          ]}
          stroke={config.vertical.color}
          lineWidth={config.vertical.lineWidth}
          opacity={config.vertical.opacity}
        />,
      );
    }

    return lines;
  }

  private renderAlternatingRows(config: Required<GridConfig>) {
    const levels = calculatePriceLevels(
      this.priceScale,
      config.horizontal.count,
    );
    const rows: JSX.Element[] = [];

    for (let i = 0; i < levels.length - 1; i++) {
      if (i % 2 === 0) continue; // Skip every other row

      const topY = this.priceScale.priceToY(levels[i]);
      const bottomY = this.priceScale.priceToY(levels[i + 1]);
      const height = Math.abs(bottomY - topY);

      rows.push(
        <Rect
          key={`alt-row-${i}`}
          width={this.bounds.contentWidth}
          height={height}
          fill={config.alternateColor}
          opacity={config.alternateOpacity}
          x={0}
          y={(topY + bottomY) / 2}
        />,
      );
    }

    return rows;
  }

  /**
   * Get container reference
   */
  public container(): Reference<Rect> {
    return this.containerRef;
  }
}
