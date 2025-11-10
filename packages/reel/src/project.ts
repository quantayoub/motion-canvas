import {makeProject} from '@quantmotion/core';

import endvid from './scenes/endvid?scene';
import hook from './scenes/hook?scene';

export default makeProject({
  experimentalFeatures: true,
  scenes: [hook, endvid],
});
