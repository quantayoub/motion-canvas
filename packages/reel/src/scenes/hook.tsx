import {Rect, Txt, makeScene2D} from '@quantmotion/2d';
import {CaptionFramework, SectionTitle} from '@quantmotion/components';
import {
  Vector2,
  all,
  createRef,
  easeInOutExpo,
  easeOutCubic,
  getLayout,
  spawn,
  waitFor,
} from '@quantmotion/core';

export default makeScene2D(function* (view) {
  const size = view.size();

  const bg = createRef<Rect>();
  view.add(<Rect ref={bg} size={size} fill={'#000000'} />);

  // Section title at top of safe zone - fast, non-intrusive animation
  const sectionTitle = SectionTitle.mount(view, {
    title: 'Part 1: Order Books',
    subtitle: 'Building your own market simulation',
    sceneSize: size,
    layoutId: 'instagram',
    marginTop: 30,
    fontSize: 48,
    subtitleFontSize: 32,
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
    textColor: '#ffffff',
    subtitleColor: '#cccccc',
    showBackground: true,
    backgroundColor: '#1a1a1a',
    backgroundOpacity: 0.9,
    backgroundRadius: 12,
    backgroundPadding: [20, 40],
    showUnderline: true,
    underlineColor: '#4cc9f0',
    underlineHeight: 4,
    underlineMargin: 12,
    showProgressBar: false,
    animationDuration: 0.3, // Faster animation - least priority
  });

  // Animate title popping in quickly and early, non-blocking
  spawn(function* () {
    yield* waitFor(0.1); // Small delay to not interfere with initial scene setup
    yield* sectionTitle.popIn();
  } as any);

  // Safe-area mapping (to place the orderbook above the caption)
  let safeTop = 0;
  let safeBottom = 0;
  try {
    const layout = getLayout('instagram');
    if (layout) {
      const def = layout.defaultResolution;
      const s = layout.safeZone.contentArea;
      const sy = size.y / def.y;
      const safeH = s.height * sy;
      const sceneCY = size.y / 2;
      const safeTopY = s.y * sy - sceneCY;
      safeTop = safeTopY;
      safeBottom = safeTopY + safeH;
    }
  } catch {
    /* noop */
  }

  // Picker-style wheel columns for bids/asks
  const centerY = (safeTop + (safeBottom - 220 - 24)) / 2;
  const rowH = 44;
  const visibleRows = 9; // odd number for a clear center
  const wheelHeight = rowH * visibleRows + 10;

  // Keep refs for dynamic spread calculation
  const bidState: {column?: Rect; prices?: number[]} = {};
  const askState: {column?: Rect; prices?: number[]} = {};

  function createWheel(x: number, isBid: boolean) {
    const viewport = createRef<Rect>();
    const column = createRef<Rect>();
    const centerBand = createRef<Rect>();
    const prices: number[] = [];
    const base = isBid ? 99.95 : 100.05;
    for (let i = -20; i <= 20; i++) {
      prices.push(base + 0.01 * i * (isBid ? -1 : 1));
    }

    view.add(
      <Rect
        ref={viewport}
        x={x}
        y={centerY}
        width={260}
        height={wheelHeight}
        clip
        radius={8}
        opacity={0}
      >
        <Rect ref={column} layout direction={'column'} gap={4} y={0}>
          {prices.map((p, idx) => (
            <Rect
              key={`${isBid ? 'b' : 'a'}-${idx}`}
              width={260}
              height={rowH}
              fill={isBid ? '#001f3f' : '#3b0000'}
              radius={6}
              padding={10}
            >
              <Txt
                text={`${p.toFixed(2)}  |  ${Math.floor(80 + Math.random() * 140)}`}
                fill={'#ffffff'}
                fontSize={22}
                opacity={() => {
                  const dy = Math.abs(
                    column().y() / (rowH + 4) +
                      idx -
                      Math.floor(prices.length / 2),
                  );
                  return Math.max(0.25, 1 - dy * 0.18);
                }}
              />
            </Rect>
          ))}
        </Rect>
        <Rect
          ref={centerBand}
          width={260}
          height={rowH + 6}
          stroke={isBid ? '#00bfff' : '#ff4500'}
          lineWidth={2}
          radius={8}
        />
      </Rect>,
    );

    // Fade in the wheel quickly
    spawn(function* () {
      yield* viewport().opacity(1, 0.2, easeInOutExpo);
    } as any);

    // Save state for spread updates
    if (isBid) {
      bidState.column = column();
      bidState.prices = prices;
    } else {
      askState.column = column();
      askState.prices = prices;
    }

    // Random step scheduler for ~3s total scene
    spawn(function* () {
      let steps = 0;
      while (steps < 20) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        const count = 1 + Math.floor(Math.random() * 2); // 1-2 steps
        for (let k = 0; k < count; k++) {
          const from = column().y();
          const to = from + dir * (rowH + 4);
          yield* column().y(to, 0.18, easeOutCubic);
          steps++;
        }
        yield* waitFor(0.05);
      }
    } as any);
  }

  // Build both wheels
  createWheel(-200, true);
  createWheel(200, false);

  // Dynamic spread label in two centered lines
  const spreadCents = createRef<Txt>();
  const spreadBps = createRef<Txt>();
  view.add(
    <>
      <Txt
        ref={spreadCents}
        text={'Spread'}
        fontSize={20}
        fill={'#e0e0e0'}
        position={new Vector2(0, centerY - 34)}
        opacity={0}
        textAlign={'center'}
      />
      <Txt
        ref={spreadBps}
        text={''}
        fontSize={16}
        fill={'#bfbfbf'}
        position={new Vector2(0, centerY - 12)}
        opacity={0}
        textAlign={'center'}
      />
    </>,
  );
  spawn(function* () {
    yield* all(spreadCents().opacity(1, 0.2), spreadBps().opacity(1, 0.2));
    // Poll quickly; cheap because it's just text
    while (true) {
      const getCenterPrice = (col?: Rect, arr?: number[]) => {
        if (!col || !arr) return undefined;
        const offsetRows = col.y() / (rowH + 4);
        const centerIdx = Math.round(arr.length / 2 - offsetRows);
        const idx = Math.max(0, Math.min(arr.length - 1, centerIdx));
        return arr[idx];
      };
      const bidP = getCenterPrice(bidState.column, bidState.prices);
      const askP = getCenterPrice(askState.column, askState.prices);
      if (bidP !== undefined && askP !== undefined) {
        const spread = askP - bidP;
        const mid = (askP + bidP) / 2;
        const bps = (spread / mid) * 10000;
        spreadCents().text(`${(spread * 100).toFixed(1)}¢`);
        spreadBps().text(`${Math.max(0, bps).toFixed(0)} bps`);
      }
      yield* waitFor(0.06);
    }
  } as any);

  // Side titles for the wheels
  const bestBidTitle = createRef<Txt>();
  const bestAskTitle = createRef<Txt>();
  view.add(
    <>
      <Txt
        ref={bestBidTitle}
        text={'Best Bid'}
        fontSize={18}
        fill={'#00bfff'}
        position={new Vector2(-200, centerY - wheelHeight / 2 - 20)}
        opacity={0}
      />
      <Txt
        ref={bestAskTitle}
        text={'Best Ask'}
        fontSize={18}
        fill={'#ff4500'}
        position={new Vector2(200, centerY - wheelHeight / 2 - 20)}
        opacity={0}
      />
    </>,
  );
  spawn(function* () {
    yield* all(bestBidTitle().opacity(1, 0.2), bestAskTitle().opacity(1, 0.2));
  } as any);

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

  const words = [
    'Same',
    'price.',
    'Two',
    'orders.',
    'Only',
    'one',
    'gets',
    'filled.',
    "Let's",
    'code',
    'it.',
  ];

  const animator = new CaptionFramework({
    container,
    words,
    config: {
      // Tiny slowdown to land right at ~3s
      speedFactor: 0.52,
      wordFadeBase: 0.065,
      wordGapBase: 0.11,
      pagePauseBase: 0.18,
      linesPerPage: 2,
      fontSize: 54,
      textColor: '#ffffff',
      highlightNewWords: true,
      newWordColor: '#4cc9f0',
      maxCharsPerLine: 22,
      maxWordsPerLine: 6,
    },
  });

  spawn(animator.animate() as any);
  yield* waitFor(4); // Increased duration to allow caption to finish
});
