import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ROUTES, WalkRoute } from '../data/routes';
import ThemeScene from '../illustrations/ThemeScene';
import { Prefs, TIME_OPTIONS, TimeKey, timeBucket } from '../prefs';
import { C, cutShadow, R, tint } from '../theme';
import { itemWidth, useLayout } from '../useLayout';

interface Props {
  prefs: Prefs;
  onSelect: (route: WalkRoute) => void;
  onUpdatePrefs: (prefs: Prefs) => void;
  onEditPrefs: () => void;
}

type TimeFilter = TimeKey | 'all';

const fmtDuration = (min: number) =>
  min >= 60
    ? `${Math.floor(min / 60)}시간${min % 60 ? ` ${min % 60}분` : ''}`
    : `${min}분`;

export default function HomeScreen({
  prefs,
  onSelect,
  onUpdatePrefs,
  onEditPrefs,
}: Props) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(prefs.time);
  const L = useLayout();
  // Percentage widths + gap overflow a wrapping row, so size cards in pixels.
  const cardW = L.cols === 1 ? undefined : itemWidth(L, L.cols);

  const { recommended, others } = useMemo(() => {
    const inTime = (r: WalkRoute) =>
      timeFilter === 'all' || timeBucket(r.durationMin) === timeFilter;
    const rec = ROUTES.filter((r) => prefs.themes.includes(r.theme) && inTime(r));
    const rest = ROUTES.filter((r) => !rec.includes(r) && inTime(r));
    return { recommended: rec, others: rest };
  }, [prefs.themes, timeFilter]);

  const pickTime = (key: TimeFilter) => {
    setTimeFilter(key);
    if (key !== 'all') onUpdatePrefs({ ...prefs, time: key });
  };

  const renderCard = (route: WalkRoute) => (
    <TouchableOpacity
      key={route.id}
      style={[styles.card, cardW != null && { width: cardW }]}
      activeOpacity={0.9}
      onPress={() => onSelect(route)}
    >
      <View style={styles.sceneWrap}>
        <ThemeScene theme={route.theme} height={L.wide ? 128 : 104} />
        <View style={[styles.themeTag, { backgroundColor: route.color }]}>
          <Text style={styles.themeTagTxt}>
            {route.emoji} {route.theme}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.title, L.wide && { fontSize: 20 }]} numberOfLines={2}>
          {route.title}
        </Text>
        <Text style={styles.area}>{route.area}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {route.description}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.pill, { backgroundColor: tint(route.color, 0.16) }]}>
            <Text style={styles.pillTxt}>📏 {route.distanceKm}km</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: tint(route.color, 0.16) }]}>
            <Text style={styles.pillTxt}>⏱ {fmtDuration(route.durationMin)}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: tint(route.color, 0.16) }]}>
            <Text style={styles.pillTxt}>🚩 {route.checkpoints.length}</Text>
          </View>
          <Text style={styles.difficulty}>{route.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const section = (label: string) => (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.sectionRule} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        <View style={[styles.inner, { maxWidth: L.maxW, paddingHorizontal: L.gutter }]}>
          <View style={[styles.header, L.wide && { paddingTop: 48 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appName, L.wide && { fontSize: 36 }]}>워크메이트</Text>
              <Text style={styles.subtitle}>오늘은 어디를 걸어볼까요?</Text>
            </View>
            <TouchableOpacity style={styles.prefBtn} onPress={onEditPrefs} activeOpacity={0.85}>
              <Text style={styles.prefBtnTxt}>취향 설정</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((t) => {
              const on = timeFilter === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, on && styles.chipOn]}
                  activeOpacity={0.85}
                  onPress={() => pickTime(t.key)}
                >
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>
                    {t.emoji} {t.label}
                  </Text>
                  <Text style={[styles.chipSub, on && styles.chipSubOn]}>{t.desc}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.chip, timeFilter === 'all' && styles.chipOn]}
              activeOpacity={0.85}
              onPress={() => pickTime('all')}
            >
              <Text style={[styles.chipTxt, timeFilter === 'all' && styles.chipTxtOn]}>
                🗺 전체
              </Text>
              <Text style={[styles.chipSub, timeFilter === 'all' && styles.chipSubOn]}>
                모든 코스
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        <View style={[styles.inner, { maxWidth: L.maxW, paddingHorizontal: L.gutter }]}>
          {recommended.length > 0 && (
            <>
              {section('맞춤 추천')}
              <View style={[styles.grid, { gap: L.gutter }]}>{recommended.map(renderCard)}</View>
            </>
          )}
          {others.length > 0 && (
            <>
              {section(recommended.length > 0 ? '이런 코스도 있어요' : '이 시간대 코스')}
              <View style={[styles.grid, { gap: L.gutter }]}>{others.map(renderCard)}</View>
            </>
          )}
          {recommended.length === 0 && others.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍃</Text>
              <Text style={styles.emptyTxt}>
                이 시간대에 맞는 코스가 아직 없어요.{'\n'}다른 시간을 골라보세요!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.paper },
  /** header band: full-bleed background, centred content */
  stage: { backgroundColor: C.paper, alignItems: 'center', zIndex: 2 },
  inner: { width: '100%', alignSelf: 'center' },
  scroll: { flex: 1 },
  scrollInner: { alignItems: 'center', paddingBottom: 48 },
  header: {
    paddingTop: 60,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  appName: { color: C.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: C.inkSoft, fontSize: 14, marginTop: 5 },
  prefBtn: {
    backgroundColor: C.card,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...cutShadow(3),
  },
  prefBtnTxt: { color: C.ink, fontSize: 12.5, fontWeight: '800' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingBottom: 16 },
  chip: {
    backgroundColor: C.card,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipOn: { borderColor: C.ink, backgroundColor: '#FFE9B8', ...cutShadow(3) },
  chipTxt: { color: C.inkSoft, fontSize: 13.5, fontWeight: '800' },
  chipTxtOn: { color: C.ink },
  chipSub: { color: C.inkFaint, fontSize: 10.5, marginTop: 2, fontWeight: '600' },
  chipSubOn: { color: C.inkSoft },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 14 },
  sectionTitle: { color: C.ink, fontSize: 15, fontWeight: '800' },
  sectionRule: { flex: 1, height: 2, backgroundColor: C.line, borderRadius: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 2.5,
    borderColor: C.ink,
    overflow: 'hidden',
    ...cutShadow(5),
  },
  sceneWrap: { borderBottomWidth: 2.5, borderBottomColor: C.ink },
  themeTag: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  themeTagTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  cardBody: { padding: 16 },
  title: { color: C.ink, fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  area: { color: C.inkFaint, fontSize: 12, marginTop: 3, fontWeight: '600' },
  description: { color: C.inkSoft, fontSize: 13, lineHeight: 19.5, marginTop: 9 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 },
  pill: { borderRadius: R.pill, paddingHorizontal: 9, paddingVertical: 4.5 },
  pillTxt: { fontSize: 11.5, fontWeight: '700', color: C.ink },
  difficulty: { color: C.inkFaint, fontSize: 11.5, fontWeight: '700', marginLeft: 'auto' },
  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyEmoji: { fontSize: 46 },
  emptyTxt: {
    color: C.inkSoft,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 21,
  },
});
