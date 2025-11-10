import {Img, makeScene2D} from '@quantmotion/2d';
import {createRef, easeOutElastic} from '@quantmotion/core';

export default makeScene2D(function* (view) {
  const ref = createRef<Img>();
  yield view.add(
    <Img
      ref={ref}
      skew={[-24, -12]}
      src="https://images.unsplash.com/photo-1696931073577-5638a6891e1e"
      width={240}
      radius={20}
    />,
  );

  yield* ref().skew([24, 12], 1, easeOutElastic).back(1);
});
