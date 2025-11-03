import {Rect, Txt} from '@motion-canvas/2d';
import {
  Vector2,
  all,
  createRef,
  easeOutCubic,
  getLayout,
  spawn,
  waitFor,
} from '@motion-canvas/core';

export interface CaptionConfig {
  speedFactor?: number;
  wordFadeBase?: number;
  wordGapBase?: number;
  pagePauseBase?: number;
  maxCharsPerLine?: number;
  maxWordsPerLine?: number;
  maxLines?: number;
  linesPerPage?: number;
  lineHeight?: number; // multiplier of fontSize
  // Reduce effective width to avoid edge overflow (in characters)
  textPaddingChars?: number;
  highlightNewWords?: boolean;
  newWordColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  textColor?: string;
  overflowStrategy?: 'scale' | 'truncate' | 'warn';
  // Box styling
  showBox?: boolean;
  boxColor?: string;
  boxOpacity?: number;
  boxRadius?: number;
  // Placement (in px, scene local coords)
  width?: number | '100%';
  height?: number;
  x?: number;
  y?: number;
  padding?: number;
  // Respect the current layout safe area when sizing/placing the box
  respectLayoutSafeArea?: boolean;
  // Provide scene size for proper scaling of the safe area
  sceneSize?: Vector2;
  // Optional explicit layout id to use for safe area mapping (e.g., 'instagram')
  layoutId?: string;
  // When using safe area, where to anchor vertically
  safeAreaAnchor?: 'bottom' | 'center' | 'top';
  // Margin from the anchored edge inside safe area
  safeAreaMargin?: number;
}

export type TriggerFunction = () => any;
export interface TriggerMap {
  [word: string]: TriggerFunction;
}

export class CaptionFramework {
  private container: Rect;
  private words: string[];
  private config: Required<CaptionConfig>;
  private triggers?: TriggerMap;

  private currentWordValue = '';
  private rowsContainerRef = createRef<Rect>();
  private currentPageLines: ReturnType<typeof createRef<Rect>>[] = [];

  public static mount(view: Rect, cfg?: CaptionConfig) {
    const config: Required<CaptionConfig> = {
      speedFactor: cfg?.speedFactor ?? 1.0,
      wordFadeBase: cfg?.wordFadeBase ?? 0.15,
      wordGapBase: cfg?.wordGapBase ?? 0.2,
      pagePauseBase: cfg?.pagePauseBase ?? 0.5,
      maxCharsPerLine: Math.max(10, cfg?.maxCharsPerLine ?? 36),
      maxWordsPerLine: Math.max(3, cfg?.maxWordsPerLine ?? 9),
      maxLines: Math.max(2, cfg?.maxLines ?? 3),
      linesPerPage: Math.max(1, cfg?.linesPerPage ?? 2),
      lineHeight: cfg?.lineHeight ?? 1.6,
      highlightNewWords: cfg?.highlightNewWords ?? true,
      newWordColor: cfg?.newWordColor ?? '#ff6b6b',
      fontFamily: cfg?.fontFamily ?? 'JetBrains Mono, monospace',
      fontSize: Math.max(10, cfg?.fontSize ?? 56),
      fontWeight: cfg?.fontWeight ?? 700,
      textColor: cfg?.textColor ?? '#ffffff',
      overflowStrategy: cfg?.overflowStrategy ?? 'warn',
      showBox: cfg?.showBox ?? true,
      boxColor: cfg?.boxColor ?? '#000000',
      boxOpacity: Math.min(1, Math.max(0, cfg?.boxOpacity ?? 0.8)),
      boxRadius: cfg?.boxRadius ?? 10,
      width: cfg?.width ?? '100%',
      height: Math.max(10, cfg?.height ?? 280),
      x: cfg?.x ?? 0,
      y: cfg?.y ?? 0,
      padding: Math.max(0, cfg?.padding ?? 24),
      respectLayoutSafeArea: cfg?.respectLayoutSafeArea ?? true,
      sceneSize: cfg?.sceneSize ?? (undefined as unknown as Vector2),
      layoutId: cfg?.layoutId,
      safeAreaAnchor: cfg?.safeAreaAnchor ?? 'bottom',
      safeAreaMargin: Math.max(0, cfg?.safeAreaMargin ?? 0),
    } as Required<CaptionConfig>;

    // Compute placement from layout safe area if requested and available
    let width: number | '100%' = config.width;
    let height: number = config.height;
    let x = config.x;
    let y = config.y;

    if (config.respectLayoutSafeArea && config.sceneSize && cfg?.layoutId) {
      try {
        const layout = getLayout(cfg.layoutId!);
        if (layout) {
          const def = layout.defaultResolution;
          const safe = layout.safeZone.contentArea; // BBox in defaultResolution units
          const scaleX = config.sceneSize.x / def.x;
          const scaleY = config.sceneSize.y / def.y;
          const safeW = safe.width * scaleX;
          const safeH = safe.height * scaleY;
          const safeCenterX = safe.x * scaleX + safeW / 2;
          // Convert from top-left origin (0,0) to scene-centered coordinates
          const sceneCenterX = config.sceneSize.x / 2;
          const sceneCenterY = config.sceneSize.y / 2;
          width = Math.floor(safeW);
          // Clamp height to safeH, but don't fill whole safe area
          height = Math.min(Math.floor(height), Math.floor(safeH));
          x = Math.floor(safeCenterX - sceneCenterX);
          const safeTop = safe.y * scaleY - sceneCenterY;
          const safeBottom = safeTop + safeH;
          const margin = config.safeAreaMargin;
          if (config.safeAreaAnchor === 'bottom') {
            y = Math.floor(safeBottom - margin - height / 2);
          } else if (config.safeAreaAnchor === 'top') {
            y = Math.floor(safeTop + margin + height / 2);
          } else {
            y = Math.floor(safeTop + safeH / 2);
          }
        }
      } catch {}
    }

    const containerRef = createRef<Rect>();
    view.add(
      <Rect
        ref={containerRef}
        width={width}
        height={height}
        x={x}
        y={y}
        fill={
          config.showBox
            ? rgba(config.boxColor, config.boxOpacity)
            : 'rgba(0,0,0,0)'
        }
        radius={config.boxRadius}
        layout
        alignItems={'center'}
        justifyContent={'center'}
        padding={config.padding}
      />,
    );

    return containerRef;
  }

  public constructor(props: {
    container: ReturnType<typeof createRef<Rect>>;
    words: string[];
    config?: CaptionConfig;
    triggers?: TriggerMap;
  }) {
    this.container = props.container();
    this.words = props.words;
    this.triggers = props.triggers;
    const cfg = props.config ?? {};
    this.config = {
      speedFactor: cfg.speedFactor ?? 1.0,
      wordFadeBase: cfg.wordFadeBase ?? 0.15,
      wordGapBase: cfg.wordGapBase ?? 0.2,
      pagePauseBase: cfg.pagePauseBase ?? 0.5,
      maxCharsPerLine: Math.max(10, cfg.maxCharsPerLine ?? 36),
      maxWordsPerLine: Math.max(3, cfg.maxWordsPerLine ?? 9),
      maxLines: Math.max(2, cfg.maxLines ?? 3),
      linesPerPage: Math.max(1, cfg.linesPerPage ?? 2),
      lineHeight: cfg.lineHeight ?? 1.6,
      textPaddingChars: Math.max(0, cfg.textPaddingChars ?? 4),
      highlightNewWords: cfg.highlightNewWords ?? true,
      newWordColor: cfg.newWordColor ?? '#ff6b6b',
      fontFamily: cfg.fontFamily ?? 'JetBrains Mono, monospace',
      fontSize: Math.max(10, cfg.fontSize ?? 56),
      fontWeight: cfg.fontWeight ?? 700,
      textColor: cfg.textColor ?? '#ffffff',
      overflowStrategy: cfg.overflowStrategy ?? 'warn',
      showBox: cfg.showBox ?? true,
      boxColor: cfg.boxColor ?? '#000000',
      boxOpacity: Math.min(1, Math.max(0, cfg.boxOpacity ?? 0.8)),
      boxRadius: cfg.boxRadius ?? 10,
      width: cfg.width ?? '100%',
      height: Math.max(10, cfg.height ?? 280),
      x: cfg.x ?? 0,
      y: cfg.y ?? 0,
      padding: Math.max(0, cfg.padding ?? 24),
    } as Required<CaptionConfig>;

    this.container.add(
      <Rect
        ref={this.rowsContainerRef}
        layout
        direction={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={this.config.lineHeight * this.config.fontSize * 0.2}
        width={'100%'}
        height={'100%'}
      />,
    );
  }

  private setCurrentWord(word: string) {
    const lowerWord = word.toLowerCase();
    this.currentWordValue = lowerWord;
    if (this.triggers && this.triggers[lowerWord]) {
      try {
        const result: any = this.triggers[lowerWord]!();
        // If trigger returned an animation generator function, spawn it.
        if (typeof result === 'function') {
          spawn(result as any);
        } else if (result && typeof result.next === 'function') {
          // If returned a generator instance, wrap and spawn.
          const gen = result as Generator;
          spawn(function* () {
            yield* gen as any;
          } as any);
        }
        // If void or unsupported, just ignore.
      } catch {}
    }
  }

  private getAdaptiveWordGap(word: string): number {
    const adaptive = true;
    if (!adaptive) return this.config.wordGapBase * this.config.speedFactor;
    const clean = word.replace(/[.,!?;:]/g, '');
    const len = clean.length;
    const minMul = 0.5;
    const maxMul = 3.5;
    let mul: number;
    if (len <= 2) mul = minMul;
    else if (len <= 4) mul = minMul + (1 - minMul) * ((len - 2) / 2);
    else if (len <= 8) mul = 1 + (2 - 1) * ((len - 4) / 4);
    else {
      const extra = Math.min((len - 8) / 5, 1);
      mul = 2 + (maxMul - 2) * extra;
    }
    let gap = this.config.wordGapBase * mul * this.config.speedFactor;
    if (word.endsWith(',')) gap += 0.12 * this.config.speedFactor;
    return gap;
  }

  private getPauseDuration(wordIndex: number, word: string): number {
    // hook for user-provided pauses externally if needed later
    return 0;
  }

  private *clearCurrentPage() {
    if (this.currentPageLines.length > 0) {
      yield* all(
        ...this.currentPageLines.map(r => r().opacity(0, 0.2, easeOutCubic)),
      );
      for (const r of this.currentPageLines) r().remove();
      this.currentPageLines = [];
    }
  }

  private *startNewPage() {
    yield* this.clearCurrentPage();
    yield* waitFor(0.1 * this.config.speedFactor);
  }

  public *animate() {
    let lineRef = createRef<Rect>();
    let charCount = 0;
    let wordCount = 0;
    let lineCount = 0;
    let pageLineCount = 0;

    // first line
    this.rowsContainerRef().add(
      <Rect
        ref={lineRef}
        layout
        direction={'row'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={10}
      />,
    );
    this.currentPageLines.push(lineRef);
    pageLineCount = 1;

    for (let i = 0; i < this.words.length; i++) {
      const word = this.words[i];
      const wordLen = word.length;
      const spaceLen = charCount === 0 ? 0 : 1;
      const totalLen = charCount + spaceLen + wordLen;
      const effectiveMaxChars = Math.max(
        10,
        this.config.maxCharsPerLine - (this.config.textPaddingChars ?? 0),
      );

      const needsNewLine =
        (totalLen > effectiveMaxChars ||
          wordCount >= (this.config.maxWordsPerLine ?? 9)) &&
        lineCount < this.config.maxLines - 1;

      if (needsNewLine) {
        yield* waitFor(this.config.pagePauseBase * this.config.speedFactor);

        if (pageLineCount >= this.config.linesPerPage) {
          yield* this.startNewPage();
          pageLineCount = 0;

          // new first line of new page
          lineRef = createRef<Rect>();
          this.rowsContainerRef().add(
            <Rect
              ref={lineRef}
              layout
              direction={'row'}
              alignItems={'center'}
              justifyContent={'center'}
              gap={10}
            />,
          );
          this.currentPageLines.push(lineRef);
          pageLineCount = 1;
          charCount = wordLen;
          wordCount = 1;
          lineCount++;

          const txtRef = createRef<Txt>();
          const initialColor = this.config.highlightNewWords
            ? this.config.newWordColor
            : this.config.textColor;
          lineRef().add(
            <Txt
              ref={txtRef}
              text={word}
              fontSize={this.config.fontSize}
              fill={initialColor}
              fontFamily={this.config.fontFamily}
              fontWeight={this.config.fontWeight}
              opacity={0}
            />,
          );
          this.setCurrentWord(word);
          const wl = word.replace(/[.,!?;:]/g, '').length;
          let fade = this.config.wordFadeBase;
          if (wl > 6) fade = this.config.wordFadeBase * (1 + (wl - 6) * 0.1);
          yield* txtRef().opacity(
            1,
            fade * this.config.speedFactor,
            easeOutCubic,
          );
          if (this.config.highlightNewWords) {
            yield* txtRef().fill(
              this.config.textColor,
              0.25 * this.config.speedFactor,
              easeOutCubic,
            );
          }
          const pause = this.getPauseDuration(i, word);
          if (pause > 0) yield* waitFor(pause);
          else yield* waitFor(this.getAdaptiveWordGap(word));
          continue;
        }

        // new line in current page
        lineRef = createRef<Rect>();
        this.rowsContainerRef().add(
          <Rect
            ref={lineRef}
            layout
            direction={'row'}
            alignItems={'center'}
            justifyContent={'center'}
            gap={10}
          />,
        );
        this.currentPageLines.push(lineRef);
        charCount = 0;
        wordCount = 0;
        lineCount++;
        pageLineCount++;
        if (lineCount >= this.config.maxLines) {
          if (this.config.overflowStrategy === 'warn') {
            // eslint-disable-next-line no-console
            console.warn(
              `Caption overflow: max lines (${this.config.maxLines}) reached`,
            );
          }
          break;
        }
      }

      const txtRef = createRef<Txt>();
      const initialColor = this.config.highlightNewWords
        ? this.config.newWordColor
        : this.config.textColor;
      lineRef().add(
        <Txt
          ref={txtRef}
          text={word}
          fontSize={this.config.fontSize}
          fill={initialColor}
          fontFamily={this.config.fontFamily}
          fontWeight={this.config.fontWeight}
          opacity={0}
        />,
      );
      this.setCurrentWord(word);
      const wl = word.replace(/[.,!?;:]/g, '').length;
      let fade = this.config.wordFadeBase;
      if (wl > 6) fade = this.config.wordFadeBase * (1 + (wl - 6) * 0.1);
      yield* txtRef().opacity(1, fade * this.config.speedFactor, easeOutCubic);
      if (this.config.highlightNewWords) {
        yield* txtRef().fill(
          this.config.textColor,
          0.25 * this.config.speedFactor,
          easeOutCubic,
        );
      }
      const pause = this.getPauseDuration(i, word);
      if (pause > 0) yield* waitFor(pause);
      else yield* waitFor(this.getAdaptiveWordGap(word));

      charCount += wordLen + (charCount > 0 ? 1 : 0);
      wordCount++;
    }

    yield* waitFor(this.config.pagePauseBase * this.config.speedFactor);
  }
}

function rgba(hex: string, alpha: number): string {
  try {
    const clean = hex.replace('#', '');
    const full =
      clean.length === 3
        ? clean
            .split('')
            .map(c => c + c)
            .join('')
        : clean;
    const v = parseInt(full, 16);
    const r = (v >> 16) & 255;
    const g = (v >> 8) & 255;
    const b = v & 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
  } catch {
    return `rgba(0,0,0,${Math.max(0, Math.min(1, alpha))})`;
  }
}
