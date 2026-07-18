import type { WalkRoute } from '../data/routes';

/**
 * Builds a self-contained MapLibre GL JS page for one route.
 * Runs inside react-native-webview; falls back to console logging
 * when opened directly in a browser (scripts/preview.mjs).
 *
 * RN -> map commands (via injectJavaScript):
 *   window.__walkCmd({type:'start'|'pause'|'reset'|'setSpeed'|'setCamera', ...})
 * map -> RN messages (via ReactNativeWebView.postMessage):
 *   {type:'ready'|'progress'|'checkpoint'|'complete'}
 */
export function buildMapHtml(route: WalkRoute): string {
  const routeJson = JSON.stringify({
    color: route.color,
    emoji: route.emoji,
    path: route.path,
    checkpoints: route.checkpoints,
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css" rel="stylesheet" />
<style>
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #F7EFE1; }
  #map { position: absolute; inset: 0; }
  .walker {
    width: 46px; height: 46px; border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #ffffff, #eef3f8);
    border: 3px solid ${route.color};
    box-shadow: 0 6px 14px rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; position: relative;
  }
  .walker::after {
    content: ''; position: absolute; left: 50%; top: 100%;
    transform: translateX(-50%);
    border: 7px solid transparent; border-top-color: ${route.color};
  }
  .walker-ring {
    position: absolute; inset: -12px; border-radius: 50%;
    border: 2px solid ${route.color};
    opacity: 0; animation: ring 2.2s ease-out infinite;
  }
  @keyframes ring {
    0% { transform: scale(0.55); opacity: 0.85; }
    100% { transform: scale(1.25); opacity: 0; }
  }
  .cp {
    width: 30px; height: 30px; border-radius: 50% 50% 50% 4px;
    transform: rotate(-45deg);
    background: #ffffff; border: 3px solid ${route.color};
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
  }
  .cp span {
    transform: rotate(45deg);
    font: 700 13px/1 -apple-system, sans-serif; color: #223;
  }
  .cp.visited { background: ${route.color}; }
  .cp.visited span { color: #fff; }
  .cp.visited::before {
    content: ''; position: absolute; inset: -10px; border-radius: 50%;
    border: 3px solid ${route.color};
    animation: ring 0.9s ease-out 3;
  }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js"></script>
<script>
(function () {
  var ROUTE = ${routeJson};
  var WALK_SPEED_MPS = 1.4;          // real walking speed
  var speedMultiplier = 24;          // preview time-lapse factor
  var cameraMode = 'overview';       // 'overview' | 'follow'
  var playing = false;
  var finished = false;
  var walkedM = 0;
  var lastTs = null;
  var smoothBearing = null;
  var visited = ROUTE.checkpoints.map(function () { return false; });

  function sendRN(msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(s); // native app (WebView)
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage(s, '*'); // web app (iframe)
    } else {
      console.log('[walk->rn] ' + s); // standalone browser preview
    }
  }

  // ---- geometry helpers ----
  var R = 6371000;
  function toRad(d) { return d * Math.PI / 180; }
  function haversine(a, b) {
    var dLat = toRad(b[1] - a[1]);
    var dLng = toRad(b[0] - a[0]);
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function bearingOf(a, b) {
    var y = Math.sin(toRad(b[0] - a[0])) * Math.cos(toRad(b[1]));
    var x = Math.cos(toRad(a[1])) * Math.sin(toRad(b[1])) -
      Math.sin(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.cos(toRad(b[0] - a[0]));
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
  function lerpAngle(a, b, t) {
    var d = ((b - a + 540) % 360) - 180;
    return (a + d * t + 360) % 360;
  }
  function destPoint(p, bearingDeg, distM) {
    var br = toRad(bearingDeg);
    var lat1 = toRad(p[1]);
    var lng1 = toRad(p[0]);
    var dr = distM / R;
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dr) +
      Math.cos(lat1) * Math.sin(dr) * Math.cos(br));
    var lng2 = lng1 + Math.atan2(
      Math.sin(br) * Math.sin(dr) * Math.cos(lat1),
      Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2));
    return [lng2 * 180 / Math.PI, lat2 * 180 / Math.PI];
  }

  // cumulative distance along path
  var cum = [0];
  for (var i = 1; i < ROUTE.path.length; i++) {
    cum.push(cum[i - 1] + haversine(ROUTE.path[i - 1], ROUTE.path[i]));
  }
  var totalM = cum[cum.length - 1];

  function pointAt(dist) {
    if (dist <= 0) return { coord: ROUTE.path[0], heading: bearingOf(ROUTE.path[0], ROUTE.path[1]), seg: 0 };
    if (dist >= totalM) {
      var n = ROUTE.path.length;
      return { coord: ROUTE.path[n - 1], heading: bearingOf(ROUTE.path[n - 2], ROUTE.path[n - 1]), seg: n - 2 };
    }
    var s = 1;
    while (cum[s] < dist) s++;
    var t = (dist - cum[s - 1]) / (cum[s] - cum[s - 1]);
    var a = ROUTE.path[s - 1], b = ROUTE.path[s];
    return {
      coord: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
      heading: bearingOf(a, b),
      seg: s - 1
    };
  }

  // project each checkpoint to a distance along the path (nearest vertex)
  var cpDist = ROUTE.checkpoints.map(function (cp) {
    var best = 0, bestD = Infinity;
    for (var j = 0; j < ROUTE.path.length; j++) {
      var d = haversine(cp.coord, ROUTE.path[j]);
      if (d < bestD) { bestD = d; best = cum[j]; }
    }
    return best;
  });

  // ---- map ----
  var bounds = ROUTE.path.reduce(function (b, c) {
    return b.extend(c);
  }, new maplibregl.LngLatBounds(ROUTE.path[0], ROUTE.path[0]));

  var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/liberty',
    bounds: bounds,
    fitBoundsOptions: { padding: 70, pitch: 50, bearing: -15 },
    attributionControl: { compact: true },
    maxPitch: 70
  });
  map.touchPitch.enable();

  var walkerEl = document.createElement('div');
  walkerEl.className = 'walker';
  walkerEl.innerHTML = '<div class="walker-ring"></div><span>' + ROUTE.emoji + '</span>';
  var walker = new maplibregl.Marker({ element: walkerEl, anchor: 'bottom' })
    .setLngLat(ROUTE.path[0])
    .addTo(map);

  var cpEls = ROUTE.checkpoints.map(function (cp, idx) {
    var el = document.createElement('div');
    el.className = 'cp';
    el.innerHTML = '<span>' + (idx + 1) + '</span>';
    new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(cp.coord).addTo(map);
    return el;
  });

  var dashStep = 0;
  var dashSeqs = [
    [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5],
    [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5]
  ];

  map.on('load', function () {
    map.addSource('route', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: ROUTE.path } }
    });
    map.addSource('walked', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
    });

    map.addLayer({
      id: 'route-glow', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ROUTE.color, 'line-width': 16, 'line-opacity': 0.3, 'line-blur': 4 }
    });
    map.addLayer({
      id: 'route-base', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 7 }
    });
    map.addLayer({
      id: 'route-dash', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ROUTE.color, 'line-width': 4, 'line-dasharray': dashSeqs[0] }
    });
    map.addLayer({
      id: 'walked-line', type: 'line', source: 'walked',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ROUTE.color, 'line-width': 7, 'line-opacity': 0.95 }
    });
    map.addLayer({
      id: 'route-arrows', type: 'symbol', source: 'route',
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 90,
        'text-field': '›',
        'text-font': ['Noto Sans Bold'],
        'text-size': 22,
        'text-keep-upright': false,
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: { 'text-color': ROUTE.color, 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 }
    });

    // animated "marching ants" on the remaining route
    setInterval(function () {
      dashStep = (dashStep + 1) % dashSeqs.length;
      if (map.getLayer('route-dash')) {
        map.setPaintProperty('route-dash', 'line-dasharray', dashSeqs[dashStep]);
      }
    }, 120);

    sendRN({ type: 'ready', totalM: Math.round(totalM) });
  });

  // ---- game loop ----
  function walkedCoords(dist) {
    var coords = [];
    for (var j = 0; j < ROUTE.path.length && cum[j] <= dist; j++) coords.push(ROUTE.path[j]);
    var p = pointAt(dist);
    coords.push(p.coord);
    return coords;
  }

  function frame(ts) {
    requestAnimationFrame(frame);
    if (!playing || finished) { lastTs = ts; return; }
    if (lastTs == null) { lastTs = ts; return; }
    var dt = Math.min(ts - lastTs, 100) / 1000;
    lastTs = ts;

    walkedM = Math.min(walkedM + WALK_SPEED_MPS * speedMultiplier * dt, totalM);
    var p = pointAt(walkedM);
    walker.setLngLat(p.coord);

    if (smoothBearing == null) smoothBearing = p.heading;
    smoothBearing = lerpAngle(smoothBearing, p.heading, 0.06);

    var ws = map.getSource('walked');
    if (ws) ws.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: walkedCoords(walkedM) } });

    if (cameraMode === 'follow') {
      map.jumpTo({
        center: destPoint(p.coord, smoothBearing, 55),
        bearing: smoothBearing,
        pitch: 62,
        zoom: 17.2
      });
    }

    for (var k = 0; k < cpDist.length; k++) {
      if (!visited[k] && walkedM >= cpDist[k] - 12) {
        visited[k] = true;
        cpEls[k].classList.add('visited');
        sendRN({
          type: 'checkpoint', index: k,
          name: ROUTE.checkpoints[k].name,
          description: ROUTE.checkpoints[k].description,
          points: ROUTE.checkpoints[k].points
        });
      }
    }

    sendRN({ type: 'progress', pct: walkedM / totalM, walkedM: Math.round(walkedM), totalM: Math.round(totalM) });

    if (walkedM >= totalM) {
      finished = true;
      playing = false;
      sendRN({ type: 'complete' });
      // slow victory orbit around the finish point
      var end = ROUTE.path[ROUTE.path.length - 1];
      map.easeTo({ center: end, zoom: 16.5, pitch: 58, bearing: map.getBearing() + 120, duration: 6000 });
    }
  }
  requestAnimationFrame(frame);

  function goOverview() {
    map.fitBounds(bounds, { padding: 70, pitch: 50, bearing: -15, duration: 1200 });
  }

  // ---- commands from RN ----
  window.__walkCmd = function (msg) {
    if (!msg || !msg.type) return;
    if (msg.type === 'start') {
      if (finished) return;
      playing = true;
      lastTs = null;
      if (cameraMode !== 'follow') {
        cameraMode = 'follow';
        var p = pointAt(walkedM);
        smoothBearing = p.heading;
        map.easeTo({ center: destPoint(p.coord, p.heading, 55), bearing: p.heading, pitch: 62, zoom: 17.2, duration: 1600 });
      }
    } else if (msg.type === 'pause') {
      playing = false;
    } else if (msg.type === 'reset') {
      playing = false;
      finished = false;
      walkedM = 0;
      smoothBearing = null;
      visited = visited.map(function () { return false; });
      cpEls.forEach(function (el) { el.classList.remove('visited'); });
      walker.setLngLat(ROUTE.path[0]);
      var ws = map.getSource('walked');
      if (ws) ws.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
      cameraMode = 'overview';
      goOverview();
      sendRN({ type: 'progress', pct: 0, walkedM: 0, totalM: Math.round(totalM) });
    } else if (msg.type === 'setSpeed') {
      speedMultiplier = msg.value;
    } else if (msg.type === 'setCamera') {
      cameraMode = msg.mode;
      if (msg.mode === 'overview') goOverview();
    }
  };

  // browser-preview helpers (no-ops inside the app)
  window.__walkDebug = { start: function () { window.__walkCmd({ type: 'start' }); } };
  window.__map = map;
})();
</script>
</body>
</html>`;
}
