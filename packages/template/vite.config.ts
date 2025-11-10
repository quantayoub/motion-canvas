import preact from '@preact/preset-vite';
import markdown from '@quantmotion/internal/vite/markdown-literals';
import path from 'path';
import {defineConfig} from 'vite';
import ffmpeg from '../ffmpeg/server';
import motionCanvas from '../vite-plugin/src/main';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@quantmotion/ui',
        replacement: '@quantmotion/ui/src/main.tsx',
      },
      {
        find: '@quantmotion/2d/editor',
        replacement: '@quantmotion/2d/src/editor',
      },
      {
        find: '@quantmotion/ffmpeg/lib/client',
        replacement: '@quantmotion/ffmpeg/client',
      },
      {
        find: /@quantmotion\/2d(\/lib)?/,
        replacement: '@quantmotion/2d/src/lib',
      },
      {
        find: '@quantmotion/components',
        replacement: path.resolve(__dirname, '../components/src'),
      },
      {find: '@quantmotion/core', replacement: '@quantmotion/core/src'},
    ],
  },
  plugins: [
    markdown(),
    preact({
      include: [
        /packages\/ui\/src\/(.*)\.tsx?$/,
        /packages\/2d\/src\/editor\/(.*)\.tsx?$/,
      ],
    }),
    motionCanvas({
      buildForEditor: true,
    }),
    ffmpeg(),
  ],
  build: {
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
