import {makeProject} from '@quantmotion/core';
import scene from './scenes/code?scene';

import {parser} from '@lezer/javascript';
import {Code, LezerHighlighter} from '@quantmotion/2d';

Code.defaultHighlighter = new LezerHighlighter(parser);

export default makeProject({
  scenes: [scene],
});
