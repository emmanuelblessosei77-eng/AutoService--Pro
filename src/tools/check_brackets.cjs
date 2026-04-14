const fs = require('fs');
const path = require('path');
const fpath = path.resolve('src/app/components/contact-page.tsx');
const s = fs.readFileSync(fpath,'utf8');
const pairs = {'(':')','{':'}','[':']'};
const closing = new Set(Object.values(pairs));
const stack=[];
for(let i=0;i<s.length;i++){
  const ch=s[i];
  if(pairs[ch]){
    stack.push({ch, i});
  } else if (closing.has(ch)){
    if(stack.length===0){
      console.log('Unmatched closing',ch,'at',i);
      process.exit(0);
    }
    const {ch:opening, i:pos} = stack.pop();
    if (pairs[opening] !== ch){
      console.log('Mismatched',opening,'at',pos,'with',ch,'at',i);
      process.exit(0);
    }
  }
}
if(stack.length) {
  console.log('Unclosed openings:', stack.length, stack[stack.length-1]);
} else {
  console.log('All balanced');
}
console.log('--- snippet around 430-460 ---');
const lines = s.split(/\r?\n/);
for(let ln=430; ln<=460 && ln<=lines.length; ln++){
  console.log(ln, lines[ln-1]);
}
