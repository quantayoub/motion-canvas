/// <reference types="vite/client" />

import 'vite/types/customEvent';

declare module 'vite/types/customEvent' {
  interface CustomEventMap {
    'quantmotion:meta': {source: string; data: any};
    'quantmotion:meta-ack': {source: string};
    'quantmotion:export': {
      data: string;
      subDirectories: string[];
      mimeType: string;
      frame: number;
      name: string;
    };
    'quantmotion:export-ack': {frame: number};
    'quantmotion:assets': {urls: string[]};
  }
}
