import motionCanvas from '@quantmotion/vite-plugin';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [
    motionCanvas({
      project: './src/projects/*.ts',
    }),
  ],
});
