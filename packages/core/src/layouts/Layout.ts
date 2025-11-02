import {BBox} from '../types/BBox';
import {Vector2} from '../types/Vector';

/**
 * Defines a safe zone where content should be placed to avoid UI overlays.
 */
export interface SafeZone {
  /**
   * The bounding box defining the safe area.
   *
   * @remarks
   * Content placed within this area will not be obscured by platform UI elements.
   */
  contentArea: BBox;
  /**
   * Margins from each edge of the canvas.
   */
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Configuration for rendering platform UI overlay elements.
 */
export interface LayoutOverlayConfig {
  /**
   * Function to draw the platform UI overlay on a canvas.
   *
   * @param ctx - The 2D rendering context.
   * @param size - The canvas size (width, height).
   */
  draw(ctx: CanvasRenderingContext2D, size: Vector2): void;
  /**
   * Opacity of the overlay (0-1).
   *
   * @defaultValue 0.7
   */
  opacity?: number;
}

/**
 * Configuration for a platform layout.
 */
export interface LayoutConfig {
  /**
   * Unique identifier for this layout.
   */
  id: string;
  /**
   * Display name of the layout.
   */
  name: string;
  /**
   * Description of the layout.
   */
  description?: string;
  /**
   * Default resolution for this layout.
   */
  defaultResolution: Vector2;
  /**
   * Safe zone configuration.
   */
  safeZone: SafeZone;
  /**
   * Configuration for rendering the platform UI overlay.
   */
  overlay: LayoutOverlayConfig;
}

/**
 * Represents a platform layout.
 */
export class Layout {
  public constructor(public readonly config: LayoutConfig) {}

  /**
   * Get the layout identifier.
   */
  public get id(): string {
    return this.config.id;
  }

  /**
   * Get the layout display name.
   */
  public get name(): string {
    return this.config.name;
  }

  /**
   * Get the default resolution.
   */
  public get defaultResolution(): Vector2 {
    return this.config.defaultResolution;
  }

  /**
   * Get the safe zone.
   */
  public get safeZone(): SafeZone {
    return this.config.safeZone;
  }

  /**
   * Draw the platform UI overlay.
   *
   * @param ctx - The 2D rendering context.
   * @param size - The canvas size.
   * @param opacity - Optional opacity override.
   */
  public drawOverlay(
    ctx: CanvasRenderingContext2D,
    size: Vector2,
    opacity?: number,
  ): void {
    const overlayOpacity = opacity ?? this.config.overlay.opacity ?? 0.7;
    ctx.save();
    ctx.globalAlpha = overlayOpacity;
    this.config.overlay.draw(ctx, size);
    ctx.restore();
  }
}
