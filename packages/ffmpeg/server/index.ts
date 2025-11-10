import {Plugin, PLUGIN_OPTIONS, PluginConfig} from '@quantmotion/vite-plugin';
import {FFmpegBridge} from './FFmpegBridge';

export default (): Plugin => {
  let config: PluginConfig;
  return {
    name: 'quantmotion/ffmpeg',
    [PLUGIN_OPTIONS]: {
      entryPoint: '@quantmotion/ffmpeg/lib/client',
      async config(value) {
        config = value;
      },
    },
    configureServer(server) {
      new FFmpegBridge(server, config);
    },
  };
};
