const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.ts');
if (!fs.existsSync(filePath)) {
  console.error('server.ts not found in:', filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the default logoUrl definition in initial memory database in server.ts
const initialMemoryRegex = /logoUrl:\s*"data:image\/png;base64,[A-Za-z0-9+/=\s\r\n]*?",/;
if (initialMemoryRegex.test(content)) {
  content = content.replace(initialMemoryRegex, 'logoUrl: "",');
  console.log('✔ Patched initial logoUrl memory state.');
} else {
  console.warn('⚠ Could not find initial logoUrl memory state pattern.');
}

// 2. Replace the override in update endpoint in server.ts
const overrideRegex = /\/\/\s*Always\s*lock\s*logoUrl\s*to\s*the\s*universal[A-Za-z0-9\s,\/\.\-]*?\s*database\.settings\.logoUrl\s*=\s*"data:image\/png;base64,[A-Za-z0-9+/=\s\r\n]*?";/;
if (overrideRegex.test(content)) {
  content = content.replace(overrideRegex, '// Dynamic customized logo support\n    database.settings.logoUrl = logoUrl !== undefined ? logoUrl : database.settings.logoUrl;');
  console.log('✔ Patched settings logoUrl override block.');
} else {
  console.warn('⚠ Could not find settings logoUrl override block pattern.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully completed patching of server.ts!');
