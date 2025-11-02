import {Stage, getLayout} from '@motion-canvas/core';
import {JSX} from 'preact';
import {useEffect, useMemo, useState} from 'preact/hooks';
import {useApplication} from '../../contexts';
import {
  usePreviewSettings,
  useSharedSettings,
  useSubscribable,
  useSubscribableValue,
} from '../../hooks';
import {StageView} from './StageView';

export function PreviewStage(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [stage] = useState(() => new Stage());
  const {player, meta} = useApplication();
  const {size, background} = useSharedSettings();
  const {resolutionScale} = usePreviewSettings();

  const layoutId = useSubscribableValue(meta.shared.layout.onChanged);
  const showOverlay = useSubscribableValue(
    meta.preview.showLayoutOverlay.onChanged,
  );

  // Auto-update resolution when layout changes
  useEffect(() => {
    if (layoutId !== 'none') {
      const layout = getLayout(layoutId);
      if (layout && layout.defaultResolution) {
        const currentSize = meta.shared.size.get();
        const defaultSize = layout.defaultResolution;
        // Only update if resolution doesn't match layout default
        if (
          currentSize.x !== defaultSize.x ||
          currentSize.y !== defaultSize.y
        ) {
          meta.shared.size.set(defaultSize);
        }
      }
    }
  }, [layoutId, meta.shared.size]);

  // Create overlay function for preview
  const overlayFunction = useMemo(() => {
    if (layoutId === 'none' || !showOverlay) {
      return undefined;
    }

    const layout = getLayout(layoutId);
    if (!layout) {
      return undefined;
    }

    return (ctx: CanvasRenderingContext2D) => {
      layout.drawOverlay(ctx, size);
    };
  }, [layoutId, showOverlay, size]);

  useSubscribable(
    player.onRender,
    async () => {
      await stage.render(
        player.playback.currentScene,
        player.playback.previousScene,
        overlayFunction,
      );
    },
    [overlayFunction],
  );

  useEffect(() => {
    stage.configure({resolutionScale, size, background});
    player.requestRender();
  }, [resolutionScale, size, background, player]);

  return <StageView stage={stage} {...props} />;
}
