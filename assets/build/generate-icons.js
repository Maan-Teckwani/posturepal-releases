// Run once: node assets/build/generate-icons.js
// Requires: npm install --save-dev sharp png2icons

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.join(__dirname, 'icon-source.png'); // 1024x1024 PNG
const ICONS_DIR = path.join(__dirname, '../build/icons');

if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

// Linux icon sizes
const sizes = [16, 32, 48, 64, 128, 256, 512];
async function generateLinuxIcons() {
  for (const size of sizes) {
    await sharp(SOURCE)
      .resize(size, size)
      .toFile(path.join(ICONS_DIR, `${size}x${size}.png`));
    console.log(`Generated ${size}x${size}.png`);
  }
}

generateLinuxIcons().then(() => {
  console.log('Linux icons done.');
  console.log('For macOS .icns: use iconutil on Mac or an online converter.');
  console.log('For Windows .ico: use an online PNG to ICO converter.');
});
