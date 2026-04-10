const fs = require('fs');
const content = fs.readFileSync('c:/Users/Admin/Projects/manavizha/components/browse-profiles.tsx', 'utf8');
const lines = content.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let char of line) {
        if (char === '{') depth++;
        if (char === '}') depth--;
    }
    if (depth < 0) {
        console.log(`Error: Depth became negative on line ${i + 1}`);
        process.exit(1);
    }
}
console.log(`Final depth: ${depth}`);
if (depth > 0) {
    console.log(`Warning: File ends with ${depth} unclosed braces.`);
}
