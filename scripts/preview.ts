// Dev-only: renders the WebView map HTML as a standalone browser page.
// Usage: node scripts/preview.ts [routeId]  -> writes preview/index.html
import { mkdirSync, writeFileSync } from 'node:fs';
import { ROUTES } from '../src/data/routes.ts';
import { buildMapHtml } from '../src/map/mapHtml.ts';

const routeId = process.argv[2] ?? ROUTES[0].id;
const route = ROUTES.find((r) => r.id === routeId);
if (!route) {
  console.error(`unknown route id: ${routeId}`);
  console.error(`available: ${ROUTES.map((r) => r.id).join(', ')}`);
  process.exit(1);
}

const autoStart = `
<script>
  // headless-friendly auto capture: hidden tabs get no rAF, so force
  // frames manually, wait for tiles, then POST the canvas to :8124.
  (function () {
    var ROUTE_ID = ${JSON.stringify(routeId)};
    function frames(n) {
      for (var i = 0; i < n; i++) window.__map._render(performance.now() + i * 16);
    }
    var fitted = false;
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (tries > 40) { clearInterval(iv); return; }
      if (!window.__map) return;
      frames(10);
      var src = window.__map.getSource && window.__map.getSource('route');
      if (!src) return;
      if (!fitted) {
        var coords = src._data.geometry.coordinates;
        var b = coords.reduce(function (bb, c) { return bb.extend(c); },
          new maplibregl.LngLatBounds(coords[0], coords[0]));
        window.__map.fitBounds(b, { padding: 70, pitch: 50, bearing: -15, duration: 0 });
        fitted = true;
        return;
      }
      if (window.__map.areTilesLoaded() || tries > 25) {
        clearInterval(iv);
        frames(40);
        var d = window.__map.getCanvas().toDataURL('image/png');
        fetch('http://localhost:8124/shot?name=' + ROUTE_ID, { method: 'POST', body: d })
          .catch(function () {});
      }
    }, 600);
  })();
</script>
`;

const html = buildMapHtml(route)
  // allow canvas.toDataURL captures in the browser preview
  .replace(
    "container: 'map',",
    "container: 'map', canvasContextAttributes: { preserveDrawingBuffer: true },"
  )
  .replace('</body>', autoStart + '</body>');
mkdirSync('preview', { recursive: true });
writeFileSync('preview/index.html', html);
console.log(`preview/index.html written for route "${route.title}"`);
