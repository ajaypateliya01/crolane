/**
 * Generates public/images/og-default.png (1200x630 social card) with sharp.
 * The committed PNG can be regenerated at any time: npm run og
 */
import sharp from 'sharp';

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FBFAF7"/>
      <stop offset="1" stop-color="#EEF1F7"/>
    </linearGradient>
    <linearGradient id="glowA" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#3E4EF5" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#3E4EF5" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glowB" x1="1" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#C77415" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#C77415" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glowA)"/>
  <rect width="${W}" height="${H}" fill="url(#glowB)"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#16161B" stroke-opacity="0.14" stroke-width="2" rx="28"/>
  <circle cx="${W - 140}" cy="150" r="86" fill="none" stroke="#3E4EF5" stroke-opacity="0.55" stroke-width="3"/>
  <path d="M ${W - 260} ${H - 160} q 60 -110 130 -60 t 140 -80" fill="none" stroke="#C77415" stroke-opacity="0.7" stroke-width="4" stroke-linecap="round"/>
  <circle cx="${W - 140}" cy="150" r="8" fill="#3E4EF5"/>
  <text x="96" y="290" font-family="Georgia, 'Times New Roman', serif" font-size="118" fill="#16161B">CROLANE</text>
  <text x="100" y="360" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#4B4B57">Conversion optimization, measurement and practical AI</text>
  <text x="100" y="${H - 90}" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#7A7A85">crolane.in</text>
  <rect x="96" y="${H - 146}" width="120" height="6" rx="3" fill="#16161B"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/images/og-default.png');
console.log('public/images/og-default.png written');
