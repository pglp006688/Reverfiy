const fs = require('fs');
const path = require('path');

const input = process.argv[2] || 'index.html';
const output = process.argv[3] || '';
const cwd = process.env.GITHUB_WORKSPACE || process.cwd();

const EXCLUDE = new Set(['.git', '.github', 'node_modules', 'dist']);

function walk(dir, cb) {
  for (const name of fs.readdirSync(dir)) {
    if (EXCLUDE.has(name)) continue;
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, cb);
    else cb(p);
  }
}

function collectHtml(p) {
  const abs = path.resolve(cwd, p);
  if (!fs.existsSync(abs)) return [];
  const stat = fs.statSync(abs);
  if (stat.isFile()) return abs.endsWith('.html') ? [abs] : [];
  const out = [];
  walk(abs, f => { if (f.endsWith('.html')) out.push(f); });
  return out;
}

function injectContent(html) {
  if (html.includes('data-reverfiy')) return null;
  const payload = fs.readFileSync(path.join(__dirname, 'reverfiy.js'), 'utf8');
  const snippet = `\n<script data-reverfiy>${payload}</script>\n`;
  return /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, snippet + '</body>')
    : html + snippet;
}

const targets = collectHtml(input);
if (targets.length === 0) {
  console.error(`[reverfiy] no .html found at: ${path.resolve(cwd, input)}`);
  process.exit(1);
}

let root = cwd;
if (output) {
  const outDir = path.resolve(cwd, output);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const sources = [];
  walk(cwd, f => sources.push(f));
  for (const src of sources) {
    const rel = path.relative(cwd, src);
    const dest = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  root = outDir;
  console.log(`[reverfiy] copied site to ${outDir}`);
}

let changed = 0;
for (const f of targets) {
  const dest = output ? path.join(root, path.relative(cwd, f)) : f;
  const next = injectContent(fs.readFileSync(dest, 'utf8'));
  if (!next) {
    console.log(`[reverfiy] skip (already injected): ${dest}`);
    continue;
  }
  fs.writeFileSync(dest, next);
  console.log(`[reverfiy] injected: ${dest}`);
  changed++;
}
console.log(`[reverfiy] done, ${changed} file(s) injected`);
