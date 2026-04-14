const fs = require('fs');
const s = fs.readFileSync('src/app/components/contact-page.tsx','utf8');
const open = (s.match(/\(/g)||[]).length;
const close = (s.match(/\)/g)||[]).length;
console.log('open (:', open, 'close ):', close, 'diff:', open-close);
