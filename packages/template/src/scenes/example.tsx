import {Rect, makeScene2D} from '@quantmotion/2d';
import {CaptionFramework} from '@quantmotion/components';
import {
  all,
  createRef,
  easeInExpo,
  easeInOutExpo,
  waitFor,
  waitUntil,
} from '@quantmotion/core';

export default makeScene2D(function* (view) {
  const rect = createRef<Rect>();
  const size = view.size();

  view.add(
    <Rect ref={rect} size={320} radius={80} smoothCorners fill={'#f3303f'} />,
  );

  // Example: captions as commentary overlay (code-controlled, no panel)
  const captionContainer = CaptionFramework.mount(view, {
    width: '100%',
    height: 260,
    // Let layout safe area position/size the caption box; scene can override.
    respectLayoutSafeArea: true,
    sceneSize: size,
    layoutId: 'instagram',
    padding: 24,
    showBox: true,
    boxColor: '#000000',
    boxOpacity: 0.8,
    boxRadius: 10,
    fontSize: 56,
    linesPerPage: 2,
  });

  const words = [
    'Hello',
    'this',
    'is',
    'a',
    'commentary',
    'caption',
    'running',
    'alongside',
    'the',
    'animation.',
  ];

  const animator = new CaptionFramework({
    container: captionContainer,
    words,
    config: {
      speedFactor: 1.0,
      linesPerPage: 2,
      fontSize: 48,
      textColor: '#ffffff',
      highlightNewWords: true,
    },
    triggers: {
      commentary: () => rect().fill('#3fb34f', 0.3),
    },
  });

  // Run both animations concurrently and wait for both to finish.
  yield* all(
    (function* () {
      yield* waitUntil('rect');
      yield* rect().scale(2, 1, easeInOutExpo).to(1, 0.6, easeInExpo);
      rect().fill('#ffa56d');
      yield* all(rect().ripple(1));
      yield* waitFor(0.3);
    })(),
    animator.animate(),
  );
});
