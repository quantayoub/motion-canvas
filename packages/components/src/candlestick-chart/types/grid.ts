/**
 * Grid configuration
 */
export interface GridConfig {
  horizontal?: {
    enabled?: boolean;
    count?: number;
    color?: string;
    opacity?: number;
    lineWidth?: number;
    style?: 'solid' | 'dashed' | 'dotted';
  };
  vertical?: {
    enabled?: boolean;
    interval?: number; // Every N candles
    color?: string;
    opacity?: number;
    lineWidth?: number;
  };
  alternatingRows?: boolean;
  alternateColor?: string;
  alternateOpacity?: number;
}

/**
 * Default grid configuration
 */
export const DEFAULT_GRID_CONFIG: Required<GridConfig> = {
  horizontal: {
    enabled: true,
    count: 6,
    color: '#1e222d',
    opacity: 1,
    lineWidth: 1,
    style: 'solid',
  },
  vertical: {
    enabled: true,
    interval: 10,
    color: '#1e222d',
    opacity: 1,
    lineWidth: 1,
  },
  alternatingRows: false,
  alternateColor: '#1a1d28',
  alternateOpacity: 0.5,
};

/**
 * Price axis configuration
 */
export interface PriceAxisConfig {
  enabled?: boolean;
  width?: number;
  showLabels?: boolean;
  labelCount?: number;
  labelFormat?: (price: number) => string;
  fontSize?: number;
  fontColor?: string;
  position?: 'left' | 'right';
}

/**
 * Default price axis configuration
 */
export const DEFAULT_PRICE_AXIS_CONFIG: Required<PriceAxisConfig> = {
  enabled: true,
  width: 80,
  showLabels: true,
  labelCount: 6,
  labelFormat: (price: number) => price.toFixed(2),
  fontSize: 12,
  fontColor: '#d1d4dc',
  position: 'left',
};

/**
 * Time axis configuration
 */
export interface TimeAxisConfig {
  enabled?: boolean;
  height?: number;
  showLabels?: boolean;
  labelInterval?: number;
  labelFormat?: (timestamp: number, index: number) => string;
  fontSize?: number;
  fontColor?: string;
  position?: 'top' | 'bottom';
}

/**
 * Default time axis configuration
 */
export const DEFAULT_TIME_AXIS_CONFIG: Required<TimeAxisConfig> = {
  enabled: true,
  height: 30,
  showLabels: true,
  labelInterval: 10,
  labelFormat: (_timestamp: number, index: number) => `C${index}`,
  fontSize: 12,
  fontColor: '#d1d4dc',
  position: 'bottom',
};
