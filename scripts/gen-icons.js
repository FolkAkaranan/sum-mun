// สคริปต์ one-off สำหรับสร้างไอคอน PWA จาก SVG (รันด้วย: node scripts/gen-icons.js)
const sharp = require("sharp");
const path = require("path");

const sizes = [192, 512];

function svgFor(size) {
  const r = Math.round(size * 0.22);
  const font = Math.round(size * 0.55);
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${r}" fill="#4f46e5"/>
  <text x="50%" y="54%" font-size="${font}" text-anchor="middle" dominant-baseline="middle">🎉</text>
</svg>`;
}

async function main() {
  for (const size of sizes) {
    const buf = Buffer.from(svgFor(size));
    const out = path.join(__dirname, "..", "public", `icon-${size}.png`);
    await sharp(buf).resize(size, size).png().toFile(out);
    console.log("wrote", out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
