import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images", "themes");

const W = 1600, H = 900;

// Aviation: golden-hour sky — deep navy at top descending to sky blue, warm sun glow low-right.
const aviation = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#08182C"/>
      <stop offset="38%" stop-color="#0E2A4A"/>
      <stop offset="68%" stop-color="#1B4D7E"/>
      <stop offset="88%" stop-color="#4F9FD6"/>
      <stop offset="100%" stop-color="#A9D6F0"/>
    </linearGradient>
    <radialGradient id="sun" cx="78%" cy="86%" r="60%">
      <stop offset="0%"  stop-color="#FFB677" stop-opacity="0.95"/>
      <stop offset="22%" stop-color="#FF7A30" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#FF7A30" stop-opacity="0.0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#sun)"/>
</svg>`;

// Scuba: underwater column — bright turquoise surface light fading into deep teal, coral warmth low.
const scuba = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#7FE0D6"/>
      <stop offset="22%" stop-color="#1FA8A0"/>
      <stop offset="55%" stop-color="#0E5E5C"/>
      <stop offset="82%" stop-color="#073B3F"/>
      <stop offset="100%" stop-color="#04282B"/>
    </linearGradient>
    <radialGradient id="rays" cx="40%" cy="-10%" r="90%">
      <stop offset="0%"  stop-color="#CDEDE8" stop-opacity="0.85"/>
      <stop offset="30%" stop-color="#7FE0D6" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#7FE0D6" stop-opacity="0.0"/>
    </radialGradient>
    <radialGradient id="coral" cx="84%" cy="92%" r="45%">
      <stop offset="0%"  stop-color="#FF6F5E" stop-opacity="0.5"/>
      <stop offset="45%" stop-color="#FF6F5E" stop-opacity="0.12"/>
      <stop offset="70%" stop-color="#FF6F5E" stop-opacity="0.0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#water)"/>
  <rect width="${W}" height="${H}" fill="url(#rays)"/>
  <rect width="${W}" height="${H}" fill="url(#coral)"/>
</svg>`;

// Mountain/Outdoor: alpine ridgeline at first light — deep pine sky fading to misty
// glacier-blue horizon, with a soft warm alpenglow behind layered mountain ridges.
const mountain = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="alpineSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#161F18"/>
      <stop offset="35%" stop-color="#2E3D31"/>
      <stop offset="65%" stop-color="#5C7A63"/>
      <stop offset="85%" stop-color="#A8D2DC"/>
      <stop offset="100%" stop-color="#D6E2D7"/>
    </linearGradient>
    <radialGradient id="alpenglow" cx="50%" cy="62%" r="55%">
      <stop offset="0%"  stop-color="#FFD9B3" stop-opacity="0.55"/>
      <stop offset="40%" stop-color="#FFD9B3" stop-opacity="0.18"/>
      <stop offset="70%" stop-color="#FFD9B3" stop-opacity="0.0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#alpineSky)"/>
  <rect width="${W}" height="${H}" fill="url(#alpenglow)"/>
  <path d="M0,640 L220,480 L430,610 L660,430 L900,580 L1150,460 L1400,570 L1600,480 L1600,900 L0,900 Z" fill="#6B8C73" opacity="0.55"/>
  <path d="M0,760 L260,580 L520,730 L780,540 L1040,710 L1320,560 L1600,690 L1600,900 L0,900 Z" fill="#1A2620"/>
</svg>`;

async function render(svg, name) {
  const path = join(OUT, name);
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(path);
  console.log("wrote", path);
}

await render(aviation, "aviation-hero.jpg");
await render(scuba, "scuba-diving-hero.jpg");
await render(mountain, "mountain-adventure-hero.jpg");
