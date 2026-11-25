import { lstat, readdir, readFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(project, 'out');
const origin = 'https://kyg09.github.io';
const errors = new Set();
const files = new Set();
let bytes = 0;

// public/도 그대로 복사된다. 숨김 파일·소스·키·소스맵은 배포 패키지에서 차단한다.
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    const name = relative(output, path).split(sep).join('/');
    const stat = await lstat(path);
    if (stat.isSymbolicLink() || (!stat.isDirectory() && stat.nlink > 1)) {
      errors.add(`링크 파일 금지: ${name}`);
      continue;
    }
    if ((entry.name.startsWith('.') && entry.name !== '.nojekyll') ||
        /(?:^|\/)(?:src|scripts|docs|node_modules)(?:\/|$)/.test(name) ||
        /(?:^|\/)(?:package(?:-lock)?\.json|AGENTS\.md|README\.md)$/.test(name) ||
        /\.(?:map|pem|key|p12|pfx|jks|keystore|env|ts|tsx)$/i.test(name)) {
      errors.add(`비공개·개발 파일 금지: ${name}`);
    }
    // 제작 입력과 사용하지 않는 옛 목업이 다시 public으로 들어오면 게시를 막는다.
    if (/(?:^|\/)(?:media-sources|macOS-sources|macOS-wallpapers)(?:\/|$)|-exact\.(?:jpg|png|mp4)$|(?:^|\/)(?:ims-safari|care-note-iphone)\.(?:jpg|mp4)$/.test(name)) {
      errors.add(`제작 원본·옛 목업은 공개 금지: ${name}`);
    }
    if (stat.isDirectory()) await walk(path);
    else if (stat.isFile()) {
      files.add(name);
      bytes += stat.size;
    } else errors.add(`일반 파일이 아님: ${name}`);
  }
}

const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
    .map(([, key, value]) => [key.toLowerCase(), value.replaceAll('&amp;', '&')]),
);

try { await walk(output); }
catch (error) {
  console.error(`정적 산출물을 읽을 수 없습니다. 먼저 npm run build:pages를 실행하세요. (${error.code ?? 'read error'})`);
  process.exit(1);
}

for (const required of ['index.html', 'en/index.html', '404.html', 'robots.txt', 'sitemap.xml']) {
  if (!files.has(required)) errors.add(`필수 경로 누락: ${required}`);
}
if (bytes > 1024 ** 3) errors.add('GitHub Pages 사이트 크기 1 GiB 초과');

let pages = 0;
for (const name of files) {
  if (!/\.(?:html|js|css|json|txt|xml)$/.test(name)) continue;
  const content = await readFile(resolve(output, name), 'utf8');
  // 값은 로그에 남기지 않고 파일명과 유형만 알린다. 패턴 검사가 모든 비밀값을 보장하지는 않는다.
  if (/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{70,}|AKIA[A-Z0-9]{16})\b/.test(content)) {
    errors.add(`비밀값 패턴 발견: ${name}`);
  }
  if (/\/Users\/[^\s"'<>]+\/(?:Desktop|Documents|Downloads)\//.test(content)) {
    errors.add(`로컬 사용자 경로 발견: ${name}`);
  }
  if (name === 'sitemap.xml' &&
      [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].some(([, url]) => !url.startsWith(origin + '/'))) {
    errors.add('사이트맵의 공개 주소가 kyg09.github.io와 다름');
  }
  if (!name.endsWith('.html')) continue;
  pages += 1;
  const meta = new Map([...content.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => {
    const attr = attributes(tag);
    return [attr.property ?? attr.name, attr.content];
  }));
  // Next의 공통 404에는 별도 공유 메타가 없다.
  if (/(?:^|\/)(?:404|_not-found)(?:\/index)?\.html$/.test(name)) continue;
  const route = name === 'index.html' ? '/' : '/' + name.replace(/index\.html$/, '');
  const ogUrl = meta.get('og:url');
  if (!ogUrl || ogUrl.replace(/\/$/, '') !== (origin + route).replace(/\/$/, '')) {
    errors.add(`공유 주소 오류: ${name}`);
  }
  const ogImage = meta.get('og:image');
  if (!ogImage?.startsWith(origin + '/') || !files.has(ogImage.slice(origin.length + 1))) {
    errors.add(`공유 이미지 누락 또는 주소 오류: ${name}`);
  }
  // 정적 서버에서 빠지는 JS·CSS·폰트·포스터 등 HTML이 참조한 로컬 파일을 검사한다.
  for (const [tag] of content.matchAll(/<(?:script|link|img|video|source)\b[^>]*>/gi)) {
    const attr = attributes(tag);
    for (const value of [attr.src, attr.href, attr.poster].filter(Boolean)) {
      if (!/^\/(?:_next|assets|fonts)\//.test(value)) continue;
      const path = decodeURIComponent(value.split(/[?#]/)[0]).slice(1);
      if (!files.has(path)) errors.add(`로컬 에셋 누락: ${name} → ${path}`);
    }
  }
}

if (errors.size) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`Pages 검사 통과 · HTML ${pages}개 · 파일 ${files.size}개 · ${(bytes / 1024 ** 2).toFixed(2)} MiB · ${origin}`);
}
