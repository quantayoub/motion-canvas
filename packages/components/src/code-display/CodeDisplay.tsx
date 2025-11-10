import {Rect, Txt, View2D} from '@quantmotion/2d';
import type {Reference, SignalValue, ThreadGenerator} from '@quantmotion/core';
import {all, createRef, easeOutCubic} from '@quantmotion/core';
import {pythonLanguage} from './languages/python';
import {vscodeDark} from './themes/vscode-dark';
import {vscodeHighContrast} from './themes/vscode-high-contrast';
import {tokenize} from './tokenizer';
import type {CodeDisplayConfig, Theme, Token} from './types';

const LANGUAGES = {
  python: pythonLanguage,
};

const THEMES: Record<string, Theme> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'vscode-dark': vscodeDark,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'vscode-high-contrast': vscodeHighContrast,
};

let INSTANCE_COUNTER = 0;

export class CodeDisplay {
  private tokens: Token[] = [];
  private theme: Theme;
  private config: Required<
    Pick<
      CodeDisplayConfig,
      | 'fontSize'
      | 'fontFamily'
      | 'lineHeight'
      | 'padding'
      | 'showLineNumbers'
      | 'showWindow'
      | 'backgroundRadius'
    >
  >;
  private containerRef: Reference<Rect> | null = null;
  private lineRefs: Array<Reference<Rect>> = [];
  private blurOpacity: number;
  private instanceId: string;
  private initialVisibility: 'all' | 'none';
  private autoScroll: boolean;
  private originalY: number | undefined;

  public constructor(config: CodeDisplayConfig) {
    this.instanceId = `cd-${INSTANCE_COUNTER++}`;
    const code = typeof config.code === 'string' ? config.code : config.code();
    const language =
      LANGUAGES[config.language as keyof typeof LANGUAGES] || pythonLanguage;
    this.theme = THEMES[config.theme as keyof typeof THEMES] || vscodeDark;

    this.config = {
      fontSize: config.fontSize ?? 16,
      fontFamily: config.fontFamily ?? 'JetBrains Mono',
      lineHeight: config.lineHeight ?? 1.5,
      padding: config.padding ?? 20,
      showLineNumbers: config.showLineNumbers ?? false,
      showWindow: config.showWindow ?? false,
      backgroundRadius: config.backgroundRadius ?? 8,
    };

    this.blurOpacity = config.focusBlurOpacity ?? 0.3;
    this.initialVisibility = config.initialVisibility ?? 'all';
    this.autoScroll = config.autoScroll ?? false;
    this.originalY = config.y;
    this.tokens = tokenize(code, language);
  }

  public static mount(
    view: View2D,
    code: string | SignalValue<string>,
    config: Omit<CodeDisplayConfig, 'code'>,
    ref?: Reference<Rect>,
  ) {
    const display = new CodeDisplay({...config, code});
    display.render(view, config, ref);
    return display;
  }

  private render(
    view: View2D,
    config: Omit<CodeDisplayConfig, 'code'>,
    ref?: Reference<Rect>,
  ) {
    const showBackground = config.showBackground !== false; // Default to true
    const backgroundColor = config.backgroundColor ?? this.theme.background;
    const backgroundOpacity = config.backgroundOpacity ?? 1;
    const borderColor = config.borderColor;
    const borderWidth = config.borderWidth ?? 0;

    // If autoScroll is enabled and initialVisibility is 'none', position container
    // so the first line (when revealed) will be centered
    let initialY = config.y;
    if (
      this.autoScroll &&
      this.initialVisibility === 'none' &&
      config.y !== undefined
    ) {
      const lineHeight = this.config.fontSize * this.config.lineHeight;
      const windowHeight = this.config.showWindow
        ? this.config.fontSize * 1.5 + 12
        : 0;
      const totalCodeHeight = this.lineRefs.length * lineHeight;
      const totalHeight = totalCodeHeight + windowHeight;
      // Position so line 0 (first line) would be centered when revealed
      initialY = config.y + totalHeight / 2 - windowHeight - 0 * lineHeight;
    }

    const containerProps = {
      ref,
      ...(showBackground && {
        fill: backgroundColor,
        opacity: backgroundOpacity,
      }),
      ...(borderWidth > 0 &&
        borderColor && {
          stroke: borderColor,
          lineWidth: borderWidth,
        }),
      radius: this.config.backgroundRadius,
      padding: this.config.padding,
      layout: true,
      direction: 'column' as const,
      gap: 0,
      clip: false,
      ...(config.width && {width: config.width}),
      ...(config.x !== undefined && {x: config.x}),
      ...(initialY !== undefined && {y: initialY}),
    };

    // Store ref if provided, otherwise create one
    this.containerRef = ref ?? createRef<Rect>();
    containerProps.ref = this.containerRef;

    const container = (
      <Rect {...containerProps}>
        {this.config.showWindow && this.renderWindow(config)}
        {this.renderCode()}
      </Rect>
    );

    view.add(container);
    return container;
  }

  private renderWindow(config: Omit<CodeDisplayConfig, 'code'>) {
    const buttonSize = config.windowButtonSize ?? 16;
    const filenameSize = config.filenameFontSize ?? 14;
    const windowHeight = Math.max(buttonSize + 8, filenameSize + 16);

    return (
      <Rect
        width={'100%'}
        height={windowHeight}
        layout
        direction={'row'}
        alignItems={'center'}
        gap={10}
        paddingLeft={16}
        marginBottom={12}
      >
        <Rect
          width={buttonSize}
          height={buttonSize}
          radius={buttonSize / 2}
          fill={'#ff5f56'}
        />
        <Rect
          width={buttonSize}
          height={buttonSize}
          radius={buttonSize / 2}
          fill={'#ffbd2e'}
        />
        <Rect
          width={buttonSize}
          height={buttonSize}
          radius={buttonSize / 2}
          fill={'#27c93f'}
        />
        {config.filename && (
          <Txt
            text={config.filename}
            fontSize={filenameSize}
            fontFamily={this.config.fontFamily}
            fill={this.theme.foreground}
            opacity={0.7}
            marginLeft={12}
          />
        )}
      </Rect>
    );
  }

  private renderCode() {
    const lines = this.groupTokensByLine();

    return (
      <Rect layout direction={'column'} gap={0} clip={false}>
        {lines.map((lineTokens, lineIdx) =>
          this.renderLine(lineTokens, lineIdx),
        )}
      </Rect>
    );
  }

  private renderLine(lineTokens: Token[], lineIdx: number) {
    // Create a ref for this line so we can control its opacity
    const lineRef = createRef<Rect>();
    this.lineRefs[lineIdx] = lineRef;

    // Set initial opacity based on initialVisibility config
    const initialOpacity = this.initialVisibility === 'none' ? 0 : 1;

    if (lineTokens.length === 0) {
      return (
        <Rect
          ref={lineRef}
          key={`${this.instanceId}-line-${lineIdx}`}
          height={this.config.fontSize * this.config.lineHeight}
          layout
          direction={'row'}
          gap={0}
          clip={false}
          opacity={initialOpacity}
        >
          <Txt
            text={'\u00A0'}
            fontSize={this.config.fontSize}
            fontFamily={this.config.fontFamily}
            fill={this.theme.foreground}
          />
        </Rect>
      );
    }

    const indent = this.calculateIndent(lineTokens);
    const indentPx = indent * this.config.fontSize * 0.6;

    return (
      <Rect
        ref={lineRef}
        key={`${this.instanceId}-line-${lineIdx}`}
        height={this.config.fontSize * this.config.lineHeight}
        layout
        direction={'row'}
        gap={0}
        marginLeft={indentPx}
        clip={false}
        opacity={initialOpacity}
      >
        {lineTokens.map((token, tokenIdx) =>
          this.renderToken(token, lineIdx, tokenIdx),
        )}
      </Rect>
    );
  }

  private renderToken(token: Token, lineIdx: number, tokenIdx: number) {
    const color = this.getColorForTokenType(token.type);
    const text = token.value.replace(/ /g, '\u00A0');

    return (
      <Txt
        key={`${this.instanceId}-line-${lineIdx}-token-${tokenIdx}`}
        text={text}
        fontSize={this.config.fontSize}
        fontFamily={this.config.fontFamily}
        fill={color}
        fontWeight={400}
        textWrap={false}
      />
    );
  }

  private groupTokensByLine(): Token[][] {
    const lines: Token[][] = [];
    let currentLine: Token[] = [];
    let currentLineNumber = 0;

    for (const token of this.tokens) {
      if (token.start.line > currentLineNumber) {
        lines.push(currentLine);
        while (lines.length < token.start.line) {
          lines.push([]);
        }
        currentLine = [];
        currentLineNumber = token.start.line;
      }
      currentLine.push(token);
    }

    if (currentLine.length > 0 || this.tokens.length === 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  private calculateIndent(lineTokens: Token[]): number {
    if (lineTokens.length === 0) return 0;
    const firstToken = lineTokens[0];
    return firstToken.start.column;
  }

  private getColorForTokenType(type: string): string {
    const colorMap: Record<string, keyof Theme> = {
      comment: 'comment',
      string: 'string',
      number: 'number',
      keyword: 'keyword',
      operator: 'operator',
      function: 'function',
      class: 'class',
      variable: 'variable',
      constant: 'constant',
      type: 'type',
      decorator: 'decorator',
      punctuation: 'punctuation',
      builtin: 'builtin',
    };

    const themeKey = colorMap[type];
    return themeKey ? this.theme[themeKey] : this.theme.foreground;
  }

  public getTokens(): Token[] {
    return this.tokens;
  }

  /**
   * Focus on specific line range (1-indexed) by dimming unfocused lines
   * Uses actual rendered line components for precise control
   * @param startLine - First line to keep in focus (1-indexed)
   * @param endLine - Last line to keep in focus (1-indexed)
   * @param duration - Animation duration in seconds
   */
  public *focusLines(
    startLine: number,
    endLine: number,
    duration: number = 0.4,
  ): ThreadGenerator {
    const animations: ThreadGenerator[] = [];

    // Convert to 0-indexed
    const startIdx = startLine - 1;
    const endIdx = endLine - 1;

    // Dim all lines except the focused range
    for (let i = 0; i < this.lineRefs.length; i++) {
      const lineRef = this.lineRefs[i];
      if (!lineRef) continue;

      if (i < startIdx || i > endIdx) {
        // Dim unfocused lines
        animations.push(
          lineRef().opacity(this.blurOpacity, duration, easeOutCubic),
        );
      } else {
        // Ensure focused lines are fully visible
        animations.push(lineRef().opacity(1, duration, easeOutCubic));
      }
    }

    if (animations.length > 0) {
      yield* all(...animations);
    }
  }

  /**
   * Clear focus by restoring all lines to full opacity
   * @param duration - Animation duration in seconds
   */
  public *clearFocus(duration: number = 0.4): ThreadGenerator {
    const animations: ThreadGenerator[] = [];

    for (const lineRef of this.lineRefs) {
      if (lineRef) {
        animations.push(lineRef().opacity(1, duration, easeOutCubic));
      }
    }

    if (animations.length > 0) {
      yield* all(...animations);
    }
  }

  /**
   * Progressively reveal code lines (animate from opacity 0 to 1)
   * Perfect for showing code sections one by one in a fluent way
   * @param startLine - First line to reveal (1-indexed)
   * @param endLine - Last line to reveal (1-indexed)
   * @param duration - Animation duration in seconds
   */
  public *revealLines(
    startLine: number,
    endLine: number,
    duration: number = 0.3,
  ): ThreadGenerator {
    const animations: ThreadGenerator[] = [];

    // Convert to 0-indexed
    const startIdx = startLine - 1;
    const endIdx = endLine - 1;

    // Reveal lines in the specified range
    for (let i = startIdx; i <= endIdx && i < this.lineRefs.length; i++) {
      const lineRef = this.lineRefs[i];
      if (lineRef) {
        // Ensure line starts at opacity 0, then animate to 1
        lineRef().opacity(0);
        animations.push(lineRef().opacity(1, duration, easeOutCubic));
      }
    }

    // Auto-scroll: keep container centered, adjust to show newly revealed content
    if (this.autoScroll && this.containerRef && this.originalY !== undefined) {
      const lineHeight = this.config.fontSize * this.config.lineHeight;
      const windowHeight = this.config.showWindow
        ? this.config.fontSize * 1.5 + 12
        : 0;

      // Calculate the center line of the revealed range (0-indexed)
      const centerLine = (startIdx + endIdx) / 2;

      // Calculate where the center line is positioned within the code area
      // (relative to the top of the code content, not including window)
      const centerLineYFromCodeTop = centerLine * lineHeight;

      // In Motion Canvas, y position is the center of the element
      // Calculate container position so center line of revealed range appears at originalY
      const totalCodeHeight = this.lineRefs.length * lineHeight;
      const totalHeight = totalCodeHeight + windowHeight;
      const newY =
        this.originalY +
        totalHeight / 2 -
        windowHeight -
        centerLineYFromCodeTop;

      // Animate container y position to keep the revealed range centered
      animations.push(this.containerRef().y(newY, duration, easeOutCubic));
    }

    if (animations.length > 0) {
      yield* all(...animations);
    }
  }

  /**
   * Focus on a specific token or range of tokens
   * @param searchText - Text to search for (can be partial match)
   * @param occurrence - Which occurrence to focus on (1-indexed, default: 1)
   * @param expandLines - Number of lines to include above/below (default: 0)
   * @param duration - Animation duration in seconds
   */
  public *focusToken(
    searchText: string,
    occurrence: number = 1,
    expandLines: number = 0,
    duration: number = 0.4,
  ): ThreadGenerator {
    const lines = this.groupTokensByLine();
    let found = 0;
    let targetLine = -1;

    // Find the token
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineTokens = lines[lineIdx];
      for (const token of lineTokens) {
        if (token.value.includes(searchText)) {
          found++;
          if (found === occurrence) {
            targetLine = lineIdx;
            break;
          }
        }
      }
      if (targetLine >= 0) break;
    }

    if (targetLine < 0) {
      console.warn(
        `CodeDisplay: Token "${searchText}" not found (occurrence ${occurrence})`,
      );
      return;
    }

    // Focus on the line containing the token, with expansion
    const startLine = Math.max(0, targetLine - expandLines) + 1; // Convert to 1-indexed
    const endLine = Math.min(lines.length - 1, targetLine + expandLines) + 1;

    yield* this.focusLines(startLine, endLine, duration);
  }

  /**
   * Focus on a field by name (e.g., "price", "orders")
   * Automatically finds the field definition line
   * @param fieldName - Name of the field to focus on
   * @param expandLines - Number of lines to include above/below
   * @param duration - Animation duration in seconds
   */
  public *focusField(
    fieldName: string,
    expandLines: number = 0,
    duration: number = 0.4,
  ): ThreadGenerator {
    const lines = this.groupTokensByLine();
    let targetLine = -1;

    // Find line with pattern "fieldName:"
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const lineTokens = lines[lineIdx];
      let foundFieldName = false;
      let foundColon = false;

      for (const token of lineTokens) {
        if (token.value === fieldName) foundFieldName = true;
        if (token.value === ':' && foundFieldName) {
          foundColon = true;
          break;
        }
      }

      if (foundFieldName && foundColon) {
        targetLine = lineIdx;
        break;
      }
    }

    if (targetLine < 0) {
      console.warn(`CodeDisplay: Field "${fieldName}" not found`);
      return;
    }

    const startLine = Math.max(0, targetLine - expandLines) + 1;
    const endLine = Math.min(lines.length - 1, targetLine + expandLines) + 1;

    yield* this.focusLines(startLine, endLine, duration);
  }

  /**
   * Get the container reference
   */
  public getContainer(): Reference<Rect> | null {
    return this.containerRef;
  }

  /**
   * Get line count for debugging
   */
  public getLineCount(): number {
    return this.groupTokensByLine().length;
  }
}
