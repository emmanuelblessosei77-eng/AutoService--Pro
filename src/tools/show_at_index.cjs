const fs = require('fs');
const path = require('path');
const fpath = path.resolve('src/app/components/contact-page.tsx');
const s = fs.readFileSync(fpath,'utf8');
const idx = 19945;
const before = s.slice(0, idx);
const ln = before.split(/\r?\n/).length;
console.log('index', idx, 'line', ln);
const lines = s.split(/\r?\n/);
for(let i=Math.max(1, ln-5); i<=Math.min(lines.length, ln+5); i++){
  console.log(i, lines[i-1]);
}
