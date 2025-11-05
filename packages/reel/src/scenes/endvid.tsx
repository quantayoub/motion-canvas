import {Rect, makeScene2D} from '@motion-canvas/2d';
import {CaptionFramework} from '@motion-canvas/components';
import {createRef, easeOutCubic, waitFor} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const size = view.size();

  const bg = createRef<Rect>();
  view.add(<Rect ref={bg} size={size} fill={'#000000'} />);

  // Caption setup
  const container = CaptionFramework.mount(view, {
    width: '100%',
    height: 220,
    respectLayoutSafeArea: true,
    sceneSize: size,
    layoutId: 'instagram',
    padding: 24,
    showBox: true,
    boxColor: '#000000',
    boxOpacity: 0.8,
    boxRadius: 10,
    lineSpacing: 8,
    alignment: 'center',
    verticalAlignment: 'center',
    fontSize: 56,
    linesPerPage: 1,
  });

  // Fade in caption container
  container().opacity(0);
  yield* container().opacity(1, 0.6, easeOutCubic);

  const words = ['End', 'Video'];

  const animator = new CaptionFramework({
    container,
    words,
    config: {
      speedFactor: 0.7,
      wordFadeBase: 0.02,
      wordGapBase: 0.025,
      pagePauseBase: 0.05,
      linesPerPage: 2,
      fontSize: 54,
      textColor: '#ffffff',
      highlightNewWords: true,
      newWordColor: '#4cc9f0',
      maxCharsPerLine: 22,
      maxWordsPerLine: 6,
    },
  });

  yield* animator.animate();

  // Hold for a moment at the end
  yield* waitFor(1);
});
