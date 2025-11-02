import {getAllLayouts} from '../layouts';
import {
  BoolMetaField,
  ColorMetaField,
  EnumMetaField,
  ExporterMetaField,
  MetaField,
  NumberMetaField,
  ObjectMetaField,
  RangeMetaField,
  Vector2MetaField,
} from '../meta';
import {CanvasColorSpace, Color, Vector2} from '../types';
import type {Project} from './Project';
import {ColorSpaces, FrameRates, ResolutionTemplates, Scales} from './presets';

function createProjectMetadata(project: Project) {
  const layouts = getAllLayouts();
  const layoutOptions = [
    {value: 'none', text: 'None'},
    ...layouts.map(layout => ({
      value: layout.id,
      text: layout.name,
    })),
  ];

  const meta = {
    version: new MetaField('version', 1),
    shared: new ObjectMetaField('General', {
      background: new ColorMetaField('background', null),
      range: new RangeMetaField('range', [0, Infinity]),
      size: new Vector2MetaField(
        'resolution',
        new Vector2(1920, 1080),
      ).setPresets(ResolutionTemplates.value),
      layout: new EnumMetaField('layout', layoutOptions, 'none').describe(
        'Platform layout template (sets resolution and safe zones)',
      ),
      audioOffset: new NumberMetaField('audio offset', 0)
        .setPrecision(4)
        .setStep(0.1),
    }),
    preview: new ObjectMetaField('Preview', {
      fps: new NumberMetaField('frame rate', 30)
        .setPresets(FrameRates)
        .setRange(1),
      resolutionScale: new EnumMetaField('scale', Scales, 1),
      showLayoutOverlay: new BoolMetaField(
        'show layout overlay',
        false,
      ).describe('Display platform UI overlay in preview'),
    }),
    rendering: new ObjectMetaField('Rendering', {
      fps: new NumberMetaField('frame rate', 60)
        .setPresets(FrameRates)
        .setRange(1),
      resolutionScale: new EnumMetaField('scale', Scales, 1),
      colorSpace: new EnumMetaField('color space', ColorSpaces),
      exporter: new ExporterMetaField('exporter', project),
      includeLayoutOverlay: new BoolMetaField(
        'include layout overlay',
        false,
      ).describe('Include platform UI overlay in final render'),
    }),
  };

  meta.shared.audioOffset.disable(!project.audio);

  return meta;
}

export class ProjectMetadata extends ObjectMetaField<
  ReturnType<typeof createProjectMetadata>
> {
  public constructor(project: Project) {
    super('project', createProjectMetadata(project));
  }

  public getFullPreviewSettings(): {
    fps: number;
    resolutionScale: number;
    background: Color | null;
    range: [number, number];
    size: Vector2;
    audioOffset: number;
  } {
    return {
      ...this.shared.get(),
      ...this.preview.get(),
    };
  }

  public getFullRenderingSettings(): {
    fps: number;
    resolutionScale: number;
    colorSpace: CanvasColorSpace;
    background: Color | null;
    range: [number, number];
    size: Vector2;
    audioOffset: number;
    exporter: {
      name: string;
      options: unknown;
    };
  } {
    return {
      ...this.shared.get(),
      ...this.rendering.get(),
    };
  }
}
