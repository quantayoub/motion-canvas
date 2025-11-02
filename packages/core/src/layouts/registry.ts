import {Layout} from './Layout';
import {getInstagramLayout} from './instagram';

/**
 * Registry of available platform layouts.
 */
class LayoutRegistry {
  private layouts = new Map<string, Layout>();
  private initialized = false;

  private initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    // Use lazy initialization function to avoid circular dependencies
    this.register(getInstagramLayout());
  }

  /**
   * Register a layout.
   *
   * @param layout - The layout to register.
   */
  public register(layout: Layout): void {
    if (this.layouts.has(layout.id)) {
      console.warn(
        `Layout with id "${layout.id}" is already registered. Overwriting.`,
      );
    }
    this.layouts.set(layout.id, layout);
  }

  /**
   * Get a layout by its identifier.
   *
   * @param id - The layout identifier.
   * @returns The layout, or undefined if not found.
   */
  public get(id: string): Layout | undefined {
    this.initialize();
    return this.layouts.get(id);
  }

  /**
   * Get all registered layouts.
   *
   * @returns Array of all registered layouts.
   */
  public getAll(): Layout[] {
    this.initialize();
    return Array.from(this.layouts.values());
  }

  /**
   * Check if a layout is registered.
   *
   * @param id - The layout identifier.
   * @returns True if the layout is registered.
   */
  public has(id: string): boolean {
    this.initialize();
    return this.layouts.has(id);
  }
}

/**
 * Global layout registry instance.
 */
export const layoutRegistry = new LayoutRegistry();

/**
 * Get a layout by its identifier.
 *
 * @param id - The layout identifier.
 * @returns The layout, or undefined if not found.
 */
export function getLayout(id: string): Layout | undefined {
  return layoutRegistry.get(id);
}

/**
 * Get all registered layouts.
 *
 * @returns Array of all registered layouts.
 */
export function getAllLayouts(): Layout[] {
  return layoutRegistry.getAll();
}
