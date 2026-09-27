(() => {
'use strict';
/* ================= Utilities ================= */
const $ = s => document.querySelector(s);
const fmt = n => Math.round(n).toLocaleString('en-US');
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (n, k) => shuffle([...Array(n).keys()]).slice(0, k);
const wpick = (items, weights) => { const tot = weights.reduce((a, b) => a + b, 0); let r = Math.random() * tot; for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r < 0) return items[i]; } return items[items.length - 1]; };
const chipSvg = (cls = '') => `<svg class="chip ${cls}"><use href="#i-chip"/></svg>`;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const msToMidnight = () => { const n = new Date(); const m = new Date(n); m.setHours(24, 0, 0, 0); return m - n; };
const hms = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(v => String(v).padStart(2, '0')).join(':'); };
function splitInt(m, k) { if (k <= 1) return [m]; const cuts = new Set(); while (cuts.size < k - 1) cuts.add(rand(1, m - 1)); const c = [0, ...[...cuts].sort((a, b) => a - b), m]; return c.slice(1).map((v, i) => v - c[i]); }

/* ================= Themes ================= */
const TIERS = [
  { price: 2, name: 'Mini', desc: '', chip: 'white' },
  { price: 3, name: 'Pocket', desc: 'Quick scratches at small stakes.', chip: 'blue' },
  { price: 5, name: 'Classic', desc: 'More games on every ticket.', chip: '' },
  { price: 10, name: 'Premium', desc: 'Bigger boards and richer prizes.', chip: 'green' },
  { price: 15, name: 'Elite', desc: '', chip: 'purple' },
  { price: 20, name: 'High Roller', desc: 'The biggest boards on the floor.', chip: 'black' },
];
const TIER_CFG = {
  3: { games: 4, nums: 3, cells: 9, cols: 3, wsym: 2, ysym: 8, rows: 4 },
  5: { games: 5, nums: 3, cells: 9, cols: 3, wsym: 2, ysym: 8, rows: 5 },
  10: { games: 6, nums: 4, cells: 12, cols: 4, wsym: 3, ysym: 12, rows: 6 },
  20: { games: 8, nums: 4, cells: 12, cols: 4, wsym: 3, ysym: 12, rows: 7 },
};
const T = (o) => o;
const THEMES = [
  // Mini · 2
  T({ id: 'penny', code: 'PNY', name: 'Lucky Penny', price: 2, emblem: '🍁', pattern: 'dots',
      c: ['#5A2A12', '#B5651D', '#F2B880'], tx: '#FFF4E8', paper: '#FFF4E8', ink: '#5A2A12', acc: '#C85A12', foil: ['#D9C3AE', '#A1866C'], stage: ['#3A1A0A', '#0E0603'],
      fx: { mode: 'drift', shape: 'star', colors: ['#F2B880', '#FFD8A8', '#E08A4A'], count: 45, size: [2, 5] } }),
  T({ id: 'plinko', code: 'PLK', name: 'Plinko Party', price: 2, emblem: '🎪', pattern: 'grid',
      c: ['#2B0F54', '#8A2BE2', '#FF4FA3'], tx: '#FFFFFF', paper: '#FFF7FC', ink: '#3A0A5E', acc: '#FF2E88', foil: ['#C9B6E4', '#8A74B0'], stage: ['#1C0838', '#07020F'],
      fx: { mode: 'fall', shape: 'circle', colors: ['#FF4FA3', '#FFD300', '#3DF2FF', '#FFFFFF'], count: 40, size: [2, 5], speed: [60, 140] } }),
  T({ id: 'garden', code: 'GDN', name: 'Garden Grow', price: 2, emblem: '🌻', pattern: 'dots',
      c: ['#1B4332', '#52B788', '#FFE066'], tx: '#F1FFF4', paper: '#F7FFF7', ink: '#1B4332', acc: '#E07000', foil: ['#C8D8BC', '#8FA383'], stage: ['#0E2A1E', '#030A07'],
      fx: { mode: 'drift', shape: 'glyph', glyphs: ['🌼', '🦋', '🌱'], count: 12, size: [14, 22] } }),
  T({ id: 'soccer', code: 'PKK', name: 'Penalty Kick', price: 2, emblem: '⚽', pattern: 'stripes',
      c: ['#081C15', '#1B7A43', '#9BE39B'], tx: '#FFFFFF', paper: '#F4FFF4', ink: '#0B3D0B', acc: '#E8175D', foil: ['#C3D6C3', '#879A87'], stage: ['#06150F', '#010503'],
      fx: { mode: 'drift', shape: 'bokeh', colors: ['#FFFFFF', '#E9F5DB', '#B9F2C9'], count: 16, size: [18, 50] } }),
  T({ id: 'bee', code: 'BEE', name: 'Spelling Bee', price: 2, emblem: '🐝', pattern: 'diamonds',
      c: ['#F4A300', '#FFC93C', '#FFE9A8'], tx: '#2A1B00', paper: '#FFFBEA', ink: '#5A3E00', acc: '#D96C00', foil: ['#E3D3A6', '#AD9A66'], stage: ['#2E2000', '#0B0800'],
      fx: { mode: 'drift', shape: 'glyph', glyphs: ['🐝', '🍯'], count: 10, size: [16, 24] } }),
  // Pocket · 3
  T({ id: 'sugar', code: 'SGR', name: 'Sugar Rush', price: 3, mech: 'match', emblem: '🍭', pattern: 'dots',
      c: ['#FF5FA2', '#FF8C6B', '#FFD36B'], tx: '#3B0A26', paper: '#FFF4F8', ink: '#7A1847', acc: '#E8207A', foil: ['#E7C3D6', '#B98BA6'], stage: ['#3A0B26', '#12030C'],
      fx: { mode: 'fall', shape: 'rect', colors: ['#FF5FA2', '#FFD86B', '#6FE3FF', '#FFFFFF', '#9B7BFF'], count: 80, size: [6, 11], speed: [40, 90] } }),
  T({ id: 'clover', code: 'CLV', name: 'Lucky Clover', price: 3, mech: 'lucky', emblem: '🍀', pattern: 'diamonds',
      c: ['#0F5A3A', '#1E8C57', '#8FD18A'], tx: '#F3FFF4', paper: '#F2FBF1', ink: '#134A2E', acc: '#E0A91B', foil: ['#CBD8C9', '#93A993'], stage: ['#0B3A26', '#041109'],
      fx: { mode: 'fall', shape: 'glyph', glyphs: ['🍀', '☘️'], count: 18, size: [16, 28], speed: [25, 55], extra: 'sparkle' } }),
  T({ id: 'fruit', code: 'FRT', name: 'Fruit Stand', price: 3, mech: 'symbols', emblem: '🍉', pattern: 'stripes',
      c: ['#FF6B3D', '#FFA64A', '#8BD37C'], tx: '#2B1200', paper: '#FFF8EE', ink: '#7A2E0B', acc: '#E8431C', foil: ['#E6D3B8', '#BFA37F'], stage: ['#3E1405', '#140602'],
      symbols: ['🍒', '🍋', '🍇', '🍉', '🍓', '🍍', '🍑', '🍏', '🥝', '🍌'],
      fx: { mode: 'fall', shape: 'glyph', glyphs: ['🍒', '🍋', '🍇', '🍓', '🍑'], count: 16, size: [18, 28], speed: [35, 70] } }),
  T({ id: 'arcade', code: 'ARC', name: 'Neon Arcade', price: 3, mech: 'beat', emblem: '👾', pattern: 'grid', beat: ['Your score', 'High score'],
      c: ['#1A0B45', '#4B0FA8', '#F72585'], tx: '#FFFFFF', paper: '#FBF7FF', ink: '#2A0A5E', acc: '#F72585', foil: ['#8C7FD8', '#4B3F99'], stage: ['#12062E', '#05010F'],
      fx: { mode: 'grid' } }),
  T({ id: 'pirate', code: 'PIR', name: "Pirate's Cove", price: 3, mech: 'symbols', emblem: '🏴‍☠️', pattern: 'waves',
      c: ['#0B3954', '#087E8B', '#E0C097'], tx: '#FFF6E5', paper: '#FFF6E5', ink: '#3D2B1F', acc: '#C8862E', foil: ['#C2B8A3', '#8C8170'], stage: ['#06283D', '#020B12'],
      symbols: ['💰', '🗝️', '⚓', '🦜', '🗺️', '💎', '🧭', '🍾', '⚔️', '🐚'],
      fx: { mode: 'rise', shape: 'bubble', colors: ['#BDF3FF'], count: 40, size: [3, 12], speed: [25, 60] } }),
  // Classic · 5
  T({ id: 'cosmic', code: 'CSM', name: 'Cosmic Multiplier', price: 5, mech: 'lucky', emblem: '🪐', pattern: 'stars',
      c: ['#0A0A2E', '#2B2D7E', '#8A2CBF'], tx: '#FFFFFF', paper: '#F1EEFF', ink: '#2B1B6B', acc: '#E0A800', foil: ['#B8B5D9', '#77739F'], stage: ['#0B0A2A', '#020109'],
      fx: { mode: 'twinkle', count: 170, shooting: true } }),
  T({ id: 'deep', code: 'DPB', name: 'Deep Blue', price: 5, mech: 'symbols', emblem: '🐋', pattern: 'waves',
      c: ['#03254C', '#1167B1', '#2A9DF4'], tx: '#EAF6FF', paper: '#EAF6FF', ink: '#06345E', acc: '#0096C7', foil: ['#A9C3D9', '#6A8BAA'], stage: ['#021B38', '#010710'],
      symbols: ['🐠', '🐙', '🦀', '🐚', '🐬', '🦑', '🐡', '🪸', '🐢', '🦈'],
      fx: { mode: 'rise', shape: 'bubble', colors: ['#9EE7FF'], count: 55, size: [2, 14], speed: [20, 70], extra: 'rays' } }),
  T({ id: 'dragon', code: 'DRG', name: "Dragon's Hoard", price: 5, mech: 'beat', emblem: '🐉', pattern: 'diamonds', beat: ['Your flame', "Dragon's flame"],
      c: ['#2B0A0A', '#8B1E1E', '#F07F2A'], tx: '#FFF1DE', paper: '#FFF1DE', ink: '#6B1414', acc: '#E8590C', foil: ['#C9A58A', '#8A6650'], stage: ['#2A0606', '#0A0101'],
      fx: { mode: 'rise', shape: 'ember', colors: ['#FFB347', '#FF7A1A', '#FFD27A'], count: 70, size: [1.5, 3.5], speed: [40, 110] } }),
  T({ id: 'snow', code: 'SNW', name: 'Snow Day', price: 5, mech: 'match', emblem: '⛄', pattern: 'dots',
      c: ['#9ED2FF', '#D7ECFF', '#FFFFFF'], tx: '#0E3558', paper: '#FFFFFF', ink: '#0E3558', acc: '#2F7BF5', foil: ['#D7DEE6', '#A3B1C2'], stage: ['#123456', '#050E1A'],
      fx: { mode: 'fall', shape: 'circle', colors: ['#FFFFFF'], count: 120, size: [1.5, 4.5], speed: [25, 70] } }),
  T({ id: 'jungle', code: 'JGL', name: 'Jungle Quest', price: 5, mech: 'symbols', emblem: '🌴', pattern: 'stripes',
      c: ['#0B3D2E', '#1F7A4D', '#C9D86B'], tx: '#F4FBEA', paper: '#F4FBEA', ink: '#1F3B14', acc: '#E07A2E', foil: ['#BFC9A8', '#869272'], stage: ['#082A1F', '#020A07'],
      symbols: ['🐒', '🦜', '🐍', '🐸', '🦋', '🐆', '🌺', '🍌', '🦎', '🐘'],
      fx: { mode: 'fall', shape: 'glyph', glyphs: ['🍃', '🌿', '🍂'], count: 18, size: [16, 26], speed: [25, 55] } }),
  // Premium · 10
  T({ id: 'pharaoh', code: 'PHR', name: "Pharaoh's Gold", price: 10, mech: 'lucky', emblem: '🏺', pattern: 'rays',
      c: ['#3A2A0B', '#B8860B', '#F2D16B'], tx: '#FFF7DA', paper: '#FFF7DA', ink: '#5A3E07', acc: '#1E6FB8', foil: ['#DAC593', '#A38850'], stage: ['#2E2006', '#0C0802'],
      fx: { mode: 'drift', shape: 'star', colors: ['#FFE08A', '#FFF4CC', '#F2C14E'], count: 60, size: [2, 6] } }),
  T({ id: 'vegas', code: 'VGS', name: 'Midnight Vegas', price: 10, mech: 'match', emblem: '🎰', pattern: 'diamonds',
      c: ['#0D0221', '#3A1470', '#FF3864'], tx: '#FFFFFF', paper: '#FFF5F8', ink: '#3A0A2A', acc: '#FF2E63', foil: ['#9C8BBE', '#584877'], stage: ['#140434', '#04010B'],
      fx: { mode: 'drift', shape: 'bokeh', colors: ['#FF3864', '#2DE2E6', '#F9C80E', '#9B5DE5'], count: 26, size: [20, 60] } }),
  T({ id: 'blossom', code: 'BLS', name: 'Cherry Blossom', price: 10, mech: 'symbols', emblem: '🌸', pattern: 'dots',
      c: ['#FFC9D8', '#FF9FBA', '#B77DDB'], tx: '#4A1030', paper: '#FFF5F8', ink: '#7A1F4A', acc: '#D6336C', foil: ['#E8CAD5', '#BF95A8'], stage: ['#3A1030', '#12040E'],
      symbols: ['🏮', '🎐', '🍡', '🦢', '🍵', '🎋', '🪭', '🐟', '🌙', '🎎'],
      fx: { mode: 'fall', shape: 'petal', colors: ['#FFC0D3', '#FF9FBA', '#FFE3EC'], count: 50, size: [6, 11], speed: [25, 55], extra: 'glyph', glyphs: ['🌸'] } }),
  T({ id: 'west', code: 'WST', name: 'Wild West', price: 10, mech: 'beat', emblem: '🤠', pattern: 'stripes', beat: ['Your draw', "Outlaw's draw"],
      c: ['#3B2412', '#A0522D', '#E9B872'], tx: '#FFF3DC', paper: '#FFF3DC', ink: '#4A2A12', acc: '#C0392B', foil: ['#CDB594', '#94795A'], stage: ['#3A200C', '#0E0703'],
      fx: { mode: 'wind', shape: 'dust', colors: ['#E9B872', '#C98B4E', '#F6DDB0'], count: 90, size: [1, 3], speed: [80, 200], extra: 'tumble' } }),
  T({ id: 'aurora', code: 'AUR', name: 'Aurora', price: 10, mech: 'lucky', emblem: '🌌', pattern: 'waves',
      c: ['#061A2B', '#0B6E6E', '#7B2FBF'], tx: '#EFFFFB', paper: '#EFFFFB', ink: '#0B3D3D', acc: '#0CB57E', foil: ['#A8C9C4', '#6C8E8A'], stage: ['#04121F', '#010509'],
      fx: { mode: 'aurora', count: 110 } }),
  // Elite · 15
  T({ id: 'prix', code: 'GPX', name: 'Grand Prix', price: 15, emblem: '🏎️', pattern: 'grid',
      c: ['#111111', '#B00000', '#FFBA08'], tx: '#FFFFFF', paper: '#F7F7F7', ink: '#111111', acc: '#D00000', foil: ['#C9C9C9', '#8A8A8A'], stage: ['#1A0000', '#050000'],
      fx: { mode: 'wind', shape: 'dust', colors: ['#FFFFFF', '#FFBA08'], count: 55, size: [1, 2.5], speed: [400, 800] } }),
  T({ id: 'volcano', code: 'VLC', name: 'Volcano', price: 15, emblem: '🌋', pattern: 'rays',
      c: ['#1A0A05', '#9D0208', '#FF7B00'], tx: '#FFEFE0', paper: '#FFF1E6', ink: '#5A0A02', acc: '#E85D04', foil: ['#CDA894', '#8F6B58'], stage: ['#240603', '#080100'],
      fx: { mode: 'rise', shape: 'ember', colors: ['#FF7B00', '#FFB703', '#FF4800'], count: 55, size: [1.5, 3.5], speed: [50, 130] } }),
  T({ id: 'mirror', code: 'MRR', name: 'Mirror Maze', price: 15, emblem: '🪞', pattern: 'diamonds',
      c: ['#101828', '#475467', '#98A2B3'], tx: '#FFFFFF', paper: '#F9FAFB', ink: '#101828', acc: '#7F56D9', foil: ['#D0D5DD', '#8C94A3'], stage: ['#0C111D', '#020308'],
      fx: { mode: 'drift', shape: 'star', colors: ['#FFFFFF', '#D6BBFB', '#E4E7EC'], count: 55, size: [2, 6] } }),
  T({ id: 'robo', code: 'RBL', name: 'Robo Lab', price: 15, emblem: '🤖', pattern: 'grid',
      c: ['#03045E', '#0077B6', '#48CAE4'], tx: '#FFFFFF', paper: '#EFFBFF', ink: '#03045E', acc: '#0096C7', foil: ['#B8D4E0', '#7898A8'], stage: ['#020340', '#00010D'],
      fx: { mode: 'twinkle', count: 110 } }),
  T({ id: 'bowling', code: 'BWL', name: 'Bowling Night', price: 15, emblem: '🎳', pattern: 'stripes',
      c: ['#240046', '#7B2CBF', '#E0AAFF'], tx: '#FFFFFF', paper: '#FAF5FF', ink: '#240046', acc: '#E05A00', foil: ['#CDBCE0', '#8F7BA8'], stage: ['#180030', '#05000C'],
      fx: { mode: 'drift', shape: 'bokeh', colors: ['#E0AAFF', '#FF9E00', '#48CAE4'], count: 20, size: [20, 55] } }),
  // High roller · 20
  T({ id: 'diamond', code: 'DMD', name: 'Diamond Vault', price: 20, mech: 'match', emblem: '💎', pattern: 'diamonds',
      c: ['#0E1A26', '#2E4A62', '#A9D6E5'], tx: '#F4FBFF', paper: '#F4FBFF', ink: '#11324D', acc: '#1CA7EC', foil: ['#C7D3DC', '#8595A3'], stage: ['#0A1520', '#020508'],
      fx: { mode: 'drift', shape: 'star', colors: ['#FFFFFF', '#BDEBFF', '#7FDBFF'], count: 70, size: [2, 7] } }),
  T({ id: 'crown', code: 'CRN', name: 'Royal Crown', price: 20, mech: 'symbols', emblem: '👑', pattern: 'rays',
      c: ['#2A0845', '#6A1B9A', '#D4AF37'], tx: '#FFF8E1', paper: '#FFF8E1', ink: '#3E0E5C', acc: '#B8860B', foil: ['#D8C79A', '#9C8756'], stage: ['#22063A', '#08010F'],
      symbols: ['💍', '🏰', '🦁', '🗡️', '🛡️', '🍷', '📜', '🐎', '🦚', '🔱'],
      fx: { mode: 'fall', shape: 'rect', colors: ['#F2D16B', '#D4AF37', '#FFF1B8', '#B98BE0'], count: 70, size: [5, 10], speed: [40, 90] } }),
  T({ id: 'thunder', code: 'THN', name: 'Thunder Strike', price: 20, mech: 'beat', emblem: '⚡', pattern: 'stripes', beat: ['Your bolt', "Storm's bolt"],
      c: ['#0A0F1F', '#1F3A93', '#F9D71C'], tx: '#FFFFFF', paper: '#EEF3FF', ink: '#0F1E4D', acc: '#E0B400', foil: ['#AEB9D4', '#67749A'], stage: ['#0A1230', '#02040C'],
      fx: { mode: 'storm', count: 140 } }),
  T({ id: 'sevens', code: 'SVN', name: 'Jackpot 7s', price: 20, mech: 'lucky', emblem: '', emblemText: '777', pattern: 'stripes',
      c: ['#3D0000', '#B3001B', '#FF8A00'], tx: '#FFFFFF', paper: '#FFF6E0', ink: '#7A0010', acc: '#E0A100', foil: ['#D9C08E', '#9E834F'], stage: ['#330007', '#0C0002'],
      fx: { mode: 'drift', shape: 'bokeh', colors: ['#FF2E2E', '#FFC300', '#FF8A00'], count: 24, size: [20, 55], extra: 'sparkle' } }),
  T({ id: 'nova', code: 'NVA', name: 'Supernova', price: 20, mech: 'lucky', emblem: '🌟', pattern: 'stars', games: 10,
      c: ['#05010F', '#3A0CA3', '#FF006E'], tx: '#FFFFFF', paper: '#F6F0FF', ink: '#2A0A5E', acc: '#E0006A', foil: ['#B3A8D6', '#6D5FA0'], stage: ['#150633', '#030009'],
      fx: { mode: 'twinkle', count: 200, nova: true } }),
];
const byId = Object.fromEntries(THEMES.map(t => [t.id, t]));
const mechLabel = t => MECHS[t.mech].label;
const ruleText = t => MECHS[t.mech].rule;
const themeVars = t => `--c1:${t.c[0]};--c2:${t.c[1]};--c3:${t.c[2]};--tx:${t.tx};--acc:${t.acc};--paper:${t.paper};--ink:${t.ink};--s1:${t.stage[0]};--s2:${t.stage[1]}`;
const emblemHTML = t => t.emblemText ? `<span class="etext">${t.emblemText}</span>` : t.emblem;

/* ================= Ticket generation ================= */
// About 41% of tickets win something; on average a ticket pays back about 95% of its price.
const PAYTABLE = [[200, .0002], [50, .0008], [20, .003], [10, .01], [5, .025], [3, .05], [2, .11], [1, .21]];
const DENOMS = [1, 2, 3, 5, 10, 20, 50, 200];
const DECOY_W = [30, 26, 16, 12, 8, 5, 3, 2];
function drawTotal(P) { const r = Math.random(); let acc = 0; for (const [m, p] of PAYTABLE) { acc += p; if (r < acc) return m * P; } return 0; }
const decoy = P => wpick(DENOMS, DECOY_W) * P;


/* ================= 20 unique games ================= */
const MECH_OF = { penny: 'headsup', plinko: 'plinko', garden: 'run3', soccer: 'penalty', bee: 'spell', prix: 'overtake', volcano: 'hilo', mirror: 'mirror', robo: 'alleven', bowling: 'turkey', sugar: 'match3', clover: 'lucky', fruit: 'slots', arcade: 'beat', pirate: 'find', cosmic: 'multiply', deep: 'dive', dragon: 'rps', snow: 'tictac', jungle: 'collect',
  pharaoh: 'curse', vegas: 'blackjack', blossom: 'make10', west: 'poker', aurora: 'ladder', diamond: 'gempair', crown: 'joust', thunder: 'charge', sevens: 'dice7', nova: 'bingo' };
THEMES.forEach(t => { t.mech = MECH_OF[t.id]; });

const A = (i, cls, inner) => `<div class="area ${cls}" data-a="${i}"><div class="in">${inner}</div><canvas class="foil"></canvas></div>`;
const amt = v => `<b class="amt">${fmt(v)}</b>`;
const lab = s => `<small>${s}</small>`;
const pbox = (i, v) => A(i, 'pbox', `${lab('Prize')}<span class="pv">${chipSvg()}<b>${fmt(v)}</b></span>`);
// Split a win into k prizes that all sit on the ticket's fixed prize ladder (1×, 2×, 3×, 5×, 10×, 20×, 50×, 200×).
function splitDenoms(m, k) {
  if (k <= 1) return [m];
  for (let t = 0; t < 200; t++) {
    const parts = []; let rem = m;
    for (let j = 0; j < k - 1; j++) { const opts = DENOMS.filter(d => d < rem); if (!opts.length) break; const d = pick(opts); parts.push(d); rem -= d; }
    if (parts.length === k - 1 && DENOMS.includes(rem)) return shuffle([...parts, rem]);
  }
  return [m];
}
function partsOf(T, P, maxK, slots) { const m = T / P; if (!m) return []; const k = m >= 50 ? 1 : Math.min(rand(1, maxK), slots); return splitDenoms(m, k).map(x => x * P); }
function rowsWith(T, P, R, maxK = 3) { const ps = partsOf(T, P, maxK, R), pos = sample(R, ps.length); return [...Array(R)].map((_, i) => { const j = pos.indexOf(i); return j >= 0 ? { win: true, p: ps[j] } : { win: false, p: decoy(P) }; }); }
const rowGroups = rows => rows.map((r, i) => r.win ? { cells: [i], deps: [], v: r.p } : null).filter(Boolean);

const rowN = (rows, n) => rows.map((r, i) => r.win ? { cells: [...Array(n + 1).keys()].map(k => i * (n + 1) + k), deps: [], v: r.p } : null).filter(Boolean);
function boxRows(tk, n, heads, cell) {
  return `<div class="brows" style="--n:${n}"><div class="bhead">${heads.map(h => `<span>${h}</span>`).join('')}<span>Prize</span></div>
    ${tk.data.rows.map((r, i) => `<div class="brow2">${[...Array(n).keys()].map(k => A(i * (n + 1) + k, 'bx', cell(r, k))).join('')}${A(i * (n + 1) + n, 'bx bp', amt(r.p))}</div>`).join('')}</div>`;
}
const rp = p => `<div class="rp">${lab('Prize')}${amt(p)}</div>`;
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const pipMap = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const die = n => `<span class="die">${[...Array(9).keys()].map(k => `<i${pipMap[n].includes(k) ? '' : ' class="o"'}></i>`).join('')}</span>`;
const SUITS = ['♠', '♥', '♦', '♣'];
const RANK = r => ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A' })[r] || String(r);
const card = (r, s, big) => `<span class="card${big ? ' big' : ''}${s === '♥' || s === '♦' ? ' red' : ''}"><b>${r}</b><i>${s}</i></span>`;
const GEMS = ['#E63946', '#2A9D8F', '#F4C542', '#8E6CD9', '#3A86FF', '#F28C38'];

const LEAF = 'M12 1.5l1.9 3.6 2.1-1.1-.5 4.6 2.8-2.9.7 1.7 2.8-.6-1 3.2 1.4.7-4.6 3.9.6 1.9-4.4-.8.1 4.8h-1.4l.1-4.8-4.4.8.6-1.9L3.1 12.7l1.4-.7-1-3.2 2.8.6.7-1.7 2.8 2.9-.5-4.6 2.1 1.1z';

const PENNY_GRAD = `<defs><radialGradient id="pcg" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#F8C9A0"/><stop offset=".55" stop-color="#C4733C"/><stop offset="1" stop-color="#7A3A14"/></radialGradient><path id="pcTop" d="M16 52 A34 34 0 0 1 84 52"/><path id="pcBot" d="M18 50 A32 32 0 0 0 82 50"/></defs>`;
const PENNY_RIM = `<circle cx="50" cy="50" r="47" fill="url(#pcg)" stroke="#6B3310" stroke-width="2"/><circle cx="50" cy="50" r="43.5" fill="none" stroke="rgba(90,40,10,.35)" stroke-width="1.2"/><circle cx="50" cy="50" r="45.3" fill="none" stroke="rgba(255,235,210,.45)" stroke-width="1" stroke-dasharray="1 2.4"/>`;
const PENNY_H = `<svg viewBox="0 0 100 100">${PENNY_GRAD}${PENNY_RIM}
  <path d="M41 29 C47 21 61 22 64 32 C66 38 65 43 68.5 47.5 L65.5 49.5 C66.5 53 64 55.5 62 56.5 C62 61 58.5 64.5 54.5 64.5 L54.5 69 C60 71 65 75 68 80 L35 80 C37 74 41 70.5 45 69 C40.5 63.5 37 58 37 50.5 C35.5 42 36.5 34 41 29 Z" fill="#7A3A14" opacity=".42"/>
  <path d="M40.5 31.5 Q52 23 63.5 31" fill="none" stroke="#FFE3C4" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>
  <circle cx="45" cy="29" r="1.6" fill="#FFE3C4" opacity=".8"/><circle cx="52" cy="26" r="1.6" fill="#FFE3C4" opacity=".8"/><circle cx="59" cy="27" r="1.6" fill="#FFE3C4" opacity=".8"/>
  <text font-family="Martian Mono,monospace" font-size="6.4" letter-spacing="1.4" fill="#5A2508" opacity=".8"><textPath href="#pcTop" startOffset="50%" text-anchor="middle">ELIZABETH II</textPath></text>
  <text font-family="Martian Mono,monospace" font-size="6.4" letter-spacing="1.4" fill="#5A2508" opacity=".8"><textPath href="#pcBot" startOffset="50%" text-anchor="middle">D · G · REGINA</textPath></text></svg>`;
const PENNY_T = `<svg viewBox="0 0 100 100">${PENNY_GRAD}${PENNY_RIM}
  <path d="M50 76 C50 64 50 54 51 44" fill="none" stroke="#6A2E0E" stroke-width="2" stroke-linecap="round" opacity=".7"/>
  <path d="${LEAF}" transform="translate(27 26) rotate(-22 12 12) scale(1.05)" fill="#7A3A14" opacity=".55"/>
  <path d="${LEAF}" transform="translate(48 22) rotate(18 12 12) scale(1.05)" fill="#7A3A14" opacity=".55"/>
  <text x="50" y="84" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="11" fill="#5A2508" opacity=".85">1 CENT</text>
  <text font-family="Martian Mono,monospace" font-size="6.8" letter-spacing="2" fill="#5A2508" opacity=".8"><textPath href="#pcTop" startOffset="50%" text-anchor="middle">CANADA</textPath></text></svg>`;
const MECHS = {

  headsup: { label: 'Heads Up', rule: 'Land 5 or more heads to win.',
    gen(t, T, P) {
      const h = T ? rand(5, 7) : rand(2, 4), hp = sample(7, h);
      const coins = [...Array(7)].map((_, i) => hp.includes(i));
      return { data: { coins, prize: T || decoy(P) }, areas: 8, groups: T ? [{ cells: [0, 1, 2, 3, 4, 5, 6], deps: [7], v: T }] : [] };
    },
    body: tk => `<div class="g c7">${tk.data.coins.map((hd, i) => A(i, 'sq flipc', `<span class="pcoin ${hd ? 'h' : 't'}">${hd ? PENNY_H : PENNY_T}</span>`)).join('')}</div>
      <div class="g2">${pbox(7, tk.data.prize)}<div class="note">5 or more heads (the portrait side) win the prize.</div></div>` },

  plinko: { label: 'Plinko', rule: 'Follow the arrows to a prize bin.',
    gen(t, T, P) {
      const bins = [...Array(5)].map(() => decoy(P)), empties = sample(5, 2);
      let target;
      if (T) { target = pick([0, 1, 2, 3, 4].filter(i => !empties.includes(i))); empties.forEach(i => bins[i] = 0); bins[target] = T; }
      else { empties.forEach(i => bins[i] = 0); target = pick(empties); }
      const rights = sample(4, target), arrows = [0, 1, 2, 3].map(i => rights.includes(i));
      return { data: { arrows, bins, target }, areas: 5, pre: [4], groups: T ? [{ cells: [0, 1, 2, 3], deps: [4], v: T }] : [] };
    },
    body: tk => `<div class="plinko">${tk.data.arrows.map((r, i) => `<div class="drop-w"><span class="step">Drop ${i + 1}</span>${A(i, 'drop', `<span class="arrow">${r ? '→' : '←'}</span>`)}</div>`).join('')}</div>
      <div class="area bins revealed" data-a="4"><div class="in">${tk.data.bins.map((v, i) => `<span class="bin ${i === tk.data.target && v ? 'm' : ''}">${v ? fmt(v) : '—'}</span>`).join('')}</div></div>
      <div class="note light">The ball starts in the middle bin’s column.</div>` },

  run3: { label: 'Run of 3', rule: 'Three numbers in a run win the row.',
    gen(t, T, P) {
      const isRun = a => { const s = [...a].sort((x, y) => x - y); return s[1] === s[0] + 1 && s[2] === s[1] + 1; };
      const rows = rowsWith(T, P, 5).map(r => { let nums; if (r.win) { const x = rand(1, 7); nums = shuffle([x, x + 1, x + 2]); } else { do { nums = sample(9, 3).map(v => v + 1); } while (isRun(nums)); } return { ...r, nums }; });
      return { data: { rows }, areas: rows.length * 4, groups: rowN(rows, 3) };
    },
    body: tk => boxRows(tk, 3, ['', '', ''], (r, k) => `<b class="num ${r.win ? 'm' : ''}">${r.nums[k]}</b>`) },
  penalty: { label: 'Penalty Kick', rule: 'Beat the keeper to score and win.',
    gen(t, T, P) {
      const D = ['←', '↑', '→'];
      const rows = rowsWith(T, P, 5).map(r => { const shot = pick(D); return { ...r, shot, dive: r.win ? pick(D.filter(d => d !== shot)) : shot }; });
      return { data: { rows }, areas: rows.length * 3, groups: rowN(rows, 2) };
    },
    body: tk => boxRows(tk, 2, ['Your shot', 'Keeper'], (r, k) => `<b class="num ${r.win && !k ? 'm' : ''}">${k ? r.dive : r.shot}</b>`) },
  spell: { label: 'Spelling Bee', rule: 'Find every letter in HONEY to win.',
    gen(t, T, P) {
      const W = ['H', 'O', 'N', 'E', 'Y'], ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      let letters, cells = [];
      if (T) { letters = [...W, ...[...Array(5)].map(() => pick(ABC))]; }
      else { const miss = pick(W); letters = [...W.filter(x => x !== miss), ...[...Array(6)].map(() => pick(ABC.filter(x => x !== miss)))]; }
      letters = shuffle(letters);
      if (T) cells = W.map(ch => letters.indexOf(ch));
      return { data: { letters, cells, prize: T || decoy(P) }, areas: 11, groups: T ? [{ cells, deps: [10], v: T }] : [] };
    },
    body: tk => `<div class="word">${'HONEY'.split('').map(c => `<span>${c}</span>`).join('')}</div>
      <div class="g c5">${tk.data.letters.map((c, i) => A(i, 'sq', `<b class="num ${tk.data.cells.includes(i) ? 'm' : ''}">${c}</b>`)).join('')}</div>
      <div class="g2">${pbox(10, tk.data.prize)}<div class="note">Find H, O, N, E and Y to win the prize.</div></div>` },

  overtake: { label: 'Overtake', rule: 'Finish in the top 3 to win.',
    gen(t, T, P) {
      const S = rand(6, 9), F = T ? rand(1, 3) : rand(4, Math.min(9, S + 2)), D = S - F;
      let laps; do { laps = [...Array(4)].map(() => { let v; do { v = rand(-2, 4); } while (!v); return v; }); } while (laps.reduce((a, b) => a + b, 0) !== D);
      return { data: { S, laps, prize: T || decoy(P) }, areas: 6, groups: T ? [{ cells: [0, 1, 2, 3, 4], deps: [5], v: T }] : [] };
    },
    body: tk => `<div class="race">${A(0, 'key', `${lab('Start')}<b class="num xl">P${tk.data.S}</b>`)}
      <div class="g c4">${tk.data.laps.map((v, i) => A(i + 1, 'sq', `${lab('Lap ' + (i + 1))}<b class="num ${v > 0 ? 'up' : 'down'}">${v > 0 ? '▲' : '▼'}${Math.abs(v)}</b>`)).join('')}</div></div>
      <div class="g2">${pbox(5, tk.data.prize)}<div class="note">▲ passes cars, ▼ drops back. Top 3 wins.</div></div>` },

  hilo: { label: 'Higher or Lower', rule: 'Guess right to win the row.',
    gen(t, T, P) {
      const rows = rowsWith(T, P, 5).map(r => {
        const a = rand(2, 19), up = Math.random() < .5;
        let b; if (r.win) b = up ? rand(a + 1, 20) : rand(1, a - 1); else b = up ? rand(1, a) : rand(a, 20);
        return { ...r, a, up, b };
      });
      return { data: { rows }, areas: rows.length * 4, groups: rowN(rows, 3) };
    },
    body: tk => boxRows(tk, 3, ['Card', 'Guess', 'Next'], (r, k) => `<b class="num ${r.win && k === 1 ? 'm' : ''}">${[r.a, r.up ? '▲' : '▼', r.b][k]}</b>`) },
  mirror: { label: 'Mirror Number', rule: 'A number that reads the same both ways wins.',
    gen(t, T, P) {
      const pal = d => d[0] === d[4] && d[1] === d[3];
      const rows = rowsWith(T, P, 5).map(r => {
        let d; if (r.win) { const a = rand(1, 9), b = rand(0, 9), c = rand(0, 9); d = [a, b, c, b, a]; }
        else if (Math.random() < .45) { const a = rand(1, 9), b = rand(0, 9), c = rand(0, 9); d = [a, b, c, b, a]; const k = pick([3, 4]); let v; do { v = rand(0, 9); } while (v === d[k]); d[k] = v; }
        else { do { d = [rand(1, 9), ...[...Array(4)].map(() => rand(0, 9))]; } while (pal(d)); }
        return { ...r, d };
      });
      return { data: { rows }, areas: rows.length * 6, groups: rowN(rows, 5) };
    },
    body: tk => boxRows(tk, 5, ['', '', '', '', ''], (r, k) => `<b class="num ${r.win ? 'm' : ''}">${r.d[k]}</b>`) },
  alleven: { label: 'All Even', rule: 'All even numbers win the row.',
    gen(t, T, P) {
      const ev = () => rand(1, 10) * 2, od = () => rand(0, 9) * 2 + 1;
      const rows = rowsWith(T, P, 5).map(r => { let n; if (r.win) n = [ev(), ev(), ev()]; else { const odd = rand(1, 2); n = shuffle([...[...Array(odd)].map(od), ...[...Array(3 - odd)].map(ev)]); } return { ...r, n }; });
      return { data: { rows }, areas: rows.length * 4, groups: rowN(rows, 3) };
    },
    body: tk => boxRows(tk, 3, ['', '', ''], (r, k) => `<b class="num ${r.win ? 'm' : ''}">${r.n[k]}</b>`) },
  turkey: { label: 'Turkey', rule: 'Three strikes in a row win.',
    gen(t, T, P) {
      const run3 = f => { for (let i = 0; i < 8; i++) if (f[i] === 'X' && f[i + 1] === 'X' && f[i + 2] === 'X') return i; return -1; };
      let frames, at = -1;
      for (let tries = 0; tries < 300; tries++) {
        frames = [...Array(10)].map(() => Math.random() < .28 ? 'X' : String(rand(3, 9)));
        if (T) { const s = rand(0, 7); frames[s] = frames[s + 1] = frames[s + 2] = 'X'; }
        const r = run3(frames);
        const count = frames.reduce((c, _, i) => c + (i < 8 && frames[i] === 'X' && frames[i + 1] === 'X' && frames[i + 2] === 'X' ? 1 : 0), 0);
        if (T ? count === 1 : count === 0) { at = r; break; }
      }
      return { data: { frames, at, prize: T || decoy(P) }, areas: 11, groups: T ? [{ cells: [at, at + 1, at + 2], deps: [10], v: T }] : [] };
    },
    body: tk => `<div class="g c5">${tk.data.frames.map((f, i) => `<div class="frame-w"><span class="step">${i + 1}</span>${A(i, 'sq', `<b class="num ${tk.data.at >= 0 && i >= tk.data.at && i < tk.data.at + 3 ? 'm' : ''}">${f}</b>`)}</div>`).join('')}</div>
      <div class="g2">${pbox(10, tk.data.prize)}<div class="note">Three X in a row win the prize.</div></div>` },
  match3: { label: 'Match 3', rule: 'Find 3 matching amounts.',
    gen(t, T, P) {
      const n = 9, cells = Array(n).fill(null), counts = {}; let wpos = [];
      if (T) { wpos = sample(n, 3); wpos.forEach(i => cells[i] = T); }
      const cands = DENOMS.map(d => d * P).filter(v => v !== T);
      const empties = () => cells.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
      if (Math.random() < .45) { const big = pick(cands.filter(v => v >= 20 * P)); shuffle(empties()).slice(0, 2).forEach(i => cells[i] = big); counts[big] = 2; }
      for (const i of empties()) { const ok = cands.filter(v => (counts[v] || 0) < 2); const v = wpick(ok, ok.map(x => DECOY_W[DENOMS.indexOf(x / P)])); cells[i] = v; counts[v] = (counts[v] || 0) + 1; }
      return { data: { cells }, areas: n, groups: T ? [{ cells: wpos, deps: [], v: T }] : [] };
    },
    body: tk => `<div class="g c3">${tk.data.cells.map((v, i) => A(i, 'sq', `${chipSvg()}${amt(v)}`)).join('')}</div>` },

  lucky: { label: 'Lucky Number', rule: 'Match the lucky number to win.',
    gen(t, T, P) {
      const N = 10, lucky = rand(1, 40), ps = partsOf(T, P, 3, N), pos = sample(N, ps.length);
      const pool = shuffle([...Array(40).keys()].map(i => i + 1).filter(x => x !== lucky));
      const cells = [...Array(N)].map((_, i) => { const j = pos.indexOf(i); return j >= 0 ? { n: lucky, p: ps[j], w: 1 } : { n: pool[i], p: decoy(P) }; });
      return { data: { lucky, cells }, areas: N + 1, groups: pos.map((i, j) => ({ cells: [i + 1], deps: [0], v: ps[j] })) };
    },
    body: tk => `<div class="keyrow">${A(0, 'key', `${lab('Lucky number')}<b class="num xl m">${tk.data.lucky}</b>`)}</div>
      <div class="lbl">Your numbers</div><div class="g c5">${tk.data.cells.map((c, i) => A(i + 1, 'sq', `<b class="num ${c.w ? 'm' : ''}">${c.n}</b>${amt(c.p)}`)).join('')}</div>` },

  slots: { label: 'Fruit Machine', rule: 'Three of a kind in a row wins.',
    gen(t, T, P) {
      const rows = rowsWith(T, P, 4).map(r => { const s = t.symbols.slice(0, 6); let reel; if (r.win) { const f = pick(s); reel = [f, f, f]; } else { do { reel = [pick(s), pick(s), pick(s)]; } while (reel[0] === reel[1] && reel[1] === reel[2]); } return { ...r, reel }; });
      return { data: { rows }, areas: rows.length * 4, groups: rowN(rows, 3) };
    },
    body: tk => boxRows(tk, 3, ['Reel', 'Reel', 'Reel'], (r, k) => `<span class="sym ${r.win ? 'm' : ''}">${r.reel[k]}</span>`) },
  beat: { label: 'High Score', rule: 'Beat the high score to win the row.',
    gen(t, T, P) {
      const rows = rowsWith(T, P, 4).map(r => { if (r.win) { const them = rand(20, 88); return { ...r, you: rand(them + 1, Math.min(99, them + 12)), them }; } const you = rand(10, 90); return { ...r, you, them: rand(you + 1, Math.min(99, you + 14)) }; });
      return { data: { rows }, areas: rows.length * 3, groups: rowN(rows, 2) };
    },
    body: (tk, t) => boxRows(tk, 2, [t.beat[0], t.beat[1]], (r, k) => `<b class="num ${r.win && !k ? 'm' : ''}">${k ? r.them : r.you}</b>`) },
  find: { label: 'Treasure Hunt', rule: 'Find 💰 to win the prize below it.',
    gen(t, T, P) {
      const N = 9, ps = partsOf(T, P, 3, N), pos = sample(N, ps.length), others = t.symbols.filter(s => s !== '💰');
      const cells = [...Array(N)].map((_, i) => { const j = pos.indexOf(i); return j >= 0 ? { s: '💰', p: ps[j], w: 1 } : { s: pick(others), p: decoy(P) }; });
      return { data: { cells }, areas: N, groups: pos.map((i, j) => ({ cells: [i], deps: [], v: ps[j] })) };
    },
    body: tk => `<div class="g c3">${tk.data.cells.map((c, i) => A(i, 'sq', `<span class="sym ${c.w ? 'm' : ''}">${c.s}</span>${amt(c.p)}`)).join('')}</div>` },

  multiply: { label: 'Match & Multiply', rule: 'Match the lucky number. Win prize × multiplier.',
    gen(t, T, P) {
      const G = 5, m = T / P, k = m ? (m >= 50 ? 1 : Math.min(rand(1, 3), m, G)) : 0;
      const parts = k ? splitDenoms(m, k).map(x => x * P) : [], wins = sample(G, parts.length), games = [];
      for (let g = 0; g < G; g++) {
        const lucky = rand(1, 40), nums = shuffle([...Array(40).keys()].map(i => i + 1).filter(n => n !== lucky)).slice(0, 3), wi = wins.indexOf(g);
        if (wi >= 0) { const part = parts[wi]; const opts = [1, 2, 3, 5, 10].filter(mu => part % mu === 0 && DENOMS.includes(part / mu / P) && (part < 20 * P || mu <= 2)); const mult = wpick(opts, opts.map(mu => ({ 1: 6, 2: 4, 3: 2, 5: 2, 10: 1 })[mu])); const pos = rand(0, 2); nums[pos] = lucky; games.push({ lucky, nums, prize: part / mult, mult, win: true, pos }); }
        else { const prize = decoy(P); games.push({ lucky, nums, prize, mult: prize >= 20 * P ? pick([1, 1, 2]) : pick([1, 1, 1, 2, 2, 3, 5, 10]), win: false, pos: -1 }); }
      }
      return { data: { games }, areas: G * 6, groups: wins.map((g, j) => ({ cells: [0, 1, 2, 3, 4, 5].map(k => g * 6 + k), deps: [], v: parts[j] })) };
    },
    body: tk => `<div class="brows six"><div class="bhead"><span>Lucky</span><span class="span3">Your numbers</span><span>Prize</span><span>Mult</span></div>
      ${tk.data.games.map((g, i) => `<div class="brow2">${A(i * 6, 'bx bk', `<b class="num ${g.win ? 'm' : ''}">${g.lucky}</b>`)}${g.nums.map((n, j) => A(i * 6 + 1 + j, 'bx', `<b class="num ${j === g.pos ? 'm' : ''}">${n}</b>`)).join('')}${A(i * 6 + 4, 'bx bp', amt(g.prize))}${A(i * 6 + 5, 'bx', `<b class="num mult">${g.mult}×</b>`)}</div>`).join('')}</div>` },
  dive: { label: 'Deep Dive', rule: 'Dive deeper than the target to win.',
    gen(t, T, P) {
      const dives = [...Array(5)].map(() => rand(3, 24)), S = dives.reduce((a, b) => a + b, 0);
      const target = T ? rand(Math.max(10, S - 18), S - 1) : rand(S, S + 18);
      return { data: { dives, target, S, prize: T || decoy(P) }, areas: 7, groups: T ? [{ cells: [1, 2, 3, 4, 5], deps: [0, 6], v: T }] : [] };
    },
    body: tk => `<div class="keyrow">${A(0, 'key', `${lab('Target depth')}<b class="num xl">${tk.data.target}m</b>`)}</div>
      <div class="lbl">Your dives</div><div class="g c5">${tk.data.dives.map((d, i) => A(i + 1, 'sq', `<span class="sym sm">🤿</span><b class="num">${d}m</b>`)).join('')}</div>
      <div class="g2">${pbox(6, tk.data.prize)}<div class="note">Add up your dives. Beat the target to win the prize.</div></div>` },

  rps: { label: 'Rock Paper Dragon', rule: 'Beat the dragon at rock, paper, scissors.',
    gen(t, T, P) {
      const H = ['✊', '✋', '✌️'], beats = { '✊': '✌️', '✋': '✊', '✌️': '✋' };
      const rows = rowsWith(T, P, 5).map(r => { const you = pick(H); if (r.win) return { ...r, you, them: beats[you] }; const them = pick(H.filter(h => beats[you] !== h)); return { ...r, you, them }; });
      return { data: { rows }, areas: rows.length * 3, groups: rowN(rows, 2) };
    },
    body: tk => boxRows(tk, 2, ['You', 'Dragon'], (r, k) => `<span class="sym ${r.win && !k ? 'm' : ''}">${k ? r.them : r.you}</span>`) },
  tictac: { label: 'Snow Line', rule: 'Three ❄️ in a line wins.',
    gen(t, T, P) {
      const others = ['☃️', '🧤', '🧣', '🎿', '⛸️'], F = '❄️';
      const lines = g => LINES.filter(L => L.every(i => g[i] === F));
      let grid, L = null;
      for (let tries = 0; tries < 300; tries++) {
        grid = [...Array(9)].map(() => pick(others));
        if (T) { L = pick(LINES); L.forEach(i => grid[i] = F); sample(9, rand(0, 2)).forEach(i => { if (!L.includes(i)) grid[i] = F; }); if (lines(grid).length === 1) break; }
        else { sample(9, rand(2, 4)).forEach(i => grid[i] = F); if (!lines(grid).length) break; }
      }
      return { data: { grid, L, prize: T || decoy(P) }, areas: 10, groups: T ? [{ cells: L, deps: [9], v: T }] : [] };
    },
    body: tk => `<div class="ttt"><div class="g c3">${tk.data.grid.map((s, i) => A(i, 'sq', `<span class="sym ${tk.data.L && tk.data.L.includes(i) ? 'm' : ''}">${s}</span>`)).join('')}</div>${pbox(9, tk.data.prize)}</div>` },

  collect: { label: 'Banana Collector', rule: 'Collect 3 🍌 to win.',
    gen(t, T, P) {
      const N = 12, others = t.symbols.filter(s => s !== '🍌'), bpos = sample(N, T ? 3 : rand(0, 2));
      const cells = [...Array(N)].map((_, i) => bpos.includes(i) ? '🍌' : pick(others));
      return { data: { cells, bpos, prize: T || decoy(P) }, areas: N + 1, groups: T ? [{ cells: bpos, deps: [N], v: T }] : [] };
    },
    body: tk => `<div class="g c4">${tk.data.cells.map((s, i) => A(i, 'sq', `<span class="sym ${s === '🍌' && tk.total ? 'm' : ''}">${s}</span>`)).join('')}</div><div class="g2">${pbox(12, tk.data.prize)}<div class="note">Three bananas anywhere win the prize.</div></div>` },

  curse: { label: 'Curse Path', rule: 'Win every prize before the 💀.',
    gen(t, T, P) {
      const N = 7, ps = partsOf(T, P, 4, 6), k = ps.length, stones = [];
      for (let i = 0; i < N; i++) {
        if (i < k) stones.push({ v: ps[i] });
        else if (i === k) stones.push({ skull: true });
        else stones.push(Math.random() < .35 ? { skull: true } : { v: decoy(P) });
      }
      return { data: { stones, k }, areas: N, groups: T ? [{ cells: [...Array(k).keys()], deps: k < N ? [k] : [], v: T }] : [] };
    },
    body: tk => `<div class="path">${tk.data.stones.map((s, i) => `<div class="stone-w"><span class="step">${i + 1}</span>${A(i, 'stone', s.skull ? `<span class="sym ${i === tk.data.k ? 'm' : ''}">💀</span>` : amt(s.v))}</div>`).join('')}</div>` },

  blackjack: { label: 'Blackjack', rule: 'Beat the dealer without going over 21.',
    gen(t, T, P) {
      const two = tot => { let a; do { a = rand(2, 11); } while (tot - a < 2 || tot - a > 11); return [a, tot - a]; };
      const face = v => v === 11 ? 'A' : v === 10 ? pick(['10', 'J', 'Q', 'K']) : String(v);
      const rows = rowsWith(T, P, 5).map(r => { let dealer, you; if (r.win) { dealer = rand(16, 20); you = rand(dealer + 1, 21); } else { dealer = rand(17, 21); you = rand(5, dealer); } return { ...r, dealer, you, cards: two(you).map(v => [face(v), pick(SUITS)]) }; });
      return { data: { rows }, areas: rows.length * 4, groups: rowN(rows, 3) };
    },
    body: tk => boxRows(tk, 3, ['Card', 'Card', 'Dealer'], (r, k) => k < 2 ? card(r.cards[k][0], r.cards[k][1]) : `<b class="num">${r.dealer}</b>`) },
  make10: { label: 'Make 10', rule: 'Two numbers that add to 10 win.',
    gen(t, T, P) {
      const rows = rowsWith(T, P, 5).map(r => { const a = rand(1, 9); if (r.win) return { ...r, a, b: 10 - a }; let b; do { b = rand(1, 9); } while (a + b === 10); return { ...r, a, b }; });
      return { data: { rows }, areas: rows.length * 3, groups: rowN(rows, 2) };
    },
    body: tk => boxRows(tk, 2, ['Number', 'Number'], (r, k) => `<b class="num ${r.win ? 'm' : ''}">${k ? r.b : r.a}</b>`) },
  poker: { label: 'Saloon Poker', rule: 'Pair or better wins.',
    gen(t, T, P) {
      const m = T / P, kind = { 0: 'high', 1: 'pair', 2: 'two', 3: 'trips', 5: 'straight', 10: 'flush', 20: 'full', 50: 'quads', 200: 'sflush' }[m] || 'high';
      const distinct = (n, avoid = []) => { let r; do { r = sample(13, n).map(x => x + 2); } while (r.some(x => avoid.includes(x)) || (n === 5 && Math.max(...r) - Math.min(...r) === 4)); return r; };
      const mixed = n => { let s; do { s = [...Array(n)].map(() => pick(SUITS)); } while (n === 5 && s.every(x => x === s[0])); return s; };
      let ranks, suits;
      if (kind === 'high') { ranks = distinct(5); suits = mixed(5); }
      else if (kind === 'pair') { const [p] = distinct(1); ranks = [p, p, ...distinct(3, [p])]; suits = mixed(5); }
      else if (kind === 'two') { const [a, b] = distinct(2); ranks = [a, a, b, b, ...distinct(1, [a, b])]; suits = mixed(5); }
      else if (kind === 'trips') { const [a] = distinct(1); ranks = [a, a, a, ...distinct(2, [a])]; suits = mixed(5); }
      else if (kind === 'straight') { const lo = rand(2, 10); ranks = [0, 1, 2, 3, 4].map(i => lo + i); suits = mixed(5); }
      else if (kind === 'flush') { ranks = distinct(5); const s = pick(SUITS); suits = Array(5).fill(s); }
      else if (kind === 'full') { const [a, b] = distinct(2); ranks = [a, a, a, b, b]; suits = mixed(5); }
      else if (kind === 'quads') { const [a] = distinct(1); ranks = [a, a, a, a, ...distinct(1, [a])]; suits = ['♠', '♥', '♦', '♣', pick(SUITS)]; }
      else { const lo = rand(2, 10); ranks = [0, 1, 2, 3, 4].map(i => lo + i); const s = pick(SUITS); suits = Array(5).fill(s); }
      if (['pair', 'two', 'trips', 'full'].includes(kind)) { const seen = {}; suits = ranks.map(r => { const used = seen[r] = seen[r] || []; const s = pick(SUITS.filter(x => !used.includes(x))); used.push(s); return s; }); if (suits.every(x => x === suits[0])) suits[4] = SUITS.find(x => x !== suits[0]); }
      const order = shuffle([0, 1, 2, 3, 4]);
      return { data: { cards: order.map(i => [RANK(ranks[i]), suits[i]]), kind }, areas: 5, groups: T ? [{ cells: [0, 1, 2, 3, 4], deps: [], v: T }] : [] };
    },
    body: tk => `<div class="g c5">${tk.data.cards.map((c, i) => A(i, 'cardarea', card(c[0], c[1], true))).join('')}</div>
      <div class="ptable">${[['Pair', 1], ['Two pair', 2], ['Three', 3], ['Straight', 5], ['Flush', 10], ['Full house', 20], ['Four', 50], ['Str. flush', 200]].map(([n, x]) => `<span><em>${n}</em>${fmt(x * tk.price)}</span>`).join('')}</div>` },

  ladder: { label: 'Sky Ladder', rule: 'Climb to a rung, win its prize.',
    gen(t, T, P) {
      let vals = shuffle(DENOMS.map(d => d * P).filter(v => v !== T)).slice(0, T ? 5 : 6);
      if (T) vals.push(T); vals.sort((a, b) => a - b);
      const climb = T ? vals.indexOf(T) + 1 : 0;
      return { data: { vals, climb }, areas: 7, groups: T ? [{ cells: [climb], deps: [0], v: T }] : [] };
    },
    body: tk => `<div class="ladder">${A(0, 'key climb', `${lab('Climb')}<b class="num xl">${tk.data.climb}</b>`)}
      <div class="rungs">${tk.data.vals.map((v, i) => ({ v, i })).reverse().map(({ v, i }) => `<div class="rung-w"><span class="step">${i + 1}</span>${A(i + 1, 'rung', amt(v))}</div>`).join('')}</div></div>` },

  gempair: { label: 'Gem Pairs', rule: 'Two matching gems side by side win.',
    gen(t, T, P) {
      const W = 4, H = 3, N = W * H;
      const pairs = g => { const out = []; for (let i = 0; i < N; i++) { if (i % W < W - 1 && g[i] === g[i + 1]) out.push([i, i + 1]); if (i + W < N && g[i] === g[i + W]) out.push([i, i + W]); } return out; };
      let grid, pr = null;
      for (let tries = 0; tries < 500; tries++) {
        grid = []; for (let i = 0; i < N; i++) { let c; do { c = rand(0, 5); } while ((i % W && grid[i - 1] === c) || (i >= W && grid[i - W] === c)); grid.push(c); }
        if (!T) break;
        const a = rand(0, N - 1), nb = [a % W < W - 1 ? a + 1 : -1, a + W < N ? a + W : -1].filter(x => x >= 0); if (!nb.length) continue;
        const b = pick(nb); grid[b] = grid[a]; const ps = pairs(grid); if (ps.length === 1) { pr = ps[0]; break; }
      }
      return { data: { grid, pr, prize: T || decoy(P) }, areas: N + 1, groups: T ? [{ cells: pr, deps: [N], v: T }] : [] };
    },
    body: tk => `<div class="g c4">${tk.data.grid.map((c, i) => A(i, 'sq', `<span class="gem" style="--g:${GEMS[c]}"></span>`)).join('')}</div><div class="g2">${pbox(12, tk.data.prize)}<div class="note">Matching gems must touch, across or down.</div></div>` },

  joust: { label: 'Royal Joust', rule: 'Win 2 of 3 rounds to win the row.',
    gen(t, T, P) {
      const rows = rowsWith(T, P, 4).map(r => {
        const need = r.win ? rand(2, 3) : rand(0, 1), wins = sample(3, need);
        const rounds = [0, 1, 2].map(k => { if (wins.includes(k)) { const b = rand(1, 8); return [rand(b + 1, 9), b]; } const a = rand(1, 9); return [a, rand(a, 9)]; });
        return { ...r, rounds };
      });
      return { data: { rows }, areas: rows.length * 4, groups: rowN(rows, 3) };
    },
    body: tk => boxRows(tk, 3, ['Round 1', 'Round 2', 'Round 3'], (r, k) => { const [a, b] = r.rounds[k]; return `<span class="duel"><b class="num ${a > b ? 'm' : ''}">${a}</b><em>–</em><b class="num">${b}</b></span>`; }) },
  charge: { label: 'Charge Up', rule: 'One ⚡ wins. Each extra ⚡ doubles it.',
    gen(t, T, P) {
      const ps = partsOf(T, P, 3, 3), wins = sample(3, ps.length), storms = [], groups = [];
      for (let s = 0; s < 3; s++) {
        const j = wins.indexOf(s); let base, bolts = 0;
        if (j >= 0) { const m = ps[j] / P; let v2 = 0, x = m; while (x % 2 === 0 && v2 < 2) { x /= 2; v2++; } const bo = [1, 2, 3].filter(b => b <= 1 + v2 && DENOMS.includes(ps[j] / Math.pow(2, b - 1) / P)); bolts = pick(bo); base = ps[j] / Math.pow(2, bolts - 1); }
        else base = decoy(P);
        const pos = sample(3, bolts); storms.push({ base, charges: [0, 1, 2].map(k => pos.includes(k)) });
        if (j >= 0) groups.push({ cells: [s * 4, s * 4 + 1, s * 4 + 2, s * 4 + 3], deps: [], v: ps[j] });
      }
      return { data: { storms }, areas: 12, groups };
    },
    body: tk => `<div class="storms">${tk.data.storms.map((s, k) => `<div class="storm">${A(k * 4, 'sq base', `${lab('Prize')}${amt(s.base)}`)}${s.charges.map((c, j) => A(k * 4 + j + 1, 'sq', `<span class="sym ${c ? 'm' : ''}">${c ? '⚡' : '☁️'}</span>`)).join('')}</div>`).join('')}</div>` },

  dice7: { label: 'Roll 7', rule: 'Roll a 7 to win the row.',
    gen(t, T, P) {
      const rows = rowsWith(T, P, 5).map(r => { const a = rand(1, 6); if (r.win) return { ...r, a, b: 7 - a }; let b; do { b = rand(1, 6); } while (a + b === 7); return { ...r, a, b }; });
      return { data: { rows }, areas: rows.length * 3, groups: rowN(rows, 2) };
    },
    body: tk => boxRows(tk, 2, ['Die', 'Die'], (r, k) => die(k ? r.b : r.a)) },
  bingo: { label: 'Star Bingo', rule: 'Complete a line to win.',
    gen(t, T, P) {
      const pool = () => shuffle([...Array(45).keys()].map(i => i + 1));
      let card, calls, L = null;
      for (let tries = 0; tries < 400; tries++) {
        card = pool().slice(0, 9);
        const called = new Set();
        if (T) { L = pick(LINES); L.forEach(i => called.add(card[i])); sample(9, 2).forEach(i => called.add(card[i])); }
        else sample(9, rand(3, 4)).forEach(i => called.add(card[i]));
        const rest = pool().filter(n => !card.includes(n));
        while (called.size < 8) called.add(rest.pop());
        const done = LINES.filter(l => l.every(i => called.has(card[i])));
        if ((T && done.length === 1) || (!T && !done.length)) { calls = shuffle([...called]); break; }
      }
      return { data: { card, calls, L, prize: T || decoy(P) }, areas: 11, groups: T ? [{ cells: L, deps: [9, 10], v: T }] : [] };
    },
    body: tk => { const d = tk.data, lineNums = d.L ? d.L.map(i => d.card[i]) : [];
      return `${A(9, 'key calls', `${lab('Called numbers')}<div class="callrow">${d.calls.map(n => `<b class="num ${lineNums.includes(n) ? 'm' : ''}">${n}</b>`).join('')}</div>`)}
      <div class="ttt"><div class="g c3">${d.card.map((n, i) => A(i, 'sq', `<b class="num ${d.L && d.L.includes(i) ? 'm' : ''}">${n}</b>`)).join('')}</div>${pbox(10, d.prize)}</div>`; } },
};

function generate(th, forced) {
  const P = th.price, total = forced == null ? drawTotal(P) : forced, M = MECHS[th.mech];
  const r = M.gen(th, total, P);
  const revealed = Array(r.areas).fill(false); (r.pre || []).forEach(i => revealed[i] = true);
  return { v: 3, id: th.id, price: P, total, t: Date.now(), done: false, data: r.data, areas: r.areas, groups: r.groups, revealed, pre: (r.pre || []).length };
}

/* ================= State & saving ================= */
const KEY = 'foil-lounge-v1';
const fresh = () => ({ v: 1, balance: 50, day: dayKey(), chestDay: null, sound: true, music: true, updatedAt: 0,
  stats: { played: 0, spent: 0, won: 0, wins: 0, best: 0, bestId: null, chests: 0, chestTotal: 0 },
  today: { day: dayKey(), spent: 0, won: 0 }, per: {}, history: [], current: null });
function normalize(s) {
  const f = fresh(); if (!s || typeof s !== 'object') return f;
  const o = Object.assign(f, s); o.stats = Object.assign(fresh().stats, s.stats || {}); o.today = Object.assign(fresh().today, s.today || {});
  if (typeof o.music !== 'boolean') o.music = true;
  o.per = s.per || {}; o.history = Array.isArray(s.history) ? s.history : [];
  if (o.current && (!byId[o.current.id] || !Array.isArray(o.current.revealed) || !Array.isArray(o.current.groups) || o.current.v !== 3)) { if (o.current.price && !o.current.done) o.balance += o.current.price; o.current = null; }
  return o;
}
let state;
try { state = normalize(JSON.parse(localStorage.getItem(KEY))); if (!localStorage.getItem(KEY)) state = fresh(); } catch (e) { state = fresh(); }
function save() {
  state.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}

/* ================= Online (Supabase) ================= */
const CFG = window.FOIL_CONFIG || {};
const ONLINE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && /^https:\/\//.test(CFG.supabaseUrl) && window.supabase && window.supabase.createClient);
const sb = ONLINE ? window.supabase.createClient(CFG.supabaseUrl.trim().replace(/\/+$/, ''), CFG.supabaseAnonKey.trim()) : null;
let me = null, uid = null;
const ERR = {
  not_enough_chips: 'Not enough chips', chest_used: 'You’ve already had today’s daily draw', no_such_player: 'No player with that name',
  thats_you: 'That’s you', already_friends: 'You’re already friends', not_friends: 'You can only do that with friends',
  bad_amount: 'Pick an amount from 1 to 1,000', no_such_room: 'Room not found', room_started: 'That game already started',
  room_full: 'That room is full', in_a_game: 'Finish your current room game first', not_host: 'Only the host can do that',
  need_two_players: 'You need at least 2 players', banned: 'The host removed you from that room', no_public_rooms: 'No public rooms are open right now. Open one!',
  round_running: 'Wait for this round to finish', empty_message: 'Type a message first', unknown_ticket: 'Unknown ticket', not_signed_in: 'Please sign in again', no_request: 'That request is gone',
};
function errText(e) {
  const m = (e && (e.message || e.error_description)) || String(e || '');
  const k = Object.keys(ERR).find(k => m.includes(k));
  if (k) return ERR[k];
  if (/fetch|network|timeout/i.test(m)) return 'Can’t reach the server. Check your connection.';
  return 'Something went wrong. Try again.';
}
async function rpc(fn, args = {}) { const { data, error } = await sb.rpc(fn, args); if (error) throw error; return data; }
// Server profile → local state. dur: balance animation length, or null to leave the display alone.
function applyProfile(p, dur = 600) {
  if (!p || !p.id) return; me = p;
  state.balance = p.balance; state.chestDay = p.chest_day; state.day = p.day;
  Object.assign(state.stats, { played: p.played, spent: +p.spent, won: +p.won, wins: p.wins, best: p.best, bestId: p.best_id, chests: p.chests, chestTotal: p.chest_total });
  save();
  if (dur != null) animateBalance(state.balance, dur);
  Social.badge();
}
let meBusy = false;
async function refreshMe(dur = 600) {
  if (!ONLINE || !uid || meBusy) return; meBusy = true;
  try { applyProfile(await rpc('me', { p_day: dayKey() }), dur); if (!active) refreshLobby(); } catch (e) {} finally { meBusy = false; }
}
function claimPending() {
  const id = state.pendingClaim; if (!ONLINE || !id) return;
  rpc('claim_ticket', { p_id: id }).then(p => { if (state.pendingClaim === id) state.pendingClaim = null; applyProfile(p, null); })
    .catch(() => setTimeout(claimPending, 4000));
}

function applyDaily(silent) {
  if (ONLINE) return;
  const today = dayKey();
  if (state.day === today) return;
  state.day = today;
  state.today = { day: today, spent: 0, won: 0 };
  if (state.balance < 50) { state.balance = 50; if (!silent) toast('New day · 50 chips'); }
  else if (!silent) toast('New day · daily draw ready');
  save();
}

/* ================= Sound ================= */
const Sfx = {
  ctx: null, master: null, noiseBuf: null, lastScr: 0,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      this.ctx = new C(); this.master = this.ctx.createGain(); this.master.gain.value = .5; this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * .5; const b = this.ctx.createBuffer(1, len, this.ctx.sampleRate); const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; this.noiseBuf = b;
    } catch (e) { this.ctx = null; }
  },
  ok() { return state.sound && this.ctx && this.ctx.state === 'running'; },
  tone(f, dur, { type = 'sine', gain = .2, when = 0, to = null } = {}) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + .02);
  },
  noise(dur, { gain = .12, freq = 3000, q = .8, when = 0, type = 'bandpass' } = {}) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime + when;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(this.master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
  },
  scratch() { const n = performance.now(); if (n - this.lastScr < 45) return; this.lastScr = n; this.noise(.06, { gain: .07, freq: 2500 + Math.random() * 2500, q: 1.2 }); },
  buy() { this.tone(1320, .09, { type: 'triangle', gain: .14 }); this.tone(1760, .16, { type: 'triangle', gain: .12, when: .07 }); this.noise(.05, { gain: .08, freq: 6000, when: .02 }); },
  reveal() { this.tone(880 + Math.random() * 120, .12, { type: 'sine', gain: .06 }); },
  lit() { this.tone(1046, .12, { type: 'triangle', gain: .12 }); this.tone(1568, .2, { type: 'triangle', gain: .1, when: .08 }); },
  win(big) { const notes = big ? [523, 659, 784, 1046, 1318, 1568, 2093] : [523, 659, 784, 1046]; notes.forEach((f, i) => { this.tone(f, .35, { type: 'triangle', gain: .13, when: i * .085 }); this.tone(f * 2, .2, { type: 'sine', gain: .04, when: i * .085 }); }); for (let i = 0; i < (big ? 14 : 6); i++) this.noise(.05, { gain: .05, freq: 7000, when: .1 + i * .06 }); },
  lose() { this.tone(392, .22, { type: 'sine', gain: .09 }); this.tone(330, .35, { type: 'sine', gain: .08, when: .16 }); },
  tick() { this.tone(1800, .03, { type: 'square', gain: .025 }); },
  stop() { this.tone(160, .14, { type: 'sine', gain: .2, to: 90 }); this.noise(.06, { gain: .06, freq: 1200 }); },
  whoosh() { this.noise(.6, { gain: .12, freq: 900, q: .6, type: 'lowpass' }); this.tone(220, .6, { type: 'sine', gain: .05, to: 660 }); },
  click() { this.tone(660, .05, { type: 'triangle', gain: .06 }); },
  // Brassy note: sawtooth through a filter that opens up, like a horn.
  horn(f, dur, { when = 0, gain = .1 } = {}) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(), o2 = c.createOscillator(), f1 = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f; o2.detune.value = 8;
    f1.type = 'lowpass'; f1.Q.value = 2; f1.frequency.setValueAtTime(500, t); f1.frequency.linearRampToValueAtTime(Math.min(5200, f * 7), t + .06); f1.frequency.exponentialRampToValueAtTime(Math.max(700, f * 2.5), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .03); g.gain.setValueAtTime(gain * .85, t + Math.max(.05, dur - .12)); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(f1); o2.connect(f1); f1.connect(g).connect(this.master); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
  },
  // Winner: a short rising fanfare that lands on a big bright chord.
  fanfare() {
    if (!this.ok()) return; Music.dip(3600);
    const T = .13, lead = [[392, 0, 1], [523, 1, 1], [659, 2, 1], [784, 3, 2], [659, 5, 1], [784, 6, 5]];
    lead.forEach(([f, at, len]) => this.horn(f, T * len + .04, { when: at * T, gain: .1 }));
    [523, 659, 784, 1046].forEach(f => this.horn(f, 1.5, { when: 6 * T, gain: .055 }));
    this.tone(131, 1.4, { type: 'triangle', gain: .22, when: 6 * T });
    [0, 2, 4, 6].forEach(i => this.noise(.12, { gain: .07, freq: 180, q: .7, when: i * T, type: 'lowpass' }));
    for (let i = 0; i < 12; i++) this.tone(2093 + Math.random() * 1200, .25, { type: 'sine', gain: .025, when: 6 * T + .1 + i * .07 });
    this.noise(1.1, { gain: .05, freq: 8000, q: .5, when: 6 * T, type: 'highpass' });
  },
  // Everyone else: a soft, slightly wistful little phrase that drifts down.
  aww() {
    if (!this.ok()) return; Music.dip(2800);
    const notes = [[440, 0, .28], [392, .3, .28], [349, .6, .28], [330, .9, 1.1]];
    notes.forEach(([f, when, d]) => {
      this.tone(f, d, { type: 'triangle', gain: .2, when });
      this.tone(f / 2, d, { type: 'sine', gain: .12, when });
    });
    // last note sighs downward
    this.tone(330, .9, { type: 'sine', gain: .1, when: 1.15, to: 262 });
    this.tone(165, 1.2, { type: 'sine', gain: .1, when: .9 });
  },
};
document.addEventListener('pointerdown', () => Sfx.init(), { once: false, passive: true });

/* ================= Background music (made live in the browser, loops forever) ================= */
const Music = (() => {
  let ctx = null, out = null, timer = null, next = 0, step = 0, bar = 0, prog = 0, playing = false, ducked = false;
  const BPM = 82, E = 60 / BPM / 2;            // one eighth note
  const LEVEL = .16, DUCK = .06;
  // Two 4-bar progressions (MIDI notes), alternated so the loop doesn't feel short.
  const PROGS = [
    [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]],   // Fmaj7 Em7 Dm7 Cmaj7
    [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [45, 48, 52, 55]],   // Dm7 G7 Cmaj7 Am7
  ];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function impulse(sec) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    return b;
  }
  function setup() {
    Sfx.init(); ctx = Sfx.ctx; if (!ctx) return false;
    if (out) return true;
    out = ctx.createGain(); out.gain.value = 0;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 4200;
    const rev = ctx.createConvolver(); rev.buffer = impulse(2.6);
    const wet = ctx.createGain(); wet.gain.value = .32;
    out.connect(tone).connect(ctx.destination);
    out.connect(rev).connect(wet).connect(ctx.destination);
    return true;
  }
  function note(f, t, dur, { type = 'sine', gain = .1, attack = .01, release = .3, cutoff = 0, detune = 0 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.setValueAtTime(gain, t + Math.max(attack, dur - release)); g.gain.linearRampToValueAtTime(0, t + dur);
    let node = o.connect(g);
    if (cutoff) { const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = cutoff; node = g.connect(f2); }
    node.connect(out); o.start(t); o.stop(t + dur + .05);
  }
  function hat(t, gain) {
    if (!Sfx.noiseBuf) return;
    const s = ctx.createBufferSource(); s.buffer = Sfx.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
    s.connect(f).connect(g).connect(out); s.start(t, Math.random() * .3); s.stop(t + .07);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(42, t + .18);
    g.gain.setValueAtTime(.32, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
    o.connect(g).connect(out); o.start(t); o.stop(t + .32);
  }
  function play(i, t) {
    const chord = PROGS[prog][bar], sw = i % 2 ? E * .18 : 0, at = t + sw;
    if (i === 0) {
      chord.forEach(m => { note(hz(m), t, E * 8 + .4, { type: 'triangle', gain: .028, attack: .5, release: 1.1, cutoff: 1300, detune: -7 }); note(hz(m), t, E * 8 + .4, { type: 'triangle', gain: .028, attack: .5, release: 1.1, cutoff: 1300, detune: 7 }); });
    }
    if (i === 0 || i === 5) note(hz(chord[0] - 12), at, E * (i === 0 ? 3.5 : 2.5), { type: 'sine', gain: .2, attack: .02, release: .25 });
    if (i === 0 || i === 4) kick(t);
    if (i % 2 === 1) hat(at, .03); else if (Math.random() < .35) hat(at, .015);
    // Mellow keys melody: chord tones an octave up, with rests so it breathes.
    const pattern = bar % 2 ? [0, 2, 1, 3, 2, 1, 3, 2] : [2, 1, 3, 2, 1, 0, 2, 3];
    if (Math.random() < (i % 2 ? .45 : .7)) {
      const m = chord[pattern[i]] + 12 + (Math.random() < .12 ? 12 : 0);
      note(hz(m), at, E * 1.6, { type: 'sine', gain: .05, attack: .005, release: .45 });
      note(hz(m) * 2, at, E * .8, { type: 'triangle', gain: .008, attack: .005, release: .3 });
    }
  }
  function schedule() {
    while (next < ctx.currentTime + .25) {
      play(step, next);
      next += E; step++;
      if (step === 8) { step = 0; bar++; if (bar === 4) { bar = 0; prog = (prog + 1) % PROGS.length; } }
    }
  }
  function level() { return ducked ? DUCK : LEVEL; }
  function start() {
    if (playing || !state.music || document.hidden || !setup()) return;
    if (ctx.state === 'suspended') ctx.resume();
    playing = true; next = ctx.currentTime + .1; step = 0;
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setValueAtTime(out.gain.value, ctx.currentTime); out.gain.linearRampToValueAtTime(level(), ctx.currentTime + 2.5);
    timer = setInterval(schedule, 60); schedule();
  }
  function stop(fast) {
    if (!playing) return; playing = false; clearInterval(timer); timer = null;
    if (out) { out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(out.gain.value, ctx.currentTime); out.gain.linearRampToValueAtTime(0, ctx.currentTime + (fast ? .3 : 1.2)); }
  }
  let dipTimer = null;
  function dip(ms) {
    if (!playing || !out) return;
    clearTimeout(dipTimer);
    out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(out.gain.value, ctx.currentTime); out.gain.linearRampToValueAtTime(.025, ctx.currentTime + .25);
    dipTimer = setTimeout(() => { if (playing) { out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(out.gain.value, ctx.currentTime); out.gain.linearRampToValueAtTime(level(), ctx.currentTime + 1.5); } }, ms);
  }
  function duck(on) {
    ducked = on;
    if (playing && out) { out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(out.gain.value, ctx.currentTime); out.gain.linearRampToValueAtTime(level(), ctx.currentTime + .8); }
  }
  function paint() {
    const b = $('#musicBtn'); if (!b) return;
    b.setAttribute('aria-pressed', String(!!state.music));
    $('#musicOff').hidden = !!state.music;
  }
  function toggle() {
    state.music = !state.music; save(); paint();
    if (state.music) { start(); toast('Music on'); } else { stop(); toast('Music off'); }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(true); else start(); });
  document.addEventListener('pointerdown', () => start(), { passive: true });
  document.addEventListener('keydown', () => start());
  return { start, stop, toggle, duck, dip, paint, playing: () => playing };
})();

/* ================= Burst particles (global overlay) ================= */
const Burst = (() => {
  const cv = $('#burst'), ctx = cv.getContext('2d'); let ps = [], running = false, last = 0, dpr = 1;
  const CHIPC = ['#D9463E', '#2F6FDE', '#2FAE74', '#1B1E27', '#E3BD6B'];
  function resize() { dpr = Math.min(1.5, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  resize(); addEventListener('resize', resize);
  const chipSprites = {};
  function chipSprite(color) { if (chipSprites[color]) return chipSprites[color]; const c = document.createElement('canvas'), R = 24; c.width = c.height = R * 2; const g = c.getContext('2d'); g.translate(R, R); g.fillStyle = color; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = R * .24; g.setLineDash([R * .36, R * .36]); g.beginPath(); g.arc(0, 0, R * .84, 0, 6.283); g.stroke(); g.setLineDash([]); g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(0, 0, R * .55, 0, 6.283); g.stroke(); return chipSprites[color] = c; }
  function drawChip(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.max(.12, Math.abs(Math.cos(p.flip))));
    ctx.drawImage(chipSprite(p.color), -p.r, -p.r, p.r * 2, p.r * 2); ctx.restore();
  }
  function loop(t) {
    const dt = Math.min(.033, (t - last) / 1000); last = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    ps = ps.filter(p => p.life > 0 && p.y < innerHeight + 60);
    for (const p of ps) {
      p.vy += (p.g ?? 900) * dt; p.vx *= (1 - (p.drag ?? .4) * dt); p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += (p.vf || 0) * dt; p.life -= dt;
      ctx.globalAlpha = Math.min(1, p.life * 2);
      if (p.k === 'chip') drawChip(p);
      else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; if (p.k === 'flake') ctx.fillRect(-p.r, -p.r * .6, p.r * 2, p.r * 1.2); else ctx.fillRect(-p.r, -p.r * .35, p.r * 2, p.r * .7); ctx.restore(); }
    }
    ctx.globalAlpha = 1;
    if (ps.length) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function add(p) { ps.push(p); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } }
  return {
    flake(x, y, color) { if (reduced || ps.length > 400) return; add({ k: 'flake', x, y, vx: (Math.random() - .5) * 160, vy: -Math.random() * 120, r: 1 + Math.random() * 2.2, rot: Math.random() * 6, vr: (Math.random() - .5) * 20, color, life: .7 + Math.random() * .4, g: 700 }); },
    chips(x, y, n, spread = 1, colors) {
      if (reduced) n = Math.min(n, 8);
      for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - .5) * 1.9 * spread; const s = 380 + Math.random() * 620;
        add({ k: 'chip', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 8 + Math.random() * 8, rot: Math.random() * 6, vr: (Math.random() - .5) * 8, flip: Math.random() * 6, vf: 6 + Math.random() * 10, color: pick(CHIPC), life: 3, drag: .6 }); }
    },
    confetti(x, y, n, colors) {
      if (reduced) return;
      for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - .5) * 2.4; const s = 300 + Math.random() * 700;
        add({ k: 'conf', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 3 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - .5) * 18, color: pick(colors), life: 3.2, g: 520, drag: 1.4 }); }
    }
  };
})();

/* ================= Ambient theme FX ================= */
const Ambient = (() => {
  const cv = $('#fx'), ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1, ps = [], cfg = null, run = false, last = 0, T = 0;
  let flash = 0, nextFlash = 3, bolt = null, rings = [], nextNova = 2, shoot = null, nextShoot = 3, tumble = null;
  function resize() { dpr = 1; W = innerWidth; H = innerHeight; cv.width = W; cv.height = H; }
  const sprites = new Map();
  function sprite(key, size, draw) { let c = sprites.get(key); if (!c) { c = document.createElement('canvas'); c.width = c.height = Math.ceil(size); draw(c.getContext('2d'), size); sprites.set(key, c); } return c; }
  addEventListener('resize', () => { if (run) resize(); });
  const R = (a, b) => a + Math.random() * (b - a);
  function make(initial) {
    const c = cfg, sz = c.size || [2, 4], sp = c.speed || [20, 40];
    const p = { x: R(0, W), y: initial ? R(0, H) : 0, size: R(sz[0], sz[1]), v: R(sp[0], sp[1]), rot: R(0, 6.28), vr: R(-2, 2), ph: R(0, 6.28), sw: R(.5, 1.6), amp: R(10, 40), color: pick(c.colors || ['#fff']), glyph: c.glyphs ? pick(c.glyphs) : null, a: R(.4, 1) };
    if (c.mode === 'fall' && !initial) p.y = -30;
    if (c.mode === 'rise' && !initial) p.y = H + 30;
    if (c.mode === 'wind' && !initial) p.x = -20;
    return p;
  }
  function set(fx) {
    cfg = fx; ps = []; rings = []; bolt = null; flash = 0; shoot = null; tumble = null; resize();
    const n = reduced ? Math.min(20, fx.count || 30) : (fx.count || 40);
    if (['fall', 'rise', 'drift', 'wind'].includes(fx.mode)) for (let i = 0; i < n; i++) ps.push(make(true));
    if (fx.mode === 'twinkle' || fx.mode === 'aurora' || fx.mode === 'grid') for (let i = 0; i < (fx.mode === 'grid' ? 80 : n); i++) ps.push({ x: R(0, W), y: R(0, fx.mode === 'grid' ? H * .55 : H), size: R(.4, 1.8), ph: R(0, 6.28), sw: R(.5, 2.5) });
    if (fx.mode === 'storm') for (let i = 0; i < n; i++) ps.push({ x: R(0, W * 1.2), y: R(0, H), v: R(700, 1100), len: R(10, 24) });
    if (fx.extra === 'glyph') for (let i = 0; i < 8; i++) ps.push(Object.assign(make(true), { glyph: pick(fx.glyphs), size: R(16, 26), isG: true }));
    if (fx.extra === 'sparkle') for (let i = 0; i < 24; i++) ps.push({ spark: true, x: R(0, W), y: R(0, H), size: R(2, 5), ph: R(0, 6.28), sw: R(1, 3), color: '#FFF3B0' });
  }
  function star(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill(); }
  function drawSpecial(dt) {
    const m = cfg.mode;
    if (m === 'twinkle' || m === 'aurora' || m === 'grid') {
      for (const p of ps) { if (p.x === undefined || p.v) continue; ctx.globalAlpha = .35 + .65 * Math.abs(Math.sin(T * p.sw + p.ph)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    if (m === 'aurora') {
      ctx.globalCompositeOperation = 'lighter';
      const bands = [['rgba(62,240,176,', .2, 0], ['rgba(123,47,191,', .16, 2], ['rgba(40,180,255,', .12, 4]];
      bands.forEach(([col, a, off], bi) => {
        const g = ctx.createLinearGradient(0, H * .05, 0, H * .6); g.addColorStop(0, col + '0)'); g.addColorStop(.5, col + a + ')'); g.addColorStop(1, col + '0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, H * .7);
        for (let x = 0; x <= W; x += 20) { const y = H * (.18 + bi * .06) + Math.sin(x * .006 + T * .5 + off) * 40 + Math.sin(x * .013 - T * .3 + off) * 24; ctx.lineTo(x, y); }
        ctx.lineTo(W, H * .7); ctx.closePath(); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }
    if (m === 'grid') {
      const hz = H * .58;
      const sun = ctx.createLinearGradient(0, hz - 170, 0, hz); sun.addColorStop(0, '#FFD166'); sun.addColorStop(1, '#F72585');
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, hz, Math.min(170, W * .3), Math.PI, 0); ctx.clip(); ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#12062E'; for (let i = 0; i < 6; i++) { const y = hz - 12 - i * 22; ctx.fillRect(0, y, W, 3 + i * .9); } ctx.restore();
      const g = ctx.createLinearGradient(0, hz, 0, H); g.addColorStop(0, 'rgba(247,37,133,.0)'); g.addColorStop(1, 'rgba(247,37,133,.25)'); ctx.fillStyle = g; ctx.fillRect(0, hz, W, H - hz);
      ctx.strokeStyle = 'rgba(247,37,133,.55)'; ctx.lineWidth = 1.2;
      for (let i = -20; i <= 20; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 12, hz); ctx.lineTo(W / 2 + i * W * .18, H); ctx.stroke(); }
      const off = (T * .35) % 1;
      for (let i = 0; i < 14; i++) { const z = (i + off) / 14; const y = hz + (H - hz) * z * z; ctx.globalAlpha = z; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    if (cfg.shooting) {
      nextShoot -= dt; if (nextShoot < 0 && !shoot) { shoot = { x: R(W * .2, W), y: R(0, H * .4), l: 0 }; nextShoot = R(3, 7); }
      if (shoot) { shoot.l += dt; const k = shoot.l / .8; const x = shoot.x - k * 400, y = shoot.y + k * 200; const g = ctx.createLinearGradient(x, y, x + 120, y - 60); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120, y - 60); ctx.stroke(); if (k > 1) shoot = null; }
    }
    if (cfg.nova) {
      nextNova -= dt; if (nextNova < 0) { rings.push({ x: R(W * .1, W * .9), y: R(H * .1, H * .8), r: 0, c: pick(['255,0,110', '255,190,11', '131,56,236']) }); nextNova = R(1.6, 3.2); }
      ctx.globalCompositeOperation = 'lighter';
      rings = rings.filter(r => r.r < 260);
      for (const r of rings) { r.r += 90 * dt; const a = 1 - r.r / 260; const g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.r); g.addColorStop(0, `rgba(${r.c},${.35 * a})`); g.addColorStop(.7, `rgba(${r.c},${.08 * a})`); g.addColorStop(1, `rgba(${r.c},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.283); ctx.fill(); ctx.strokeStyle = `rgba(${r.c},${.5 * a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(r.x, r.y, r.r * .9, 0, 6.283); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (m === 'storm') {
      ctx.strokeStyle = 'rgba(180,200,255,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); for (const p of ps) { p.y += p.v * dt; p.x -= p.v * .18 * dt; if (p.y > H) { p.y = -20; p.x = R(0, W * 1.2); } ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.len * .18, p.y - p.len); } ctx.stroke();
      nextFlash -= dt;
      if (nextFlash < 0 && !reduced) {
        nextFlash = R(2.5, 6); flash = 1; let x = R(W * .15, W * .85), y = 0; const pts = [[x, y]];
        while (y < H * R(.45, .75)) { x += R(-40, 40); y += R(20, 50); pts.push([x, y]); } bolt = { pts, life: .35 };
        if (!$('#play').hidden) { Sfx.noise(1.2, { gain: .1, freq: 180, type: 'lowpass', when: .15 }); }
      }
      if (bolt) { bolt.life -= dt; ctx.strokeStyle = `rgba(255,248,200,${Math.max(0, bolt.life / .35)})`; ctx.lineWidth = 3; ctx.shadowColor = '#F9D71C'; ctx.shadowBlur = 18; ctx.beginPath(); bolt.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.shadowBlur = 0; if (bolt.life <= 0) bolt = null; }
      if (flash > 0) { ctx.fillStyle = `rgba(200,215,255,${flash * .22})`; ctx.fillRect(0, 0, W, H); flash -= dt * 3; }
    }
    if (cfg.extra === 'rays') {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) { const x = W * (.15 + i * .18) + Math.sin(T * .3 + i) * 40; const g = ctx.createLinearGradient(x, 0, x + 120, H); g.addColorStop(0, 'rgba(120,210,255,.10)'); g.addColorStop(1, 'rgba(120,210,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 30, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 220, H); ctx.lineTo(x + 60, H); ctx.closePath(); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (cfg.extra === 'tumble') {
      if (!tumble && Math.random() < dt * .15) tumble = { x: -60, y: H * R(.7, .9), r: R(18, 30), rot: 0, b: 0 };
      if (tumble) { tumble.x += 170 * dt; tumble.rot += 4 * dt; tumble.b += dt * 5; const y = tumble.y - Math.abs(Math.sin(tumble.b)) * 30; ctx.save(); ctx.translate(tumble.x, y); ctx.rotate(tumble.rot); ctx.strokeStyle = 'rgba(160,110,60,.8)'; ctx.lineWidth = 1.3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(0, 0, tumble.r, tumble.r * .55, i * .7, 0, 6.283); ctx.stroke(); } ctx.restore(); if (tumble.x > W + 60) tumble = null; }
    }
  }
  function drawP(p, dt) {
    const c = cfg, m = c.mode;
    if (p.spark) { const a = Math.max(0, Math.sin(T * p.sw + p.ph)); ctx.globalAlpha = a; ctx.fillStyle = p.color; star(p.x, p.y, p.size * a + .5); ctx.globalAlpha = 1; return; }
    if (m === 'fall') { p.y += p.v * dt; p.x += Math.sin(T * p.sw + p.ph) * p.amp * dt; p.rot += p.vr * dt; if (p.y > H + 30) Object.assign(p, make(false)); }
    else if (m === 'rise') { p.y -= p.v * dt; p.x += Math.sin(T * p.sw + p.ph) * p.amp * .6 * dt; if (p.y < -30) Object.assign(p, make(false)); }
    else if (m === 'drift') { p.x += Math.cos(p.ph + T * .1) * 10 * dt; p.y += Math.sin(p.ph + T * .13) * 8 * dt - 4 * dt; if (p.y < -60) p.y = H + 60; if (p.x < -60) p.x = W + 60; if (p.x > W + 60) p.x = -60; }
    else if (m === 'wind') { p.x += p.v * dt; p.y += Math.sin(T * p.sw + p.ph) * 20 * dt; if (p.x > W + 20) Object.assign(p, make(false), { x: -20 }); }
    const shape = p.isG ? 'glyph' : c.shape;
    ctx.save(); ctx.translate(p.x, p.y);
    if (shape === 'rect') { ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.globalAlpha = .9; ctx.scale(1, Math.abs(Math.cos(T * 3 + p.ph)) * .8 + .2); ctx.fillRect(-p.size / 2, -p.size * .18, p.size, p.size * .36); }
    else if (shape === 'circle') { ctx.fillStyle = p.color; ctx.globalAlpha = p.a * .9; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, 6.283); ctx.fill(); }
    else if (shape === 'glyph') { ctx.rotate(Math.sin(T + p.ph) * .6); ctx.globalAlpha = .85; const sz = Math.round(p.size), sp = sprite('g' + p.glyph + sz, sz * 1.4, (g, S) => { g.font = `${sz}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.glyph, S / 2, S / 2); }); ctx.drawImage(sp, -sp.width / 2, -sp.height / 2); }
    else if (shape === 'petal') { ctx.rotate(p.rot + Math.sin(T * 2 + p.ph)); ctx.fillStyle = p.color; ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * .55, 0, 0, 6.283); ctx.fill(); }
    else if (shape === 'bubble') { ctx.globalAlpha = .55; ctx.strokeStyle = p.color; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, 6.283); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-p.size * .35, -p.size * .35, p.size * .22, 0, 6.283); ctx.fill(); }
    else if (shape === 'ember') { ctx.globalCompositeOperation = 'lighter'; const a = .5 + .5 * Math.sin(T * 6 + p.ph); ctx.fillStyle = p.color; ctx.globalAlpha = .25 * a; ctx.beginPath(); ctx.arc(0, 0, p.size * 4, 0, 6.283); ctx.fill(); ctx.globalAlpha = .9 * a + .1; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, 6.283); ctx.fill(); }
    else if (shape === 'star') { const a = .3 + .7 * Math.abs(Math.sin(T * p.sw + p.ph)); ctx.globalAlpha = a; ctx.fillStyle = p.color; star(0, 0, p.size * (0.6 + a * .6)); }
    else if (shape === 'bokeh') { ctx.globalCompositeOperation = 'lighter'; const sp = sprite('b' + p.color, 128, (g, S) => { const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gr.addColorStop(0, p.color + '55'); gr.addColorStop(.7, p.color + '22'); gr.addColorStop(1, p.color + '00'); g.fillStyle = gr; g.fillRect(0, 0, S, S); }); ctx.globalAlpha = .6 + .4 * Math.sin(T * .8 + p.ph); ctx.drawImage(sp, -p.size, -p.size, p.size * 2, p.size * 2); }
    else if (shape === 'dust') { ctx.fillStyle = p.color; ctx.globalAlpha = .5; ctx.fillRect(0, 0, p.size * 3, p.size * .8); }
    ctx.restore();
  }
  function loop(t) {
    if (!run) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t; T += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    drawSpecial(dt);
    if (['fall', 'rise', 'drift', 'wind'].includes(cfg.mode) || cfg.extra) for (const p of ps) { if (p.x === undefined || p.len || (!cfg.shape && !p.spark && !p.isG)) continue; drawP(p, dt); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(loop);
  }
  return {
    start(fx) { set(fx); if (!run) { run = true; last = performance.now(); requestAnimationFrame(loop); } },
    stop() { run = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  };
})();


THEMES.forEach((t, i) => { t.idx = i; });
const TIER_OF = p => TIERS.find(x => x.price === p);
const ARROW_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';

/* ================= Balance ================= */
let shownBal = state.balance;
function setBalText(v) { document.querySelectorAll('.bal-num').forEach(el => el.textContent = fmt(v)); }
function animateBalance(to, dur = 900) {
  const from = shownBal; shownBal = to;
  if (reduced || from === to || !dur) { setBalText(to); return; }
  const t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 4); setBalText(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function pulseBal(cls) { const b = $('#wallet'); b.classList.remove('bump', 'drop'); void b.offsetWidth; b.classList.add(cls); }

function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast glasspill'; el.textContent = msg; $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 360); }, 2800);
}

function flyChips(fromX, fromY, n, onDone) {
  const target = $('#wallet .stack').getBoundingClientRect();
  const tx = target.left + target.width / 2, ty = target.top + target.height / 2;
  const colors = ['', 'blue', 'green', 'gold', 'black'];
  let landed = 0;
  if (reduced) { onDone && onDone(); return; }
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div'); el.className = 'fly'; el.innerHTML = chipSvg(pick(colors)); document.body.appendChild(el);
    const sx = fromX + (Math.random() - .5) * 140, sy = fromY + (Math.random() - .5) * 50;
    const mx = (sx + tx) / 2 + (Math.random() - .5) * 240, my = Math.min(sy, ty) - 60 - Math.random() * 140;
    const a = el.animate([
      { transform: `translate(${sx - 12}px,${sy - 12}px) scale(.4)`, opacity: 0 },
      { transform: `translate(${mx - 12}px,${my - 12}px) scale(1.25) rotate(200deg)`, opacity: 1, offset: .45 },
      { transform: `translate(${tx - 12}px,${ty - 12}px) scale(.8) rotate(400deg)`, opacity: 1 }
    ], { duration: 800 + Math.random() * 260, delay: i * 50, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
    a.onfinish = () => { el.remove(); Sfx.tick(); if (++landed === n) onDone && onDone(); };
  }
}

/* ================= Faces ================= */
function faceHTML(t) {
  return `<div class="face" style="${themeVars(t)}">
    <div class="f-pat pat-${t.pattern}"></div>
    <div class="f-emb">${emblemHTML(t)}</div>
    <div class="f-top"><span></span><span class="f-price">${chipSvg()}<b>${t.price}</b></span></div>
    <div class="f-name" style="font-size:${Math.min(16.5, 80 / (Math.max(...t.name.split(' ').map(w => w.length)) * .55)).toFixed(2)}cqw">${t.name.split(' ').join('<br>')}</div>
    <div class="f-bottom"><div class="f-foil"><span>SCRATCH</span></div></div>
    <div class="f-holo"></div><div class="f-glare"></div>
  </div>`;
}

/* ================= Lobby ================= */
let sel = byId[state.sel] ? state.sel : 'cosmic';
function setBodyTheme(t) {
  const b = document.body.style;
  b.setProperty('--c1', t.c[0]); b.setProperty('--c2', t.c[1]); b.setProperty('--c3', t.c[2]); b.setProperty('--acc', t.acc); b.setProperty('--s2', t.stage[1]);
}
function renderTiers() {
  const cur = byId[sel].price;
  $('#tiers').innerHTML = TIERS.map(tr => `<button class="tier-tab" role="tab" aria-selected="${tr.price === cur}" data-p="${tr.price}"><span class="disc">${chipSvg(tr.chip)}<b>${tr.price}</b></span><span class="tn">${tr.name}</span></button>`).join('');
  $('#tiers').querySelectorAll('.tier-tab').forEach(b => b.onclick = () => {
    const p = +b.dataset.p; if (p === byId[sel].price) return; Sfx.init(); Sfx.click();
    const first = THEMES.find(t => t.price === p); select(first.id, 1, true);
  });
}
function renderFan(deal) {
  const list = THEMES.filter(t => t.price === byId[sel].price);
  $('#fan').innerHTML = list.map((t, i) => `<button class="mini ${deal ? 'enter' : ''}" data-id="${t.id}" style="--r:${(i - 2) * 6}deg;--y:${Math.abs(i - 2) * 9}px;--i:${i}" aria-label="${t.name}, ${t.price} chips"><div class="shell">${faceHTML(t)}</div></button>`).join('');
  $('#fan').querySelectorAll('.mini').forEach(m => m.onclick = () => { Sfx.init(); if (m.dataset.id !== sel) { Sfx.click(); select(m.dataset.id, THEMES.indexOf(byId[m.dataset.id]) > THEMES.indexOf(byId[sel]) ? 1 : -1); } });
  markFan();
}
function markFan() {
  $('#fan').querySelectorAll('.mini').forEach(m => { m.classList.toggle('on', m.dataset.id === sel); m.classList.toggle('short', state.balance < byId[m.dataset.id].price); });
}
function titleHTML(name) {
  let d = 0;
  return name.split(' ').map(w => `<span class="w">${[...w].map(c => `<span class="ch" style="--d:${d++}">${c}</span>`).join('')}</span>`).join('');
}
function renderInfo(animate) {
  const t = byId[sel], per = state.per[t.id] || { n: 0, best: 0 };
  $('#iTier').textContent = mechLabel(t);
  const title = $('#iTitle');
  title.innerHTML = titleHTML(t.name); title.setAttribute('aria-label', t.name);
  $('#iRule').textContent = ruleText(t);
  $('#iFacts').innerHTML = `<div><dt>Top prize</dt><dd>${chipSvg()}${fmt(t.price * 200)}</dd></div>${per.best ? `<div><dt>Your best</dt><dd>${fmt(per.best)}</dd></div>` : ''}`;
  fitTitle();
  if (animate) ['#iRule', '#iFacts', '.cta'].forEach(s => { const e = $(s); e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
  updateBuy();
}
function updateBuy() {
  const t = byId[sel], short = state.balance < t.price;
  const cur = state.current && !state.current.done;
  $('#buyPrice').textContent = t.price;
  $('#buyBtn').classList.toggle('short', short && !cur);
  $('#buyLbl').textContent = short && !cur ? `Need ${t.price - state.balance}` : 'Play';
  markFan();
}
function fitTitle() {
  const title = $('#iTitle'); title.style.fontSize = '';
  let fs = parseFloat(getComputedStyle(title).fontSize), n = 0;
  const words = [...title.querySelectorAll('.w')];
  while (n++ < 30 && words.some(w => w.scrollWidth > title.clientWidth + 1)) { fs -= 4; title.style.fontSize = fs + 'px'; }
}
addEventListener('resize', () => { if (!active) fitTitle(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitTitle());
function renderFeature(dir) {
  const t = byId[sel], shell = $('#featShell');
  shell.innerHTML = faceHTML(t);
  if (dir && !reduced) {
    shell.animate([{ opacity: 0, transform: `translateX(${dir * 70}px) rotateY(${-dir * 38}deg) scale(.9)` }, { opacity: 1, transform: 'none' }], { duration: 850, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
}
function select(id, dir = 1, deal = false) {
  const prevTier = byId[sel].price; sel = id; state.sel = id;
  const t = byId[id];
  setBodyTheme(t);
  Ambient.start(t.fx);
  renderFeature(dir); renderInfo(true);
  if (deal || prevTier !== t.price) { renderTiers(); renderFan(true); } else markFan();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}
function step(d) { const i = (THEMES.indexOf(byId[sel]) + d + THEMES.length) % THEMES.length; Sfx.init(); Sfx.click(); select(THEMES[i].id, d); }
$('#prevBtn').onclick = () => step(-1);
$('#nextBtn').onclick = () => step(1);
$('#buyBtn').onclick = () => buy(byId[sel], $('#featShell'));
$('#tilt').addEventListener('click', () => buy(byId[sel], $('#featShell')));

/* smooth spring tilt for the featured ticket */
(() => {
  const tilt = $('#tilt'); if (reduced) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, mx = 50, my = 50, cmx = 50, cmy = 50, hovering = false, raf = 0;
  const loop = () => {
    cx += (tx - cx) * .12; cy += (ty - cy) * .12; cmx += (mx - cmx) * .15; cmy += (my - cmy) * .15;
    tilt.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg)`;
    if (hovering) { tilt.style.setProperty('--mx', cmx.toFixed(2)); tilt.style.setProperty('--my', cmy.toFixed(2)); }
    if (hovering || Math.abs(cx) > .05 || Math.abs(cy) > .05) raf = requestAnimationFrame(loop); else { raf = 0; tilt.style.transform = ''; }
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  tilt.addEventListener('pointerenter', () => { hovering = true; tilt.classList.remove('idle'); kick(); });
  tilt.addEventListener('pointermove', e => { const r = tilt.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; tx = (x - .5) * 22; ty = -(y - .5) * 22; mx = x * 100; my = y * 100; kick(); });
  tilt.addEventListener('pointerleave', () => { hovering = false; tx = ty = 0; tilt.classList.add('idle'); tilt.style.removeProperty('--mx'); tilt.style.removeProperty('--my'); kick(); });
})();

function renderResume() {
  const cur = state.current, res = $('#resume');
  const rt = ONLINE && uid ? Room.ticket() : null;
  if (rt && !rt.done) {
    res.hidden = false;
    res.innerHTML = `<span class="dotlive"></span><span><b>${byId[rt.id].name}</b> · room game</span><button id="resumeBtn">Resume</button>`;
    $('#resumeBtn').onclick = () => openPlay(rt); return;
  }
  if (cur && !cur.done) {
    const t = byId[cur.id], n = cur.revealed.filter(Boolean).length;
    res.hidden = false;
    res.innerHTML = `<span class="dotlive"></span><span><b>${t.name}</b> in play</span><button id="resumeBtn">Resume</button>`;
    $('#resumeBtn').onclick = () => openPlay(cur);
  } else res.hidden = true;
}
function updateChestBtn() {
  const ready = state.chestDay !== dayKey();
  $('#chestBtn').classList.toggle('ready', ready);
  $('#chestLbl').textContent = ready ? 'DAILY DRAW' : hms(msToMidnight());
}
function refreshLobby() { renderInfo(false); renderResume(); updateChestBtn(); }
function renderAll() {
  shownBal = state.balance; setBalText(state.balance);
  const t = byId[sel]; setBodyTheme(t); Ambient.start(t.fx);
  renderTiers(); renderFan(true); renderFeature(0); renderInfo(false); renderResume(); updateChestBtn(); updateSoundIcon();
}

/* ================= Buying ================= */
function buy(t, fromEl) {
  Sfx.init();
  if (state.current && !state.current.done) {
    if (state.current.id !== t.id) toast('Finish this one first');
    openPlay(state.current, fromEl); return;
  }
  if (state.balance < t.price) {
    toast(state.chestDay !== dayKey() ? 'Not enough chips. Try your daily draw.' : 'Not enough chips');
    $('#buyBtn').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 360 });
    return;
  }
  if (ONLINE) {
    if (buy.busy) return; buy.busy = true; document.body.classList.add('busy');
    rpc('buy_ticket', { p_theme: t.id, p_day: dayKey() }).then(res => {
      const th = byId[res.ticket.theme] || t;
      const tk = generate(th, res.ticket.total); tk.sid = res.ticket.id;
      state.current = tk;
      if (!res.resumed) { state.per[th.id] = state.per[th.id] || { n: 0, best: 0 }; state.per[th.id].n++; }
      else if (th.id !== t.id) toast('Finish this one first');
      applyProfile(res.me, null);
      paid(th, tk, fromEl, !res.resumed);
    }).catch(e => { toast(errText(e)); refreshMe(300); })
      .finally(() => { buy.busy = false; document.body.classList.remove('busy'); });
    return;
  }
  state.balance -= t.price; state.stats.spent += t.price; state.today.spent += t.price;
  state.per[t.id] = state.per[t.id] || { n: 0, best: 0 }; state.per[t.id].n++;
  state.stats.played++;
  const tk = generate(t); state.current = tk; save();
  paid(t, tk, fromEl, true);
}
function paid(t, tk, fromEl, charged) {
  if (charged) {
    Sfx.buy();
    const b = $('#wallet').getBoundingClientRect(); const m = document.createElement('div'); m.className = 'minus'; m.textContent = `−${t.price}`; m.style.left = (b.left + b.width / 2 - 12) + 'px'; m.style.top = (b.bottom + 6) + 'px'; document.body.appendChild(m); setTimeout(() => m.remove(), 1100);
    pulseBal('drop');
  }
  animateBalance(state.balance, 450);
  openPlay(tk, fromEl);
}

/* ================= Play ================= */
let active = null, finishing = false;
const areaEl = i => document.querySelector(`#ticketHost .area[data-a="${i}"]`);
function ticketHTML(tk) {
  const t = byId[tk.id];
  const body = MECHS[t.mech].body(tk, t);
  return `<article class="ticket" id="ticket" style="${themeVars(t)}">
    <header class="tk-band">
      <div class="f-pat pat-${t.pattern}"></div>
      <div class="tk-emb">${emblemHTML(t)}</div>
      <h2 class="tk-name">${t.name}</h2>
      <div class="tk-price">${chipSvg()}<b>${t.price}</b></div>
    </header>
    <div class="perf"></div>
    <div class="tk-rules"><p>${ruleText(t)}</p><div class="tp"><span class="k">Top prize</span><b>${fmt(t.price * 200)}</b></div></div>
    <div class="tk-body">${body}</div>
    <footer class="tk-foot"><div class="barcode"></div></footer>
  </article>`;
}
function paintFoil(cv, t) {
  const w0 = cv.offsetWidth, h0 = cv.offsetHeight; if (!w0 || !h0) return;
  const dpr = Math.min(1.5, devicePixelRatio || 1);
  cv.width = Math.round(w0 * dpr); cv.height = Math.round(h0 * dpr);
  const ctx = cv.getContext('2d'); cv._ctx = ctx; cv._moves = 0; cv._dpr = dpr; cv._brush = coinBrush() * dpr;
  cv._cell = 8 * dpr; cv._gw = Math.ceil(cv.width / cv._cell); cv._gh = Math.ceil(cv.height / cv._cell); cv._grid = new Uint8Array(cv._gw * cv._gh); cv._hit = 0;
  const w = cv.width, h = cv.height;
  const g = ctx.createLinearGradient(0, 0, w, h * 1.4);
  g.addColorStop(0, t.foil[1]); g.addColorStop(.3, t.foil[0]); g.addColorStop(.5, '#F7F5EF'); g.addColorStop(.7, t.foil[0]); g.addColorStop(1, t.foil[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += dpr * 1.3) { ctx.fillStyle = Math.random() < .5 ? `rgba(255,255,255,${Math.random() * .16})` : `rgba(0,0,0,${Math.random() * .06})`; ctx.fillRect(0, y, w, dpr * .8); }
  const hg = ctx.createLinearGradient(0, 0, w, h);
  ['#ff6f91', '#ffe66d', '#9dff7a', '#7af3ff', '#8a8cff', '#ff7ae0'].forEach((c, i, a) => hg.addColorStop(i / (a.length - 1), c));
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .22; ctx.fillStyle = hg; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0,0,0,.05)'; const s = 12 * dpr;
  for (let y = s / 2; y < h; y += s) for (let x = (y / s % 2 ? s : s / 2); x < w; x += s * 2) { ctx.beginPath(); ctx.moveTo(x, y - 2.5 * dpr); ctx.lineTo(x + 2.5 * dpr, y); ctx.lineTo(x, y + 2.5 * dpr); ctx.lineTo(x - 2.5 * dpr, y); ctx.fill(); }
  // Fit the label inside the panel so it never gets clipped
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const maxW = w * .84;
  let label = w0 > 170 ? 'SCRATCH HERE' : 'SCRATCH', fs = Math.min(h0 * .42, w0 > 170 ? 26 : 18) * dpr, ls = (w0 > 170 ? 6 : 3) * dpr, tw = 0;
  const measure = () => { ctx.font = `900 ${fs}px "Big Shoulders Display", Impact, "Arial Narrow", sans-serif`; try { ctx.letterSpacing = '0px'; } catch (e) {} const base = ctx.measureText(label).width; return base + ls * (label.length - 1); };
  for (let n = 0; n < 40; n++) {
    tw = measure(); if (tw <= maxW) break;
    if (label === 'SCRATCH HERE' && fs < 16 * dpr) { label = 'SCRATCH'; continue; }
    if (ls > dpr) ls *= .7; else fs *= .9;
  }
  const drawSpaced = (x, y) => { let cx = x; for (const ch of label) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + ls; } };
  const x0 = (w - tw) / 2;
  ctx.fillStyle = 'rgba(255,255,255,.7)'; drawSpaced(x0 + dpr, h / 2 + dpr * 1.2);
  ctx.fillStyle = 'rgba(20,18,24,.3)'; drawSpaced(x0, h / 2);
  cv.classList.remove('gone');
}
function mountFoils() {
  if (!active) return; const t = byId[active.id];
  active.revealed.forEach((rv, i) => {
    const a = areaEl(i); if (!a) return; const cv = a.querySelector('canvas.foil');
    if (rv) { a.classList.add('revealed'); a.style.animation = 'none'; cv && cv.remove(); }
    else if (cv && !cv._done) paintFoil(cv, t);
  });
}
let playToken = 0;
function openPlay(tk, fromEl) {
  playToken++; active = tk; finishing = false;
  const t = byId[tk.id];
  if (sel !== tk.id) { sel = tk.id; state.sel = tk.id; }
  setBodyTheme(t); Ambient.start(t.fx); Coin.set(t.price);
  $('#ptMeta').innerHTML = '';
  $('#ticketHost').innerHTML = ticketHTML(tk);
  if (tk.room) Room.strip();
  const play = $('#play'); play.hidden = false; play.scrollTop = 0;
  document.body.classList.add('playing'); document.body.style.overflow = 'hidden';
  $('#pill').hidden = false;
  const tEl = $('#ticket');
  if (fromEl && !reduced) {
    const a = fromEl.getBoundingClientRect(), b = tEl.getBoundingClientRect(), s = a.width / b.width;
    tEl.animate([
      { transformOrigin: '0 0', transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${s})`, opacity: .3 },
      { transformOrigin: '0 0', transform: 'none', opacity: 1 }
    ], { duration: 820, easing: 'cubic-bezier(.16,1,.3,1)' });
  } else if (!reduced) tEl.animate([{ opacity: 0, transform: 'translateY(60px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
  const go = () => { mountFoils(); updateLit(true); updatePill(); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(go));
  bindScratch();
  if (tk.done) showResult(tk, true); else updatePill();
  if (!tk.done && tk.revealed.filter(Boolean).length <= (tk.pre || 0) && !(state.hideHelp || {})[t.id]) setTimeout(() => { if (active === tk) showHelp(t); }, reduced ? 0 : 650);
}
function closePlay() {
  Coin.hide();
  const tEl = $('#ticket'), tok = playToken;
  const done = () => {
    if (tok !== playToken) return;
    $('#play').hidden = true; $('#pill').hidden = true; document.body.classList.remove('playing'); document.body.style.overflow = '';
    active = null; renderFeature(0); renderTiers(); renderFan(false); refreshLobby();
  };
  if (tEl && !reduced) { const a = tEl.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(50px) scale(.95)' }], { duration: 320, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }); a.onfinish = done; }
  else done();
}
$('#backBtn').addEventListener('click', () => { Sfx.click(); closePlay(); });


/* ================= Coin scratcher (Canadian coins by ticket price) ================= */
const SILVER = ['#FBFCFD', '#C3C9D1', '#7E8691'], GOLDC = ['#FFF2B0', '#E3B32E', '#8C6A0B'];
const COINS = {
  2: { name: 'penny', size: 46, edge: '#6B3310', face: ['#F6C29A', '#C4733C', '#7A3A14'], ink: '#6A300F', label: '1¢', leaf: true },
  3: { name: 'nickel', size: 50, edge: '#6D737D', face: SILVER, ink: '#5D646E', label: '5¢' },
  5: { name: 'dime', size: 42, edge: '#6D737D', face: SILVER, ink: '#5D646E', label: '10¢' },
  10: { name: 'quarter', size: 56, edge: '#6D737D', face: SILVER, ink: '#5D646E', label: '25¢' },
  15: { name: 'loonie', size: 60, edge: '#7A5A08', face: GOLDC, ink: '#6E5206', label: '$1', sides: 11 },
  20: { name: 'toonie', size: 64, edge: '#5E646E', face: SILVER, inner: GOLDC, ink: '#6E5206', label: '$2' },
};
function coinSVG(c) {
  const id = 'cn' + c.name, grad = (gid, col) => `<radialGradient id="${gid}" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="${col[0]}"/><stop offset=".55" stop-color="${col[1]}"/><stop offset="1" stop-color="${col[2]}"/></radialGradient>`;
  const outer = c.sides
    ? `<polygon points="${[...Array(c.sides)].map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / c.sides; return `${(50 + 47 * Math.cos(a)).toFixed(1)},${(50 + 47 * Math.sin(a)).toFixed(1)}`; }).join(' ')}" fill="url(#${id}f)" stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"/>`
    : `<circle cx="50" cy="50" r="47" fill="url(#${id}f)" stroke="${c.edge}" stroke-width="2"/>`;
  const inner = c.inner ? `<circle cx="50" cy="50" r="29" fill="url(#${id}i)" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/>` : '';
  const leaf = c.leaf
    ? `<path d="${LEAF}" transform="translate(29 20) scale(1.75)" fill="${c.ink}" opacity=".75"/>`
    : `<path d="${LEAF}" transform="translate(43.5 17) scale(.55)" fill="${c.ink}" opacity=".7"/>`;
  const label = c.leaf
    ? `<text x="50" y="84" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="15" fill="${c.ink}" opacity=".8">1¢</text>`
    : `<text x="50" y="${c.inner ? 61 : 62}" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="${c.label.length > 2 ? 28 : 32}" fill="#fff" opacity=".55" dx=".8" dy=".8">${c.label}</text><text x="50" y="${c.inner ? 61 : 62}" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="${c.label.length > 2 ? 28 : 32}" fill="${c.ink}">${c.label}</text>`;
  return `<svg viewBox="0 0 100 100"><defs>${grad(id + 'f', c.face)}${c.inner ? grad(id + 'i', c.inner) : ''}</defs>${outer}
    <circle cx="50" cy="50" r="41.5" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.4"/><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.2" stroke-dasharray="1.2 2.6"/>
    ${inner}${leaf}${label}<text x="50" y="${c.leaf ? 94 : 82}" text-anchor="middle" font-family="Martian Mono,monospace" font-size="6.5" letter-spacing="1.5" fill="${c.ink}" opacity=".6">CANADA</text></svg>`;
}
const Coin = (() => {
  const el = $('#coin'), inner = $('#coinIn'); let x = -200, y = -200, lastX = 0, vx = 0, raf = 0, size = 52, touchOn = false;
  function render() {
    raf = 0; vx *= .82; const tilt = Math.max(-22, Math.min(22, vx * .9));
    el.style.transform = `translate(${x - size / 2}px,${y - size / 2}px) rotate(${tilt}deg)`;
    if (Math.abs(vx) > .2) raf = requestAnimationFrame(render);
  }
  function at(px, py, touch) {
    const ox = touch ? -size * .55 : 0, oy = touch ? -size * .65 : 0;
    vx += (px - lastX) * .35; lastX = px; x = px + ox; y = py + oy;
    if (!raf) raf = requestAnimationFrame(render);
  }
  const modalOpen = () => !!document.querySelector('.modal:not([hidden])');
  document.addEventListener('pointermove', e => {
    if ($('#play').hidden) return;
    const touch = e.pointerType === 'touch';
    if (touch && !touchOn) return;
    const over = (scr.on || !!(e.target.closest && e.target.closest('#ticket'))) && !modalOpen();
    el.classList.toggle('on', touch ? touchOn : over);
    at(e.clientX, e.clientY, touch);
  }, { passive: true });
  return {
    set(price) { const c = COINS[price] || COINS[5]; size = c.size; el.style.setProperty('--cs', size + 'px'); el.style.setProperty('--edge', c.edge); inner.innerHTML = coinSVG(c); },
    size: () => size,
    down(e) { el.classList.add('down'); if (e.pointerType === 'touch') { touchOn = true; el.classList.add('on'); } at(e.clientX, e.clientY, e.pointerType === 'touch'); },
    up(e) { el.classList.remove('down'); if (e.pointerType === 'touch') { touchOn = false; el.classList.remove('on'); } },
    hide() { el.classList.remove('on', 'down'); touchOn = false; },
  };
})();
function coinBrush() { return Math.max(22, Coin.size() * .52); }

/* ---- scratching ---- */
const scr = { on: false, id: null, cv: null, last: null };
$('#play').addEventListener('scroll', () => { if (scr.cv) scr.cv._rect = scr.cv.getBoundingClientRect(); }, { passive: true });
const pending = [];
let scratchRaf = 0;
function bindScratch() {
  const host = $('#ticketHost'); if (host._bound) return; host._bound = true;
  host.addEventListener('pointerdown', e => {
    const cv = e.target.closest && e.target.closest('canvas.foil'); if (!cv || cv._done || !cv._ctx || !active || active.done) return;
    e.preventDefault(); Sfx.init();
    scr.on = true; scr.id = e.pointerId; scr.cv = null; scr.last = null;
    try { host.setPointerCapture(e.pointerId); } catch (_) {}
    Coin.down(e);
    queuePoint(e.clientX, e.clientY);
  });
  host.addEventListener('pointermove', e => {
    if (!scr.on || e.pointerId !== scr.id) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) queuePoint(ev.clientX, ev.clientY);
  });
  const end = e => { if (!scr.on || e.pointerId !== scr.id) return; flushScratch(); scr.on = false; if (scr.cv) checkProgress(scr.cv); scr.cv = null; Coin.up(e); };
  host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);
}
function queuePoint(x, y) { pending.push(x, y); if (!scratchRaf) scratchRaf = requestAnimationFrame(flushScratch); }
function flushScratch() {
  if (scratchRaf) { cancelAnimationFrame(scratchRaf); scratchRaf = 0; }
  for (let k = 0; k < pending.length; k += 2) scratchAt(pending[k], pending[k + 1]);
  pending.length = 0;
}
function markGrid(cv, x0, y0, x1, y1) {
  const r = cv._brush / 2, c = cv._cell, len = Math.hypot(x1 - x0, y1 - y0), steps = Math.max(1, Math.ceil(len / (r * .5)));
  for (let s2 = 0; s2 <= steps; s2++) {
    const x = x0 + (x1 - x0) * s2 / steps, y = y0 + (y1 - y0) * s2 / steps;
    const gx0 = Math.max(0, Math.floor((x - r) / c)), gx1 = Math.min(cv._gw - 1, Math.floor((x + r) / c));
    const gy0 = Math.max(0, Math.floor((y - r) / c)), gy1 = Math.min(cv._gh - 1, Math.floor((y + r) / c));
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const k = gy * cv._gw + gx; if (cv._grid[k]) continue;
      const cx = (gx + .5) * c, cy = (gy + .5) * c; if ((cx - x) ** 2 + (cy - y) ** 2 <= r * r) { cv._grid[k] = 1; cv._hit++; }
    }
  }
}
function scratchAt(x, y) {
  const el = document.elementFromPoint(x, y);
  const cv = el && el.matches && el.matches('canvas.foil') && !el._done && el._ctx ? el : null;
  if (!cv) { if (scr.cv) checkProgress(scr.cv); scr.cv = null; scr.last = null; return; }
  if (scr.cv !== cv) { if (scr.cv) checkProgress(scr.cv); scr.cv = cv; scr.last = null; cv._rect = cv.getBoundingClientRect(); }
  const r = cv._rect; const px = (x - r.left) * cv.width / r.width, py = (y - r.top) * cv.height / r.height;
  const ctx = cv._ctx; ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = cv._brush; ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
  ctx.beginPath();
  if (scr.last) { ctx.moveTo(scr.last.x, scr.last.y); ctx.lineTo(px, py); ctx.stroke(); markGrid(cv, scr.last.x, scr.last.y, px, py); }
  else { ctx.arc(px, py, cv._brush / 2, 0, 6.283); ctx.fill(); markGrid(cv, px, py, px, py); }
  ctx.globalCompositeOperation = 'source-over';
  const moved = scr.last ? Math.hypot(px - scr.last.x, py - scr.last.y) : 10;
  scr.last = { x: px, y: py };
  if (moved > 2) { Sfx.scratch(); if (Math.random() < .35) Burst.flake(x, y, pick(byId[active.id].foil)); }
  if (++cv._moves % 6 === 0) checkProgress(cv);
}
function checkProgress(cv) {
  if (cv._done || !cv._grid) return;
  if (cv._hit / cv._grid.length > .55) revealArea(+cv.parentElement.dataset.a);
}
function revealArea(i) {
  if (!active || active.revealed[i]) return;
  active.revealed[i] = true;
  const a = areaEl(i), cv = a && a.querySelector('canvas.foil');
  if (a) a.classList.add('revealed');
  if (cv) { cv._done = true; cv.classList.add('gone'); setTimeout(() => cv.remove(), 520); }
  Sfx.reveal();
  updateLit(false); updatePill(); save();
  if (active.revealed.every(Boolean) && !finishing) { finishing = true; setTimeout(finish, 600); }
}
function revealAll() {
  if (!active) return; Sfx.init();
  active.revealed.map((v, i) => v ? -1 : i).filter(i => i >= 0).forEach((i, k) => setTimeout(() => revealArea(i), reduced ? 0 : k * 85));
}
const groupLit = g => g.cells.every(c => active.revealed[c]) && (g.deps || []).every(c => active.revealed[c]);
function updateLit(silent) {
  if (!active) return; let newly = false;
  for (const g of active.groups) {
    if (!groupLit(g)) continue;
    for (const c of [...g.cells, ...(g.deps || [])]) { const a = areaEl(c); if (a && !a.classList.contains('lit')) { a.classList.add('lit'); newly = true; } }
  }
  if (newly && !silent) Sfx.lit();
}
function litTotal() { return active.groups.filter(groupLit).reduce((a, g) => a + g.v, 0); }
function setRing(frac, txt) { $('#ringPr').style.strokeDashoffset = String(125.66 * (1 - frac)); $('#ringTxt').textContent = txt; }
function updatePill() {
  if (!active || active.done) return;
  const n = active.revealed.filter(Boolean).length, N = active.areas, lt = litTotal();
  $('#pill').className = 'pill glasspill' + (lt ? ' win' : '');
  setRing(n / N, `${n}/${N}`);
  $('#ps').innerHTML = `<div class="t">${lt ? `${chipSvg()}${fmt(lt)} found` : 'Scratch'}</div>`;
  $('#pa').innerHTML = `<button class="btn btn-ghost" id="revealAllBtn">Reveal</button>`;
  $('#revealAllBtn').onclick = revealAll;
}
function finish() {
  const tk = active; if (!tk || tk.done) return;
  const t = byId[tk.id];
  tk.done = true;
  if (tk.room) { save(); showResult(tk, false); Room.finished(tk); return; }
  state.balance += tk.total; state.stats.won += tk.total; state.today.won += tk.total;
  if (tk.total > 0) state.stats.wins++;
  if (tk.total > state.stats.best) { state.stats.best = tk.total; state.stats.bestId = tk.id; }
  const per = state.per[t.id] = state.per[t.id] || { n: 0, best: 0 }; per.best = Math.max(per.best, tk.total);
  state.history.unshift({ id: tk.id, price: tk.price, won: tk.total, t: Date.now() }); state.history = state.history.slice(0, 30);
  state.current = null;
  if (ONLINE && tk.sid) { state.pendingClaim = tk.sid; claimPending(); }
  save();
  showResult(tk, false);
}
function showResult(tk, quiet) {
  if (tk.room) return Room.showResult(tk, quiet);
  const t = byId[tk.id], P = t.price, won = tk.total, big = won >= 10 * P;
  $('#pill').className = 'pill glasspill' + (won ? (big ? ' big' : ' win') : '');
  setRing(1, won ? `${won / P}×` : '—');
  $('#ps').innerHTML = won
    ? `<div class="t">${chipSvg()}+${fmt(won)}</div>`
    : `<div class="t">No win</div>`;
  const can = state.balance >= P;
  $('#pa').innerHTML = `<button class="btn btn-ghost" id="toLobby">Lobby</button><button class="btn btn-light" id="againBtn" ${can ? '' : 'disabled'}>Another ${chipSvg()}${P}</button>`;
  $('#toLobby').onclick = () => { Sfx.click(); closePlay(); };
  $('#againBtn').onclick = () => {
    if (state.balance < P) return;
    const tEl = $('#ticket');
    const go = () => { active = null; buy(t, null); };
    if (tEl && !reduced) { const a = tEl.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-120%) rotate(-8deg)', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }); a.onfinish = go; } else go();
  };
  if (quiet) { animateBalance(state.balance, 0); return; }
  const tr = $('#ticket').getBoundingClientRect(); const cx = tr.left + tr.width / 2, cy = Math.min(innerHeight * .6, tr.top + tr.height / 2);
  if (won) {
    Sfx.win(big);
    $('#ticket').classList.add('celebrate');
    Burst.chips(cx, cy, Math.min(80, 14 + Math.round(won / P) * 3), big ? 1.2 : .9);
    Burst.confetti(cx, cy, big ? 150 : 60, [t.acc, t.c[1], t.c[2], '#FFFFFF', '#F2C14E']);
    if (big) {
      const b = document.createElement('div'); b.className = 'bigwin';
      b.innerHTML = `<div><div class="l1">${won >= 50 * P ? 'Jackpot' : 'Big win'}</div><div class="l2">+${fmt(won)} CHIPS</div></div>`;
      document.body.appendChild(b); setTimeout(() => b.remove(), 2900);
      setTimeout(() => Burst.chips(innerWidth * .15, innerHeight, 30, .6), 400); setTimeout(() => Burst.chips(innerWidth * .85, innerHeight, 30, .6), 650);
    }
    flyChips(cx, cy, Math.min(14, 4 + Math.round(won / P)), () => { animateBalance(state.balance, 900); pulseBal('bump'); });
  } else { Sfx.lose(); animateBalance(state.balance, 300); }
}
let rsz; addEventListener('resize', () => { clearTimeout(rsz); rsz = setTimeout(() => { if (!active) return; document.querySelectorAll('#ticketHost canvas.foil').forEach(cv => { if (!cv._done) paintFoil(cv, byId[active.id]); }); }, 250); });

/* ================= Daily draw (slot machine) ================= */
let chestTimer = null;
function openChest() { Sfx.init(); Sfx.click(); $('#chestModal').hidden = false; renderChest(); }
function renderChest() {
  const ready = state.chestDay !== dayKey(), body = $('#chestBody');
  clearInterval(chestTimer);
  if (!ready) {
    $('#chestSub').textContent = 'You’ve had today’s draw. The next one is in';
    body.innerHTML = `<div class="countdown" id="cd">${hms(msToMidnight())}</div><div class="actions"><button class="btn btn-ghost" data-close>Close</button></div>`;
    chestTimer = setInterval(() => { const c = $('#cd'); if (c) c.textContent = hms(msToMidnight()); if (state.chestDay !== dayKey()) renderChest(); }, 1000);
    return;
  }
  renderSlot();
}
function renderSlot() {
  $('#chestSub').textContent = 'One free pull a day. Win 3 to 100 chips.';
  const strip = [...Array(7)].map(() => [...Array(10).keys()].map(d => `<div>${d}</div>`).join('')).join('');
  $('#chestBody').innerHTML = `
    <div class="slot">
      <div class="marquee"><span class="bulbs t"></span>DAILY DRAW<span class="bulbs b"></span></div>
      <div class="slot-row">
        <div class="reels">${[0, 1, 2].map(() => `<div class="reel"><div class="strip">${strip}</div></div>`).join('')}<div class="payline"></div></div>
        <button class="lever" id="lever" aria-label="Pull the lever"><span class="base"></span><span class="rod"><span class="knob"></span></span></button>
      </div>
      <div class="slot-out" id="slotOut"></div>
    </div>
    <div class="actions"><button class="btn btn-gold" id="pullBtn">Pull</button></div>`;
  $('#chestBody').querySelector('.slot').animate([{ opacity: 0, transform: 'translateY(20px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
  $('#pullBtn').onclick = spin; $('#lever').onclick = spin;
}
function spin() {
  if (spin.busy) return;
  if (state.chestDay === dayKey()) return;
  spin.busy = true;
  if (ONLINE) {
    $('#pullBtn').disabled = true; $('#pullBtn').textContent = 'Spinning…';
    rpc('open_chest', { p_day: dayKey() }).then(res => { applyProfile(res.me, null); runSpin(res.amount); })
      .catch(e => { spin.busy = false; toast(errText(e)); $('#chestModal').hidden = true; refreshMe(300); });
    return;
  }
  const amount = 3 + Math.floor(97 * Math.pow(Math.random(), 2.1));
  state.chestDay = dayKey(); state.balance += amount; state.stats.chests++; state.stats.chestTotal += amount; state.today.won += amount; save();
  runSpin(amount);
}
function runSpin(amount) {
  $('#pullBtn').disabled = true; $('#pullBtn').textContent = 'Spinning…';
  const lever = $('#lever'); lever.classList.add('pulled'); setTimeout(() => lever.classList.remove('pulled'), 420);
  const digits = String(amount).padStart(3, '0').split('').map(Number);
  const strips = [...document.querySelectorAll('.strip')];
  const cell = strips[0].firstElementChild.offsetHeight;
  let ticking = true; (function tk() { if (!ticking) return; Sfx.tick(); setTimeout(tk, 70); })();
  strips.forEach((s, i) => {
    const target = 60 + digits[i], dur = reduced ? 10 : 1600 + i * 600;
    s.style.transition = 'none'; s.style.transform = 'translateY(0)'; void s.offsetHeight;
    s.classList.add('blur');
    s.style.transition = `transform ${dur}ms cubic-bezier(.12,.62,.16,1)`; s.style.transform = `translateY(${-target * cell}px)`;
    setTimeout(() => s.classList.remove('blur'), dur * .7);
    setTimeout(() => { Sfx.stop(); if (i === 2) { ticking = false; done(); } }, dur);
  });
  function done() {
    const out = $('#slotOut'); out.classList.add('won'); out.innerHTML = `${chipSvg('gold')}+${amount}`;
    Sfx.win(amount >= 50);
    const r = out.getBoundingClientRect();
    Burst.chips(r.left + r.width / 2, r.top, Math.min(50, 8 + Math.round(amount / 3)), .9);
    $('#pullBtn').disabled = false; $('#pullBtn').textContent = 'Collect';
    $('#pullBtn').onclick = () => {
      $('#chestModal').hidden = true; clearInterval(chestTimer); spin.busy = false;
      flyChips(r.left + r.width / 2, r.top, 10, () => { animateBalance(state.balance, 900); pulseBal('bump'); refreshLobby(); });
    };
    updateChestBtn();
  }
}
$('#chestBtn').addEventListener('click', openChest);

/* ================= Stats ================= */
function renderStats() {
  const s = state.stats, net = s.won - s.spent, rate = s.played ? Math.round(s.wins / s.played * 100) : 0;
  const ago = t => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `${h} h ago`; return `${Math.round(h / 24)} d ago`; };
  const fav = Object.entries(state.per).sort((a, b) => b[1].n - a[1].n)[0];
  $('#statsBody').innerHTML = `
    <div class="tiles">
      <div class="tile"><div class="k">Chips</div><div class="v">${fmt(state.balance)}</div></div>
      <div class="tile"><div class="k">Played</div><div class="v">${fmt(s.played)}</div></div>
      <div class="tile"><div class="k">Net</div><div class="v ${net > 0 ? 'pos' : net < 0 ? 'neg' : ''}">${net > 0 ? '+' : net < 0 ? '−' : ''}${fmt(Math.abs(net))}</div></div>
      <div class="tile"><div class="k">Best</div><div class="v">${fmt(s.best)}</div></div>
    </div>
    <div class="hist"><h4>Recent</h4>
      ${state.history.length ? state.history.slice(0, 15).map(h => { const t = byId[h.id]; return `<div class="hrow" style="${themeVars(t)}"><span class="sw"><span>${t.emblemText ? '7' : t.emblem}</span></span><div>${t.name}</div><span class="w ${h.won ? 'pos' : 'zero'}">${h.won ? '+' + fmt(h.won) : '0'}</span></div>`; }).join('') : '<div class="empty">Nothing yet.</div>'}
    </div>
    <div class="actions"><button class="btn btn-ghost" data-close>Close</button></div>
`;
}
$('#statsBtn').addEventListener('click', () => {
  Sfx.init(); Sfx.click(); renderStats(false); $('#statsModal').hidden = false;
  if (ONLINE && uid) sb.from('tickets').select('theme,total,created_at').eq('claimed', true).order('id', { ascending: false }).limit(15).then(({ data }) => {
    if (!data || $('#statsModal').hidden) return;
    state.history = data.filter(h => byId[h.theme]).map(h => ({ id: h.theme, won: h.total, t: Date.parse(h.created_at) }));
    renderStats(false);
  });
});

/* ================= Wiring ================= */
const HELP = {
  headsup: ['Scratch all 7 pennies and the prize.', 'Heads is the portrait side. Tails shows the maple leaves.', 'If 5 or more pennies land heads up, you win the prize.'],
  plinko: ['Scratch the 4 arrows.', 'The ball starts in the middle. Each arrow moves it one bin left or right.', 'Win the prize in the bin where it lands. A dash means no prize.'],
  run3: ['Scratch each row.', 'If the three numbers make a run, like 4, 5, 6 in any order, you win that row’s prize.'],
  penalty: ['Scratch each kick.', 'If your shot goes a different way than the keeper dives, it’s a goal.', 'Each goal wins that row’s prize.'],
  spell: ['Scratch the 10 letter tiles and the prize.', 'If you find every letter in HONEY, you win the prize.'],
  overtake: ['Scratch your starting place, the 4 laps and the prize.', '▲ means you pass that many cars. ▼ means you drop back.', 'Finish in the top 3 to win the prize.'],
  hilo: ['Each row shows a card, a guess and the next card.', 'If the guess is right, you win that row’s prize.', 'A tie doesn’t win.'],
  mirror: ['Scratch each row.', 'If the 5 digits read the same forwards and backwards, you win that row’s prize.'],
  alleven: ['Scratch each row.', 'If all three numbers are even, you win that row’s prize.'],
  turkey: ['Scratch the 10 frames and the prize.', 'Three strikes (X) in a row win the prize.'],
  match3: ['Scratch all 9 panels.', 'Find the same amount 3 times.', 'Win that amount.'],
  lucky: ['Scratch the lucky number.', 'Scratch your 10 numbers.', 'Any number that matches the lucky number wins the prize under it.'],
  slots: ['Scratch each row.', 'Three matching fruits in a row win that row’s prize.', 'Every row plays on its own.'],
  beat: ['Scratch each row.', 'If your score is higher than the high score, you win that row’s prize.'],
  find: ['Scratch all 9 spots.', 'Every 💰 you find wins the prize under it.'],
  multiply: ['Each game has a lucky number, your numbers, a prize and a multiplier.', 'If the lucky number matches one of your numbers, you win the prize × the multiplier.', 'Every game plays on its own.'],
  dive: ['Scratch the target depth and your 5 dives.', 'Add up your dives.', 'If your total is deeper than the target, you win the prize.'],
  rps: ['Scratch each row.', 'Rock beats scissors, scissors beat paper, paper beats rock.', 'Beat the dragon to win that row. A tie doesn’t win.'],
  tictac: ['Scratch the 9 squares and the prize.', 'Three ❄️ in a line across, down or diagonally wins the prize.'],
  collect: ['Scratch all 12 spots and the prize.', 'Find 3 🍌 anywhere to win the prize.'],
  curse: ['Scratch the 7 stones in any order.', 'Starting at stone 1, you win every prize until you reach a 💀.', 'A 💀 on stone 1 means no win.'],
  blackjack: ['Scratch each row.', 'Your two cards are added up. Aces count 11, face cards count 10.', 'Beat the dealer’s total to win that row.'],
  make10: ['Scratch each row.', 'If the two numbers add up to exactly 10, you win that row’s prize.'],
  poker: ['Scratch all 5 cards.', 'A pair or better wins.', 'The better your hand, the bigger the prize. The table is on the ticket.'],
  ladder: ['Scratch the climb number and the rungs.', 'Climb that many rungs up from the bottom.', 'Win the prize on that rung. A climb of 0 means no win.'],
  gempair: ['Scratch the 12 gems and the prize.', 'Two gems of the same colour touching across or down win the prize.'],
  joust: ['Each row is a joust of 3 rounds.', 'Your score is on the left. The higher score wins the round.', 'Win 2 of the 3 rounds to win that row’s prize.'],
  charge: ['Each storm has a prize and 3 charge spots.', 'One ⚡ wins the prize. Two ⚡ double it. Three ⚡ make it 4×.', 'No ⚡ means no win for that storm.'],
  dice7: ['Scratch each row.', 'If the two dice add up to 7, you win that row’s prize.'],
  bingo: ['Scratch the called numbers, your card and the prize.', 'If every number in a row, column or diagonal of your card was called, you win the prize.'],
};
let helpFor = null;
function showHelp(t) {
  helpFor = t.id; state.hideHelp = state.hideHelp || {};
  const m = $('#helpModal'); m.style.cssText = themeVars(t);
  $('#helpEmb').innerHTML = emblemHTML(t);
  $('#helpTicket').textContent = t.name;
  $('#helpTitle').textContent = MECHS[t.mech].label;
  $('#helpSteps').innerHTML = HELP[t.mech].map((x, i) => `<li style="--i:${i}">${x}</li>`).join('');
  $('#helpDont').setAttribute('aria-checked', String(!!state.hideHelp[t.id]));
  m.hidden = false;
}
function hideHelp() { $('#helpModal').hidden = true; }
$('#helpGo').onclick = () => { Sfx.click(); hideHelp(); };
$('#helpDont').onclick = () => {
  Sfx.init(); Sfx.click(); state.hideHelp = state.hideHelp || {};
  const on = !state.hideHelp[helpFor];
  if (on) state.hideHelp[helpFor] = true; else delete state.hideHelp[helpFor];
  $('#helpDont').setAttribute('aria-checked', String(on)); save();
};
$('#helpLobby').onclick = () => { Sfx.init(); Sfx.click(); showHelp(byId[sel]); };
$('#helpPlay').onclick = () => { Sfx.init(); Sfx.click(); if (active) showHelp(byId[active.id]); };
function closeModal(m) { if (m.id === 'chestModal' && spin.busy) return; m.hidden = true; clearInterval(chestTimer); animateBalance(state.balance); refreshLobby(); }
document.addEventListener('click', e => {
  const c = e.target.closest('[data-close]');
  if (c) { const m = c.closest('.modal'); if (m) { if (m.id === 'chestModal') spin.busy = false; closeModal(m); } }
  else if (e.target.classList && e.target.classList.contains('modal')) closeModal(e.target);
});
document.addEventListener('keydown', e => {
  const open = [...document.querySelectorAll('.modal')].find(m => !m.hidden);
  if (e.target.closest && e.target.closest('input')) return;
  if (e.key === 'Escape') { if (open) closeModal(open); else if (!$('#play').hidden) closePlay(); return; }
  if (open || !$('#play').hidden || !$('#gate').hidden || !$('#auth').hidden) return;
  if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
});
function updateSoundIcon() { $('#soundWaves').style.display = state.sound ? '' : 'none'; $('#soundOff').hidden = state.sound; $('#soundBtn').setAttribute('aria-pressed', String(state.sound)); }
$('#musicBtn').addEventListener('click', () => { Sfx.init(); Sfx.click(); Music.toggle(); });
Music.paint();
$('#soundBtn').addEventListener('click', () => { state.sound = !state.sound; save(); updateSoundIcon(); Sfx.init(); Sfx.click(); toast(state.sound ? 'Sound on' : 'Sound off'); });

setInterval(() => {
  if (state.day !== dayKey()) {
    if (ONLINE) { if (uid) refreshMe(600); }
    else { applyDaily(); shownBal = state.balance; setBalText(state.balance); if (!active) refreshLobby(); }
  }
  updateChestBtn();
}, 1000);

/* ================= Online helpers ================= */
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const themeName = id => (byId[id] ? byId[id].name : 'a ticket');
const ago = t => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `${h} h ago`; return `${Math.round(h / 24)} d ago`; };
const typing = () => { const a = document.activeElement; return !!(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')); };
const dots = '<div class="loading"><span></span><span></span><span></span></div>';
function toastAct(msg, label, fn, ms = 8000) {
  const el = document.createElement('div'); el.className = 'toast glasspill act';
  const txt = document.createElement('span'); txt.textContent = msg; el.appendChild(txt);
  const b = document.createElement('button'); b.textContent = label; el.appendChild(b);
  const gone = () => { if (el.classList.contains('out')) return; el.classList.add('out'); setTimeout(() => el.remove(), 360); };
  b.onclick = () => { Sfx.init(); Sfx.click(); gone(); fn(); };
  $('#toasts').appendChild(el); setTimeout(gone, ms);
}

/* ================= Accounts ================= */
const Auth = (() => {
  let mode = 'in';
  const box = () => $('#auth');
  function msg(t, ok) { const e = $('#aErr'); e.textContent = t || ''; e.classList.toggle('ok', !!ok); }
  function setMode(m) {
    mode = m;
    const up = m === 'up', forgot = m === 'forgot', reset = m === 'reset';
    $('#authTitle').textContent = up ? 'Create account' : forgot ? 'Reset password' : reset ? 'New password' : 'Sign in';
    $('#authTabs').hidden = forgot || reset;
    $('#authTabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
    $('#fUser').hidden = !up; $('#fAge').hidden = !up;
    $('#fEmail').hidden = reset; $('#fPass').hidden = forgot;
    $('#aPass').setAttribute('autocomplete', up || reset ? 'new-password' : 'current-password');
    $('#aGo').textContent = up ? 'Create account' : forgot ? 'Send reset link' : reset ? 'Save password' : 'Sign in';
    $('#aForgot').hidden = m !== 'in'; $('#aBack').hidden = !forgot;
    msg('');
  }
  function show(m = 'in') { setMode(m); box().hidden = false; }
  function hide() {
    const g = box(); if (g.hidden || mode === 'reset') return;
    if (reduced) { g.hidden = true; return; }
    g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: 'ease' }).onfinish = () => { g.hidden = true; };
  }
  function authErr(e) {
    const m = (e && e.message) || '';
    if (/invalid login/i.test(m)) return 'Wrong email or password.';
    if (/not confirmed/i.test(m)) return 'Confirm your email first. The link is in your inbox.';
    if (/already registered|already been registered/i.test(m)) return 'That email already has an account. Sign in instead.';
    if (/rate limit|too many|security purposes/i.test(m)) return 'Too many tries. Wait a minute and try again.';
    if (/database error saving new user/i.test(m)) return 'That username was just taken. Try another.';
    if (/error sending|smtp|sending (recovery|confirmation|magic)/i.test(m)) return 'The email couldn’t be sent. The site’s email settings need fixing in Supabase (see the README).';
    if (/redirect/i.test(m)) return 'This site’s address isn’t allowed in Supabase yet. Add it under Authentication → URL Configuration.';
    if (/password/i.test(m) && /least|short|weak/i.test(m)) return 'Pick a longer password.';
    return errText(e);
  }
  async function submit(e) {
    e.preventDefault(); Sfx.init();
    const go = $('#aGo'); if (go.disabled) return;
    const email = $('#aEmail').value.trim(), pass = $('#aPass').value, name = $('#aUser').value.trim();
    if (mode !== 'reset' && !/^\S+@\S+\.\S+$/.test(email)) return msg('Enter your email address.');
    if (mode !== 'forgot' && pass.length < 6) return msg('Your password needs at least 6 characters.');
    if (mode === 'up') {
      if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) return msg('Usernames are 3–16 letters, numbers or _.');
      if (!$('#aAge').checked) return msg('You must be 18 or older to play.');
    }
    go.disabled = true; msg('');
    try {
      if (mode === 'up') {
        const { data: free, error: e1 } = await sb.rpc('username_available', { p_name: name });
        if (e1) throw e1;
        if (!free) { msg('That username is taken.'); return; }
        const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { username: name }, emailRedirectTo: location.origin } });
        if (error) throw error;
        if (!data.session) { setMode('in'); $('#aEmail').value = email; msg('Almost there. Open the confirmation link we emailed you, then sign in.', true); }
      } else if (mode === 'in') {
        const { error } = await sb.auth.signInWithPassword({ email, password: pass }); if (error) throw error;
      } else if (mode === 'forgot') {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/' }); if (error) throw error;
        msg('If that email has an account, a reset link is on its way. Check your spam folder too, and open the newest link.', true);
      } else if (mode === 'reset') {
        const { error } = await sb.auth.updateUser({ password: pass }); if (error) throw error;
        mode = 'in'; hide(); toast('Password updated');
      }
    } catch (x) { msg(authErr(x)); }
    finally { go.disabled = false; }
  }
  async function signedIn(user) {
    uid = user.id;
    if (state.uid !== uid) Object.assign(state, { uid, current: null, roomRun: null, history: [], per: {}, pendingClaim: null });
    state.adult = true;
    let p;
    try { p = await rpc('me', { p_day: dayKey() }); }
    catch (e) { uid = null; show('in'); msg(/function|schema|relation/i.test(e.message || '') ? 'The game’s database isn’t set up yet. Run supabase.sql in Supabase (see the README).' : errText(e)); return; }
    applyProfile(p, 0);
    const ot = p.open_ticket;
    if (ot && state.pendingClaim === ot.id) { state.current = null; claimPending(); }
    else if (ot) { if (!state.current || state.current.sid !== ot.id) { const th = byId[ot.theme]; if (th) state.current = Object.assign(generate(th, ot.total), { sid: ot.id }); } }
    else if (state.current && !state.current.done) state.current = null;
    save(); hide();
    if (!active) renderAll();
    Social.connect(); Room.resume();
    setTimeout(() => toast(`Welcome${p.played ? ' back' : ''}, ${p.username}`), 400);
  }
  function signedOut() {
    uid = null; me = null;
    Social.disconnect(); Room.clear(true);
    if (!$('#play').hidden) closePlay();
    document.querySelectorAll('.modal').forEach(m => { m.hidden = true; });
    show('in');
  }
  // Coming back from an email link that expired or was already used.
  function linkError() {
    const h = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
    const code = h.get('error_code') || h.get('error');
    if (!code) return false;
    history.replaceState(null, '', location.pathname);
    show('forgot');
    msg(/expired|invalid|denied/i.test(code + ' ' + (h.get('error_description') || ''))
      ? 'That link has expired or was already used. Enter your email to get a new one.'
      : (h.get('error_description') || 'That link didn’t work. Try again.').replace(/\+/g, ' '));
    return true;
  }
  function start() {
    $('#authForm').addEventListener('submit', submit);
    const hadError = linkError();
    $('#authTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { Sfx.init(); Sfx.click(); setMode(b.dataset.m); } });
    $('#aForgot').onclick = () => setMode('forgot');
    $('#aBack').onclick = () => setMode('in');
    sb.auth.onAuthStateChange((ev, session) => {
      // Supabase asks us not to call it from inside this callback, so step out first.
      setTimeout(() => {
        if (ev === 'PASSWORD_RECOVERY') { show('reset'); return; }
        const u = session && session.user;
        if (u) { if (u.id !== uid) signedIn(u); }
        else if (uid) signedOut();
        else if (box().hidden && !hadError) show('in');
      }, 0);
    });
  }
  return { start, show, signOut: () => sb.auth.signOut() };
})();

/* ================= Friends, leaderboard, activity ================= */
const Social = (() => {
  let tab = 'rooms', lbKind = 'chips', data = null, online = new Set(), chEvents = null, chPresence = null, giftFor = null, giftAsk = null;
  const body = () => $('#socialBody');
  const isOpen = () => !$('#socialModal').hidden;
  const isOnline = id => online.has(id);
  const errBox = e => `<div class="empty">${esc(errText(e))}</div>`;
  const av = (name, id) => `<span class="av">${esc((name || '?')[0].toUpperCase())}${id ? `<i class="odot${online.has(id) ? ' yes' : ''}"></i>` : ''}</span>`;
  function badge() {
    const n = (me && me.requests) || 0, b = $('#socialBadge');
    b.hidden = !n; b.textContent = n > 9 ? '9+' : String(n);
    $('#reqDot').hidden = !n;
  }
  function open(t) {
    Sfx.init(); Sfx.click();
    const m = $('#socialModal');
    if (!ONLINE) {
      $('#socialTabs').hidden = true; $('#socialWho').textContent = 'Play with friends';
      body().innerHTML = `<div class="empty-card"><b>Online play isn’t switched on yet.</b><p>The owner of this site needs to connect it to Supabase in <code>config.js</code>. The README walks through it. You can keep playing solo in the meantime.</p></div><div class="actions"><button class="btn btn-ghost" data-close>Close</button></div>`;
      m.hidden = false; return;
    }
    if (!uid) { Auth.show('in'); return; }
    if (t) tab = t;
    $('#socialTabs').hidden = false;
    $('#socialWho').innerHTML = `Signed in as <b>${esc(me ? me.username : '')}</b> · <button class="linkbtn" id="signOutBtn">Sign out</button>`;
    $('#signOutBtn').onclick = () => { Sfx.click(); Auth.signOut(); };
    m.hidden = false; render();
  }
  function render() {
    $('#socialTabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    if (tab === 'rooms') Room.render(body());
    else if (tab === 'friends') renderFriends();
    else if (tab === 'leaders') renderLeaders();
    else renderActivity();
  }
  async function loadFriends() { data = await rpc('social_state'); if (me) { me.requests = data.incoming.length; badge(); } return data; }
  async function renderFriends(cached) {
    if (!cached || !data) { if (!data) body().innerHTML = dots; try { await loadFriends(); } catch (e) { body().innerHTML = errBox(e); return; } }
    if (!isOpen() || tab !== 'friends') return;
    const d = data;
    const fr = [...d.friends].sort((a, b) => (online.has(b.id) - online.has(a.id)) || a.username.localeCompare(b.username));
    const keep = $('#addName') ? $('#addName').value : '';
    body().innerHTML = `
      <form class="addrow" id="addFriend"><input id="addName" placeholder="Add a friend by username" maxlength="16" autocomplete="off" spellcheck="false"><button class="btn btn-light" type="submit">Add</button></form>
      ${d.incoming.length ? `<h4 class="sh">Requests</h4>${d.incoming.map(u => `<div class="lrow">${av(u.username)}<div class="nm">${esc(u.username)}<small>Wants to be friends</small></div><div class="ra"><button class="btn btn-gold sm" data-acc="${u.id}">Accept</button><button class="btn btn-ghost sm" data-dec="${u.id}">Decline</button></div></div>`).join('')}` : ''}
      <h4 class="sh">Friends <span>${fr.length}</span></h4>
      ${fr.length ? fr.map(f => `<div class="lrow${giftFor === f.id ? ' open' : ''}">${av(f.username, f.id)}<div class="nm">${esc(f.username)}<small>${online.has(f.id) ? 'Online' : 'Offline'} · ${fmt(f.balance)} chips</small></div><div class="ra"><button class="btn btn-ghost sm" data-gift="${f.id}">${giftFor === f.id ? 'Cancel' : 'Send chips'}</button><button class="rm" data-rm="${f.id}" aria-label="Remove ${esc(f.username)}">Remove</button></div>
        ${giftFor === f.id && giftAsk ? `<div class="giftrow confirm"><span class="gq">Send <b>${fmt(giftAsk)} chip${giftAsk === 1 ? '' : 's'}</b> to <b>${esc(f.username)}</b>? You can’t undo this.</span><span class="gbtns"><button class="btn btn-ghost sm" data-gcancel="1">Cancel</button><button class="btn btn-gold sm" data-gconfirm="1">Yes, send ${fmt(giftAsk)}</button></span></div>`
        : giftFor === f.id ? `<div class="giftrow">${[5, 10, 25, 50].map(v => `<button class="gchip" data-send="${v}" ${state.balance < v ? 'disabled' : ''}>${chipSvg()}${v}</button>`).join('')}<input id="giftAmt" type="number" min="1" max="1000" inputmode="numeric" placeholder="Other"><button class="btn btn-light sm" data-send="custom">Send</button></div>` : ''}</div>`).join('')
        : `<div class="empty">No friends yet. Add someone by their username.</div>`}
      ${d.outgoing.length ? `<h4 class="sh">Waiting for a reply</h4>${d.outgoing.map(u => `<div class="lrow dim">${av(u.username)}<div class="nm">${esc(u.username)}<small>Request sent</small></div><div class="ra"><button class="btn btn-ghost sm" data-unreq="${u.id}">Cancel</button></div></div>`).join('')}` : ''}`;
    $('#addName').value = keep;
    $('#addFriend').onsubmit = async e => {
      e.preventDefault(); const n = $('#addName').value.trim(); if (!n) return;
      const btn = e.target.querySelector('button'); btn.disabled = true;
      try { const r = await rpc('request_friend', { p_username: n }); $('#addName').value = ''; Sfx.lit(); toast(r.status === 'friends' ? `You and ${n} are now friends` : `Friend request sent to ${n}`); renderFriends(); }
      catch (x) { toast(errText(x)); btn.disabled = false; }
    };
  }
  async function renderLeaders() {
    const kinds = [['chips', 'Chips'], ['best', 'Biggest win'], ['won', 'Total won']];
    body().innerHTML = `<div class="seg small">${kinds.map(([k, l]) => `<button data-lb="${k}" aria-pressed="${k === lbKind}">${l}</button>`).join('')}</div><div id="lbList">${dots}</div>`;
    const kind = lbKind; let r;
    try { r = await rpc('leaderboard', { p_kind: kind }); } catch (e) { const l = $('#lbList'); if (l) l.innerHTML = errBox(e); return; }
    const list = $('#lbList'); if (!list || !isOpen() || tab !== 'leaders' || kind !== lbKind) return;
    const row = (rk, name, id, v, mine) => `<div class="lrow lb${mine ? ' mine' : ''}${rk <= 3 ? ' top' + rk : ''}"><span class="rk">${rk}</span><div class="nm">${esc(name)}${id && online.has(id) ? '<i class="odot yes"></i>' : ''}${mine ? '<small>You</small>' : ''}</div><span class="val">${chipSvg()}${fmt(v)}</span></div>`;
    list.innerHTML = (r.top.length ? r.top.map(x => row(x.rank, x.username, x.id, x.value, x.id === uid)).join('') : '<div class="empty">No players yet.</div>')
      + (r.my_rank > 50 ? `<div class="lbsep">⋯</div>${row(r.my_rank, me.username, uid, r.my_value, true)}` : '');
  }
  async function renderActivity() {
    body().innerHTML = dots; let f;
    try { f = await rpc('feed'); } catch (e) { body().innerHTML = errBox(e); return; }
    if (!isOpen() || tab !== 'activity') return;
    const who = (ev, n) => ev.mine ? 'You' : `<b>${esc(n)}</b>`;
    body().innerHTML = f.length ? f.map(ev => {
      const d = ev.data || {}; let icon = '🎉', txt = '';
      if (ev.kind === 'big_win') txt = `${who(ev, d.username)} won <b>${fmt(d.amount)}</b> on ${esc(themeName(d.theme))}`;
      else if (ev.kind === 'room_win') { icon = '🏆'; txt = `${who(ev, d.username)} ${d.mode === 'tourney' ? 'won a tournament and ' : ''}took a <b>${fmt(d.amount)}</b>-chip pot in a ${d.players}-player room`; }
      else if (ev.kind === 'gift') { icon = '🎁'; txt = ev.mine ? `You sent <b>${fmt(d.amount)}</b> chips to ${esc(d.to || 'a friend')}` : `${who(ev, d.username)} sent you <b>${fmt(d.amount)}</b> chips`; }
      return `<div class="lrow feed"><span class="av em">${icon}</span><div class="nm">${txt}<small>${ago(Date.parse(ev.created_at))}</small></div></div>`;
    }).join('') : '<div class="empty">Nothing here yet. Big wins from you and your friends, room wins and gifts all show up here.</div>';
  }
  function onEvent(e) {
    if (!e || !uid) return; const d = e.data || {};
    if (e.target === uid) {
      if (e.kind === 'gift') { Sfx.win(false); toast(`🎁 ${d.username} sent you ${fmt(d.amount)} chips`); pulseBal('bump'); refreshMe(900); }
      else if (e.kind === 'friend_request') { if (me) me.requests = (me.requests || 0) + 1; badge(); toastAct(`${d.username} wants to be friends`, 'View', () => open('friends')); if (isOpen() && tab === 'friends' && !typing()) renderFriends(); }
      else if (e.kind === 'friend_accept') { toast(`${d.username} is now your friend`); data = null; if (isOpen() && tab === 'friends' && !typing()) renderFriends(); }
      else if (e.kind === 'room_invite') toastAct(`${d.username} invited you to room ${d.code}`, 'Join', () => Room.join(d.code), 20000);
    } else if (!e.target && e.user_id !== uid) {
      if (Room.has(e.user_id)) return; // you'll see it in your own room
      if (e.kind === 'big_win') toast(`🎉 ${d.username} just won ${fmt(d.amount)} on ${themeName(d.theme)}`);
      else if (e.kind === 'room_win') toast(`🏆 ${d.username} took a ${fmt(d.amount)}-chip pot`);
    }
  }
  function connect() {
    disconnect();
    chEvents = sb.channel('events-' + uid)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, pl => onEvent(pl.new))
      .subscribe();
    chPresence = sb.channel('online', { config: { presence: { key: uid } } });
    chPresence.on('presence', { event: 'sync' }, () => {
      online = new Set(Object.keys(chPresence.presenceState()));
      if (isOpen() && !typing()) { if (tab === 'friends' && data) renderFriends(true); }
    }).subscribe(st => { if (st === 'SUBSCRIBED') chPresence.track({ username: me && me.username, at: Date.now() }); });
  }
  function disconnect() {
    if (chEvents) sb.removeChannel(chEvents); if (chPresence) sb.removeChannel(chPresence);
    chEvents = chPresence = null; online = new Set(); data = null; giftFor = null; giftAsk = null;
  }
  async function onClick(e) {
    const b = e.target.closest('button'); if (!b || b.disabled || !isOpen()) return;
    const d = b.dataset;
    try {
      if (d.tab) { Sfx.click(); tab = d.tab; giftFor = null; giftAsk = null; render(); }
      else if (d.acc || d.dec) {
        Sfx.click(); b.disabled = true;
        data = await rpc('respond_friend', { p_from: d.acc || d.dec, p_accept: !!d.acc });
        if (me) { me.requests = data.incoming.length; badge(); }
        if (d.acc) toast('Friend added');
        renderFriends(true);
      }
      else if (d.rm || d.unreq) {
        if (d.rm && !b.classList.contains('sure')) { b.classList.add('sure'); b.textContent = 'Sure?'; setTimeout(() => { b.classList.remove('sure'); b.textContent = 'Remove'; }, 2500); return; }
        Sfx.click(); b.disabled = true; data = await rpc('remove_friend', { p_id: d.rm || d.unreq }); renderFriends(true);
      }
      else if (d.gift) { Sfx.click(); giftFor = giftFor === d.gift ? null : d.gift; giftAsk = null; renderFriends(true); if (giftFor) { const i = $('#giftAmt'); if (i && !matchMedia('(pointer:coarse)').matches) i.focus(); } }
      else if (d.send) {
        const amt = d.send === 'custom' ? parseInt(($('#giftAmt') || {}).value, 10) : +d.send;
        if (!(amt >= 1 && amt <= 1000)) { toast('Pick an amount from 1 to 1,000'); return; }
        if (amt > state.balance) { toast('Not enough chips'); return; }
        Sfx.click(); giftAsk = amt; renderFriends(true);
      }
      else if (d.gcancel) { Sfx.click(); giftAsk = null; renderFriends(true); }
      else if (d.gconfirm) {
        const amt = giftAsk; if (!amt || !giftFor) return;
        if (amt > state.balance) { toast('Not enough chips'); giftAsk = null; renderFriends(true); return; }
        b.disabled = true;
        const f = data && data.friends.find(x => x.id === giftFor);
        const p = await rpc('send_chips', { p_to: giftFor, p_amount: amt });
        applyProfile(p, 600); pulseBal('drop'); Sfx.buy();
        toast(`Sent ${fmt(amt)} chips to ${f ? f.username : 'your friend'}`);
        giftFor = null; giftAsk = null; await loadFriends(); renderFriends(true);
      }
      else if (d.lb) { Sfx.click(); lbKind = d.lb; renderLeaders(); }
      else await Room.onClick(b);
    } catch (x) { toast(errText(x)); b.disabled = false; }
  }
  function init() {
    $('#socialBtn').addEventListener('click', () => open());
    $('#socialModal').addEventListener('click', onClick);
  }
  init();
  return { open, badge, connect, disconnect, isOnline, rerender: () => { if (isOpen() && tab === 'rooms' && !typing()) render(); }, tab: () => tab, isOpen };
})();

/* ================= Blocking (personal: hides chat, mutes voice) ================= */
const isBlocked = id => !!(state.blocked && state.blocked.includes(id));
function setBlocked(id, on) {
  state.blocked = (state.blocked || []).filter(x => x !== id);
  if (on) state.blocked.push(id);
  save(); Voice.applyBlocks();
}

/* ================= Voice chat (peer to peer, signalled through the room channel) ================= */
const Voice = (() => {
  const ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }] };
  let on = false, muted = false, micOk = false, stream = null, chan = null, actx = null, meter = null;
  const peers = new Map(), levels = {};
  const send = msg => { if (chan) chan.send({ type: 'broadcast', event: 'rtc', payload: Object.assign({ from: uid }, msg) }); };
  function analyse(id, st) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const src = actx.createMediaStreamSource(st), an = actx.createAnalyser(); an.fftSize = 512; src.connect(an);
      levels[id] = { an, buf: new Uint8Array(an.fftSize) };
    } catch (e) {}
  }
  function startMeter() {
    clearInterval(meter);
    meter = setInterval(() => {
      const speaking = new Set();
      for (const id in levels) {
        const { an, buf } = levels[id]; an.getByteTimeDomainData(buf);
        let sum = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        if (Math.sqrt(sum / buf.length) > 0.04 && !(id === uid && muted)) speaking.add(id);
      }
      Room.speaking(speaking);
    }, 180);
  }
  function peer(id) {
    let p = peers.get(id); if (p) return p;
    const pc = new RTCPeerConnection(ICE);
    p = { id, pc, polite: String(uid) < String(id), making: false, ignore: false, audio: null };
    peers.set(id, p);
    if (stream && stream.getAudioTracks().length) stream.getTracks().forEach(t => pc.addTrack(t, stream));
    else pc.addTransceiver('audio', { direction: 'recvonly' });
    pc.onnegotiationneeded = async () => {
      try { p.making = true; await pc.setLocalDescription(); send({ to: id, type: 'desc', desc: pc.localDescription }); }
      catch (e) {} finally { p.making = false; }
    };
    pc.onicecandidate = ({ candidate }) => { if (candidate) send({ to: id, type: 'cand', cand: candidate }); };
    pc.ontrack = ({ track, streams }) => {
      const st = streams[0] || new MediaStream([track]);
      if (!p.audio) { p.audio = document.createElement('audio'); p.audio.autoplay = true; p.audio.setAttribute('playsinline', ''); p.audio.className = 'vaudio'; document.body.appendChild(p.audio); }
      p.audio.srcObject = st; p.audio.muted = isBlocked(id); p.audio.play().catch(() => toastAct('Tap to hear voice chat', 'Listen', () => document.querySelectorAll('audio.vaudio').forEach(a => a.play().catch(() => {}))));
      analyse(id, st);
    };
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') drop(id); Room.paintVoice(); };
    return p;
  }
  function drop(id) {
    const p = peers.get(id); if (!p) return;
    peers.delete(id); delete levels[id];
    try { p.pc.close(); } catch (e) {}
    if (p.audio) { p.audio.srcObject = null; p.audio.remove(); }
  }
  async function signal(m) {
    if (!on || !m || m.from === uid || (m.to && m.to !== uid)) return;
    if (m.type === 'hello') { peer(m.from); return; }
    if (m.type === 'bye') { drop(m.from); return; }
    const p = peer(m.from), pc = p.pc;
    try {
      if (m.type === 'desc') {
        const d = m.desc, collision = d.type === 'offer' && (p.making || pc.signalingState !== 'stable');
        p.ignore = !p.polite && collision; if (p.ignore) return;
        await pc.setRemoteDescription(d);
        if (d.type === 'offer') { await pc.setLocalDescription(); send({ to: m.from, type: 'desc', desc: pc.localDescription }); }
      } else if (m.type === 'cand') {
        try { await pc.addIceCandidate(m.cand); } catch (e) { if (!p.ignore) throw e; }
      }
    } catch (e) { console.warn('voice', e); }
  }
  async function join() {
    if (on) return true;
    if (!window.RTCPeerConnection) { toast('Voice chat isn’t supported in this browser'); return false; }
    micOk = false;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      micOk = true;
    } catch (e) {
      stream = null;
      toast('No microphone access, so you can listen but not talk. Allow the mic in your browser to talk.');
    }
    on = true; muted = !micOk; Music.duck(true);
    if (stream) analyse(uid, stream);
    startMeter();
    send({ type: 'hello' });
    Sfx.lit();
    return true;
  }
  function leave(silent) {
    if (!on) return;
    send({ type: 'bye' });
    [...peers.keys()].forEach(drop);
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null; on = false; muted = false; micOk = false; Music.duck(false);
    for (const k in levels) delete levels[k];
    clearInterval(meter); meter = null; Room.speaking(new Set());
    if (!silent) Sfx.click();
  }
  function toggleMute() {
    if (!on) return;
    if (!micOk) { toast('Allow the microphone in your browser to talk'); return; }
    muted = !muted; stream.getAudioTracks().forEach(t => { t.enabled = !muted; });
    Sfx.click();
  }
  // Someone left voice without saying goodbye (closed the tab): tidy up.
  function prune(present) { [...peers.keys()].forEach(id => { if (!present.has(id)) drop(id); }); }
  return {
    attach: c => { chan = c; }, signal, join, leave, toggleMute, prune,
    applyBlocks: () => peers.forEach(p => { if (p.audio) p.audio.muted = isBlocked(p.id); }),
    on: () => on, muted: () => muted, connected: id => { const p = peers.get(id); return !!(p && p.pc.connectionState === 'connected'); },
  };
})();

/* ================= Live rooms ================= */
const ROOM_TIERS = { low: 'Low · 20', mid: 'Mid · 50', high: 'High · 120' };
const ICON = {
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  micOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 9.3V6a3 3 0 0 0-5.7-1.3M9 9v2a3 3 0 0 0 5 2.2M5 11a7 7 0 0 0 11.5 5.3M19 11a7 7 0 0 1-.4 2.3M12 18v3M4 4l16 16"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.3A7.5 7.5 0 1 1 20 12.5z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>',
};
const Room = (() => {
  let s = null, run = null, ch = null, poll = null, busy = false, lastKey = '', invited = new Set();
  let msgs = [], lastMsg = 0, unread = 0, present = {}, picker = false, invOpen = false, loadingMsgs = false, speakingNow = new Set();
  let newVis = 'private', pubTimer = null;
  const mine = () => s && s.players.find(p => p.id === uid);
  const isHost = () => !!(s && s.host === uid);
  const modalOpen = () => !$('#roomModal').hidden;
  const nGames = () => (s && s.themes ? s.themes.length : 1);
  const label = () => (s && s.mode === 'tourney' ? 'Tournament' : 'Round');

  /* ---------- connection ---------- */
  function connect(id) {
    if (ch && ch.roomId === id) return;
    if (ch) { Voice.leave(true); sb.removeChannel(ch); }
    ch = sb.channel('room:' + id, { config: { broadcast: { self: false }, presence: { key: uid } } });
    ch.on('broadcast', { event: 'poke' }, () => { refresh(); loadMsgs(); });
    ch.on('broadcast', { event: 'rtc' }, ({ payload }) => Voice.signal(payload));
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState(); present = {};
      for (const k in st) present[k] = (st[k] && st[k][0]) || {};
      Voice.prune(new Set(Object.keys(present).filter(k => present[k].voice)));
      paintPlayers(); dock();
    });
    ch.subscribe(st => { if (st === 'SUBSCRIBED') track(); });
    ch.roomId = id;
    Voice.attach(ch);
    clearInterval(poll); poll = setInterval(tick, 4000);
  }
  function track() { if (ch) { try { ch.track({ name: me && me.username, voice: Voice.on(), muted: Voice.muted() }); } catch (e) {} } }
  function poke() { if (ch) { try { ch.send({ type: 'broadcast', event: 'poke', payload: {} }); } catch (e) {} } }
  function clear(silent) {
    Voice.leave(true);
    if (ch) { sb.removeChannel(ch); ch = null; }
    clearInterval(poll); poll = null;
    s = null; run = null; lastKey = ''; invited.clear(); msgs = []; lastMsg = 0; unread = 0; present = {}; picker = false; invOpen = false;
    state.roomRun = null; save();
    $('#roomModal').hidden = true; $('#roomBody').dataset.room = '';
    dock();
    if (!silent) { Social.rerender(); if (!active) renderResume(); }
  }
  async function refresh() {
    if (!s) return; const id = s.id;
    try {
      const ns = await rpc('room_state', { p_room: id });
      if (!s || s.id !== id) return;
      if (!ns) { toast('You’re no longer in that room'); clear(); return; }
      set(ns);
    } catch (e) { /* try again on the next tick */ }
  }
  function tick() {
    if (!s) return;
    refresh(); loadMsgs();
    const my = mine();
    if (s.status === 'playing' && my && my.in_round && run && run.tks.every(t => t.done) && s.started_at
        && Date.now() - Date.parse(s.started_at) > 120000 * nGames() + 5000)
      rpc('settle_room', { p_room: s.id }).then(ns => { if (ns) { set(ns); poke(); } }).catch(() => {});
  }
  function set(ns) {
    if (!ns) return;
    s = ns;
    if (ns.status === 'closed') { clear(); toast('The room closed'); return; }
    connect(ns.id);
    if (run && run.room === ns.id && ns.result && ns.result.round >= run.round) {
      const r = run; run = null; state.roomRun = null; save(); roundDone(r, ns.result);
    }
    if (ns.status === 'playing') ensureRun();
    const key = ns.id + ':' + ns.version + ':' + ns.status + ':' + ns.host;
    if (key !== lastKey) { lastKey = key; paint(); strip(); dock(); Social.rerender(); if (!active) renderResume(); }
  }

  /* ---------- playing a round ---------- */
  const nextTk = () => (run ? run.tks.find(t => !t.done) : null);
  function ensureRun() {
    const my = mine(); if (!my || !my.in_round || !Array.isArray(my.totals) || !my.totals.length) return;
    if (run && run.room === s.id && run.round === s.round) return;
    const saved = state.roomRun && state.roomRun.room === s.id && state.roomRun.round === s.round ? state.roomRun : null;
    if (saved) run = saved;
    else {
      run = { room: s.id, round: s.round, tks: s.themes.map((id, i) => Object.assign(generate(byId[id], my.totals[i]), { room: s.id, round: s.round, idx: i })) };
      run.tks.forEach((t, i) => { if (i < my.progress) { t.done = true; t.revealed = t.revealed.map(() => true); } });
    }
    state.roomRun = run; save();
    // Catch up if a ticket was finished here but the server never heard about it.
    const doneHere = run.tks.filter(t => t.done).length;
    if (doneHere > my.progress) report(run.tks[doneHere - 1]);
    if (my.finished) return;
    const tk = nextTk(); if (!tk) return;
    const go = () => { document.querySelectorAll('.modal').forEach(m => { m.hidden = true; }); openPlay(tk); };
    if (active && active.room === s.id && active.round === s.round) return;
    const onOldRoomTicket = active && active.room === s.id && active.done;
    if (onOldRoomTicket) { toast(s.mode === 'tourney' ? '7-game tournament. Highest total takes the pot.' : 'Next round. Highest ticket takes the pot.'); Sfx.whoosh(); go(); }
    else if (active && !$('#play').hidden) toastAct(`${label()} ${s.round} has started`, 'Play', go, 30000);
    else if (!saved) { toast(s.mode === 'tourney' ? '7-game tournament. Highest total takes the pot.' : 'Game on. Highest ticket takes the pot.'); Sfx.whoosh(); go(); }
  }
  async function report(t) {
    if (!s || t.room !== s.id) return;
    try { set(await rpc('finish_room_ticket', { p_room: t.room, p_round: t.round, p_index: t.idx })); poke(); }
    catch (e) { setTimeout(() => report(t), 3000); }
  }
  function finished(t) { save(); report(t); }
  function roundDone(r, res) {
    const st = (res.standings || []).find(p => p.id === uid);
    if (!st) return;
    if (res.refund) { toast('Nobody won anything, so everyone gets their chips back.'); setTimeout(() => Sfx.aww(), 700); refreshMe(900); }
    else if (st.payout > 0) {
      setTimeout(() => Sfx.fanfare(), 500);
      const b = document.createElement('div'); b.className = 'bigwin';
      b.innerHTML = `<div><div class="l1">${res.mode === 'tourney' ? 'Champion' : 'Pot won'}</div><div class="l2">+${fmt(st.payout)} CHIPS</div></div>`;
      document.body.appendChild(b); setTimeout(() => b.remove(), 2900);
      Burst.confetti(innerWidth / 2, innerHeight * .45, 140, ['#F2C14E', '#FFFFFF', '#6BE3A0', '#FFE7A6']);
      setTimeout(() => flyChips(innerWidth / 2, innerHeight * .5, 14, () => { refreshMe(900); pulseBal('bump'); }), 600);
    } else {
      const w = res.standings.filter(p => p.payout > 0).map(p => p.username);
      toast(`${w.join(' & ') || 'Someone'} took the pot`); setTimeout(() => Sfx.aww(), 700); refreshMe(600);
    }
    if (active && active.room === r.room) pillStatus();
    if ($('#play').hidden) setTimeout(open, 700);
  }
  function showResult(t, quiet) {
    const th = byId[t.id], won = t.total;
    $('#pill').className = 'pill glasspill' + (won ? ' win' : '');
    setRing(1, won ? `${won / th.price}×` : '—');
    pillStatus();
    const nx = run && run.round === t.round ? nextTk() : null;
    $('#pa').innerHTML = nx
      ? `<button class="btn btn-ghost" id="roomRes">Room</button><button class="btn btn-gold" id="nextTk">Next game · ${nx.idx + 1}/${run.tks.length}</button>`
      : `<button class="btn btn-ghost" id="toLobby">Lobby</button><button class="btn btn-light" id="roomRes">Room</button>`;
    if ($('#toLobby')) $('#toLobby').onclick = () => { Sfx.click(); closePlay(); };
    $('#roomRes').onclick = () => open();
    if (nx) $('#nextTk').onclick = () => {
      Sfx.click(); const tEl = $('#ticket');
      const go = () => openPlay(nx);
      if (tEl && !reduced) { const a = tEl.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-120%) rotate(-8deg)', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }); a.onfinish = go; } else go();
    };
    if (quiet) return;
    if (won) {
      Sfx.win(false); $('#ticket').classList.add('celebrate');
      const r = $('#ticket').getBoundingClientRect();
      Burst.confetti(r.left + r.width / 2, Math.min(innerHeight * .6, r.top + r.height / 2), 60, [th.acc, th.c[1], '#FFFFFF', '#F2C14E']);
    } else Sfx.lose();
  }
  function myScore(round) {
    const r = run && run.round === round ? run : state.roomRun && state.roomRun.round === round ? state.roomRun : null;
    return r ? r.tks.filter(t => t.done).reduce((a, t) => a + t.total, 0) : 0;
  }
  function pillStatus() {
    if (!active || !active.room || !active.done) return;
    let sub = '';
    const res = s && s.result && s.result.round === active.round ? s.result : null;
    if (res) {
      const st = (res.standings || []).find(p => p.id === uid);
      if (res.refund) sub = 'Nobody won. Chips refunded.';
      else if (st && st.payout) sub = `You took the pot · +${fmt(st.payout)}`;
      else sub = `${(res.standings || []).filter(p => p.payout > 0).map(p => p.username).join(' & ')} took the pot`;
    } else if (s && s.id === active.room && s.round === active.round) {
      const nx = nextTk(), n = s.themes.length;
      if (nx) sub = `Game ${active.idx + 1} of ${n} · your total ${fmt(myScore(active.round))}`;
      else { const left = s.players.filter(p => p.in_round && !p.finished && p.id !== uid).length; sub = left ? `Waiting for ${left} more player${left > 1 ? 's' : ''}…` : 'Adding up…'; }
    } else sub = 'Round finished';
    $('#ps').innerHTML = `<div class="t">${active.total ? `${chipSvg()}${fmt(active.total)}` : 'No win'}</div><div class="s">${esc(sub)}</div>`;
  }
  function strip() {
    if (!active || !active.room || !s || active.room !== s.id) return;
    const n = s.themes ? s.themes.length : 1;
    const players = s.players.filter(p => p.in_round);
    $('#ptMeta').innerHTML = `<div class="rstrip"><span class="rpot">${chipSvg('gold')}${fmt(s.pot)} pot</span>${n > 1 ? `<span class="rgame">Game ${active.idx + 1}/${n}</span>` : ''}${players.map(p => {
      const sc = p.id === uid ? myScore(active.round) : p.score;
      const pr = p.id === uid ? (run ? run.tks.filter(t => t.done).length : n) : p.progress;
      return `<span class="rpl${pr >= n ? ' done' : ''}${p.id === uid ? ' me' : ''}">${esc(p.username)}${pr ? ` · ${fmt(sc)}` : ''}</span>`;
    }).join('')}</div>`;
    pillStatus();
  }

  /* ---------- room screen ---------- */
  function open() {
    if (!s) return;
    Sfx.init(); Sfx.click();
    document.querySelectorAll('.modal').forEach(m => { if (m.id !== 'roomModal') m.hidden = true; });
    $('#roomModal').hidden = false; unread = 0;
    build(); paint(); renderChat(true); loadMsgs(); dock();
  }
  function build() {
    const b = $('#roomBody'); if (b.dataset.room === s.id) return;
    b.dataset.room = s.id;
    b.innerHTML = `
      <header class="rm-head" id="rmHead"></header>
      <div class="rm-grid">
        <div class="rm-main"><div id="rmStage"></div><h4 class="sh">In the room <span id="rmCount"></span></h4><div id="rmPlayers"></div><div id="rmInvite"></div></div>
        <section class="rm-chat" aria-label="Room chat">
          <h4 class="sh">${ICON.chat}Chat</h4>
          <div class="chatlist" id="chatList"></div>
          <form class="chatform" id="chatForm" autocomplete="off"><input id="chatIn" maxlength="300" placeholder="Message the room" enterkeyhint="send"><button class="sendbtn" type="submit" aria-label="Send">${ICON.send}</button></form>
        </section>
      </div>`;
    $('#chatForm').onsubmit = sendMsg;
  }
  function paint() {
    if (!s || !modalOpen()) return;
    build(); paintHead(); paintStage(); paintPlayers(); paintInvite();
  }
  function paintHead() {
    const st = s.status === 'playing' ? `${label()} ${s.round} in play` : isHost() ? 'You’re the host' : 'Waiting for the host';
    $('#rmHead').innerHTML = `
      <div class="rm-title"><small>${esc(st)}</small><b>Room <button class="rm-code" data-r="copy" aria-label="Copy room code">${esc(s.code)}</button>${isHost()
        ? `<button class="vis${s.is_public ? ' pub' : ''}" data-r="vis" aria-pressed="${!!s.is_public}" title="${s.is_public ? 'Anyone can join. Click to make it private.' : 'Only people with the code can join. Click to make it public.'}">${s.is_public ? 'Public' : 'Private'}</button>`
        : `<span class="vis${s.is_public ? ' pub' : ''} ro">${s.is_public ? 'Public' : 'Private'}</span>`}</b></div>
      <div class="rm-tools">${voiceBtns()}<button class="btn btn-ghost sm" data-r="leave">Leave</button></div>`;
  }
  function voiceBtns() {
    if (!Voice.on()) return `<button class="vbtn" data-r="voice">${ICON.mic}<span>Join voice</span></button>`;
    return `<button class="vbtn on${Voice.muted() ? ' muted' : ''}" data-r="mute" aria-pressed="${Voice.muted()}">${Voice.muted() ? ICON.micOff : ICON.mic}<span>${Voice.muted() ? 'Unmute' : 'Mute'}</span></button><button class="vbtn off" data-r="voiceoff"><span>Leave voice</span></button>`;
  }
  function paintVoice() { if (modalOpen() && s) { const h = $('#rmHead .rm-tools'); if (h) h.innerHTML = `${voiceBtns()}<button class="btn btn-ghost sm" data-r="leave">Leave</button>`; paintPlayers(); } dock(); }
  function lineupHTML(themes) {
    return `<div class="lineup">${themes.map((id, i) => { const t = byId[id]; return t ? `<div class="lu" style="${themeVars(t)}"><span class="lu-n">${i + 1}</span><span class="lu-e">${emblemHTML(t)}</span><b>${esc(t.name)}</b></div>` : ''; }).join('')}</div>`;
  }
  function pickerHTML() {
    const prices = [...new Set(THEMES.map(t => t.price))].sort((a, b) => a - b);
    return `<div class="picker">${prices.map(p => `<div class="pk-row"><span class="pk-p">${chipSvg()}${p}</span><div class="pk-list">${THEMES.filter(t => t.price === p).map(t => `<button class="pk${t.id === s.theme ? ' on' : ''}" data-theme="${t.id}" style="${themeVars(t)}"><span class="pk-e">${emblemHTML(t)}</span>${esc(t.name)}</button>`).join('')}</div></div>`).join('')}</div>`;
  }
  function resultHTML(res) {
    if (!res || !res.standings || !res.standings.length) return '';
    const n = res.themes ? res.themes.length : 1;
    return `<div class="rm-result"><h4 class="sh">${res.mode === 'tourney' ? 'Last tournament' : 'Last round'} · pot ${fmt(res.pot)}</h4>
      ${res.standings.map((p, i) => `<div class="lrow lb${p.id === uid ? ' mine' : ''}${p.payout && !res.refund ? ' top1' : ''}"><span class="rk">${i + 1}</span><div class="nm">${esc(p.username)}<small>${p.payout && !res.refund ? `Took the pot · +${fmt(p.payout)}` : res.refund ? 'Refunded' : n > 1 ? `${(p.totals || []).filter(v => v > 0).length} of ${n} games won` : 'No luck'}</small></div><span class="val">${fmt(p.score)}</span></div>`).join('')}</div>`;
  }
  function paintStage() {
    const host = isHost(), my = mine(), n = nGames();
    let h = '';
    if (s.status === 'lobby') {
      const t = byId[s.theme] || THEMES[0];
      h += `<div class="rm-card">
        <div class="seg small${host ? '' : ' ro'}"><button data-mode="single" aria-pressed="${s.mode === 'single'}" ${host ? '' : 'disabled'}>Single game</button><button data-mode="tourney" aria-pressed="${s.mode === 'tourney'}" ${host ? '' : 'disabled'}>Tournament · 7 games</button></div>`;
      if (s.mode === 'single') {
        h += `<div class="rhero" style="${themeVars(t)}"><div class="rh-emb">${emblemHTML(t)}</div><div class="rh-txt"><small>Next game</small><b>${esc(t.name)}</b><span>Everyone pays ${s.entry}. The highest ticket takes the pot.</span></div>${host ? `<button class="btn btn-light sm" data-r="pick">${picker ? 'Done' : 'Change'}</button>` : ''}</div>
          ${host && picker ? pickerHTML() : ''}`;
      } else {
        h += `<div class="seg small tiers${host ? '' : ' ro'}">${Object.keys(ROOM_TIERS).map(k => `<button data-tier="${k}" aria-pressed="${s.tier === k}" ${host ? '' : 'disabled'}>${ROOM_TIERS[k]}</button>`).join('')}</div>
          ${lineupHTML(s.themes || [])}
          <p class="rm-note">Entry is always ${s.entry} chips at this level. Everyone plays these 7 tickets, and the highest total across all 7 takes the pot.</p>`;
      }
      const short = state.balance < s.entry;
      h += `<div class="rm-go">
          <div class="rm-entry"><small>Entry</small><b>${chipSvg()}${fmt(s.entry)}</b></div>
          ${host ? `${s.mode === 'tourney' ? '<button class="btn btn-ghost" data-r="shuffle">Shuffle</button>' : ''}<button class="btn btn-gold" data-r="start" ${s.players.length < 2 ? 'disabled' : ''}>${s.players.length < 2 ? 'Waiting for players' : s.mode === 'tourney' ? 'Start tournament' : 'Start round'}</button>`
                 : '<span class="rm-wait">The host starts each round</span>'}
        </div>
        ${short ? `<p class="rm-note warn">You need ${s.entry} chips to play. You’ll sit out until you have enough.</p>` : ''}
        ${s.players.length < 2 ? '<p class="rm-note">Share the room code or invite a friend below. You need at least 2 players.</p>' : ''}
      </div>`;
      h += resultHTML(s.result);
    } else {
      const inR = s.players.filter(p => p.in_round).sort((a, b) => b.score - a.score);
      const left = run ? run.tks.filter(t => !t.done).length : 0;
      h += `<div class="rm-card live">
        <div class="rm-live"><span class="dotlive"></span>${label()} ${s.round} · pot ${fmt(s.pot)}</div>
        ${s.mode === 'tourney' ? lineupHTML(s.themes) : ''}
        ${inR.map((p, i) => { const pr = p.id === uid ? (run ? n - left : n) : p.progress; const sc = p.id === uid ? myScore(s.round) : p.score;
          return `<div class="lrow lb${p.id === uid ? ' mine' : ''}"><span class="rk">${i + 1}</span><div class="nm">${esc(p.username)}<small>${pr >= n ? 'Finished' : n > 1 ? `Game ${pr + 1} of ${n}` : 'Scratching…'}</small></div><span class="val">${fmt(sc)}</span></div>`; }).join('')}
        <div class="actions">${my && my.in_round
          ? (left ? `<button class="btn btn-gold" data-r="play">${n > 1 ? `Play game ${n - left + 1} of ${n}` : 'Play my ticket'}</button>` : '<button class="btn btn-ghost" disabled>Waiting for the others…</button>')
          : '<p class="rm-note">You’re sitting this one out. You’ll be in the next round.</p>'}</div>
      </div>`;
    }
    $('#rmStage').innerHTML = h;
  }
  function paintPlayers() {
    if (!s || !modalOpen() || !$('#rmPlayers')) return;
    $('#rmCount').textContent = `${s.players.length}/8`;
    $('#rmPlayers').innerHTML = s.players.map(p => {
      const pr = present[p.id], online = p.id === uid || !!pr, inVoice = p.id === uid ? Voice.on() : !!(pr && pr.voice), muted = p.id === uid ? Voice.muted() : !!(pr && pr.muted);
      const status = isBlocked(p.id) ? 'Blocked by you' : s.status === 'playing' ? (p.in_round ? 'Playing' : 'Sitting out') : online ? 'Here' : 'Away';
      return `<div class="lrow prow${speakingNow.has(p.id) ? ' speaking' : ''}" data-pid="${p.id}"><span class="av">${esc(p.username[0].toUpperCase())}<i class="odot${online ? ' yes' : ''}"></i></span>
        <div class="nm">${esc(p.username)}<small>${p.id === uid ? 'You · ' : ''}${p.id === s.host ? 'Host · ' : ''}${status}</small></div>
        <span class="vico${inVoice ? ' in' : ''}${muted ? ' muted' : ''}" title="${inVoice ? (muted ? 'In voice, muted' : 'In voice') : 'Not in voice'}">${inVoice ? (muted ? ICON.micOff : ICON.mic) : ''}</span>
        ${p.id === uid ? '' : `<span class="pacts"><button class="pa-btn${isBlocked(p.id) ? ' on' : ''}" data-block="${p.id}" title="${isBlocked(p.id) ? 'Show their messages and hear them again' : 'Hide their messages and mute their voice, just for you'}">${isBlocked(p.id) ? 'Unblock' : 'Block'}</button>${isHost() ? `<button class="pa-btn kick" data-kick="${p.id}" title="Remove from the room">Remove</button>` : ''}</span>`}</div>`;
    }).join('');
  }
  function speaking(set) {
    speakingNow = set;
    document.querySelectorAll('#rmPlayers .prow').forEach(r => r.classList.toggle('speaking', set.has(r.dataset.pid)));
    const d = $('#roomDock .dk-mic'); if (d) d.classList.toggle('speaking', set.has(uid));
  }
  function paintInvite() {
    const el = $('#rmInvite'); if (!el) return;
    el.innerHTML = `<button class="linkbtn inv-t" data-r="invite">${invOpen ? 'Hide friends' : 'Invite friends'}</button>${invOpen ? `<div id="invList">${dots}</div>` : ''}`;
    if (invOpen) invites();
  }
  async function invites() {
    let d; try { d = await rpc('social_state'); } catch (e) { const b = $('#invList'); if (b) b.innerHTML = ''; return; }
    const box = $('#invList'); if (!box || !s) return;
    const inRoom = new Set(s.players.map(p => p.id));
    const list = d.friends.filter(f => !inRoom.has(f.id)).sort((a, b) => Social.isOnline(b.id) - Social.isOnline(a.id));
    box.innerHTML = list.length ? list.map(f => `<div class="lrow"><span class="av">${esc(f.username[0].toUpperCase())}<i class="odot${Social.isOnline(f.id) ? ' yes' : ''}"></i></span><div class="nm">${esc(f.username)}<small>${Social.isOnline(f.id) ? 'Online' : 'Offline'}</small></div><div class="ra"><button class="btn ${invited.has(f.id) ? 'btn-ghost' : 'btn-light'} sm" data-inv="${f.id}" ${invited.has(f.id) ? 'disabled' : ''}>${invited.has(f.id) ? 'Invited' : 'Invite'}</button></div></div>`).join('')
      : `<div class="empty">${d.friends.length ? 'All your friends are already here.' : 'Add friends in the Lounge, or share the room code.'}</div>`;
  }

  /* ---------- chat ---------- */
  async function loadMsgs() {
    if (!s || loadingMsgs) return; loadingMsgs = true; const id = s.id, first = lastMsg === 0;
    try {
      const rows = await rpc('room_messages', { p_room: id, p_after: lastMsg });
      if (!s || s.id !== id || !rows.length) return;
      add(rows, first);
    } catch (e) {} finally { loadingMsgs = false; }
  }
  function add(rows, quiet) {
    const fresh = rows.filter(m => m.id > lastMsg && !msgs.some(x => x.id === m.id));
    if (!fresh.length) return;
    msgs = msgs.concat(fresh).sort((a, b) => a.id - b.id).slice(-150);
    lastMsg = Math.max(lastMsg, ...fresh.map(m => m.id));
    if (!quiet) {
      const others = fresh.filter(m => m.kind === 'chat' && m.user_id !== uid && !isBlocked(m.user_id));
      if (others.length && !modalOpen()) {
        unread += others.length; const m = others[others.length - 1];
        toastAct(`${m.username}: ${m.body.length > 70 ? m.body.slice(0, 70) + '…' : m.body}`, 'Reply', open, 5000);
        Sfx.click();
      }
    }
    renderChat(); dock();
  }
  function renderChat(force) {
    const list = $('#chatList'); if (!list || !modalOpen()) return;
    const atBottom = force || list.scrollHeight - list.scrollTop - list.clientHeight < 60;
    let prev = null;
    const shown = msgs.filter(m => !(m.kind === 'chat' && isBlocked(m.user_id)));
    list.innerHTML = shown.length ? shown.map(m => {
      if (m.kind === 'system') { prev = null; return `<div class="cmsg sys">${esc(m.body)}</div>`; }
      const same = prev === m.user_id; prev = m.user_id;
      return `<div class="cmsg${m.user_id === uid ? ' me' : ''}${same ? ' cont' : ''}">${same ? '' : `<b>${esc(m.username)}</b>`}<span>${esc(m.body)}</span></div>`;
    }).join('') : '<div class="cmsg sys">Say hi to the room.</div>';
    if (atBottom) list.scrollTop = list.scrollHeight;
  }
  async function sendMsg(e) {
    e.preventDefault(); const inp = $('#chatIn'), body = inp.value.trim(); if (!body || !s) return;
    inp.value = '';
    try { const m = await rpc('send_message', { p_room: s.id, p_body: body }); add([m], true); renderChat(true); poke(); }
    catch (x) { if (!inp.value) inp.value = body; toast(/slow_down/.test(x.message || '') ? 'Slow down a little' : errText(x)); }
  }

  /* ---------- floating room button ---------- */
  function dock() {
    const d = $('#roomDock');
    if (!s || !uid) { d.hidden = true; return; }
    d.hidden = false;
    d.innerHTML = `<button class="dk-room" data-d="open" aria-label="Open room ${esc(s.code)}"><span class="dotlive"></span><span>Room</span><b>${esc(s.code)}</b>${unread ? `<i class="dk-badge">${unread > 9 ? '9+' : unread}</i>` : ''}</button>${Voice.on() ? `<button class="dk-mic${Voice.muted() ? ' muted' : ''}${speakingNow.has(uid) ? ' speaking' : ''}" data-d="mute" aria-label="${Voice.muted() ? 'Unmute' : 'Mute'}">${Voice.muted() ? ICON.micOff : ICON.mic}</button>` : ''}`;
  }

  /* ---------- actions ---------- */
  async function create(themeId) {
    if (busy) return; busy = true;
    try { const ns = await rpc('create_room', { p_theme: themeId, p_day: dayKey(), p_public: newVis === 'public' }); invited.clear(); set(ns); loadMsgs(); open(); }
    catch (e) { toast(errText(e)); }
    finally { busy = false; }
  }
  async function join(code) {
    if (busy) return; busy = true;
    try { const ns = await rpc('join_room', { p_code: code }); msgs = []; lastMsg = 0; set(ns); poke(); loadMsgs(); open(); toast('You’re in the room'); }
    catch (e) { toast(errText(e)); }
    finally { busy = false; }
  }
  async function setGame(mode, theme, tier) {
    try { set(await rpc('set_room_game', { p_room: s.id, p_mode: mode || s.mode, p_theme: theme || s.theme, p_tier: tier || s.tier })); poke(); }
    catch (e) { toast(errText(e)); }
  }
  async function act(b) {
    const r = b.dataset.r, inv = b.dataset.inv;
    if (inv && s) { b.disabled = true; await rpc('invite_to_room', { p_room: s.id, p_friend: inv }); invited.add(inv); b.textContent = 'Invited'; b.className = 'btn btn-ghost sm'; Sfx.click(); return; }
    if (b.dataset.block) { Sfx.click(); const on = !isBlocked(b.dataset.block); setBlocked(b.dataset.block, on); toast(on ? 'Blocked. You won’t see their messages or hear them.' : 'Unblocked'); paintPlayers(); renderChat(); return; }
    if (b.dataset.kick && s) {
      if (!b.classList.contains('sure')) { b.classList.add('sure'); b.textContent = 'Sure?'; setTimeout(() => { if (b.isConnected) { b.classList.remove('sure'); b.textContent = 'Remove'; } }, 2800); return; }
      b.disabled = true; set(await rpc('kick_player', { p_room: s.id, p_user: b.dataset.kick })); poke(); loadMsgs(); return;
    }
    if (b.dataset.theme) { Sfx.click(); picker = false; return setGame('single', b.dataset.theme); }
    if (b.dataset.mode) { Sfx.click(); picker = false; return setGame(b.dataset.mode); }
    if (b.dataset.tier) { Sfx.click(); return setGame('tourney', null, b.dataset.tier); }
    if (!r || !s) return;
    if (r === 'copy') { Sfx.click(); try { await navigator.clipboard.writeText(s.code); toast('Room code copied'); } catch (e) { toast(`Room code: ${s.code}`); } return; }
    if (r === 'pick') { Sfx.click(); picker = !picker; paintStage(); return; }
    if (r === 'vis') { Sfx.click(); set(await rpc('set_room_public', { p_room: s.id, p_public: !s.is_public })); poke(); loadMsgs(); toast(s.is_public ? 'Public room. Anyone can join from the room list.' : 'Private room. Only people with the code can join.'); return; }
    if (r === 'shuffle') { Sfx.whoosh(); return setGame('tourney'); }
    if (r === 'start') { b.disabled = true; Sfx.buy(); set(await rpc('start_round', { p_room: s.id, p_day: dayKey() })); poke(); refreshMe(450); pulseBal('drop'); return; }
    if (r === 'play') { const tk = nextTk(); if (tk) { $('#roomModal').hidden = true; openPlay(tk); } return; }
    if (r === 'invite') { Sfx.click(); invOpen = !invOpen; paintInvite(); return; }
    if (r === 'voice') { if (await Voice.join()) { track(); paintVoice(); } return; }
    if (r === 'mute') { Voice.toggleMute(); track(); paintVoice(); return; }
    if (r === 'voiceoff') { Voice.leave(); track(); paintVoice(); return; }
    if (r === 'leave') {
      const mid = s.status === 'playing' && mine() && mine().in_round && nextTk();
      if (!b.classList.contains('sure')) { b.classList.add('sure'); b.textContent = mid ? 'Forfeit entry?' : 'Sure?'; setTimeout(() => { if (b.isConnected) { b.classList.remove('sure'); b.textContent = 'Leave'; } }, 2800); return; }
      b.disabled = true; const id = s.id;
      const p = await rpc('leave_room', { p_room: id }); poke(); clear(); applyProfile(p, 600); toast('You left the room');
      if (active && active.room === id) closePlay();
      return;
    }
  }
  async function onModalClick(e) {
    const b = e.target.closest('button'); if (!b || b.disabled || b.hasAttribute('data-close')) return;
    try { await act(b); } catch (x) { toast(errText(x)); b.disabled = false; paint(); }
  }

  /* ---------- Lounge tab ---------- */
  function render(el) {
    clearInterval(pubTimer); pubTimer = null;
    if (!s) {
      el.innerHTML = `
        <div class="seg small vis-seg"><button data-vis="private" aria-pressed="${newVis === 'private'}">Private · code only</button><button data-vis="public" aria-pressed="${newVis === 'public'}">Public · anyone can join</button></div>
        <button class="btn btn-gold wide" data-r="create">Open a ${newVis} room</button>
        <p class="hint">Play round after round together, pick single games or a 7-game tournament, and chat as you go.</p>
        <div class="or"><span>or join one</span></div>
        <button class="btn btn-light wide qj" data-r="quick">Quick join a public room</button>
        <h4 class="sh">Public rooms <span id="pubCount"></span></h4>
        <div id="pubList">${dots}</div>
        <h4 class="sh">Have a code?</h4>
        <form class="addrow" id="joinForm"><input id="joinCode" placeholder="Room code" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="btn btn-light" type="submit">Join</button></form>`;
      $('#joinForm').onsubmit = e => { e.preventDefault(); const c = $('#joinCode').value.trim(); if (c) join(c); };
      loadPublic();
      pubTimer = setInterval(() => { if (Social.isOpen() && Social.tab() === 'rooms' && !s && $('#pubList')) loadPublic(); else { clearInterval(pubTimer); pubTimer = null; } }, 8000);
      return;
    }
    el.innerHTML = `
      <div class="rhead"><div class="rh-txt"><small>${s.status === 'playing' ? `${label()} ${s.round} in play` : `You’re in a ${s.is_public ? 'public' : 'private'} room`}</small><b>Room ${esc(s.code)}</b><span>${s.players.map(p => esc(p.username)).join(', ')}</span></div></div>
      <button class="btn btn-gold wide" data-r="openroom">Go to room</button>
      <p class="hint">You stay in the room between games. Leave it from inside the room.</p>`;
  }
  async function loadPublic() {
    let list; try { list = await rpc('public_rooms'); } catch (e) { const b = $('#pubList'); if (b) b.innerHTML = `<div class="empty">${esc(errText(e))}</div>`; return; }
    const box = $('#pubList'); if (!box || s) return;
    $('#pubCount').textContent = list.length ? String(list.length) : '';
    box.innerHTML = list.length ? list.map(r => {
      const t = byId[r.theme] || THEMES[0], tour = r.mode === 'tourney';
      return `<div class="lrow pubrow"><span class="av em pr-e" style="${themeVars(t)}">${tour ? '🏆' : emblemHTML(t)}</span>
        <div class="nm">${esc(r.host)}’s room<small>${r.players}/8 players · ${tour ? `Tournament · ${ROOM_TIERS[r.tier] ? ROOM_TIERS[r.tier].split(' · ')[0] : ''}` : esc(t.name)} · entry ${r.entry}${r.status === 'playing' ? ' · <span class="pr-live">in a round</span>' : ''}</small></div>
        <div class="ra"><button class="btn btn-light sm" data-join="${esc(r.code)}">Join</button></div></div>`;
    }).join('') : '<div class="empty">No public rooms right now. Open one and others can find it here.</div>';
  }
  async function onClick(b) {
    if (b.dataset.vis) {
      Sfx.click(); newVis = b.dataset.vis;
      b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const c = document.querySelector('#socialBody [data-r="create"]'); if (c) c.textContent = `Open a ${newVis} room`;
      return;
    }
    if (b.dataset.join) { Sfx.click(); b.disabled = true; await join(b.dataset.join); b.disabled = false; return; }
    const r = b.dataset.r; if (!r) return;
    Sfx.click();
    if (r === 'create') return create(sel);
    if (r === 'openroom') return open();
    if (r === 'quick') {
      if (busy) return; busy = true; b.disabled = true;
      try { const ns = await rpc('quick_join'); msgs = []; lastMsg = 0; set(ns); poke(); loadMsgs(); open(); toast('You’re in. Say hi!'); }
      catch (e) { toast(errText(e)); }
      finally { busy = false; b.disabled = false; }
    }
  }
  async function resume() {
    try {
      const ns = await rpc('my_room');
      if (ns) { set(ns); loadMsgs(); } else if (state.roomRun) { state.roomRun = null; save(); }
    } catch (e) {}
  }
  function init() {
    $('#roomModal').addEventListener('click', onModalClick);
    $('#roomDock').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.d === 'open') open();
      else if (b.dataset.d === 'mute') { Voice.toggleMute(); track(); paintVoice(); }
    });
    addEventListener('pagehide', () => Voice.leave(true));
  }
  init();
  return {
    render, onClick, join, resume, clear, finished, showResult, strip, set, open, speaking, paintVoice, track,
    has: id => !!(s && s.players.some(p => p.id === id)),
    ticket: () => nextTk(),
  };
})();

/* ================= Boot ================= */
const firstVisit = !state.updatedAt;
if (ONLINE) {
  renderAll();
  Auth.start();
} else {
  applyDaily(firstVisit);
  if (firstVisit) save();
  renderAll();
  if (!state.adult) {
    $('#gate').hidden = false;
    $('#gateYes').onclick = () => { Sfx.init(); state.adult = true; save(); const g = $('#gate'); g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: 'ease' }).onfinish = () => { g.hidden = true; }; setTimeout(() => toast('50 chips to start'), 500); };
    $('#gateNo').onclick = () => { $('#gateTitle').textContent = 'Sorry'; $('#gateMsg').textContent = 'You must be 18 or older to play Foil Lounge.'; $('#gateBtns').hidden = true; };
  }
}
})();
