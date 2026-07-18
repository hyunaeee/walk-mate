# 테마 일러스트 (생성 기록)

Higgsfield **Recraft V4.1** / `model_type: standard` / `aspect_ratio: 16:9` / `resolution: 1k`로
생성한 뒤, 제공된 `_min.webp`(1344x768, 장당 60~105KB)를 그대로 받아 쓰고 있습니다.
[ThemeScene.tsx](../../src/illustrations/ThemeScene.tsx)가 테마 이름으로 매핑합니다.

## 스타일 문구 (8장 공통 — 새 테마를 추가할 때 그대로 붙일 것)

> Children's storybook illustration, wide banner landscape. **〈장면 묘사〉** Flat shapes with
> gentle grain texture, layered depth, bold clear silhouettes readable at small size, soft limited
> palette, generous negative space. No text, no lettering, no signage, no logos, no people.

카드 헤더는 이미지의 **가운데 띠만** 잘라 쓰므로(16:9 → 약 3:1), 중요한 요소는 세로 중앙에 오게 묘사하세요.

## 장면 묘사

| 파일 | 테마 | 묘사 |
| --- | --- | --- |
| `cherry.webp` | 벚꽃길 | A cream-coloured walking path winds from the bottom of the frame into the distance, lined on both sides by blooming pink cherry blossom trees whose canopies arch overhead into a tunnel. Petals drift in the air. Soft rolling hills and a calm river far behind. Warm spring afternoon light. |
| `night.webp` | 한강 야경 | A wide calm river at night seen from the near bank, a long illuminated bridge crossing it with warm golden lights reflecting in the dark water, a crescent moon and a few stars, a city skyline glowing on the far bank, a lantern-lit riverside path in the foreground. |
| `alley.webp` | 골목 투어 | A narrow stone-paved alley climbing gently between traditional Korean hanok houses with dark grey curved tiled roofs, upturned eaves and cream plaster walls with wooden doors. A leafy tree leans over a low stone wall. Warm late afternoon light. |
| `stream.webp` | 도심 물길 | A clear shallow stream running through the middle of a city, low stone embankments on both sides, flat square stepping stones crossing the water, leafy plants along the banks, tall pale buildings behind. Bright fresh daylight. |
| `forest.webp` | 숲길 | A quiet forest walking trail winding gently uphill between tall pine trees, dappled sunlight falling through the canopy in soft beams, layered green hills receding behind. Warm calm morning light. |
| `fortress.webp` | 성곽길 | An ancient stone fortress wall with square crenellations marching over a grassy ridge into the distance, a footpath alongside it, a small traditional Korean gate pavilion with a dark curved tiled roof. Golden sunset light. |
| `railpark.webp` | 철길 공원 | A former railway line turned into a long narrow city park, old steel rails and sleepers set into the grass receding straight into the distance, young leafy trees and lawn on both sides, a wooden bench. Bright fresh afternoon light. |
| `riverwalk.webp` | 롱워크 | A very wide calm river at sunset seen along its grassy bank, a paved riverside path stretching far into the distance, a large low orange sun, a long low bridge and gentle blue hills far away, golden light on the water. |

## 안 통한 것 (반복하지 말 것)

- `model_type: vector` + `colors` 팔레트 강제 → 색이 뭉개지고 원근이 사라져 카드 크기에서 안 읽힘.
  팔레트를 넘기지 말고 `standard`를 쓸 것.
