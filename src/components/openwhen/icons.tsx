/**
 * Icon set for Open When, ported directly from the SVG path data in the HTML
 * mockup so the native app matches pixel-for-pixel. Built on react-native-svg
 * (bundled in Expo Go — no native rebuild needed).
 */
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { OW } from '@/constants/openwhen';

export type IconProps = { size?: number; color?: string; strokeWidth?: number };

const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function HomeIcon({ size = 22, color = OW.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11l8-7 8 7M6 10v9h12v-9" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function PeopleIcon({ size = 22, color = OW.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M3 20c0-3 3-5 6-5s6 2 6 5" stroke={color} strokeWidth={strokeWidth} {...round} />
      <Circle cx="17" cy="8" r="2.4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M16 14c3 0 5 2 5 6" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function ProfileIcon({ size = 22, color = OW.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

/** Envelope outline — used as the "Capsules" tab icon. */
export function EnvelopeTabIcon({ size = 22, color = OW.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="13" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M4 7l8 6 8-6" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function PlusIcon({ size = 22, color = OW.ink, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

/** Open eye — "tap to reveal" the password. */
export function EyeIcon({ size = 22, color = OW.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={color} strokeWidth={strokeWidth} {...round} />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

/** Eye with a slash — "tap to hide" the (currently visible) password. */
export function EyeOffIcon({ size = 22, color = OW.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={color} strokeWidth={strokeWidth} {...round} />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M4 4l16 16" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function PencilIcon({ size = 22, color = OW.ink, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 3l5 5L8 21H3v-5z" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function MicIcon({ size = 22, color = OW.ink, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="2" width="6" height="12" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function ImageIcon({ size = 22, color = OW.ink, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="3" stroke={color} strokeWidth={strokeWidth} {...round} />
      <Circle cx="8.5" cy="10" r="1.6" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M21 16l-5-5-8 8" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function VideoIcon({ size = 22, color = OW.ink, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="13" height="12" rx="2.5" stroke={color} strokeWidth={strokeWidth} {...round} />
      <Path d="M15 10l6-3v10l-6-3z" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function MusicIcon({ size = 22, color = OW.ink, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18V5l11-2v13" stroke={color} strokeWidth={strokeWidth} {...round} />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="17" cy="16" r="3" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function HeartIcon({ size = 18, color = OW.rose }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21c-5-4-9-6.5-9-11a4.2 4.2 0 0 1 9-1.4A4.2 4.2 0 0 1 21 10c0 4.5-4 7-9 11z"
        fill={color}
      />
    </Svg>
  );
}

export function LockIcon({ size = 16, color = OW.muted, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="9" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function CalendarIcon({ size = 18, color = OW.muted, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="16" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M3 9h18M8 3v4M16 3v4" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 20, color = OW.ink2, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 18, color = OW.muted, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = OW.ink2, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function CloseIcon({ size = 20, color = OW.ink2, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function SearchIcon({ size = 18, color = OW.muted, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

export function TrashIcon({ size = 20, color = OW.ink2, strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16" stroke={color} strokeWidth={strokeWidth} {...round} />
      <Path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={strokeWidth} {...round} />
      <Path
        d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
        stroke={color}
        strokeWidth={strokeWidth}
        {...round}
      />
    </Svg>
  );
}

/** The two-tone envelope-with-heart used on capsule cards. */
export function EnvelopeGlyph({
  size = 42,
  color = OW.pink,
  soft = OW.pinkSoft,
}: {
  size?: number;
  color?: string;
  soft?: string;
}) {
  return (
    <Svg width={size} height={(size * 40) / 48} viewBox="0 0 48 40" fill="none">
      <Rect x="2" y="6" width="44" height="31" rx="6" fill={soft} stroke={color} strokeWidth={1.4} />
      <Path d="M3 9 L24 23 L45 9" fill="none" stroke={color} strokeWidth={1.4} />
      <Path
        d="M24 25c-2-2-5-3.4-5-6a2.1 2.1 0 0 1 5-0.7 2.1 2.1 0 0 1 5 0.7c0 2.6-3 4-5 6z"
        fill={color}
      />
    </Svg>
  );
}

/** Large hero envelope used on the Create-a-Capsule screen. */
export function BigEnvelope({
  size = 120,
  color = OW.pink,
  soft = OW.pinkSoft,
}: {
  size?: number;
  color?: string;
  soft?: string;
}) {
  return (
    <Svg width={size} height={(size * 104) / 130} viewBox="0 0 130 104" fill="none">
      <Rect x="6" y="14" width="118" height="84" rx="12" fill={soft} stroke={color} strokeWidth={2} />
      <Path d="M8 18 L65 64 L122 18" fill="none" stroke={color} strokeWidth={2} />
      <Path
        d="M65 62c-6-5.5-14-9.5-14-17a6 6 0 0 1 14-2 6 6 0 0 1 14 2c0 7.5-8 11.5-14 17z"
        fill={color}
      />
    </Svg>
  );
}

const gid = (a: string, b: string) => `g${a}${b}`.replace(/[^a-zA-Z0-9]/g, '');

/** A circular avatar filled with a diagonal gradient (stand-in for a profile photo). */
export function GradientAvatar({
  size = 34,
  from = '#caa07a',
  to = '#9c7150',
}: {
  size?: number;
  from?: string;
  to?: string;
}) {
  const id = gid(from, to);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="50" fill={`url(#${id})`} />
    </Svg>
  );
}

/** A rounded-rectangle gradient thumbnail (stand-in for a photo/memory). */
export function GradientThumb({
  width = 46,
  height = 46,
  radius = 11,
  from = '#cdb38f',
  to = '#8a9b7c',
}: {
  width?: number;
  height?: number;
  radius?: number;
  from?: string;
  to?: string;
}) {
  const id = gid(from, to);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} rx={radius} fill={`url(#${id})`} />
    </Svg>
  );
}

export function PlayIcon({ size = 16, color = OW.dark }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5v14l11-7z" fill={color} />
    </Svg>
  );
}

/** Download-to-tray "Save" action. */
export function SaveIcon({ size = 20, color = '#fff', strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4v11M8 11l4 4 4-4M5 20h14" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

/** Paper-plane "Share" action (Unlocked screen). */
export function SharePlaneIcon({ size = 20, color = '#fff', strokeWidth = 1.9 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 4L3 11l7 2 2 7z" stroke={color} strokeWidth={strokeWidth} {...round} />
    </Svg>
  );
}

/** Upload/box "Share" action (Wrapped button). */
export function UploadIcon({ size = 16, color = '#fff', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 16V4M8 8l4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"
        stroke={color}
        strokeWidth={strokeWidth}
        {...round}
      />
    </Svg>
  );
}

/** Donut/ring chart (Wrapped "vibes"). Segments are drawn clockwise from the top. */
export function Donut({
  size = 88,
  thickness = 26,
  segments,
}: {
  size?: number;
  thickness?: number;
  segments: { value: number; color: string }[];
}) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let acc = 0;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s, i) => {
          const len = (s.value / total) * circumference;
          const el = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-acc}
            />
          );
          acc += len;
          return el;
        })}
      </G>
    </Svg>
  );
}
