import {Rect, Txt} from '@quantmotion/2d';
import {
  ThreadGenerator,
  Vector2,
  all,
  createRef,
  easeInCubic,
  easeOutCubic,
  getLayout,
} from '@quantmotion/core';

export interface SectionTitleConfig {
  // Text content
  title: string;
  subtitle?: string;

  // Positioning
  sceneSize?: Vector2;
  layoutId?: string;
  marginTop?: number; // Margin from top of safe zone

  // Text styling
  fontSize?: number;
  subtitleFontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textColor?: string;
  subtitleColor?: string;

  // Background
  showBackground?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundRadius?: number;
  backgroundPadding?:
    | number
    | [number, number]
    | [number, number, number, number];

  // Underline
  showUnderline?: boolean;
  underlineColor?: string;
  underlineHeight?: number;
  underlineMargin?: number;

  // Progress bar
  showProgressBar?: boolean;
  progressColor?: string;
  progressHeight?: number;
  progressValue?: number; // 0-1

  // Animation
  animationDuration?: number;
  animationEasing?: (t: number) => number;
}

export class SectionTitle {
  private container: Rect;
  private titleRef = createRef<Txt>();
  private subtitleRef = createRef<Txt>();
  private backgroundRef = createRef<Rect>();
  private underlineRef = createRef<Rect>();
  private progressBarRef = createRef<Rect>();
  private progressBarBgRef = createRef<Rect>();
  private config: Required<SectionTitleConfig>;
  private safeWidth = 1080; // Store safe width for text wrapping

  public static mount(view: Rect, config: SectionTitleConfig): SectionTitle {
    const instance = new SectionTitle(view, config);
    return instance;
  }

  private constructor(view: Rect, userConfig: SectionTitleConfig) {
    // Calculate safe area position from Layout
    const sceneSize = userConfig.sceneSize || view.size();
    let safeTop = 0;
    let safeCenterX = 0;
    let safeWidth = sceneSize.x; // Fallback to full scene width

    try {
      const layout = getLayout(userConfig.layoutId || 'instagram');
      if (layout) {
        const def = layout.defaultResolution;
        const contentArea = layout.safeZone.contentArea; // Get contentArea from safeZone
        const sx = sceneSize.x / def.x;
        const sy = sceneSize.y / def.y;
        // Use contentArea.width as the safe width (scaled to scene size)
        const safeW = contentArea.width * sx;
        safeWidth = safeW;
        const sceneCX = sceneSize.x / 2;
        const sceneCY = sceneSize.y / 2;
        // Calculate center X position within safe area
        const safeCenterXPos = contentArea.x * sx + safeW / 2 - sceneCX;
        safeCenterX = safeCenterXPos;
        // Calculate top position of safe area
        const safeTopY = contentArea.y * sy - sceneCY;
        safeTop = safeTopY;
      }
    } catch {
      /* noop */
    }

    // Default config
    this.config = {
      title: userConfig.title,
      subtitle: userConfig.subtitle || '',
      sceneSize,
      layoutId: userConfig.layoutId || 'instagram',
      marginTop: userConfig.marginTop ?? 20,
      fontSize: userConfig.fontSize ?? 48,
      subtitleFontSize: userConfig.subtitleFontSize ?? 32,
      fontFamily: userConfig.fontFamily || 'JetBrains Mono, monospace',
      fontWeight: userConfig.fontWeight ?? 700,
      textColor: userConfig.textColor || '#ffffff',
      subtitleColor: userConfig.subtitleColor || '#cccccc',
      showBackground: userConfig.showBackground ?? false,
      backgroundColor: userConfig.backgroundColor || '#000000',
      backgroundOpacity: userConfig.backgroundOpacity ?? 0.8,
      backgroundRadius: userConfig.backgroundRadius ?? 10,
      backgroundPadding: userConfig.backgroundPadding ?? 24,
      showUnderline: userConfig.showUnderline ?? false,
      underlineColor: userConfig.underlineColor || '#4cc9f0',
      underlineHeight: userConfig.underlineHeight ?? 4,
      underlineMargin: userConfig.underlineMargin ?? 12,
      showProgressBar: userConfig.showProgressBar ?? false,
      progressColor: userConfig.progressColor || '#4cc9f0',
      progressHeight: userConfig.progressHeight ?? 3,
      progressValue: userConfig.progressValue ?? 0,
      animationDuration: userConfig.animationDuration ?? 0.5,
      animationEasing: userConfig.animationEasing || easeOutCubic,
    };

    // Calculate position
    const y = safeTop + this.config.marginTop;
    const x = safeCenterX;

    // Parse padding
    let paddingTop = 0;
    let paddingBottom = 0;
    let paddingLeft = 0;
    let paddingRight = 0;

    if (typeof this.config.backgroundPadding === 'number') {
      paddingTop =
        paddingBottom =
        paddingLeft =
        paddingRight =
          this.config.backgroundPadding;
    } else if (Array.isArray(this.config.backgroundPadding)) {
      if (this.config.backgroundPadding.length === 2) {
        paddingTop = paddingBottom = this.config.backgroundPadding[0];
        paddingLeft = paddingRight = this.config.backgroundPadding[1];
      } else if (this.config.backgroundPadding.length === 4) {
        [paddingTop, paddingRight, paddingBottom, paddingLeft] =
          this.config.backgroundPadding;
      }
    }

    // Create container
    this.container = (
      <Rect
        x={x}
        y={y}
        layout
        direction="column"
        gap={this.config.subtitle ? 8 : 0}
        alignItems="center"
        opacity={0}
        scale={0.9}
      >
        {/* Background */}
        {this.config.showBackground && (
          <Rect
            ref={this.backgroundRef}
            fill={this.config.backgroundColor}
            opacity={this.config.backgroundOpacity}
            radius={this.config.backgroundRadius}
            paddingTop={paddingTop}
            paddingBottom={paddingBottom}
            paddingLeft={paddingLeft}
            paddingRight={paddingRight}
            layout
            direction="column"
            gap={this.config.subtitle ? 8 : 0}
            alignItems="center"
          >
            {this.renderContent()}
          </Rect>
        )}

        {/* Content without background */}
        {!this.config.showBackground && this.renderContent()}

        {/* Underline */}
        {this.config.showUnderline && (
          <Rect
            ref={this.underlineRef}
            width={0}
            height={this.config.underlineHeight}
            fill={this.config.underlineColor}
            marginTop={this.config.underlineMargin}
          />
        )}

        {/* Progress bar */}
        {this.config.showProgressBar && (
          <Rect
            ref={this.progressBarBgRef}
            width={safeWidth - 80}
            height={this.config.progressHeight}
            fill="#333333"
            marginTop={16}
            radius={this.config.progressHeight / 2}
          >
            <Rect
              ref={this.progressBarRef}
              width={0}
              height={this.config.progressHeight}
              fill={this.config.progressColor}
              radius={this.config.progressHeight / 2}
            />
          </Rect>
        )}
      </Rect>
    );

    // Store safeWidth for use in renderContent
    this.safeWidth = safeWidth;

    view.add(this.container);
  }

  private renderContent() {
    // Calculate max width for text wrapping (use safe width minus padding)
    const maxTextWidth = this.safeWidth - 160; // Account for container padding and margins

    return (
      <>
        <Txt
          ref={this.titleRef}
          text={this.config.title}
          fontSize={this.config.fontSize}
          fontFamily={this.config.fontFamily}
          fontWeight={this.config.fontWeight}
          fill={this.config.textColor}
          maxWidth={maxTextWidth}
          textAlign="center"
        />
        {this.config.subtitle && (
          <Txt
            ref={this.subtitleRef}
            text={this.config.subtitle}
            fontSize={this.config.subtitleFontSize}
            fontFamily={this.config.fontFamily}
            fontWeight={400}
            fill={this.config.subtitleColor}
            maxWidth={maxTextWidth}
            textAlign="center"
          />
        )}
      </>
    );
  }

  /**
   * Animate the title popping in
   */
  public *popIn(duration?: number): ThreadGenerator {
    const dur = duration ?? this.config.animationDuration;
    const easing = this.config.animationEasing;

    const animations: ThreadGenerator[] = [
      this.container.opacity(1, dur, easing),
      this.container.scale(1, dur, easing),
    ];

    if (this.config.showUnderline) {
      // Animate underline width
      const titleWidth = this.titleRef().width();
      animations.push(this.underlineRef().width(titleWidth, dur, easing));
    }

    if (this.config.showProgressBar) {
      // Animate progress bar
      const progressWidth =
        this.progressBarBgRef().width() * this.config.progressValue;
      animations.push(this.progressBarRef().width(progressWidth, dur, easing));
    }

    yield* all(...animations);
  }

  /**
   * Animate the title popping out
   */
  public *popOut(duration?: number): ThreadGenerator {
    const dur = duration ?? this.config.animationDuration;
    const easing = easeInCubic;

    yield* all(
      this.container.opacity(0, dur, easing),
      this.container.scale(0.9, dur, easing),
    );
  }

  /**
   * Update progress bar value
   */
  public *setProgress(value: number, duration?: number): ThreadGenerator {
    if (!this.config.showProgressBar) return;

    const dur = duration ?? 0.3;
    const progressWidth =
      this.progressBarBgRef().width() * Math.max(0, Math.min(1, value));
    yield* this.progressBarRef().width(progressWidth, dur, easeOutCubic);
    this.config.progressValue = value;
  }

  /**
   * Get the container reference for manual control
   */
  public getContainer(): Rect {
    return this.container;
  }
}
