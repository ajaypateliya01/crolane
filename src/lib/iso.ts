/**
 * Isometric line-art illustrations, generated at build time as inline SVG.
 * One small engine (point projection + box faces) draws every service scene,
 * so there are no image files to download and the art stays crisp.
 */

export type IllKey = 'audit' | 'ab' | 'shop' | 'ga4' | 'tags' | 'voice' | 'flow' | 'chip';

const C = 0.866;
const OX = 200;
const OY = 96;
const INK = '#1b1233';

type P3 = [number, number, number];

// Project a 3D point to 2D isometric screen space.
const pt = (x: number, y: number, z: number) =>
  [(OX + (x - y) * C).toFixed(1), (OY + (x + y) * 0.5 - z).toFixed(1)];

const pts = (list: P3[]) => list.map((p) => pt(...p).join(',')).join(' ');

const poly = (list: P3[], fill: string) =>
  `<polygon points="${pts(list)}" fill="${fill}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;

const line = (list: P3[], w = 1.5, c = INK, dash = '') =>
  `<polyline points="${pts(list)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const PAL = {
  w: ['#ffffff', '#e4e0f2', '#c9c2e4'],
  l: ['#cdc4f6', '#a99bec', '#8a7adf'],
  d: ['#3a2d66', '#271c4b', '#1b1233'],
} as const;

// A box with its three visible faces: top, front-left, front-right.
function box(x: number, y: number, z: number, w: number, d: number, h: number, p: keyof typeof PAL = 'w') {
  const c = PAL[p];
  return (
    poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], c[0]) +
    poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], c[1]) +
    poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], c[2])
  );
}

const shadow = (x: number, y: number, w: number, d: number) =>
  `<polygon points="${pts([[x + 6, y + 6, 0], [x + w + 10, y + 6, 0], [x + w + 10, y + d + 10, 0], [x + 6, y + d + 10, 0]])}" fill="${INK}" opacity=".12"/>`;

const GLYPH: Record<string, string> = {
  bar: `<path d="M-5 5V1M0 5V-4M5 5V-1" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
  pct: `<path d="M-4 5 4-5" stroke="${INK}" stroke-width="1.5"/><circle cx="-3.5" cy="-3.5" r="1.6" fill="none" stroke="${INK}" stroke-width="1.3"/><circle cx="3.5" cy="3.5" r="1.6" fill="none" stroke="${INK}" stroke-width="1.3"/>`,
  chk: `<path d="M-4 0 -1 3 4-3" fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round"/>`,
  bolt: `<path d="M1-6-3 1h3l-1 5 4-7H0z" fill="${INK}"/>`,
  dot: `<circle r="3.5" fill="#8a7adf" stroke="${INK}" stroke-width="1.3"/>`,
  ai: `<text y="3.5" text-anchor="middle" font-size="9" font-weight="800" font-family="system-ui,sans-serif" fill="${INK}">AI</text>`,
  tag: `<path d="M-5-5h5l5 5-5 5-5-5z" fill="none" stroke="${INK}" stroke-width="1.5"/><circle cx="-2" cy="-2" r="1.2" fill="${INK}"/>`,
};

// Small floating icon card above the scene.
const tile = (cx: number, cy: number, g: string, cls = 'flo') =>
  `<g class="${cls}"><g transform="translate(${cx} ${cy})"><rect x="-11" y="-12" width="22" height="24" rx="4" fill="#fff" stroke="${INK}" stroke-width="1.5"/>${GLYPH[g]}</g></g>`;

const scene = (body: string, tiles = '') =>
  `<svg viewBox="0 0 400 300" aria-hidden="true" focusable="false"><rect x="146" y="40" width="108" height="260" fill="#b9adf3"/><g transform="translate(0 38)">${body}${tiles}</g></svg>`;

const DASH = '#6a3dd3';

const SCENES: Record<IllKey, () => string> = {
  audit: () =>
    scene(
      shadow(-60, -20, 150, 110) +
        box(-60, -20, 0, 150, 110, 12) +
        box(-40, 0, 12, 22, 22, 30) +
        box(-10, 0, 12, 22, 22, 52, 'l') +
        box(20, 0, 12, 22, 22, 80) +
        box(50, 0, 12, 22, 22, 104, 'd') +
        `<g transform="translate(236 196)"><circle r="30" fill="#fff" stroke="${INK}" stroke-width="2"/><circle r="22" fill="#e9e5fc" stroke="${INK}" stroke-width="1.5"/><path d="M-12 6l7-7 6 5 10-12" fill="none" stroke="${DASH}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21l22 22" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M21 21l22 22" stroke="#8a7adf" stroke-width="5" stroke-linecap="round"/></g>`,
      tile(118, 40, 'pct') + tile(292, 58, 'bar', 'flo2') + tile(176, 16, 'chk', 'flo2'),
    ),
  ab: () => {
    const a = pt(-20, 18, 58);
    const b = pt(50, 18, 58);
    return scene(
      shadow(-70, -10, 160, 100) +
        box(-70, -10, 0, 160, 100, 10) +
        box(-50, 10, 10, 60, 8, 86) +
        box(20, 10, 10, 60, 8, 86, 'l') +
        `<text x="${a[0]}" y="${a[1]}" font-size="26" font-weight="800" font-family="system-ui,sans-serif" fill="${INK}" text-anchor="middle">A</text><text x="${b[0]}" y="${b[1]}" font-size="26" font-weight="800" font-family="system-ui,sans-serif" fill="#fff" text-anchor="middle">B</text>` +
        line([[-44, 18, 34], [2, 18, 34]], 3, '#c9c2e4') +
        line([[26, 18, 34], [72, 18, 34]], 3, '#3a2d66') +
        box(40, 60, 10, 26, 26, 18, 'd'),
      tile(118, 60, 'pct') + tile(292, 44, 'chk', 'flo2') + tile(255, 14, 'bar'),
    );
  },
  shop: () =>
    scene(
      shadow(-50, -20, 120, 100) +
        box(-50, -20, 0, 120, 100, 10) +
        box(-30, 0, 10, 70, 46, 70, 'l') +
        line([[-10, 23, 80], [-6, 23, 104], [18, 23, 104], [22, 23, 80]], 3) +
        box(48, 30, 10, 26, 26, 24) +
        box(48, 58, 10, 26, 26, 14, 'd'),
      tile(116, 46, 'tag') + tile(290, 60, 'pct', 'flo2') + tile(250, 16, 'bolt'),
    ),
  ga4: () =>
    scene(
      shadow(-70, -20, 160, 110) +
        box(-70, -20, 0, 160, 110, 10) +
        [[-50, 24], [-24, 44], [2, 62], [28, 86], [54, 112]]
          .map((b, i) => box(b[0], 10, 10, 20, 20, b[1], i === 4 ? 'd' : i % 2 ? 'l' : 'w'))
          .join('') +
        line([[-50, 60, 140], [-20, 60, 150], [10, 60, 148], [40, 60, 170], [70, 60, 186]], 2, DASH, '4 4'),
      tile(118, 44, 'bar') + tile(296, 40, 'chk', 'flo2') + tile(160, 16, 'dot', 'flo2'),
    ),
  tags: () =>
    scene(
      shadow(-70, -30, 160, 130) +
        box(-70, -30, 0, 160, 130, 8) +
        box(-50, -10, 8, 30, 30, 30, 'l') +
        box(20, -10, 8, 30, 30, 30) +
        box(-50, 50, 8, 30, 30, 30) +
        box(20, 50, 8, 30, 30, 30, 'd') +
        line([[-20, 5, 24], [20, 5, 24]], 2, DASH, '4 4') +
        line([[-35, 20, 24], [-35, 50, 24]], 2, DASH, '4 4') +
        line([[35, 20, 24], [35, 50, 24]], 2, DASH, '4 4'),
      tile(120, 52, 'tag') + tile(290, 48, 'chk', 'flo2') + tile(200, 16, 'bolt'),
    ),
  voice: () =>
    scene(
      shadow(-40, -10, 110, 90) +
        box(-40, -10, 0, 110, 90, 10) +
        box(-10, 10, 10, 40, 12, 110, 'd') +
        poly([[-4, 22, 30], [24, 22, 30], [24, 22, 108], [-4, 22, 108]], '#cdc4f6') +
        `<g fill="none" stroke="${DASH}" stroke-width="2.4" stroke-linecap="round"><path d="M262 120a24 24 0 0 1 0 40"/><path d="M276 108a42 42 0 0 1 0 64"/><path d="M290 96a60 60 0 0 1 0 88"/></g><g transform="translate(104 150)"><rect width="56" height="30" rx="12" fill="#fff" stroke="${INK}" stroke-width="1.5"/><path d="M14 30l-4 8 10-8" fill="#fff" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><circle cx="18" cy="15" r="2.5" fill="${INK}"/><circle cx="28" cy="15" r="2.5" fill="${INK}"/><circle cx="38" cy="15" r="2.5" fill="${INK}"/></g>`,
      tile(300, 62, 'chk', 'flo2') + tile(132, 44, 'ai'),
    ),
  flow: () =>
    scene(
      shadow(-90, -10, 200, 90) +
        box(-90, -10, 0, 200, 90, 8) +
        box(-75, 15, 8, 30, 30, 26) +
        box(-25, 15, 8, 30, 30, 26, 'l') +
        box(25, 15, 8, 30, 30, 26, 'd') +
        box(75, 15, 8, 30, 30, 26) +
        line([[-45, 30, 21], [-25, 30, 21]], 2, DASH, '4 4') +
        line([[5, 30, 21], [25, 30, 21]], 2, DASH, '4 4') +
        line([[55, 30, 21], [75, 30, 21]], 2, DASH, '4 4'),
      tile(130, 50, 'bolt') + tile(272, 40, 'ai', 'flo2') + tile(200, 18, 'chk'),
    ),
  chip: () =>
    scene(
      shadow(-60, -30, 140, 130) +
        box(-60, -30, 0, 140, 130, 8) +
        box(-30, -5, 8, 70, 70, 16, 'd') +
        box(-15, 10, 24, 40, 40, 6, 'l') +
        [0, 14, 28, 42, 56].map((i) => line([[-23 + i, 65, 12], [-23 + i, 75, 8]], 2)).join('') +
        [0, 14, 28, 42, 56].map((i) => line([[40, 2 + i, 12], [50, 2 + i, 8]], 2)).join('') +
        box(60, 70, 8, 24, 24, 10) +
        box(60, 70, 18, 24, 24, 10, 'l') +
        box(60, 70, 28, 24, 24, 10),
      tile(122, 48, 'ai') + tile(288, 50, 'pct', 'flo2') + tile(200, 14, 'chk', 'flo2'),
    ),
};

export const illustration = (key: IllKey) => SCENES[key]();
