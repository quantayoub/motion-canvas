/**
 * Chart theme configuration
 */
export interface ChartTheme {
  backgroundColor: string;
  bullishColor: string;
  bearishColor: string;
  wickColor: string;
  gridColor?: string;
  textColor?: string;
}

/**
 * Predefined chart themes
 */
export const CHART_THEMES: Record<string, ChartTheme> = {
  dark: {
    backgroundColor: '#1a1a1a',
    bullishColor: '#0ecb81',
    bearishColor: '#ea3943',
    wickColor: '#737780',
    gridColor: '#2a2a2a',
    textColor: '#ffffff',
  },
  light: {
    backgroundColor: '#ffffff',
    bullishColor: '#26a69a',
    bearishColor: '#ef5350',
    wickColor: '#78909c',
    gridColor: '#e0e0e0',
    textColor: '#000000',
  },
  highContrast: {
    backgroundColor: '#000000',
    bullishColor: '#00ff00',
    bearishColor: '#ff0000',
    wickColor: '#ffffff',
    gridColor: '#333333',
    textColor: '#ffffff',
  },
};

/**
 * Get a theme by name, defaulting to 'dark' if not found
 */
export function getTheme(name: string = 'dark'): ChartTheme {
  return CHART_THEMES[name] || CHART_THEMES.dark;
}

/**
 * Chart configuration types
 */
export interface ChartConfig {
  data?: any[];
  startPrice?: number;
  candleCount?: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
  padding?: number | [number, number, number, number];
  candleSpacing?: number;
  candleWidth?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderRadius?: number;
  candleStyle?: {
    bullishColor?: string;
    bearishColor?: string;
    wickColor?: string;
    bodyWidthRatio?: number;
    wickWidth?: number;
  };
  showGrid?: boolean;
  gridConfig?: any;
  showPriceAxis?: boolean;
  showTimeAxis?: boolean;
  priceAxisWidth?: number;
  timeAxisHeight?: number;
  autoScale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  priceBuffer?: number;
  visibleCandles?: number;
  startIndex?: number;
  showCrosshair?: boolean;
  showVolume?: boolean;
  volumeHeight?: number;
  animationDuration?: number;
  enableTransitions?: boolean;
}

/**
 * Chart bounds for rendering calculations
 */
export interface ChartBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  contentX: number;
  contentY: number;
  contentWidth: number;
  contentHeight: number;
}

/**
 * Price scale for converting prices to Y coordinates
 */
export interface PriceScale {
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  height: number;
  priceToY: (price: number) => number;
  yToPrice: (y: number) => number;
}

/**
 * Time scale for converting candle indices to X coordinates
 */
export interface TimeScale {
  startIndex: number;
  visibleCandles: number;
  width: number;
  candleWidth: number;
  spacing: number;
  indexToX: (index: number) => number;
  xToIndex: (x: number) => number;
}

/**
 * Chart viewport configuration
 */
export interface ChartViewport {
  startIndex: number;
  endIndex: number;
  minPrice: number;
  maxPrice: number;
  candleWidth: number;
  candleSpacing: number;
}
