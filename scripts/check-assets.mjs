import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = resolve(project, 'src');
const publicRoot = resolve(project, 'public');
const staticAsset = /\/(?:assets|fonts)\/[^\s"'\x60?<>{}()[\],;]+|\/favicon\.(?:ico|svg)\b/g;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : path;
  }));
  return files.flat();
}

// 쿼리 값이 붙은 URL과 srcSet의 각 후보에서 실제 공개 파일 경로를 찾는다.
const sources = (await listFiles(sourceRoot)).filter(file => /\.(?:tsx?|jsx?|mjs|css)$/.test(file));
const referenced = new Map();
for (const source of sources) {
  const contents = await readFile(source, 'utf8');
  for (const [url] of contents.matchAll(staticAsset)) {
    if (!referenced.has(url)) referenced.set(url, relative(project, source));
  }
}

const publicFiles = new Set((await listFiles(publicRoot))
  .filter(file => !file.endsWith(sep + '.DS_Store'))
  .map(file => '/' + relative(publicRoot, file).split(sep).join('/')));
const missing = [...referenced].filter(([url]) => !publicFiles.has(url));
const unused = [...publicFiles].filter(url => !referenced.has(url)).sort();

console.log(`공개 파일 ${publicFiles.size}개 · 참조 ${referenced.size}개 · 누락 ${missing.length}개 · 미참조 후보 ${unused.length}개`);
for (const [url, source] of missing) console.error(`누락 ${url} (${source})`);
if (process.argv.includes('--list-unused')) {
  for (const url of unused) console.log(url);
}
if (missing.length) process.exitCode = 1;
