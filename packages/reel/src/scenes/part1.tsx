import {Rect, makeScene2D} from '@motion-canvas/2d';
import {CaptionFramework} from '@motion-canvas/captions';
import {
  Matrix2D,
  Vector2,
  all,
  createRef,
  easeInOutExpo,
  waitFor,
} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const size = view.size();

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
    fontSize: 56,
    linesPerPage: 1,
  });

  const words = ['machine'];

  // Travel border from the word to the safe-area center and draw a circle.
  const animator = new CaptionFramework({
    container,
    words,
    config: {
      linesPerPage: 1,
      fontSize: 56,
      textColor: '#ffffff',
      highlightNewWords: true,
    },
    triggers: {
      machine: ({node}) =>
        function* () {
          if (!node) return;
          // Place overlay in the same parent as the word initially, aligned to exact word center/size
          const parent = node.parent?.() ?? view;
          const worldCenter = node.absolutePosition?.() ?? Vector2.zero;
          const toParent =
            (parent as any).worldToLocal?.() ?? Matrix2D.identity;
          const wordLocalPos = worldCenter.transformAsPoint(toParent);
          const sizeFromNode = (node as any).size?.() as Vector2 | undefined;
          const computed =
            ((node as any).computedSize?.() as Vector2 | undefined) ??
            sizeFromNode;
          const fallback = new Vector2(
            ((node as any).width?.() as number) ?? 0,
            ((node as any).height?.() as number) ?? 0,
          );
          const wordSize: Vector2 = computed ?? fallback;

          const padding = 6;
          const overlay = createRef<Rect>();
          parent.add(
            <Rect
              ref={overlay}
              width={wordSize.x + padding * 2}
              height={wordSize.y + padding * 2}
              position={wordLocalPos}
              offset={[0, 0]}
              stroke={'#4cc9f0'}
              lineWidth={6}
              radius={8}
            />,
          );

          // Reparent to view so further movement is in screen space; absolute position is preserved
          overlay().parent(view);

          // Move to screen center (0,0 in scene coordinates). For safe-area center, compute instead.
          const screenCenter = Vector2.zero;
          yield* overlay().position(screenCenter, 0.6, easeInOutExpo);

          // Morph into a circle by animating size to a square and radius to half the side
          const targetDiameter = 240;
          const targetRadius = targetDiameter / 2;
          yield* all(
            overlay().size(targetDiameter, 0.5, easeInOutExpo),
            overlay().radius(targetRadius, 0.5, easeInOutExpo),
          );
        },
    },
  });

  yield* all(animator.animate(), waitFor(0));
});
