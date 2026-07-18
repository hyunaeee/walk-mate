import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ROUTES } from '../data/routes';
import ThemeScene from '../illustrations/ThemeScene';
import { Prefs, TIME_OPTIONS, TimeKey } from '../prefs';
import { C, cutShadow, R, tint } from '../theme';
import { itemWidth, useLayout } from '../useLayout';

interface Props {
  initial?: Prefs | null;
  onDone: (prefs: Prefs) => void;
}

interface ThemeItem {
  theme: string;
  emoji: string;
  color: string;
  count: number;
}

export default function OnboardingScreen({ initial, onDone }: Props) {
  const themes = useMemo<ThemeItem[]>(() => {
    const map = new Map<string, ThemeItem>();
    for (const r of ROUTES) {
      const cur = map.get(r.theme);
      if (cur) cur.count++;
      else map.set(r.theme, { theme: r.theme, emoji: r.emoji, color: r.color, count: 1 });
    }
    return [...map.values()];
  }, []);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(initial?.themes ?? []);
  const [time, setTime] = useState<TimeKey | null>(initial?.time ?? null);
  const L = useLayout();
  // pixel widths, not percentages — percentages plus gap overflow the row
  const tileW = itemWidth(L, L.themeCols);

  const toggleTheme = (theme: string) =>
    setSelected((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );

  const allSelected = selected.length === themes.length;

  return (
    <View style={[styles.container, { paddingHorizontal: L.gutter }]}>
      <View style={[styles.inner, { maxWidth: L.maxW }]}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>{step + 1} / 2</Text>
        <View style={styles.stepDots}>
          <View style={[styles.dot, step === 0 && styles.dotActive]} />
          <View style={[styles.dot, step === 1 && styles.dotActive]} />
        </View>
      </View>

      {step === 0 ? (
        <>
          <Text style={[styles.title, L.wide && styles.titleWide]}>
            어떤 산책을{L.wide ? ' ' : '\n'}좋아하세요?
          </Text>
          <Text style={styles.subtitle}>관심 있는 테마를 모두 골라주세요</Text>
          <ScrollView
            contentContainerStyle={[styles.themeGrid, { gap: L.gutter }]}
            showsVerticalScrollIndicator={false}
          >
            {themes.map((t) => {
              const on = selected.includes(t.theme);
              return (
                <TouchableOpacity
                  key={t.theme}
                  style={[styles.themeCard, { width: tileW }, on && styles.themeCardOn]}
                  activeOpacity={0.9}
                  onPress={() => toggleTheme(t.theme)}
                >
                  <View style={styles.themeSceneWrap}>
                    <ThemeScene theme={t.theme} height={L.wide ? 92 : 70} />
                    {on && (
                      <View style={[styles.check, { backgroundColor: t.color }]}>
                        <Text style={styles.checkTxt}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.themeFoot}>
                    <Text style={styles.themeName}>
                      {t.emoji} {t.theme}
                    </Text>
                    <Text style={styles.themeCount}>코스 {t.count}개</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.allBtn}
              activeOpacity={0.8}
              onPress={() => setSelected(allSelected ? [] : themes.map((t) => t.theme))}
            >
              <Text style={styles.allBtnTxt}>
                {allSelected ? '전체 해제' : '✨ 전부 좋아요'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.nextBtn, selected.length === 0 && styles.nextBtnOff]}
              activeOpacity={0.9}
              disabled={selected.length === 0}
              onPress={() => setStep(1)}
            >
              <Text style={[styles.nextTxt, selected.length === 0 && styles.nextTxtOff]}>
                {selected.length === 0 ? '테마를 골라주세요' : `다음 (${selected.length}개 선택)`}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.title, L.wide && styles.titleWide]}>
            얼마나{L.wide ? ' ' : '\n'}걸을까요?
          </Text>
          <Text style={styles.subtitle}>
            평소 산책 시간을 알려주시면 딱 맞는 코스를 추천해요
          </Text>
          <View style={[styles.timeList, L.wide && styles.timeListWide]}>
            {TIME_OPTIONS.map((t) => {
              const on = time === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.timeCard, L.wide && styles.timeCardWide, on && styles.timeCardOn]}
                  activeOpacity={0.9}
                  onPress={() => setTime(t.key)}
                >
                  <View style={[styles.timeEmojiWrap, on && { backgroundColor: tint('#E8913A', 0.22) }]}>
                    <Text style={styles.timeEmoji}>{t.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timeLabel}>{t.label}</Text>
                    <Text style={styles.timeDesc}>{t.desc}</Text>
                  </View>
                  <View style={[styles.radio, on && styles.radioOn]}>
                    {on && <Text style={styles.radioTxt}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.backBtn} activeOpacity={0.85} onPress={() => setStep(0)}>
              <Text style={styles.backTxt}>이전</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, styles.nextBtnFlex, !time && styles.nextBtnOff]}
              activeOpacity={0.9}
              disabled={!time}
              onPress={() => time && onDone({ themes: selected, time })}
            >
              <Text style={[styles.nextTxt, !time && styles.nextTxtOff]}>
                {time ? '산책 시작하기 🚶' : '시간을 골라주세요'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.paper, alignItems: 'center' },
  inner: { flex: 1, width: '100%', alignSelf: 'center' },
  header: {
    paddingTop: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: { color: C.inkFaint, fontSize: 13, fontWeight: '800' },
  stepDots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.paperDeep,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  dotActive: { backgroundColor: '#FFC85C', borderColor: C.ink, width: 24 },
  title: {
    color: C.ink,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 24,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  titleWide: { fontSize: 38, lineHeight: 46, marginTop: 28 },
  subtitle: { color: C.inkSoft, fontSize: 14, marginTop: 8, lineHeight: 20 },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 20,
    paddingBottom: 12,
  },
  themeCard: {
    backgroundColor: C.card,
    borderRadius: R.md,
    borderWidth: 2.5,
    borderColor: C.line,
    overflow: 'hidden',
  },
  themeCardOn: { borderColor: C.ink, ...cutShadow(4) },
  themeSceneWrap: { borderBottomWidth: 2, borderBottomColor: C.line },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  themeFoot: { padding: 11 },
  themeName: { color: C.ink, fontSize: 14.5, fontWeight: '800' },
  themeCount: { color: C.inkFaint, fontSize: 11, marginTop: 2, fontWeight: '600' },
  allBtn: { width: '100%', alignItems: 'center', paddingVertical: 10 },
  allBtnTxt: { color: '#C97A2B', fontSize: 14, fontWeight: '800' },
  // marginTop:'auto' keeps the buttons pinned to the bottom now that the
  // time list above is content-sized rather than flex-grown
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 34,
    paddingTop: 8,
    marginTop: 'auto',
  },
  nextBtn: {
    flex: 1,
    backgroundColor: '#FFC85C',
    borderRadius: R.pill,
    borderWidth: 2.5,
    borderColor: C.ink,
    paddingVertical: 15,
    alignItems: 'center',
    ...cutShadow(4),
  },
  nextBtnFlex: { flex: 1 },
  nextBtnOff: {
    backgroundColor: C.paperDeep,
    borderColor: C.line,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextTxt: { color: C.ink, fontSize: 16, fontWeight: '800' },
  nextTxtOff: { color: C.inkFaint },
  // no `flex` here on purpose: RN(-web)'s `flex: 0` shorthand sets
  // flex-basis to 0%, which collapses the container to zero height and the
  // cards spill over the buttons below. Content-sized is what we want; the
  // bottom bar anchors itself with marginTop:'auto' instead.
  timeList: { gap: 12, marginTop: 24 },
  /** side-by-side cards on desktop instead of one tall stack */
  timeListWide: { flexDirection: 'row', gap: 16 },
  timeCardWide: { flex: 1, flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 20 },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: C.card,
    borderRadius: R.md,
    borderWidth: 2.5,
    borderColor: C.line,
    padding: 15,
  },
  timeCardOn: { borderColor: C.ink, backgroundColor: '#FFF6E2', ...cutShadow(4) },
  timeEmojiWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeEmoji: { fontSize: 22 },
  timeLabel: { color: C.ink, fontSize: 17, fontWeight: '800' },
  timeDesc: { color: C.inkSoft, fontSize: 12.5, marginTop: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: C.ink, backgroundColor: '#FFC85C' },
  radioTxt: { color: C.ink, fontSize: 12, fontWeight: '900' },
  backBtn: {
    backgroundColor: C.card,
    borderRadius: R.pill,
    borderWidth: 2.5,
    borderColor: C.ink,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...cutShadow(4),
  },
  backTxt: { color: C.ink, fontSize: 15, fontWeight: '800' },
});
