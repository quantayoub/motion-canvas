import {makeScene2D} from '@quantmotion/2d';
import {createEffect, createSignal} from '@quantmotion/core';

export default makeScene2D(function* () {
  const signal = createSignal(0);

  createEffect(() => {
    console.log('Signal changed: ', signal());
  });

  yield* signal(1, 2);
});
