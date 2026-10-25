const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'index.html';
if (!fs.existsSync(target)) {
  console.error(`[reverfiy] file not found: ${target}`);
  process.exit(1);
}

let html = fs.readFileSync(target, 'utf8');
if (html.includes('data-reverfiy')) {
  console.log('[reverfiy] already injected, skip');
  process.exit(0);
}

const payload = fs.readFileSync(path.join(__dirname, 'reverfiy.js'), 'utf8');
const snippet = `\n<script data-reverfiy>${payload}</script>\n`;

html = /<\/body>/i.test(html)
  ? html.replace(/<\/body>/i, snippet + '</body>')
  : html + snippet;

fs.writeFileSync(target, html);
console.log(`[reverfiy] injected into ${target}`);
