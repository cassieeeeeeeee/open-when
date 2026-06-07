import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

// Hand-drawn vector motifs for the ornate text frames (lace / floral / watercolor / rococo).
// Stylised, soft-pastel interpretations — composed from simple primitives so they stay light.

export type FloralPalette = { stem: string; leaf: string; flower: string; flowerAlt: string; center: string; bud: string };

export const BLUE_FLORAL: FloralPalette = { stem: '#9aa988', leaf: '#aeb89c', flower: '#8ea6c6', flowerAlt: '#b3c3d9', center: '#d8c98f', bud: '#c2d0e0' };
export const PINK_FLORAL: FloralPalette = { stem: '#a3b08f', leaf: '#b6c2a2', flower: '#e3aebe', flowerAlt: '#eec6d2', center: '#cf8fa2', bud: '#ecc9d3' };

function Blossom({ x, y, r, p }: { x: number; y: number; r: number; p: FloralPalette }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <G>
      {petals.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return <Circle key={i} cx={x + Math.cos(rad) * r} cy={y + Math.sin(rad) * r} r={r * 0.64} fill={i % 2 ? p.flowerAlt : p.flower} />;
      })}
      <Circle cx={x} cy={y} r={r * 0.52} fill={p.center} />
    </G>
  );
}

function Leaf({ x, y, rot, len, p }: { x: number; y: number; rot: number; len: number; p: FloralPalette }) {
  return (
    <G transform={`translate(${x}, ${y}) rotate(${rot})`}>
      <Ellipse cx={0} cy={0} rx={len} ry={len * 0.4} fill={p.leaf} />
    </G>
  );
}

// A floral spray growing inward from the top-left corner (74×74). Mirror with View transforms
// to fill the other corners.
export function CornerSprig({ size = 74, p = BLUE_FLORAL, full = false }: { size?: number; p?: FloralPalette; full?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 74 74">
      <Path d="M5,5 C 26,16 36,34 31,64" stroke={p.stem} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M5,7 C 16,20 14,38 21,58" stroke={p.stem} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <Path d="M9,6 C 26,9 42,11 62,8" stroke={p.stem} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <Leaf x={15} y={16} rot={35} len={6} p={p} />
      <Leaf x={25} y={31} rot={68} len={7} p={p} />
      <Leaf x={19} y={47} rot={102} len={6} p={p} />
      <Leaf x={33} y={11} rot={-12} len={6} p={p} />
      <Leaf x={50} y={9} rot={6} len={6} p={p} />
      {full ? <Leaf x={43} y={40} rot={120} len={6.5} p={p} /> : null}
      <Blossom x={31} y={62} r={7} p={p} />
      <Blossom x={62} y={8} r={6.4} p={p} />
      <Blossom x={9} y={6} r={5.4} p={p} />
      {full ? <Blossom x={46} y={30} r={5.2} p={p} /> : null}
      <Circle cx={42} cy={20} r={2.2} fill={p.bud} />
      <Circle cx={23} cy={41} r={2} fill={p.bud} />
    </Svg>
  );
}

// A fuller bouquet for the bottom corners of the watercolor frame (84×64), growing up from the corner.
export function BlossomBouquet({ size = 84, p = PINK_FLORAL }: { size?: number; p?: FloralPalette }) {
  return (
    <Svg width={size} height={size * 0.78} viewBox="0 0 84 66">
      <Path d="M10,64 C 18,44 16,28 20,12" stroke={p.stem} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M22,64 C 30,48 34,34 33,20" stroke={p.stem} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M14,62 C 28,54 44,52 60,56" stroke={p.stem} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <Leaf x={16} y={46} rot={-60} len={7} p={p} />
      <Leaf x={27} y={40} rot={-30} len={7.5} p={p} />
      <Leaf x={40} y={52} rot={20} len={7} p={p} />
      <Leaf x={52} y={56} rot={10} len={6.5} p={p} />
      <Leaf x={33} y={30} rot={-50} len={6.5} p={p} />
      <Blossom x={20} y={12} r={8.5} p={p} />
      <Blossom x={33} y={19} r={7.5} p={p} />
      <Blossom x={11} y={26} r={6.5} p={p} />
      <Blossom x={58} y={55} r={6.5} p={p} />
      <Circle cx={44} cy={24} r={2.6} fill={p.bud} />
      <Circle cx={26} cy={30} r={2.2} fill={p.bud} />
    </Svg>
  );
}

// A delicate ribbon bow (38×30).
export function Bow({ size = 34, color = '#e8d6c0', tie = '#cdb79b' }: { size?: number; color?: string; tie?: string }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 40 32">
      <Path d="M20,13 C 7,3 1,9 4,18 C 6,24 16,20 20,15 Z" fill={color} />
      <Path d="M20,13 C 33,3 39,9 36,18 C 34,24 24,20 20,15 Z" fill={color} />
      <Path d="M18,15 C 13,23 11,28 12,31" stroke={tie} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M22,15 C 27,23 29,28 28,31" stroke={tie} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Ellipse cx={20} cy={14} rx={2.6} ry={3.4} fill={tie} />
    </Svg>
  );
}

function Rose({ x, y, r, c1, c2, c3 }: { x: number; y: number; r: number; c1: string; c2: string; c3: string }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={c1} />
      <Path d={`M ${x - r * 0.7},${y + r * 0.2} A ${r * 0.7} ${r * 0.7} 0 1 1 ${x + r * 0.6},${y - r * 0.3}`} stroke={c3} strokeWidth={1} fill="none" />
      <Circle cx={x} cy={y} r={r * 0.55} fill={c2} />
      <Path d={`M ${x - r * 0.35},${y} A ${r * 0.35} ${r * 0.35} 0 1 0 ${x + r * 0.3},${y - r * 0.15}`} stroke={c3} strokeWidth={0.8} fill="none" />
      <Circle cx={x} cy={y} r={r * 0.2} fill={c3} />
    </G>
  );
}

// A rose-and-leaf cluster for the rococo corners (72×72), growing inward from the top-left.
export function RoseSpray({ size = 72, leaf = '#b9c2a6' }: { size?: number; leaf?: string }) {
  const p = { stem: leaf, leaf, flower: '', flowerAlt: '', center: '', bud: '' } as FloralPalette;
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Leaf x={30} y={14} rot={20} len={9} p={p} />
      <Leaf x={14} y={30} rot={70} len={9} p={p} />
      <Leaf x={40} y={34} rot={-30} len={8} p={p} />
      <Leaf x={24} y={46} rot={110} len={7} p={p} />
      <Rose x={18} y={18} r={11} c1="#e9c6cf" c2="#f0d6dc" c3="#d29fae" />
      <Rose x={38} y={22} r={8.5} c1="#ead7c2" c2="#f2e6d6" c3="#cdb191" />
      <Rose x={22} y={40} r={8} c1="#e3cdd6" c2="#efe0e6" c3="#c9a7b4" />
      <Circle cx={44} cy={40} r={2.6} fill="#ddc6cf" />
      <Circle cx={34} cy={48} r={2.2} fill="#e7d6c4" />
    </Svg>
  );
}

// A symmetric scroll flourish for a corner (62×62), opening toward the bottom-right.
export function CornerScroll({ size = 62, color = '#c8b48a' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 62 62">
      <Path d="M6,32 C 6,15 16,6 33,6" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M13,32 C 13,20 20,12 33,12" stroke={color} strokeWidth={1} fill="none" strokeLinecap="round" />
      <Path d="M6,32 C 1,32 0,25 4,22 C 8,19 10,25 7,27" stroke={color} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <Path d="M33,6 C 33,1 26,0 23,4 C 20,8 26,10 28,7" stroke={color} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <Path d="M18,40 C 26,34 32,30 36,22" stroke={color} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <Circle cx={20} cy={20} r={1.8} fill={color} />
    </Svg>
  );
}
