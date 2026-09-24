/**
 * Análise dos PNGs fdi-1..fdi-32 (frontend/public) para a vetorização:
 *  - estatísticas de alpha e cores (tinta dominante + cores secundárias);
 *  - máscara de tinta (traços) e silhueta (tinta + interiores fechados);
 *  - perfis verticais de largura → orientação coroa/raiz de cada dente;
 *  - IoU de espelhamento horizontal entre pares → confirma a ordem dos
 *    arquivos (hipótese: numeração Universal 1–32, fdi-1 = FDI 18).
 *
 * Uso (a partir de frontend/): node scripts/tooth-svg/analyze.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng } from "./png.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(HERE, "../../public");

/** Hipótese de mapeamento índice do arquivo → número FDI (Universal 1–32). */
const FILE_TO_FDI = [
  18, 17, 16, 15, 14, 13, 12, 11, // fdi-1..8  — superior direito (distal→mesial)
  21, 22, 23, 24, 25, 26, 27, 28, // fdi-9..16 — superior esquerdo (mesial→distal)
  38, 37, 36, 35, 34, 33, 32, 31, // fdi-17..24 — inferior esquerdo (distal→mesial)
  41, 42, 43, 44, 45, 46, 47, 48, // fdi-25..32 — inferior direito (mesial→distal)
];

/** Pares espelhados esperados na hipótese Universal (lado direito ↔ esquerdo). */
const MIRROR_PAIRS = [
  [1, 16], [2, 15], [3, 14], [4, 13], [5, 12], [6, 11], [7, 10], [8, 9],
  [17, 32], [18, 31], [19, 30], [20, 29], [21, 28], [22, 27], [23, 26], [24, 25],
];

function toHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function analyzeFile(idx) {
  const file = path.join(PUBLIC, `fdi-${idx}.png`);
  const { w, h, ctype, texts, rgba } = decodePng(file);
  const n = w * h;

  let transp = 0;
  let semi = 0;
  const buckets = new Map();
  for (let i = 0; i < n; i++) {
    const a = rgba[i * 4 + 3];
    if (a < 16) {
      transp++;
      continue;
    }
    if (a < 255) semi++;
    if (a >= 200) {
      const r = rgba[i * 4];
      const g = rgba[i * 4 + 1];
      const b = rgba[i * 4 + 2];
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      let e = buckets.get(key);
      if (!e) {
        e = { n: 0, r: 0, g: 0, b: 0 };
        buckets.set(key, e);
      }
      e.n++;
      e.r += r;
      e.g += g;
      e.b += b;
    }
  }
  const hasTransparency = transp > n * 0.02;

  // Máscara de tinta: pixels visíveis (fundo transparente) ou distantes da cor dominante.
  const ink = new Uint8Array(n);
  let inkCount = 0;
  if (hasTransparency) {
    for (let i = 0; i < n; i++) {
      if (rgba[i * 4 + 3] >= 128) {
        ink[i] = 1;
        inkCount++;
      }
    }
  } else {
    const sortedBg = [...buckets.values()].sort((a, b) => b.n - a.n);
    const bg = sortedBg[0];
    const br = bg.r / bg.n;
    const bgc = bg.g / bg.n;
    const bb = bg.b / bg.n;
    for (let i = 0; i < n; i++) {
      const r = rgba[i * 4];
      const g = rgba[i * 4 + 1];
      const b = rgba[i * 4 + 2];
      if (Math.abs(r - br) + Math.abs(g - bgc) + Math.abs(b - bb) > 90) {
        ink[i] = 1;
        inkCount++;
      }
    }
  }

  // Bounding box da tinta.
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (ink[y * w + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Componentes conectados da tinta (8-conectividade).
  const seen = new Uint8Array(n);
  let comps = 0;
  const compSizes = [];
  for (let i = 0; i < n; i++) {
    if (!ink[i] || seen[i]) continue;
    comps++;
    let size = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop();
      size++;
      const jx = j % w;
      const jy = (j - jx) / w;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = jx + dx;
          const ny = jy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const k = ny * w + nx;
          if (ink[k] && !seen[k]) {
            seen[k] = 1;
            stack.push(k);
          }
        }
      }
    }
    compSizes.push(size);
  }
  compSizes.sort((a, b) => b - a);

  // Silhueta: tinta + interiores fechados (flood fill do fundo a partir da borda).
  const outside = new Uint8Array(n);
  const stack = [];
  const push = (x, y) => {
    const i = y * w + x;
    if (!ink[i] && !outside[i]) {
      outside[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  const sil = new Uint8Array(n);
  let silCount = 0;
  for (let i = 0; i < n; i++) {
    if (ink[i] || !outside[i]) {
      sil[i] = 1;
      silCount++;
    }
  }

  // Perfis verticais da silhueta.
  const rowWidth = new Int32Array(h);
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) if (sil[y * w + x]) c++;
    rowWidth[y] = c;
  }
  const H = maxY - minY + 1;
  const widthAt = (frac) => rowWidth[Math.max(0, Math.min(h - 1, minY + Math.round(frac * (H - 1))))];
  const runsAt = (frac) => {
    const y = Math.max(0, Math.min(h - 1, minY + Math.round(frac * (H - 1))));
    let runs = 0;
    let inRun = false;
    for (let x = minX; x <= maxX; x++) {
      const v = sil[y * w + x] ? 1 : 0;
      if (v && !inRun) runs++;
      inRun = !!v;
    }
    return runs;
  };

  const wTop = widthAt(0.05);
  const wTopB = widthAt(0.3);
  const wBot = widthAt(0.95);
  const wBotB = widthAt(0.7);
  const ratioT = wTop / Math.max(1, wTopB);
  const ratioB = wBot / Math.max(1, wBotB);
  let orient = "?";
  if (ratioT < ratioB - 0.18) orient = "raiz no topo (coroa p/ baixo)";
  else if (ratioB < ratioT - 0.18) orient = "raiz embaixo (coroa p/ cima)";
  else orient = `indefinido (rT=${ratioT.toFixed(2)} rB=${ratioB.toFixed(2)})`;

  // Máscara recortada ao bbox (para IoU de espelhamento).
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const crop = new Uint8Array(cw * ch);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      crop[y * cw + x] = ink[(minY + y) * w + (minX + x)];
    }
  }

  const colors = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 4);
  return {
    idx,
    fdi: FILE_TO_FDI[idx - 1],
    w,
    h,
    ctype,
    texts,
    hasTransparency,
    semi,
    inkCount,
    silCount,
    comps,
    compSizes: compSizes.slice(0, 4),
    colors: colors.map(
      (c) => `${toHex(c.r / c.n, c.g / c.n, c.b / c.n)}(${Math.round((100 * c.n) / Math.max(1, inkCount))}%)`
    ),
    widths: [0.05, 0.15, 0.3, 0.5, 0.7, 0.85, 0.95].map((f) => widthAt(f)),
    runs: {
      top: [runsAt(0.05), runsAt(0.12), runsAt(0.2)],
      bot: [runsAt(0.95), runsAt(0.88), runsAt(0.8)],
    },
    orient,
    crop,
    cw,
    ch,
  };
}

function mirrorIoU(a, b) {
  // Espelha "a" horizontalmente e compara com "b" em canvas comum (bbox-aligned).
  const fa = new Uint8Array(a.cw * a.ch);
  for (let y = 0; y < a.ch; y++) {
    for (let x = 0; x < a.cw; x++) {
      fa[y * a.cw + x] = a.crop[y * a.cw + (a.cw - 1 - x)];
    }
  }
  const W = Math.max(a.cw, b.cw);
  const H = Math.max(a.ch, b.ch);
  let inter = 0;
  let union = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const va = x < a.cw && y < a.ch ? fa[y * a.cw + x] : 0;
      const vb = x < b.cw && y < b.ch ? b.crop[y * b.cw + x] : 0;
      if (va && vb) inter++;
      if (va || vb) union++;
    }
  }
  return inter / Math.max(1, union);
}

const results = [];
for (let i = 1; i <= 32; i++) results.push(analyzeFile(i));

console.log("==== Análise por arquivo ====");
for (const r of results) {
  console.log(
    `fdi-${String(r.idx).padStart(2, "0")} (FDI ${r.fdi}) ${r.w}x${r.h} ctype=${r.ctype} transp=${r.hasTransparency ? "sim" : "não"} semiAlpha=${r.semi}`
  );
  console.log(
    `   tinta=${r.inkCount}px silhueta=${r.silCount}px comps=${r.comps} [${r.compSizes.join(",")}] cores: ${r.colors.join(" ")}`
  );
  console.log(
    `   larguras silhueta (5,15,30,50,70,85,95%): ${r.widths.join(",")} · runs topo(5,12,20%): ${r.runs.top.join(",")} · base(95,88,80%): ${r.runs.bot.join(",")}`
  );
  console.log(`   orientação: ${r.orient}${r.texts.length ? " · textos: " + r.texts.join("; ") : ""}`);
}

console.log("\n==== Espelhamento horizontal (hipótese Universal 1–32) ====");
let sum = 0;
for (const [ai, bi] of MIRROR_PAIRS) {
  const a = results[ai - 1];
  const b = results[bi - 1];
  const iou = mirrorIoU(a, b);
  sum += iou;
  console.log(`fdi-${ai}↔fdi-${bi} (FDI ${a.fdi}/${b.fdi}): IoU=${iou.toFixed(3)}`);
}
console.log(`média IoU = ${(sum / MIRROR_PAIRS.length).toFixed(3)}`);

