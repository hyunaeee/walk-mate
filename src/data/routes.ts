import { BAKED } from './paths';

export interface Checkpoint {
  name: string;
  description: string;
  coord: [number, number]; // [lng, lat]
  points: number;
  /**
   * false = point of interest only: shown on the map and scored, but NOT
   * used as a routing waypoint (avoids forced out-and-back detours).
   * Defaults to true.
   */
  via?: boolean;
}

export interface WalkRoute {
  id: string;
  theme: string;
  emoji: string;
  title: string;
  area: string;
  description: string;
  color: string;
  distanceKm: number;
  durationMin: number;
  difficulty: '쉬움' | '보통' | '조금 힘듦';
  path: [number, number][]; // [lng, lat]
  checkpoints: Checkpoint[];
}

// Hand-placed anchors (start / checkpoints / end). The real walkable
// geometry is baked into paths.ts by scripts/fetch-paths.ts (OSRM foot
// routing) and merged below.
export const RAW_ROUTES: WalkRoute[] = [
  {
    id: 'yeouido-cherry',
    theme: '벚꽃길',
    emoji: '🌸',
    title: '여의도 윤중로 벚꽃 산책',
    area: '영등포구 여의도동',
    description:
      '국회의사당 뒤편 윤중로를 따라 이어지는 서울 대표 벚꽃 터널. 봄이 아니어도 한강과 서강대교 풍경이 시원하게 펼쳐집니다.',
    color: '#FF7EB6',
    distanceKm: 2.6,
    durationMin: 40,
    difficulty: '쉬움',
    // anchors taken from OSM way nodes of 여의서로 (the cherry-blossom road)
    path: [
      [126.9171, 37.522],
      [126.9136, 37.5269],
      [126.9125, 37.5294],
      [126.9182, 37.533],
      [126.9295, 37.5291],
    ],
    checkpoints: [
      {
        name: '벚꽃터널 입구',
        description: '국회 뒤편 윤중로 벚꽃길의 시작점',
        coord: [126.9136, 37.5269],
        points: 100,
      },
      {
        name: '윤중로 포토스팟',
        description: '벚꽃 아치가 가장 빽빽한 구간',
        coord: [126.9125, 37.5294],
        points: 150,
      },
      {
        name: '서강대교 전망 포인트',
        description: '한강 너머 서강대교와 밤섬이 보이는 곳',
        coord: [126.9182, 37.533],
        points: 150,
      },
      {
        name: '여의도한강공원 진입로',
        description: '한강공원으로 이어지는 골인 지점',
        coord: [126.9295, 37.5291],
        points: 200,
      },
    ],
  },
  {
    id: 'banpo-night',
    theme: '한강 야경',
    emoji: '🌉',
    title: '반포 달빛 야경 산책',
    area: '서초구 반포동',
    description:
      '동작대교에서 잠수교까지 한강 남쪽 물가를 따라 걷는 야경 코스. 세빛섬의 불빛과 반포대교 달빛무지개분수가 하이라이트.',
    color: '#5B8DEF',
    distanceKm: 3.1,
    durationMin: 50,
    difficulty: '쉬움',
    // anchors taken from OSM riverside footway/cycleway nodes in Banpo park
    path: [
      [126.9868, 37.5082],
      [126.9949, 37.5117],
      [126.9979, 37.5092],
      [127.003, 37.5145],
    ],
    checkpoints: [
      {
        name: '동작대교 전망',
        description: '노을과 야경이 겹치는 출발 포인트',
        coord: [126.9868, 37.5082],
        points: 100,
      },
      {
        name: '세빛섬',
        description: '한강 위에 떠 있는 빛나는 세 개의 섬',
        coord: [126.9949, 37.5117],
        points: 150,
      },
      {
        name: '달빛무지개분수',
        description: '반포대교에서 쏟아지는 무지개 분수쇼',
        coord: [126.9979, 37.5092],
        points: 200,
        via: false,
      },
      {
        name: '잠수교 포토존',
        description: '수면 바로 위에서 강을 건너는 다리',
        coord: [127.003, 37.5145],
        points: 150,
      },
    ],
  },
  {
    id: 'bukchon-alley',
    theme: '골목 투어',
    emoji: '🏘️',
    title: '북촌 한옥마을 골목 한 바퀴',
    area: '종로구 가회동·삼청동',
    description:
      '안국역에서 출발해 가회동 한옥 골목과 북촌8경을 지나 삼청동 카페거리로 내려오는 순환 코스. 오르막이 있지만 골목마다 풍경이 바뀝니다.',
    color: '#F2A65A',
    distanceKm: 2.2,
    durationMin: 45,
    difficulty: '보통',
    path: [
      [126.9849, 37.576],
      [126.9847, 37.5775],
      [126.9843, 37.579],
      [126.9838, 37.5805],
      [126.9836, 37.582],
      [126.9841, 37.5833],
      [126.9829, 37.584],
      [126.9816, 37.5843],
      [126.9805, 37.5833],
      [126.98, 37.5818],
      [126.9799, 37.5803],
      [126.9805, 37.5788],
      [126.9815, 37.5775],
      [126.983, 37.5765],
      [126.9849, 37.576],
    ],
    checkpoints: [
      {
        name: '북촌문화센터',
        description: '한옥마을 여행의 안내소이자 첫 관문',
        coord: [126.9843, 37.579],
        points: 100,
      },
      {
        name: '북촌8경 포토스팟',
        description: '기와지붕 너머 서울 도심이 내려다보이는 언덕',
        coord: [126.9841, 37.5833],
        points: 200,
      },
      {
        name: '삼청동 카페거리',
        description: '골목을 내려오면 만나는 갤러리와 카페들',
        coord: [126.9799, 37.5803],
        points: 150,
      },
      {
        name: '안국역 복귀',
        description: '한 바퀴를 완성하는 골인 지점',
        coord: [126.9849, 37.576],
        points: 150,
      },
    ],
  },
  {
    id: 'cheonggye-stream',
    theme: '도심 물길',
    emoji: '💧',
    title: '청계천 물길 따라 걷기',
    area: '종로구·중구',
    description:
      '청계광장에서 동대문까지 도심 한복판의 물길을 따라 걷는 코스. 다리 하나하나에 이야기가 있고, 여름밤엔 특히 시원합니다.',
    color: '#38BDF8',
    distanceKm: 3.4,
    durationMin: 55,
    difficulty: '쉬움',
    path: [
      [126.9779, 37.5693],
      [126.981, 37.5691],
      [126.984, 37.5689],
      [126.987, 37.5689],
      [126.99, 37.569],
      [126.993, 37.5692],
      [126.996, 37.5694],
      [126.999, 37.5696],
      [127.002, 37.5698],
      [127.005, 37.57],
      [127.0075, 37.5701],
    ],
    checkpoints: [
      {
        name: '청계광장 분수',
        description: '물길이 시작되는 캔들 분수',
        coord: [126.9779, 37.5693],
        points: 100,
      },
      {
        name: '광통교',
        description: '조선시대 돌다리를 복원한 구간',
        coord: [126.984, 37.5689],
        points: 150,
      },
      {
        name: '수표교 터',
        description: '물 높이를 재던 수표가 있던 자리',
        coord: [126.993, 37.5692],
        points: 150,
      },
      {
        name: '오간수교',
        description: '흥인지문(동대문)이 보이는 골인 지점',
        coord: [127.0075, 37.5701],
        points: 200,
      },
    ],
  },
  {
    id: 'namsan-forest',
    theme: '숲길',
    emoji: '🌲',
    title: '남산 북측순환로 숲 산책',
    area: '중구 남산공원',
    description:
      '국립극장에서 케이블카 승강장까지 차 없는 순환로를 걷는 코스. 숲 그늘이 이어지고 중간중간 도심 전망이 열립니다.',
    color: '#34D399',
    distanceKm: 3.0,
    durationMin: 55,
    difficulty: '보통',
    path: [
      [126.9999, 37.5529],
      [126.995, 37.554],
      [126.9883, 37.5553],
      [126.9841, 37.5567],
    ],
    checkpoints: [
      {
        name: '국립극장 출발점',
        description: '순환로가 시작되는 남산 동쪽 입구',
        coord: [126.9999, 37.5529],
        points: 100,
      },
      {
        name: '도심 전망 데크',
        description: '나무 사이로 서울 도심이 내려다보이는 곳',
        coord: [126.995, 37.554],
        points: 150,
      },
      {
        name: '와룡묘 갈림길',
        description: '숲이 가장 깊어지는 구간',
        coord: [126.9883, 37.5553],
        points: 150,
      },
      {
        name: '케이블카 승강장',
        description: 'N서울타워로 이어지는 골인 지점',
        coord: [126.9841, 37.5567],
        points: 200,
      },
    ],
  },
  {
    id: 'naksan-fortress',
    theme: '성곽길',
    emoji: '🏯',
    title: '낙산 한양도성 성곽 산책',
    area: '종로구 이화동·창신동',
    description:
      '혜화역에서 낙산공원에 올라 한양도성 성곽을 따라 흥인지문까지 내려오는 코스. 해 질 무렵 성벽 너머 야경이 압권입니다.',
    color: '#F59E0B',
    distanceKm: 2.3,
    durationMin: 45,
    difficulty: '보통',
    path: [
      [127.0019, 37.5822],
      [127.0038, 37.5818],
      [127.0057, 37.5813],
      [127.0072, 37.5808],
      [127.0082, 37.5798],
      [127.0087, 37.5785],
      [127.0089, 37.5771],
      [127.009, 37.5757],
      [127.0091, 37.5743],
      [127.0092, 37.5728],
      [127.0093, 37.5713],
    ],
    checkpoints: [
      {
        name: '낙산공원 입구',
        description: '혜화역에서 오르막을 지나 만나는 공원 입구',
        coord: [127.0072, 37.5808],
        points: 100,
      },
      {
        name: '낙산 정상 전망대',
        description: '서울 시내가 한눈에 들어오는 성곽 위 전망',
        coord: [127.0082, 37.5798],
        points: 200,
      },
      {
        name: '성곽 포토스팟',
        description: '성벽과 야경을 함께 담는 인생샷 구간',
        coord: [127.0089, 37.5771],
        points: 150,
      },
      {
        name: '흥인지문',
        description: '보물 제1호 동대문에서 마무리',
        coord: [127.0093, 37.5713],
        points: 200,
      },
    ],
  },
  {
    id: 'gyeongui-line',
    theme: '철길 공원',
    emoji: '🚃',
    title: '경의선숲길 연트럴파크 종주',
    area: '마포구 연남동→공덕동',
    description:
      '옛 경의선 철길을 통째로 공원으로 만든 길. 연남동 잔디밭에서 시작해 홍대, 서강대 책거리를 지나 공덕까지 도심을 가로지릅니다.',
    color: '#A3E635',
    distanceKm: 4.5,
    durationMin: 60,
    difficulty: '보통',
    path: [
      [126.916, 37.5665],
      [126.9205, 37.561],
      [126.9237, 37.5568],
      [126.9357, 37.5519],
      [126.9515, 37.5445],
    ],
    checkpoints: [
      {
        name: '연트럴파크 잔디밭',
        description: '피크닉 인파로 가득한 연남동 구간',
        coord: [126.9205, 37.561],
        points: 100,
      },
      {
        name: '홍대입구역',
        description: '숲길이 도심과 만나는 교차점',
        coord: [126.9237, 37.5568],
        points: 150,
      },
      {
        name: '경의선책거리',
        description: '철길 옆 책방과 조형물이 이어지는 구간',
        coord: [126.9357, 37.5519],
        points: 150,
      },
      {
        name: '공덕 골인',
        description: '숲길의 끝, 공덕역 도착',
        coord: [126.9515, 37.5445],
        points: 200,
      },
    ],
  },
  {
    id: 'hangang-longwalk',
    theme: '롱워크',
    emoji: '🏞️',
    title: '한강 종주 롱워크 (여의도→반포)',
    area: '영등포구→서초구',
    description:
      '여의도한강공원에서 반포 잠수교까지 한강 남쪽 둔치를 쭉 걷는 2시간 코스. 63빌딩, 노들섬, 동작대교, 세빛섬을 차례로 지나갑니다.',
    color: '#F97316',
    distanceKm: 9.0,
    durationMin: 120,
    difficulty: '조금 힘듦',
    path: [
      [126.9338, 37.5322],
      [126.9415, 37.5215],
      [126.9585, 37.5128],
      [126.9868, 37.5082],
      [127.003, 37.5145],
    ],
    checkpoints: [
      {
        name: '63빌딩 앞 둔치',
        description: '황금빛 63빌딩을 올려다보는 구간',
        coord: [126.9415, 37.5215],
        points: 150,
      },
      {
        name: '노들섬 전망',
        description: '한강대교 아래 음악섬 노들섬이 보이는 곳',
        coord: [126.9585, 37.5128],
        points: 150,
      },
      {
        name: '동작대교 전망',
        description: '중간 반환점, 잠시 쉬어가기 좋은 곳',
        coord: [126.9868, 37.5082],
        points: 150,
      },
      {
        name: '세빛섬',
        description: '반포의 빛나는 세 개의 섬',
        coord: [126.9949, 37.5117],
        points: 150,
        via: false,
      },
      {
        name: '잠수교 골인',
        description: '수면 위 잠수교에서 마무리',
        coord: [127.003, 37.5145],
        points: 250,
      },
    ],
  },
];

// Merge the baked OSRM geometry over the hand-placed anchors. Falls back
// to the raw anchor polyline for any route not yet baked.
export const ROUTES: WalkRoute[] = RAW_ROUTES.map((route) => {
  const baked = BAKED[route.id];
  if (!baked) return route;
  return {
    ...route,
    path: baked.path,
    distanceKm: Math.round(baked.distanceM / 100) / 10,
    durationMin: Math.round((baked.distanceM / 1000 / 4.5) * 60 / 5) * 5,
    checkpoints: route.checkpoints.map((cp, i) => ({
      ...cp,
      coord: baked.checkpoints[i] ?? cp.coord,
    })),
  };
});
