import { Platform, ViewStyle } from 'react-native';

/**
 * "종이 위의 산책" — a warm storybook-illustration look.
 * Cream paper, soft ink outlines, and sticker-like cards with a solid
 * offset shadow (no blur) so everything reads as cut paper.
 */
export const C = {
  paper: '#F7EFE1',      // page background
  paperDeep: '#EFE3CF',  // recessed areas
  card: '#FFFCF6',       // card surface
  ink: '#3B322A',        // primary text / outlines
  inkSoft: '#7C6F62',    // secondary text
  inkFaint: '#B3A695',   // tertiary text / disabled
  line: '#E0D2BA',       // hairlines
  night: '#2A3350',      // dark surfaces (map overlays)
  nightSoft: '#4A5573',
} as const;

/** Theme accent colors — kept in sync with route.color, used for tinting. */
export const tint = (hex: string, alpha: number) => {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
};

/**
 * Cut-paper shadow: a hard offset shadow with no blur.
 * RN's shadow* props don't render a zero-blur shadow on Android, and
 * elevation always blurs, so web/iOS get the crisp version and Android
 * falls back to a subtle elevation.
 */
export const cutShadow = (offset = 4, color = '#2B2118'): ViewStyle =>
  Platform.select<ViewStyle>({
    android: { elevation: 3 },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offset },
      shadowOpacity: 0.18,
      shadowRadius: 0,
    },
  })!;

export const R = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;
