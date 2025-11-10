import type {SignalValue} from '@quantmotion/core';

export interface CodeDisplayConfig {
  code: string | SignalValue<string>;
  language: string;
  theme?: string;

  // Layout
  width?: number | string;
  height?: number;
  x?: number;
  y?: number;
  padding?: number;

  // Font
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;

  // Features
  showLineNumbers?: boolean;
  startLineNumber?: number;

  // Focus/Blur
  focusBlurOpacity?: number; // Opacity of dimmed lines (default: 0.3)
  initialVisibility?: 'all' | 'none'; // Start with all lines visible or hidden (default: 'all')
  autoScroll?: boolean; // Automatically scroll/recenter when revealing new lines (default: false)

  // Window chrome
  showWindow?: boolean;
  windowTitle?: string;
  filename?: string;
  windowButtonSize?: number;
  filenameFontSize?: number;

  // Background
  showBackground?: boolean;
  backgroundColor?: string;
  backgroundRadius?: number;
  backgroundOpacity?: number;
  borderColor?: string;
  borderWidth?: number;

  // Shadow
  showShadow?: boolean;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffset?: [number, number];
}

export interface TokenPosition {
  line: number;
  column: number;
}

export interface Token {
  type: string;
  value: string;
  start: TokenPosition;
  end: TokenPosition;
}

export interface TokenRule {
  pattern: RegExp;
  type: string;
  scopes?: string[];
}

export interface MultiLineRule {
  start: RegExp;
  end: RegExp;
  type: string;
}

export interface LanguageDefinition {
  name: string;
  extensions: string[];
  keywords: {
    control: string[];
    declaration: string[];
    operator: string[];
    constant: string[];
    builtin: string[];
  };
  comments: {
    line: string;
  };
  brackets: Array<[string, string]>;
  multiLineRules: MultiLineRule[];
  tokenRules: TokenRule[];
}

export interface Theme {
  name: string;
  background: string;
  foreground: string;
  comment: string;
  string: string;
  number: string;
  keyword: string;
  operator: string;
  function: string;
  class: string;
  variable: string;
  constant: string;
  type: string;
  decorator: string;
  punctuation: string;
  builtin: string;
}
