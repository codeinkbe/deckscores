import { Platform } from 'react-native';

export const Palette = {
  blueDark: '#1e6db3',
  blueMid: '#5fa9d6',
  blueLight: '#bfdcec',
  blueVeryLight: '#e5f1f7',
  white: '#ffffff',
  black: '#0a0d12',
  greyDark: '#3d4148',
  greyMid: '#7a8089',
  greyLight: '#d3d6db',
  greyVeryLight: '#f1f3f6',
  greenAction: '#1cb05a',
  greenSoft: '#9be7b9',
  redAction: '#f04444',
  pinkAccent: '#ff62a8',
  hartRed: '#e0152b',
  ruitenRed: '#e0152b',
  klaverBlack: '#0a0d12',
  schoppenBlack: '#0a0d12',
} as const;

const tintColorLight = Palette.blueDark;
const tintColorDark = Palette.white;

export const Colors = {
  light: {
    text: Palette.black,
    textMuted: Palette.greyMid,
    background: Palette.white,
    surface: Palette.greyVeryLight,
    border: Palette.greyLight,
    tint: tintColorLight,
    icon: Palette.greyMid,
    tabIconDefault: Palette.greyMid,
    tabIconSelected: tintColorLight,
    primary: Palette.blueDark,
    primarySoft: Palette.blueLight,
    success: Palette.greenAction,
    successSoft: Palette.greenSoft,
    danger: Palette.redAction,
    accent: Palette.pinkAccent,
  },
  dark: {
    text: '#ECEDEE',
    textMuted: Palette.greyLight,
    background: '#151718',
    surface: '#1f2225',
    border: Palette.greyDark,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: Palette.blueMid,
    primarySoft: Palette.blueDark,
    success: Palette.greenAction,
    successSoft: Palette.greenSoft,
    danger: Palette.redAction,
    accent: Palette.pinkAccent,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const Typography = {
  title: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
  heading: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  subheading: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
