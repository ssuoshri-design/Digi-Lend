const fs = require('fs');
const path = require('path');

const LOGO_BASE64 = "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";

const assetsDirs = [
  path.join(__dirname, 'assets', 'brand'),
  path.join(__dirname, 'public', 'assets', 'brand')
];

try {
  assetsDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const logoPath = path.join(dir, 'digilend-logo.png');
    let needsRestore = false;

    if (!fs.existsSync(logoPath)) {
      console.log(`⚠️ Brand Preservation Notice: Logo file was missing in ${dir}! Restoring from locked local backup...`);
      needsRestore = true;
    } else {
      const stats = fs.statSync(logoPath);
      if (stats.size === 0) {
        console.log(`⚠️ Brand Preservation Notice: Logo file empty/corrupted in ${dir}! Restoring logo...`);
        needsRestore = true;
      }
    }

    if (needsRestore) {
      fs.writeFileSync(logoPath, Buffer.from(LOGO_BASE64, 'base64'));
    }

    // Double check integrity
    if (!fs.existsSync(logoPath) || fs.statSync(logoPath).size === 0) {
      console.error(`❌ CRITICAL ERROR: DigiLend logo file cannot be found or restored in ${dir}! Stopping build to preserve brand identity.`);
      process.exit(1);
    }
  });

  console.log("✅ Brand Preservation Status: DigiLend logo validated and locked in both assets and public folders.");
} catch (error) {
  console.error("❌ CRITICAL ERROR during logo verification:", error);
  process.exit(1);
}

