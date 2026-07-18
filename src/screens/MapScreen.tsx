import React, { useMemo, useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapCanvas, { MapCanvasHandle } from '../components/MapCanvas';
import type { WalkRoute } from '../data/routes';
import ThemeScene from '../illustrations/ThemeScene';
import { buildMapHtml } from '../map/mapHtml';
import { C, cutShadow, R } from '../theme';
import { useLayout } from '../useLayout';

interface Props {
  route: WalkRoute;
  onBack: () => void;
}

interface Toast {
  name: string;
  description: string;
  points: number;
}

const SPEEDS = [12, 24, 48];

export default function MapScreen({ route, onBack }: Props) {
  const mapRef = useRef<MapCanvasHandle>(null);
  const html = useMemo(() => buildMapHtml(route), [route]);
  const L = useLayout();
  // the map fills the window; the chrome stays a comfortable reading width
  const barW = Math.min(L.vw - 28, 900);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [walkedM, setWalkedM] = useState(0);
  const [points, setPoints] = useState(0);
  const [visitedCount, setVisitedCount] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [camera, setCamera] = useState<'follow' | 'overview'>('overview');
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendCmd = (cmd: object) => {
    mapRef.current?.sendCmd(cmd);
  };

  const onMessage = (msg: any) => {
    switch (msg.type) {
      case 'ready':
        setReady(true);
        break;
      case 'progress':
        setProgress(msg.pct);
        setWalkedM(msg.walkedM);
        break;
      case 'checkpoint':
        setPoints((p) => p + msg.points);
        setVisitedCount((c) => c + 1);
        setToast({ name: msg.name, description: msg.description, points: msg.points });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3500);
        break;
      case 'complete':
        setPlaying(false);
        setFinished(true);
        break;
    }
  };

  const togglePlay = () => {
    if (playing) {
      sendCmd({ type: 'pause' });
      setPlaying(false);
    } else {
      sendCmd({ type: 'start' });
      setPlaying(true);
      setCamera('follow');
    }
  };

  const toggleCamera = () => {
    const next = camera === 'follow' ? 'overview' : 'follow';
    setCamera(next);
    sendCmd({ type: 'setCamera', mode: next });
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    sendCmd({ type: 'setSpeed', value: SPEEDS[next] });
  };

  const reset = () => {
    sendCmd({ type: 'reset' });
    setPlaying(false);
    setFinished(false);
    setProgress(0);
    setWalkedM(0);
    setPoints(0);
    setVisitedCount(0);
    setCamera('overview');
    setToast(null);
  };

  return (
    <View style={styles.container}>
      <MapCanvas ref={mapRef} html={html} onMessage={onMessage} />

      {/* top bar */}
      <View style={[styles.topBar, { width: barW }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={styles.routeTitle} numberOfLines={1}>
            {route.emoji} {route.title}
          </Text>
          <Text style={styles.routeMeta}>
            {(walkedM / 1000).toFixed(2)}km / {route.distanceKm}km · 🚩{' '}
            {visitedCount}/{route.checkpoints.length}
          </Text>
        </View>
        <View style={[styles.pointsChip, { backgroundColor: route.color }]}>
          <Text style={styles.pointsTxt}>⭐ {points}</Text>
        </View>
      </View>

      {/* progress bar */}
      <View style={[styles.progressWrap, { width: barW }]}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(progress * 100)}%`, backgroundColor: route.color },
            ]}
          />
        </View>
      </View>

      {/* checkpoint toast */}
      {toast && (
        <View style={[styles.toast, { width: Math.min(barW, 520) }]}>
          <View style={[styles.toastFlag, { backgroundColor: route.color }]}>
            <Text style={styles.toastFlagTxt}>🚩</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>
              {toast.name}{'  '}
              <Text style={{ color: '#C97A2B' }}>+{toast.points}P</Text>
            </Text>
            <Text style={styles.toastDesc}>{toast.description}</Text>
          </View>
        </View>
      )}

      {/* bottom controls */}
      <View style={[styles.bottomBar, { width: Math.min(barW, 560) }]}>
        <TouchableOpacity style={styles.subBtn} onPress={toggleCamera}>
          <Text style={styles.subBtnTxt}>
            {camera === 'follow' ? '🗺 전체' : '🎥 따라가기'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: route.color }]}
          onPress={togglePlay}
          disabled={!ready || finished}
        >
          <Text style={styles.playTxt}>
            {!ready ? '지도 로딩중…' : playing ? '⏸ 일시정지' : '▶ 걷기 시작'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subBtn} onPress={cycleSpeed}>
          <Text style={styles.subBtnTxt}>⚡ x{SPEEDS[speedIdx]}</Text>
        </TouchableOpacity>
      </View>

      {/* completion modal */}
      <Modal visible={finished} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalScene}>
              <ThemeScene theme={route.theme} height={104} />
              <View style={styles.modalBadge}>
                <Text style={styles.modalEmoji}>🎉</Text>
              </View>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>산책 완주!</Text>
              <Text style={styles.modalDesc}>
                {route.title} {route.distanceKm}km를 모두 걸었어요
              </Text>
              <View style={styles.modalPoints}>
                <Text style={styles.modalPointsTxt}>⭐ 총 {points} 포인트 획득</Text>
              </View>
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.modalBtn} onPress={reset} activeOpacity={0.9}>
                  <Text style={styles.modalBtnTxt}>다시 걷기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnGhost]}
                  onPress={onBack}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modalBtnTxt}>목록으로</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.paper },
  topBar: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.card,
    borderWidth: 2.5,
    borderColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...cutShadow(3),
  },
  backTxt: { color: C.ink, fontSize: 26, fontWeight: '800', marginTop: -4 },
  titleBox: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: R.md,
    borderWidth: 2.5,
    borderColor: C.ink,
    paddingHorizontal: 13,
    paddingVertical: 8,
    ...cutShadow(3),
  },
  routeTitle: { color: C.ink, fontSize: 14, fontWeight: '800' },
  routeMeta: { color: C.inkSoft, fontSize: 11.5, marginTop: 2, fontWeight: '600' },
  pointsChip: {
    borderRadius: R.md,
    borderWidth: 2.5,
    borderColor: C.ink,
    paddingHorizontal: 11,
    paddingVertical: 13,
    ...cutShadow(3),
  },
  pointsTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  progressWrap: { position: 'absolute', top: 108, alignSelf: 'center' },
  progressBg: {
    height: 12,
    borderRadius: R.pill,
    backgroundColor: C.card,
    borderWidth: 2.5,
    borderColor: C.ink,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: R.pill },
  toast: {
    position: 'absolute',
    top: 132,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: R.md,
    borderWidth: 2.5,
    borderColor: C.ink,
    padding: 13,
    ...cutShadow(4),
  },
  toastFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastFlagTxt: { fontSize: 18 },
  toastTitle: { color: C.ink, fontSize: 15, fontWeight: '800' },
  toastDesc: { color: C.inkSoft, fontSize: 12.5, marginTop: 3 },
  bottomBar: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  playBtn: {
    flex: 1,
    borderRadius: R.pill,
    borderWidth: 2.5,
    borderColor: C.ink,
    paddingVertical: 15,
    alignItems: 'center',
    ...cutShadow(4),
  },
  playTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  subBtn: {
    backgroundColor: C.card,
    borderRadius: R.pill,
    borderWidth: 2.5,
    borderColor: C.ink,
    paddingVertical: 13,
    paddingHorizontal: 14,
    ...cutShadow(4),
  },
  subBtnTxt: { color: C.ink, fontSize: 13, fontWeight: '800' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(43,33,24,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: C.card,
    borderRadius: R.lg,
    borderWidth: 2.5,
    borderColor: C.ink,
    overflow: 'hidden',
    ...cutShadow(6),
  },
  modalScene: {
    borderBottomWidth: 2.5,
    borderBottomColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBadge: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.card,
    borderWidth: 2.5,
    borderColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...cutShadow(3),
  },
  modalEmoji: { fontSize: 30 },
  modalBody: { padding: 24, alignItems: 'center' },
  modalTitle: { color: C.ink, fontSize: 24, fontWeight: '800' },
  modalDesc: {
    color: C.inkSoft,
    fontSize: 13.5,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalPoints: {
    borderRadius: R.pill,
    backgroundColor: '#FFE9B8',
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginTop: 16,
  },
  modalPointsTxt: { fontSize: 15.5, fontWeight: '800', color: C.ink },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20, alignSelf: 'stretch' },
  modalBtn: {
    flex: 1,
    borderRadius: R.pill,
    borderWidth: 2.5,
    borderColor: C.ink,
    backgroundColor: '#FFC85C',
    paddingVertical: 13,
    alignItems: 'center',
    ...cutShadow(3),
  },
  modalBtnGhost: { backgroundColor: C.card },
  modalBtnTxt: { color: C.ink, fontWeight: '800', fontSize: 14.5 },
});
