import {MetaOption} from '../meta';
import {CanvasColorSpace, CanvasOutputMimeType, Vector2} from '../types';

export const Scales: MetaOption<number>[] = [
  {value: 0.25, text: '0.25x (Quarter)'},
  {value: 0.5, text: `0.5x (Half)`},
  {value: 1, text: `1.0x (Full)`},
  {value: 2, text: `2.0x (Double)`},
];

export const ColorSpaces: MetaOption<CanvasColorSpace>[] = [
  {value: 'srgb', text: 'sRGB'},
  {value: 'display-p3', text: 'DCI-P3'},
];

export const FileTypes: MetaOption<CanvasOutputMimeType>[] = [
  {value: 'image/png', text: 'png'},
  {value: 'image/jpeg', text: 'jpeg'},
  {value: 'image/webp', text: 'webp'},
];

export const FrameRates: MetaOption<number>[] = [
  {value: 30, text: '30 FPS'},
  {value: 60, text: '60 FPS'},
];

// Lazy initialization - only create when first accessed to avoid circular dependency
let RESOLUTION_TEMPLATES_CACHE: MetaOption<Vector2>[] | null = null;

export function getResolutionTemplates(): MetaOption<Vector2>[] {
  if (!RESOLUTION_TEMPLATES_CACHE) {
    RESOLUTION_TEMPLATES_CACHE = [
      {value: new Vector2(1920, 1080), text: '1920x1080 (Full HD)'},
      {value: new Vector2(1280, 720), text: '1280x720 (HD)'},
      {value: new Vector2(3840, 2160), text: '3840x2160 (4K UHD)'},
      {value: new Vector2(2560, 1440), text: '2560x1440 (2K QHD)'},
      {value: new Vector2(1080, 1080), text: '1080x1080 (Square)'},
      {value: new Vector2(1080, 1920), text: '1080x1920 (Portrait)'},
      {value: new Vector2(720, 1280), text: '720x1280 (Portrait HD)'},
      {value: new Vector2(854, 480), text: '854x480 (SD)'},
    ];
  }
  return RESOLUTION_TEMPLATES_CACHE;
}

// Export as a getter property to maintain compatibility
export const ResolutionTemplates = {
  get value() {
    return getResolutionTemplates();
  },
};
