const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Admin\\Projects\\manavizha\\components\\user-landing-page.tsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = (line.match(/\{/g) || []).length;
    const close = (line.match(/\}/g) || []).length;
    balance += open - close;
    if (balance < 0) {
        console.log(`Mismatch at line ${i + 1}: balance is ${balance}`);
        console.log(`Line content: ${line}`);
        break;
    }
}
console.log(`Final balance: ${balance}`);
