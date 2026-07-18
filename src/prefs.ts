import AsyncStorage from '@react-native-async-storage/async-storage';

export type TimeKey = 'short' | 'medium' | 'long';

export interface TimeOption {
  key: TimeKey;
  emoji: string;
  label: string;
  desc: string;
}

export const TIME_OPTIONS: TimeOption[] = [
  { key: 'short', emoji: '☕', label: '가볍게', desc: '35분 이하' },
  { key: 'medium', emoji: '🚶', label: '한 시간 안팎', desc: '40분 ~ 1시간 15분' },
  { key: 'long', emoji: '🔥', label: '든든하게', desc: '1시간 반 이상' },
];

export function timeBucket(durationMin: number): TimeKey {
  if (durationMin <= 35) return 'short';
  if (durationMin <= 75) return 'medium';
  return 'long';
}

export interface Prefs {
  themes: string[];
  time: TimeKey;
}

const KEY = 'walkmate.prefs.v1';

export async function loadPrefs(): Promise<Prefs | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Prefs) : null;
  } catch {
    return null;
  }
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // non-fatal: prefs just won't survive an app restart
  }
}
