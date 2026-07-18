# 🚶 워크메이트 (walk-mate)

한국 지도 기반 테마별 산책 경로 앱. 첫 실행 시 온보딩에서 **좋아하는 테마**(벚꽃길·한강 야경·골목 투어·도심 물길·숲길·성곽길·철길 공원·롱워크)와
**산책 시간대**(35분 이하 / 1시간 안팎 / 1시간 반 이상)를 고르면 맞춤 코스를 추천하고,
기울어진 3D 지도 위에서 캐릭터가 실제 보행로를 따라 걸어가는 **게임 길찾기 스타일**로 코스를 미리 볼 수 있습니다.

## 실행

### 웹 브라우저 (가장 간단 — 설치할 앱 없음)

```bash
npm install
npm run web           # 브라우저에서 http://localhost:8081 열기
```

같은 코드가 브라우저에서 그대로 돌아갑니다. 온보딩·추천·3D 지도·게임 오버레이 모두 동일합니다.

### 휴대폰 (Expo Go)

```bash
npx expo start        # 폰과 컴퓨터가 같은 와이파이일 때
npm run dev:tunnel    # 폰과 컴퓨터가 다른 네트워크일 때 (원격 서버 개발 등)
```

휴대폰에 [Expo Go](https://expo.dev/go)를 설치하고 터미널의 QR 코드를 스캔하면 실행됩니다.

> **SDK 버전 주의**: 이 프로젝트는 **Expo SDK 55**로 고정돼 있습니다. Expo Go는 특정 SDK 버전만
> 실행할 수 있어서, 스토어의 Expo Go가 지원하는 버전과 어긋나면 "Project is incompatible with
> this version of Expo Go"가 뜹니다. SDK를 올리기 전에 폰의 Expo Go 지원 버전을 먼저 확인하세요.
>
> `expo start --tunnel`(공용 ngrok)은 [Expo 측 과부하](https://github.com/expo/expo/issues/43335)로 실패할 수 있어
> `npm run dev:tunnel`(Cloudflare 무료 터널) 스크립트를 대신 씁니다. 가입 없이 동작하며
> 실행할 때마다 새 `exps://….trycloudflare.com` 주소의 QR이 출력됩니다.

## 구조

| 경로 | 역할 |
| --- | --- |
| [App.tsx](App.tsx) | 온보딩 ↔ 홈 ↔ 지도 화면 전환 |
| [src/screens/OnboardingScreen.tsx](src/screens/OnboardingScreen.tsx) | 테마·시간대 선택 온보딩 (AsyncStorage에 저장) |
| [src/prefs.ts](src/prefs.ts) | 취향 저장/로드, 시간 버킷 정의 |
| [src/theme.ts](src/theme.ts) | 디자인 토큰 — 종이 팔레트, 잉크 색, 컷아웃 그림자, 라운드 값 |
| [src/useLayout.ts](src/useLayout.ts) | 반응형 브레이크포인트 — 폭에 따라 카드 열 수·최대 폭·여백 결정 |
| [src/illustrations/ThemeScene.tsx](src/illustrations/ThemeScene.tsx) | 테마별 일러스트(assets/scenes의 webp)를 테마 이름으로 매핑 |
| [assets/scenes/](assets/scenes/) | Higgsfield로 생성한 테마 일러스트 8장 + 생성 프롬프트 기록([scenes.md](assets/scenes/scenes.md)) |
| [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx) | 맞춤 추천 + 시간 필터 칩 + 전체 코스 목록 |
| [src/screens/MapScreen.tsx](src/screens/MapScreen.tsx) | 지도 + 게임 오버레이(포인트·진행률·체크포인트 토스트·완주 모달) |
| [src/components/MapCanvas.tsx](src/components/MapCanvas.tsx) | 네이티브용 지도 컨테이너 (react-native-webview) |
| [src/components/MapCanvas.web.tsx](src/components/MapCanvas.web.tsx) | 웹용 지도 컨테이너 (iframe). Metro가 웹 빌드에서 자동 선택 |
| [src/map/mapHtml.ts](src/map/mapHtml.ts) | 지도 페이지 HTML (3D 건물, 경로 라인, 캐릭터 애니메이션, 추적 카메라) |
| [src/data/routes.ts](src/data/routes.ts) | 코스 정의(앵커 좌표 + 체크포인트) 및 베이킹 결과 병합 |
| [src/data/paths.ts](src/data/paths.ts) | **자동 생성** — OSRM으로 스냅된 실제 보행 경로 |

## 디자인

**"종이 위의 산책"** — 크림색 종이 배경 위에 잉크 테두리(2.5px)와 컷아웃 그림자(블러 없는 오프셋)를
얹어 오려 붙인 종이처럼 보이게 했습니다. 색·그림자·라운드 값은 모두 [src/theme.ts](src/theme.ts)에 있습니다.

테마별 일러스트는 **Higgsfield(Recraft V4.1)로 생성한 동화책 스타일 장면 8장**입니다
(벚꽃 터널, 한강 야경, 북촌 한옥 골목, 청계천, 남산 숲길, 낙산 성곽, 경의선숲길, 한강 롱워크).
webp로 [assets/scenes/](assets/scenes/)에 저장하고 [ThemeScene](src/illustrations/ThemeScene.tsx)이
테마 이름으로 매핑합니다. 새 테마를 추가하거나 다시 그릴 때는
[assets/scenes/scenes.md](assets/scenes/scenes.md)의 공통 스타일 프롬프트를 그대로 쓰세요.

### 반응형

[useLayout](src/useLayout.ts)이 창 폭에 따라 카드 열 수를 바꿉니다: 모바일 1열 → 태블릿 2열 →
데스크톱 3~4열. 콘텐츠는 최대 폭(최대 1360px)에서 가운데 정렬됩니다. 웹에서 한 컬럼이
넓은 창을 가로지르던 문제를 이걸로 해결했습니다.

> **주의**: react-native-web은 창 폭을 `visualViewport`에서 읽는데, 일부 환경(임베드/오프스크린,
> 첫 레이아웃 직전)에서 0을 보고합니다. 0이면 모든 max-width가 0으로 무너지므로
> `useLayout`이 `window.innerWidth`로 폴백합니다.

## 지도 · 경로 데이터

- 타일/스타일: [OpenFreeMap](https://openfreemap.org) `liberty` (API 키 불필요, 3D 건물 포함)
- 경로 스냅: OSRM 도보 라우팅 공개 서버 (OpenStreetMap 데이터)

코스 앵커(`routes.ts`의 `RAW_ROUTES`)를 수정했다면 경로를 다시 구우세요:

```bash
npm run bake-paths   # src/data/paths.ts 재생성
```

베이킹 시 안전장치가 걸려 있습니다:
- 앵커가 보행로에서 **100m 이상** 떨어져 있으면 실패합니다 (엉뚱한 길로 우회하는 것 방지).
  OSRM `nearest` API로 근처 보행로 좌표를 찾아 앵커를 옮기세요.
- 구간이 직선 거리 대비 1.8배 이상 돌아가면 ⚠ 경고를 출력합니다 (산길처럼 원래 구불한 곳은 무시해도 됩니다).
- 체크포인트에 `via: false`를 주면 지도에 표시·점수만 되고 경유지로는 쓰지 않습니다 (왕복 스퍼 방지).

## 개발 도구

```bash
npm run typecheck            # tsc --noEmit
npm run preview <routeId>    # preview/index.html 생성 (지도 파트만 브라우저에서 확인)
```

`preview/index.html`을 정적 서버로 열면 앱과 동일한 지도 페이지를 브라우저에서 볼 수 있습니다.
콘솔에서 `__walkDebug.start()`로 걷기를 시작할 수 있습니다.

## 앱 ↔ 지도 메시지 프로토콜

지도 페이지는 네이티브에서는 WebView 안, 웹에서는 iframe 안에서 돌아갑니다.
[MapCanvas](src/components/MapCanvas.tsx)가 이 차이를 흡수하므로 MapScreen은 한 가지 방식만 씁니다.

- 앱 → 지도: `window.__walkCmd({type: 'start' | 'pause' | 'reset' | 'setSpeed' | 'setCamera', ...})`
- 지도 → 앱: `{type: 'ready' | 'progress' | 'checkpoint' | 'complete', ...}` JSON 문자열
  - 네이티브: `window.ReactNativeWebView.postMessage`
  - 웹: `window.parent.postMessage`

> 웹 구현이 `srcDoc` 대신 **blob URL**을 쓰는 이유: `srcDoc` 문서는 origin이 `null`이라
> MapLibre의 타일 워커 요청에 `Origin: null`이 붙고, 타일 서버가 이를 거부해 타일이 영원히
> `loading` 상태로 멈춥니다(→ `load` 이벤트가 안 나서 지도가 안 뜸). blob URL은 부모 origin을
> 물려받아 정상 동작합니다.
