import { Platform, useWindowDimensions } from 'react-native';

/**
 * The app started life phone-only; on a desktop browser that meant one
 * 400px-wide column of cards stretched across a 1400px window. These
 * breakpoints drive a real multi-column layout instead.
 */
export interface Layout {
  /** viewport width, guarded against the 0 that RNW can report */
  vw: number;
  /** card columns for the route list */
  cols: number;
  /** columns for the onboarding theme grid */
  themeCols: number;
  /** width the content is capped at, centred in the window */
  maxW: number;
  /** true from tablet width up — bigger type, roomier padding */
  wide: boolean;
  /** true on a real desktop window */
  desktop: boolean;
  gutter: number;
}

/**
 * react-native-web derives window width from `visualViewport`, which reports 0
 * in some embedded/offscreen contexts (and briefly before first layout). A 0
 * width would collapse every max-width to zero, so fall back to the real
 * viewport before deciding a breakpoint.
 */
function useViewportWidth(): number {
  const { width } = useWindowDimensions();
  if (width > 0) return width;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.innerWidth || document.documentElement.clientWidth || 390;
  }
  return 390;
}

export function useLayout(): Layout {
  const width = useViewportWidth();

  if (width < 700) {
    return { vw: width, cols: 1, themeCols: 2, maxW: width, wide: false, desktop: false, gutter: 18 };
  }
  if (width < 1060) {
    return { vw: width, cols: 2, themeCols: 3, maxW: 720, wide: true, desktop: false, gutter: 22 };
  }
  if (width < 1440) {
    return { vw: width, cols: 3, themeCols: 4, maxW: 1080, wide: true, desktop: true, gutter: 26 };
  }
  return { vw: width, cols: 4, themeCols: 4, maxW: 1360, wide: true, desktop: true, gutter: 28 };
}

/** Width of one grid item, in px, so a wrapping row lands exactly on `cols`. */
export function itemWidth(L: Layout, cols: number): number {
  const content = Math.min(L.vw, L.maxW) - L.gutter * 2;
  return (content - L.gutter * (cols - 1)) / cols;
}
