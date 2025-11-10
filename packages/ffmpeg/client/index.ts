import type {ExporterClass} from '@quantmotion/core';
import {makePlugin} from '@quantmotion/core';
import {FFmpegExporterClient} from './FFmpegExporterClient';

export default makePlugin({
  name: 'ffmpeg-plugin',
  exporters(): ExporterClass[] {
    return [FFmpegExporterClient];
  },
});
