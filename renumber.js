const fs = require('fs');
const content = fs.readFileSync('src/2-level.js', 'utf8');
let counter = 1;
const updated = content.replace(/"id":\s*\d+,/g, () => `"id": ${counter++},`);
fs.writeFileSync('src/2-level.js', updated, 'utf8');
console.log('Total replaced:', counter - 1);
