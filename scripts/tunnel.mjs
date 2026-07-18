// Expo 공용 ngrok 터널이 과부하로 막혀 있어 Cloudflare 무료 터널로 대체.
// 사용법: npm run dev:tunnel  →  뜨는 QR을 Expo Go로 스캔 (같은 와이파이 불필요)
import { spawn, execFileSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { get } from 'node:https';
import { join } from 'node:path';
import qrcode from 'qrcode-terminal';

const PORT = 8081;
const TOOLS = join(import.meta.dirname, '..', '.tools');
const CLOUDFLARED = join(TOOLS, 'cloudflared.exe');
const RELEASE =
  'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (res.statusCode >= 300 && res.headers.location) {
        download(res.headers.location, dest).then(resolve, reject);
        res.resume();
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const f = createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => f.close(resolve));
      f.on('error', reject);
    }).on('error', reject);
  });
}

async function ensureCloudflared() {
  if (existsSync(CLOUDFLARED)) return;
  mkdirSync(TOOLS, { recursive: true });
  console.log('cloudflared 다운로드 중... (최초 1회)');
  await download(RELEASE, CLOUDFLARED);
  execFileSync(CLOUDFLARED, ['--version'], { stdio: 'inherit' });
}

const METRICS = '127.0.0.1:20250';

function openTunnel() {
  return new Promise((resolve, reject) => {
    // --protocol http2: QUIC(UDP)이 방화벽에 막히면 연결 0개인 좀비 터널이
    // 되어 폰에서 530이 뜬다. TCP 443만 쓰는 http2로 강제.
    const cf = spawn(CLOUDFLARED, [
      'tunnel',
      '--url', `http://localhost:${PORT}`,
      '--protocol', 'http2',
      '--metrics', METRICS,
    ]);
    const onData = (chunk) => {
      const m = String(chunk).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m) resolve({ url: m[0], proc: cf });
    };
    cf.stdout.on('data', onData);
    cf.stderr.on('data', onData);
    cf.on('exit', (code) => reject(new Error(`cloudflared 종료 (code ${code})`)));
    setTimeout(() => reject(new Error('터널 URL을 30초 안에 못 받았습니다')), 30000);
  });
}

// 터널이 Cloudflare 서버와 실제로 연결될 때까지 대기 (URL만 나오고 연결이
// 없으면 폰에서 530 에러가 난다)
async function waitUntilReady() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://${METRICS}/ready`);
      const j = await res.json();
      if (j.readyConnections > 0) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

const argPlain = process.argv.includes('--no-expo');

await ensureCloudflared();
console.log('Cloudflare 터널 여는 중...');
const { url, proc: cf } = await openTunnel();
process.stdout.write('터널 연결 확인 중');
const ready = await waitUntilReady();
console.log('');
if (!ready) {
  console.error('⚠ 터널이 Cloudflare에 연결되지 못했습니다 (30초 대기).');
  console.error('  네트워크가 443 아웃바운드를 막고 있는지 확인하세요.');
  cf.kill();
  process.exit(1);
}
console.log('✓ 터널 연결됨');
const expsUrl = url.replace('https://', 'exps://');

console.log('\n──────────────────────────────────────────────');
console.log(`  터널 주소:  ${url}`);
console.log(`  Expo Go 접속 주소:  ${expsUrl}`);
console.log('──────────────────────────────────────────────');
console.log('폰의 Expo Go 앱에서 아래 QR을 스캔하거나,');
console.log('"Enter URL manually"에 위 exps:// 주소를 입력하세요.\n');
qrcode.generate(expsUrl, { small: true });

if (!argPlain) {
  const expo = spawn('npx', ['expo', 'start', '--port', String(PORT)], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, EXPO_PACKAGER_PROXY_URL: url },
  });
  const stop = () => {
    cf.kill();
    expo.kill();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  expo.on('exit', () => {
    cf.kill();
    process.exit(0);
  });
}
