import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { CapsuleArt } from '@/constants/capsuleThemes';

// Decorative background art for the capsule reveal — one tasteful, semi-transparent scene per
// theme, sized to the screen and pinned behind the scrolling content. Kept in its own file so
// the reveal screen stays readable.

const STARS: [number, number][] = [
  [20, 40], [70, 28], [120, 60], [170, 30], [220, 54],
  [265, 36], [40, 100], [150, 90], [250, 104], [95, 130],
];
const PETALS: [number, number, number][] = [
  [30, 40, 3], [80, 24, 2.2], [130, 54, 3.4], [184, 30, 2.4], [234, 60, 3],
  [268, 34, 2.2], [54, 94, 2.6], [110, 118, 3.2], [170, 98, 2.4], [224, 120, 3],
  [80, 162, 2.6], [200, 160, 3.2],
];
// Unit directions of 5 petals (72° apart) for laying out simple flowers.
const PETAL5: [number, number][] = [
  [0, -1], [0.95, -0.31], [0.59, 0.81], [-0.59, 0.81], [-0.95, -0.31],
];
// Flowers: [cx, cy, scale, white?]
const FLOWERS: [number, number, number, number][] = [
  [38, 52, 1, 0], [108, 30, 0.8, 1], [180, 58, 1.15, 0], [244, 32, 0.85, 0],
  [276, 74, 0.85, 1], [66, 116, 0.95, 0], [150, 124, 1.05, 1], [222, 116, 0.85, 0],
];
// Autumn leaves: [x, y, scale, colourIndex]
const LEAVES: [number, number, number, number][] = [
  [34, 42, 1, 0], [92, 26, 0.8, 1], [150, 52, 1.15, 2], [206, 30, 0.9, 0],
  [256, 50, 1, 1], [60, 104, 0.85, 2], [128, 118, 1, 0], [200, 110, 0.9, 1], [262, 108, 0.8, 2],
];
const LEAF_FILL = ['rgba(212,120,58,0.5)', 'rgba(226,162,72,0.5)', 'rgba(190,92,70,0.5)'];
// Graduation confetti: [x, y, kind] — 0 gold square, 1 cream square, 2 rose dot
const CONFETTI: [number, number, number][] = [
  [42, 34, 0], [82, 22, 2], [120, 46, 1], [206, 28, 1], [242, 48, 0],
  [276, 28, 2], [54, 122, 1], [112, 132, 0], [196, 126, 2], [258, 116, 1],
];
// Christmas string-light bulbs: [x, y, colourIndex]
const LIGHTS: [number, number, number][] = [
  [28, 27, 0], [62, 36, 1], [96, 25, 2], [130, 35, 0], [164, 26, 1],
  [198, 35, 2], [232, 26, 0], [266, 34, 1],
];
const LIGHT_FILL = ['rgba(255,210,140,0.78)', 'rgba(245,236,220,0.68)', 'rgba(170,205,160,0.72)'];
// Christmas trees: [baseX, baseY, scale]
const TREES: [number, number, number][] = [
  [150, 160, 1.05], [76, 156, 0.78], [226, 156, 0.82],
];

const s = StyleSheet.create({ art: { position: 'absolute', left: 0, right: 0 } });

export function ThemeArt({ art, width, insetsTop }: { art: CapsuleArt; width: number; insetsTop: number }) {
  // Scene arts share a 300×240 canvas pinned near the top; mountains stretch along the bottom.
  const scene = (top: number) => ({ width, height: width * 0.85, viewBox: '0 0 300 240' as const, style: [s.art, { top: insetsTop + top }] });

  if (art === 'mountains') {
    return (
      <Svg width={width} height={(width * 90) / 292} viewBox="0 0 292 90" preserveAspectRatio="none" style={[s.art, { top: insetsTop + 250 }]}>
        <Path d="M0 90 L0 55 L55 22 L110 60 L150 35 L200 68 L250 40 L292 64 L292 90 Z" fill="rgba(0,0,0,0.28)" />
      </Svg>
    );
  }

  if (art === 'stars') {
    return (
      <Svg {...scene(36)}>
        {STARS.map(([cx, cy], i) => (
          <Circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2 : 1.2} fill="rgba(255,255,255,0.75)" />
        ))}
      </Svg>
    );
  }

  if (art === 'sun') {
    return (
      <Svg {...scene(16)}>
        <Circle cx={232} cy={54} r={34} fill="rgba(255,236,180,0.18)" />
        <Circle cx={232} cy={54} r={21} fill="rgba(255,240,200,0.3)" />
        <G stroke="rgba(255,238,190,0.42)" strokeWidth={2.4} strokeLinecap="round">
          <Line x1={232} y1={10} x2={232} y2={24} />
          <Line x1={232} y1={84} x2={232} y2={98} />
          <Line x1={188} y1={54} x2={202} y2={54} />
          <Line x1={262} y1={54} x2={276} y2={54} />
          <Line x1={201} y1={23} x2={211} y2={33} />
          <Line x1={253} y1={75} x2={263} y2={85} />
          <Line x1={263} y1={23} x2={253} y2={33} />
          <Line x1={211} y1={75} x2={201} y2={85} />
        </G>
      </Svg>
    );
  }

  if (art === 'petals') {
    return (
      <Svg {...scene(40)}>
        {PETALS.map(([cx, cy, r], i) => (
          <Circle key={i} cx={cx} cy={cy} r={r} fill="rgba(247,201,217,0.5)" />
        ))}
      </Svg>
    );
  }

  if (art === 'flowers') {
    return (
      <Svg {...scene(18)}>
        {FLOWERS.map(([cx, cy, sc, white], i) => {
          const pr = 7 * sc;
          const d = 8.5 * sc;
          const petal = white ? 'rgba(252,246,248,0.52)' : 'rgba(234,168,194,0.52)';
          return (
            <G key={i}>
              {PETAL5.map(([ox, oy], j) => (
                <Circle key={j} cx={cx + ox * d} cy={cy + oy * d} r={pr} fill={petal} />
              ))}
              <Circle cx={cx} cy={cy} r={pr * 0.72} fill="rgba(255,224,150,0.62)" />
            </G>
          );
        })}
      </Svg>
    );
  }

  if (art === 'leaves') {
    return (
      <Svg {...scene(18)}>
        {LEAVES.map(([x, y, sc, v], i) => (
          <G key={i} transform={`translate(${x}, ${y}) rotate(${((x * 7 + y * 5) % 90) - 45}) scale(${sc})`}>
            <Path d="M0,-9 Q8,-3 0,9 Q-8,-3 0,-9 Z" fill={LEAF_FILL[v]} />
            <Line x1={0} y1={-8} x2={0} y2={8} stroke="rgba(120,70,40,0.4)" strokeWidth={0.8} />
          </G>
        ))}
      </Svg>
    );
  }

  if (art === 'snowscape') {
    return (
      <Svg {...scene(56)}>
        <Path d="M0,150 L52,70 L96,118 L150,52 L208,118 L256,82 L300,150 Z" fill="rgba(255,255,255,0.2)" />
        <Path d="M150,52 L134,76 L143,72 L150,82 L158,72 L167,78 Z" fill="rgba(255,255,255,0.42)" />
        <Path d="M52,70 L41,90 L48,86 L52,94 L57,86 L64,92 Z" fill="rgba(255,255,255,0.42)" />
        {/* a small snowman in the foreground */}
        <G>
          <Circle cx={54} cy={150} r={13} fill="rgba(255,255,255,0.58)" />
          <Circle cx={54} cy={131} r={9.5} fill="rgba(255,255,255,0.58)" />
          <Circle cx={54} cy={116} r={6.5} fill="rgba(255,255,255,0.58)" />
          <Circle cx={51.5} cy={114.5} r={1.2} fill="rgba(58,70,86,0.7)" />
          <Circle cx={56.5} cy={114.5} r={1.2} fill="rgba(58,70,86,0.7)" />
          <Polygon points="54,117 63,118.5 54,120" fill="rgba(232,138,64,0.75)" />
          <Circle cx={54} cy={129} r={1.3} fill="rgba(58,70,86,0.6)" />
          <Circle cx={54} cy={135} r={1.3} fill="rgba(58,70,86,0.6)" />
          <Line x1={44} y1={130} x2={33} y2={123} stroke="rgba(110,84,60,0.55)" strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={64} y1={130} x2={75} y2={123} stroke="rgba(110,84,60,0.55)" strokeWidth={1.6} strokeLinecap="round" />
          <Rect x={45} y={106} width={18} height={2.6} rx={1} fill="rgba(46,56,70,0.6)" />
          <Rect x={48.5} y={97} width={11} height={9} rx={1} fill="rgba(46,56,70,0.6)" />
        </G>
      </Svg>
    );
  }

  if (art === 'graduation') {
    return (
      <Svg {...scene(20)}>
        {/* mortarboard */}
        <Polygon points="150,40 214,68 150,96 86,68" fill="rgba(245,238,222,0.46)" />
        <Path d="M126,76 L174,76 L168,97 Q150,105 132,97 Z" fill="rgba(226,216,194,0.42)" />
        <Circle cx={150} cy={68} r={3.5} fill="rgba(216,182,112,0.7)" />
        <Path d="M150,68 L206,68 L206,104" stroke="rgba(216,182,112,0.62)" strokeWidth={2} fill="none" />
        <Circle cx={206} cy={108} r={4.5} fill="rgba(216,182,112,0.62)" />
        {/* a rolled diploma */}
        <G transform="rotate(-12, 60, 150)">
          <Rect x={38} y={145} width={44} height={10} rx={5} fill="rgba(245,238,222,0.5)" />
          <Rect x={57} y={142} width={4} height={16} rx={2} fill="rgba(228,150,162,0.55)" />
        </G>
        {/* confetti */}
        {CONFETTI.map(([x, y, k], i) =>
          k === 2 ? (
            <Circle key={i} cx={x} cy={y} r={3} fill="rgba(228,150,162,0.55)" />
          ) : (
            <Rect
              key={i}
              x={x}
              y={y}
              width={6}
              height={6}
              rx={1}
              transform={`rotate(${(x + y) % 70} ${x + 3} ${y + 3})`}
              fill={k === 0 ? 'rgba(216,182,112,0.6)' : 'rgba(245,238,222,0.55)'}
            />
          ),
        )}
      </Svg>
    );
  }

  if (art === 'christmas') {
    return (
      <Svg {...scene(14)}>
        {/* string lights */}
        <Path d="M0,16 Q75,50 150,20 T300,24" stroke="rgba(255,235,205,0.32)" strokeWidth={1.4} fill="none" />
        {LIGHTS.map(([x, y, c], i) => (
          <G key={i}>
            <Line x1={x} y1={y - 5} x2={x} y2={y} stroke="rgba(255,235,205,0.28)" strokeWidth={1} />
            <Circle cx={x} cy={y + 2} r={3} fill={LIGHT_FILL[c]} />
          </G>
        ))}
        {/* trees */}
        {TREES.map(([bx, by, sc], i) => (
          <G key={i}>
            <Rect x={bx - 3 * sc} y={by} width={6 * sc} height={11 * sc} fill="rgba(120,90,70,0.42)" />
            <Polygon points={`${bx},${by - 56 * sc} ${bx - 26 * sc},${by} ${bx + 26 * sc},${by}`} fill="rgba(150,182,150,0.4)" />
            <Polygon points={`${bx},${by - 72 * sc} ${bx - 20 * sc},${by - 28 * sc} ${bx + 20 * sc},${by - 28 * sc}`} fill="rgba(166,196,164,0.44)" />
          </G>
        ))}
        {/* star atop the tallest tree */}
        <Circle cx={150} cy={82} r={4.5} fill="rgba(255,224,150,0.8)" />
      </Svg>
    );
  }

  return null;
}
