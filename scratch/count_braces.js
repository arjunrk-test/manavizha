const fs = require('fs');
const content = fs.readFileSync('c:/Users/Admin/Projects/manavizha/components/browse-profiles.tsx', 'utf8');
let open = 0, close = 0;
for (let char of content) {
    if (char === '{') open++;
    if (char === '}') close++;
}
console.log(`Open: ${open}, Close: ${close}`);
if (open !== close) {
    console.log(`Imbalance: ${open - close}`);
} else {
    console.log('Balanced!');
}
