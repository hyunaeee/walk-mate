// Dev-only: receives canvas data-URL POSTs from the browser preview and
// writes them as PNG files, so route shapes can be inspected when normal
// screenshotting is unavailable. Usage: node scripts/shot-server.mjs
import { createServer } from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('preview/shots', { recursive: true });

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  if (req.method === 'POST') {
    const name = new URL(req.url, 'http://x').searchParams.get('name') ?? 'shot';
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const b64 = body.replace(/^data:image\/png;base64,/, '');
      const file = `preview/shots/${name.replace(/[^\w-]/g, '')}.png`;
      writeFileSync(file, Buffer.from(b64, 'base64'));
      console.log(`${file} (${Math.round(b64.length / 1024)}KB)`);
      res.end('ok');
    });
    return;
  }
  res.end('shot-server');
}).listen(8124, () => console.log('shot-server on :8124'));
