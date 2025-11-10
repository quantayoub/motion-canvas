import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import type {MotionCanvasPlayerProps} from '@quantmotion/player';
import clsx from 'clsx';
import React, {ComponentProps} from 'react';
import AnimationLink from './AnimationLink';
import styles from './styles.module.css';

if (ExecutionEnvironment.canUseDOM) {
  import('@quantmotion/player');
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'quantmotion-player': MotionCanvasPlayerProps & ComponentProps<'div'>;
    }
  }
}

export interface AnimationPlayerProps {
  banner?: boolean;
  small?: boolean;
  name: string;
  link?: string;
}

export default function AnimationPlayer({
  name,
  banner,
  small,
  link,
}: AnimationPlayerProps) {
  return (
    <div
      className={clsx(
        styles.container,
        banner && styles.banner,
        small && styles.small,
      )}
    >
      <quantmotion-player
        class={styles.player}
        src={`/examples/${name}.js`}
        auto={banner}
      />
      <AnimationLink name={link || name} />
    </div>
  );
}
