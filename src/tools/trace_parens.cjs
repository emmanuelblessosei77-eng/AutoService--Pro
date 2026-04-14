const fs = require('fs');
const s = fs.readFileSync('src/app/components/contact-page.tsx','utf8');
let paren = 0, brace = 0, brack = 0;
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (ch === '(') paren++;
  if (ch === ')') paren--;
  if (ch === '{') brace++;
  if (ch === '}') brace--;
  if (ch === '[') brack++;
  if (ch === ']') brack--;
  if (paren < 0) {
    const before = s.slice(0, i);
    const line = before.split(/\r?\n/).length;
    console.log('Paren negative at index', i, 'line', line);
    const lines = s.split(/\r?\n/);
    for (let ln = Math.max(1, line - 6); ln <= Math.min(lines.length, line + 6); ln++) {
      console.log(ln, lines[ln - 1]);
    }
    process.exit(0);
  }
}
console.log('Paren final', paren, 'brace final', brace, 'brack final', brack);
