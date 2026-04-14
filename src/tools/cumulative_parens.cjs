const fs = require('fs');
const s = fs.readFileSync('src/app/components/contact-page.tsx','utf8');
const lines = s.split(/\r?\n/);
let cum = 0, min = Infinity, minLine = -1;
for (let i = 0; i < lines.length; i++) {
  const opens = (lines[i].match(/\(/g) || []).length;
  const closes = (lines[i].match(/\)/g) || []).length;
  cum += opens - closes;
  if (cum < min) { min = cum; minLine = i + 1; }
}
console.log('min', min, 'minLine', minLine, 'final', cum);
for (let ln = Math.max(1, minLine - 5); ln <= Math.min(lines.length, minLine + 5); ln++) {
  console.log(ln, lines[ln - 1]);
}
