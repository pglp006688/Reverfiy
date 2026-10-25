const fs = require('fs');
const path = require('path');

const input = process.argv[2] || 'index.html';

function collectHtml(p) {
  const abs = path.resolve(p);
  if (!fs.existsSync(abs)) return [];
  const stat = fs.statSync(abs);
  if (stat.isFile()) return abs.endsWith('.html') ? [abs] : [];
  const out = [];
  for (const name of fs.readdirSync(abs)) {
    if (name === 'node_modules' || name === '.git' || name === '.github') continue;
    out.push(...collectHtml(path.join(abs, name)));
  }
  return out;
}

function injectFile(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-reverfiy')) {
    console.log(`[reverfiy] skip (already injected): ${file}`);
    return false;
  }
  const payload = fs.readFileSync(path.join(__dirname, 'reverfiy.js'), 'utf8');
  const snippet = `\n<script data-reverfiy>${payload}</script>\n`;
  html = /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, snippet + '</body>')
    : html + snippet;
  fs.writeFileSync(file, html);
  console.log(`[reverfiy] injected: ${file}`);
  return true;
}

const files = collectHtml(input);

if (files.length === 0) {
  console.error(`[reverfiy] no .html found at: ${path.resolve(input)}`);
  console.error(`[reverfiy] cwd: ${process.cwd()}`);
  console.error('[reverfiy] cwd contents:');
  for (const name of fs.readdirSync(process.cwd())) {
    console.error('  - ' + name);
  }
  process.exit(1);
}

let changed = 0;
for (const f of files) {
  if (injectFile(f)) changed++;
}
console.log(`[reverfiy] done, ${changed} file(s) injected`);
