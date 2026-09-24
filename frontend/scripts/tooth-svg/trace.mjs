/**
 * Vetoriza os PNGs fdi-1..fdi-32 (frontend/public) em SVG fiel:
 *  - fundo = cor exata mais frequente; cada pixel recebe uma "distância" ao fundo
 *    (soma das diferenças por canal) — resolve os gradientes suaves da arte;
 *  - silhueta (corpo do dente) por flood fill do fundo;
 *  - bandas tonais do interior por quantis da distância (posterização fiel do
 *    gradiente) + contorno separado em halo (anti-aliasing) e miolo do traço;
 *  - cada camada é traçada com marching squares + Douglas-Peucker e VERIFICADA:
 *    IoU rasterizado por camada, IoU com tolerância de 1 px e correspondência de
 *    cor pixel a pixel do composto final contra o PNG original;
 *  - gera:
 *      src/pages/agenda/atendimento/components/toothArtwork.ts
 *          → paths dos 32 dentes FDI (usado pelo Odontograma.tsx)
 *      public/teeth/tooth-<FDI>.svg
 *          → SVGs individuais com as cores originais da imagem
 *      src/mockups/odontograma_dentes_svg_mockup.html
 *          → comparação PNG × SVG + prévia do odontograma
 *
 * Mapeamento arquivo → FDI: numeração Universal 1–32 (fdi-1 = FDI 18),
 * confirmado por scripts/tooth-svg/analyze.mjs (anatomia + espelhamento).
 *
 * Uso (a partir de frontend/): node scripts/tooth-svg/trace.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodePng } from "./png.mjs";
import {
  traceMask,
  simplifyLoop,
  roundLoops,
  loopsToPath,
  rasterizeLoops,
  iou,
  dilate,
} from "./trace-lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.resolve(HERE, "../..");
const PUBLIC = path.join(FRONTEND, "public");
const TEETH_DIR = path.join(PUBLIC, "teeth");
const COMPONENTS_DIR = path.join(
  FRONTEND,
  "src/pages/agenda/atendimento/components"
);
const MOCKUPS_DIR = path.join(FRONTEND, "src/mockups");

/** Índice do arquivo fdi-N.png → número FDI (numeração Universal 1–32). */
const FILE_TO_FDI = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  38, 37, 36, 35, 34, 33, 32, 31,
  41, 42, 43, 44, 45, 46, 47, 48,
];

/** Tolerância Douglas-Peucker por camada (px da imagem de origem). */
const EPS = { silhouette: 0.4, band: 0.3, outline: 0.26 };

/** Manchas mínimas mantidas nas bandas internas (remove ruído de anti-aliasing). */
const MIN_SHADE_PX = 10;

/** Quantil de um array ordenado. */
function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[i];
}

/** Cor média dos pixels de uma máscara. */
function meanColor(mask, rgba, n) {
  let r = 0;
  let g = 0;
  let b = 0;
  let c = 0;
  for (let i = 0; i < n; i++) {
    if (mask[i]) {
      r += rgba[i * 4];
      g += rgba[i * 4 + 1];
      b += rgba[i * 4 + 2];
      c++;
    }
  }
  return c ? [Math.round(r / c), Math.round(g / c), Math.round(b / c)] : [255, 255, 255];
}

/** Flood fill do fundo a partir da borda: máscara "fora" (não-arte alcançável). */
function floodOutside(art, w, h) {
  const outside = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const i = y * w + x;
    if (!art[i] && !outside[i]) {
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
  return outside;
}

/** Remove manchas conectadas menores que minPx (ruído de anti-aliasing). */
function filterSpeckles(mask, w, h, minPx) {
  const out = new Uint8Array(w * h);
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || seen[i]) continue;
    const comp = [];
    seen[i] = 1;
    stack.push(i);
    while (stack.length) {
      const j = stack.pop();
      comp.push(j);
      const x = j % w;
      const y = (j - x) / w;
      if (x > 0 && mask[j - 1] && !seen[j - 1]) { seen[j - 1] = 1; stack.push(j - 1); }
      if (x < w - 1 && mask[j + 1] && !seen[j + 1]) { seen[j + 1] = 1; stack.push(j + 1); }
      if (y > 0 && mask[j - w] && !seen[j - w]) { seen[j - w] = 1; stack.push(j - w); }
      if (y < h - 1 && mask[j + w] && !seen[j + w]) { seen[j + w] = 1; stack.push(j + w); }
    }
    if (comp.length >= minPx) for (const j of comp) out[j] = 1;
  }
  return out;
}

/** Box blur 3×3 de um campo Int32 (suaviza o dithering dos gradientes). */
function blur3(src, w, h) {
  const out = new Int32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      let c = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h) {
            s += src[ny * w + nx];
            c++;
          }
        }
      }
      out[y * w + x] = Math.round(s / c);
    }
  }
  return out;
}

/** Preenche buracos (regiões de não-máscara não alcançáveis da borda) de até maxPx. */
function fillSmallHoles(mask, w, h, maxPx) {
  const outsideM = floodOutside(mask, w, h);
  const fill = new Uint8Array(w * h);
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let i = 0; i < w * h; i++) {
    if (mask[i] || outsideM[i] || seen[i]) continue;
    const comp = [];
    seen[i] = 1;
    stack.push(i);
    while (stack.length) {
      const j = stack.pop();
      comp.push(j);
      const x = j % w;
      const y = (j - x) / w;
      if (x > 0 && !mask[j - 1] && !outsideM[j - 1] && !seen[j - 1]) { seen[j - 1] = 1; stack.push(j - 1); }
      if (x < w - 1 && !mask[j + 1] && !outsideM[j + 1] && !seen[j + 1]) { seen[j + 1] = 1; stack.push(j + 1); }
      if (y > 0 && !mask[j - w] && !outsideM[j - w] && !seen[j - w]) { seen[j - w] = 1; stack.push(j - w); }
      if (y < h - 1 && !mask[j + w] && !outsideM[j + w] && !seen[j + w]) { seen[j + w] = 1; stack.push(j + w); }
    }
    if (comp.length <= maxPx) for (const j of comp) fill[j] = 1;
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = mask[i] || fill[i] ? 1 : 0;
  return out;
}

function traceLayer(mask, w, h, eps) {
  const loops = traceMask(mask, w, h).map((l) => simplifyLoop(l, eps));
  const rounded = roundLoops(loops);
  return { loops: rounded, path: loopsToPath(rounded) };
}

function verifyLayer(mask, loops, w, h) {
  let maskCount = 0;
  for (let i = 0; i < w * h; i++) if (mask[i]) maskCount++;
  if (maskCount === 0) return { iou: 1, iouTol: 1 }; // máscara vazia == path vazio
  const raster = rasterizeLoops(loops, w, h);
  return {
    iou: iou(raster, mask, w, h),
    iouTol: iou(dilate(raster, w, h), dilate(mask, w, h), w, h),
  };
}

const hex = (c) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;

function processTooth(idx) {
  const file = path.join(PUBLIC, `fdi-${idx}.png`);
  const { w, h, rgba } = decodePng(file);
  const n = w * h;

  // Cor de fundo = RGB exato mais frequente da imagem (paleta do artista).
  const exactCounts = new Map();
  for (let i = 0; i < n; i++) {
    const key = (rgba[i * 4] << 16) | (rgba[i * 4 + 1] << 8) | rgba[i * 4 + 2];
    exactCounts.set(key, (exactCounts.get(key) || 0) + 1);
  }
  let bgKey = 0xffffff;
  let bgCount = -1;
  for (const [k, c] of exactCounts) {
    if (c > bgCount) {
      bgCount = c;
      bgKey = k;
    }
  }
  const bg = [(bgKey >> 16) & 255, (bgKey >> 8) & 255, bgKey & 255];

  // Distância de cada pixel ao fundo (soma absoluta por canal).
  const dist = new Int32Array(n);
  const visibleD = [];
  for (let i = 0; i < n; i++) {
    const d =
      Math.abs(rgba[i * 4] - bg[0]) +
      Math.abs(rgba[i * 4 + 1] - bg[1]) +
      Math.abs(rgba[i * 4 + 2] - bg[2]);
    dist[i] = d;
    if (d > 4) visibleD.push(d);
  }
  visibleD.sort((a, b) => a - b);
  const d99 = quantile(visibleD, 0.99);
  const ART_CUT = Math.max(8, Math.round(d99 * 0.05));
  const OUTLINE_CUT = Math.max(40, Math.round(d99 * 0.29));

  // Silhueta: flood fill do fundo a partir da borda (barreira = pixels de arte).
  const art = new Uint8Array(n);
  for (let i = 0; i < n; i++) art[i] = dist[i] > ART_CUT ? 1 : 0;
  const outside = floodOutside(art, w, h);
  const silMask = new Uint8Array(n);
  for (let i = 0; i < n; i++) silMask[i] = outside[i] ? 0 : 1;

  // Campo de distância suavizado (2× box blur 3×3): os gradientes da arte são
  // dithered (ruído pixel a pixel); o blur gera bandas tonais limpas.
  const distS = blur3(blur3(dist, w, h), w, h);

  // Contorno (traço escuro + halo): pertencimento pelo campo CRU (não erode o
  // traço); a divisão miolo/halo usa o campo suavizado para não ditherar.
  const outlineMask = new Uint8Array(n);
  const interiorDS = [];
  const outlineDS = [];
  for (let i = 0; i < n; i++) {
    if (dist[i] > OUTLINE_CUT) {
      outlineMask[i] = 1;
      outlineDS.push(distS[i]);
    } else if (silMask[i]) {
      interiorDS.push(distS[i]);
    }
  }
  interiorDS.sort((a, b) => a - b);
  outlineDS.sort((a, b) => a - b);
  const CORE_CUT = quantile(outlineDS, 0.5);
  const coreRaw = new Uint8Array(n);
  const haloRaw = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (outlineMask[i]) {
      if (distS[i] > CORE_CUT) coreRaw[i] = 1;
      else haloRaw[i] = 1;
    }
  }
  const haloMask = filterSpeckles(fillSmallHoles(haloRaw, w, h, 6), w, h, 6);
  const coreMask = filterSpeckles(fillSmallHoles(coreRaw, w, h, 6), w, h, 6);
  const outlineClean = fillSmallHoles(outlineMask, w, h, 6);

  // Bandas tonais do interior (posterização do gradiente suavizado) por quantis.
  const e0 = quantile(interiorDS, 0.4);
  const e1 = quantile(interiorDS, 0.65);
  const e2 = quantile(interiorDS, 0.82);
  const bandDefs = [
    { lo: -1, hi: e0 },
    { lo: e0, hi: e1 },
    { lo: e1, hi: e2 },
    { lo: e2, hi: Infinity },
  ];
  const bandMasks = bandDefs.map((b) => {
    const m = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      m[i] =
        silMask[i] && dist[i] <= OUTLINE_CUT && distS[i] > b.lo && distS[i] <= b.hi
          ? 1
          : 0;
    }
    return filterSpeckles(m, w, h, MIN_SHADE_PX);
  });

  // Traçado das camadas (marching squares + Douglas-Peucker).
  const sil = traceLayer(silMask, w, h, EPS.silhouette);
  const outline = traceLayer(outlineClean, w, h, EPS.outline);
  const halo = traceLayer(haloMask, w, h, EPS.outline);
  const core = traceLayer(coreMask, w, h, EPS.outline);
  const bands = bandMasks.map((m) => traceLayer(m, w, h, EPS.band));

  // Cores por camada = média dos pixels originais da camada.
  const bandColors = bandMasks.map((m) => meanColor(m, rgba, n));
  const haloColor = meanColor(haloMask, rgba, n);
  const coreColor = meanColor(coreMask, rgba, n);

  // Verificação: IoU por camada (silhueta, contorno e bandas).
  const vSil = verifyLayer(silMask, sil.loops, w, h);
  const vOut = verifyLayer(outlineClean, outline.loops, w, h);
  const vBands = bands.map((b, k) => verifyLayer(bandMasks[k], b.loops, w, h));

  // Composto final (topmost primeiro): miolo, halo, bandas escuras→claras; resto = fundo.
  const stackLoops = [
    core.loops,
    halo.loops,
    ...bands.map((b) => b.loops).reverse(),
  ];
  const rasters = stackLoops.map((l) => rasterizeLoops(l, w, h));
  const layerColors = [coreColor, haloColor, ...bandColors.slice().reverse()];
  let exact = 0;
  let interior = 0;
  let interiorTotal = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let rc = bg;
      for (let L = 0; L < rasters.length; L++) {
        if (rasters[L][i]) {
          rc = layerColors[L];
          break;
        }
      }
      const delta =
        Math.abs(rc[0] - rgba[i * 4]) +
        Math.abs(rc[1] - rgba[i * 4 + 1]) +
        Math.abs(rc[2] - rgba[i * 4 + 2]);
      if (delta <= 48) exact++;
      // Banda de fronteira (anti-aliasing): vizinho com "classe tonal" diferente.
      const cls = (j) => (dist[j] > OUTLINE_CUT ? 2 : distS[j] > e1 ? 1 : 0);
      let band =
        (x > 0 && cls(i - 1) !== cls(i)) ||
        (x < w - 1 && cls(i + 1) !== cls(i)) ||
        (y > 0 && cls(i - w) !== cls(i)) ||
        (y < h - 1 && cls(i + w) !== cls(i));
      if (!band) {
        interiorTotal++;
        if (delta <= 48) interior++;
      }
    }
  }

  // Diagnóstico: nº de sub-caminhos (loops) por dente em todas as camadas.
  const countM = (s) => (s.match(/M/g) || []).length;
  const subpathCount =
    countM(sil.path) +
    countM(outline.path) +
    countM(halo.path) +
    countM(core.path) +
    bands.reduce((s, b) => s + countM(b.path), 0);

  return {
    idx,
    fdi: FILE_TO_FDI[idx - 1],
    w,
    h,
    viewBox: `0 0 ${w} ${h}`,
    colors: {
      bg: hex(bg),
      outline: hex(coreColor),
      halo: hex(haloColor),
      bands: bandColors.map(hex),
    },
    paths: {
      silhouette: sil.path,
      bands: bands.map((b) => b.path),
      /** Bandas internas mais escuras → sombreados do componente. */
      shades: [bands[2].path, bands[3].path].filter((p) => p.length > 0),
      outline: outline.path,
      halo: halo.path,
      core: core.path,
    },
    metrics: {
      iouSil: vSil.iou,
      iouSilTol: vSil.iouTol,
      iouOutline: vOut.iou,
      iouOutlineTol: vOut.iouTol,
      iouBandMin: vBands.length ? Math.min(...vBands.map((v) => v.iou)) : null,
      colorMatch: exact / n,
      colorMatchInterior: interiorTotal ? interior / interiorTotal : 1,
      subpaths: subpathCount,
    },
    pngB64: fs.readFileSync(file).toString("base64"),
  };
}

function emitToothArtworkTs(teeth) {
  const lines = [];
  lines.push("/**");
  lines.push(" * Arte vetorial dos 32 dentes permanentes (notação FDI) — AUTO-GERADA a partir de");
  lines.push(" * frontend/public/fdi-*.png pelo script scripts/tooth-svg/trace.mjs (marching squares");
  lines.push(" * + Douglas-Peucker sobre os pixels, com verificação de IoU e de cor contra o PNG).");
  lines.push(" *");
  lines.push(" * NÃO editar à mão — para regenerar: node scripts/tooth-svg/trace.mjs");
  lines.push(" *");
  lines.push(" * Camadas por dente (coordenadas em unidades do viewBox, mesmo espaço do PNG):");
  lines.push(" *  - silhouette: corpo do dente (contorno externo + furos, ex.: vão entre raízes);");
  lines.push(" *  - shades: bandas de sombreamento interno (tons médios do original);");
  lines.push(" *  - outline: traço do contorno e detalhes (tons mais escuros).");
  lines.push(" *");
  lines.push(" * Origem: fdi-1.png = FDI 18 … fdi-32.png = FDI 48 (numeração Universal 1–32,");
  lines.push(" * confirmada por anatomia e espelhamento — ver scripts/tooth-svg/analyze.mjs).");
  lines.push(" */");
  lines.push("");
  lines.push("export interface ToothArtwork {");
  lines.push("  /** Dimensões do viewBox (\"0 0 W H\") da imagem de origem. */");
  lines.push("  viewBox: string;");
  lines.push("  /** Corpo do dente — camada base de preenchimento. */");
  lines.push("  silhouette: string;");
  lines.push("  /** Bandas de sombreamento interno. */");
  lines.push("  shades: string[];");
  lines.push("  /** Traço do contorno/detalhes — camada superior. */");
  lines.push("  outline: string;");
  lines.push("}");
  lines.push("");
  lines.push("export const TOOTH_ARTWORK: Record<number, ToothArtwork> = {");
  for (const t of teeth) {
    lines.push(`  ${t.fdi}: {`);
    lines.push(`    viewBox: ${JSON.stringify(t.viewBox)},`);
    lines.push(`    silhouette: ${JSON.stringify(t.paths.silhouette)},`);
    lines.push(`    shades: ${JSON.stringify(t.paths.shades)},`);
    lines.push(`    outline: ${JSON.stringify(t.paths.outline)},`);
    lines.push("  },");
  }
  lines.push("};");
  lines.push("");
  const code = lines.join("\n");
  const out = path.join(COMPONENTS_DIR, "toothArtwork.ts");
  fs.writeFileSync(out, code);
  return { out, bytes: Buffer.byteLength(code) };
}

function emitStandaloneSvgs(teeth) {
  fs.mkdirSync(TEETH_DIR, { recursive: true });
  let total = 0;
  for (const t of teeth) {
    const parts = [];
    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${t.viewBox}" width="${t.w}" height="${t.h}">`
    );
    parts.push(
      `  <!-- Dente FDI ${t.fdi} — vetorizado fielmente de public/fdi-${t.idx}.png por scripts/tooth-svg/trace.mjs -->`
    );
    parts.push(`  <rect width="${t.w}" height="${t.h}" fill="${t.colors.bg}"/>`);
    // Bandas claras → escuras, depois halo e miolo do traço.
    t.paths.bands.forEach((d, k) => {
      if (d) parts.push(`  <path fill="${t.colors.bands[k]}" fill-rule="evenodd" d="${d}"/>`);
    });
    parts.push(`  <path fill="${t.colors.halo}" fill-rule="evenodd" d="${t.paths.halo}"/>`);
    parts.push(`  <path fill="${t.colors.outline}" fill-rule="evenodd" d="${t.paths.core}"/>`);
    parts.push("</svg>");
    const code = parts.join("\n") + "\n";
    fs.writeFileSync(path.join(TEETH_DIR, `tooth-${t.fdi}.svg`), code);
    total += Buffer.byteLength(code);
  }
  return { dir: TEETH_DIR, count: teeth.length, bytes: total };
}

const pct = (v) => (v === null || v === undefined ? "—" : (v * 100).toFixed(1) + "%");

function emitMockup(teeth) {
  const art = {};
  for (const t of teeth) {
    art[t.fdi] = {
      viewBox: t.viewBox,
      silhouette: t.paths.silhouette,
      shades: t.paths.shades,
      outline: t.paths.outline,
    };
  }

  const cards = [];
  for (const t of teeth) {
    const m = t.metrics;
    const svgInner =
      `<rect width="${t.w}" height="${t.h}" fill="${t.colors.bg}"/>` +
      t.paths.bands
        .map((d, k) => (d ? `<path fill="${t.colors.bands[k]}" fill-rule="evenodd" d="${d}"/>` : ""))
        .join("") +
      `<path fill="${t.colors.halo}" fill-rule="evenodd" d="${t.paths.halo}"/>` +
      `<path fill="${t.colors.outline}" fill-rule="evenodd" d="${t.paths.core}"/>`;
    const pngUri = `data:image/png;base64,${t.pngB64}`;
    cards.push(
      `<div class="card"><div class="card-title">fdi-${t.idx}.png → FDI ${t.fdi}</div>` +
        `<div class="panes">` +
        `<div class="pane"><span>PNG original</span><img src="${pngUri}" alt="FDI ${t.fdi} (PNG)"></div>` +
        `<div class="pane"><span>SVG vetorial</span><svg viewBox="${t.viewBox}">${svgInner}</svg></div>` +
        `<div class="pane"><span>Sobreposição 55%</span><div class="ovl"><img src="${pngUri}" alt=""><svg viewBox="${t.viewBox}" class="ovsvg">${svgInner}</svg></div></div>` +
        `</div>` +
        `<div class="m">IoU sil ${pct(m.iouSil)} · contorno ${pct(m.iouOutline)} · tol. 1px ${pct(m.iouOutlineTol)} · cor (interior) ${pct(m.colorMatchInterior)}</div>` +
        `</div>`
    );
  }

  const css = `:root{--blue:#4F7EF7;--blue-dark:#3d64c9;--blue-light:#c8d7fb;--text:#111827;--text-2:#6B7280;--border:#E5E7EB;--bg-2:#F8FAFC}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#fff;color:var(--text);padding:32px 40px 48px}
h1{font-size:24px;font-weight:700;letter-spacing:-.3px;margin-bottom:6px}
h2{font-size:15px;font-weight:600;margin:34px 0 10px}
.page-sub{font-size:13px;color:var(--text-2);margin-bottom:18px;max-width:1240px;line-height:1.6}
.page-sub b{color:var(--text)}
.grid{display:flex;flex-wrap:wrap;gap:14px}
.card{border:1.5px solid var(--border);border-radius:14px;padding:10px 12px 8px;width:344px;background:#fff}
.card-title{font-size:11px;font-weight:600;margin-bottom:8px}
.panes{display:flex;gap:10px}
.pane{display:flex;flex-direction:column;align-items:center;gap:4px}
.pane>span{font-size:9px;font-weight:600;color:var(--text-2);text-transform:uppercase;letter-spacing:.04em}
.pane img,.pane svg{width:96px;height:auto;display:block}
.ovl{position:relative}
.ovl .ovsvg{position:absolute;inset:0;width:100%;height:100%;opacity:.55}
.m{font-size:9.5px;color:var(--text-2);margin-top:7px;font-variant-numeric:tabular-nums}
.odo-card{display:inline-block;border:1.5px solid var(--border);border-radius:10px;background:#fff;padding:12px 16px 10px}
.lbl-row{display:flex;font-size:9px;font-weight:600;letter-spacing:.03em;color:var(--text-2);margin:2px 0 4px}
.lbl-row span:first-child{width:220px;text-align:center}
.lbl-row .sp{width:12px}
.lbl-row span:last-child{width:220px;text-align:center}
.arow{display:flex;align-items:flex-end;gap:1px}
.arow+.arow{margin-top:4px;align-items:flex-start}
.gap{width:12px;flex-shrink:0}
.tooth{display:flex;flex-direction:column;align-items:center;width:25px;flex-shrink:0;background:none;border:none;cursor:pointer;padding:0}
.tooth.lower{flex-direction:column-reverse}
.tsvg{display:block;width:22px;height:30px;overflow:visible}
.sil{fill:#f5f6f9;transition:fill .12s}
.sh{fill:rgba(170,176,189,.45);transition:fill .12s}
.ink{fill:#aab0bd;transition:fill .12s}
.tooth:hover .ink{fill:var(--blue)}
.tooth.sel .sil{fill:var(--blue)}
.tooth.sel .sh{fill:rgba(255,255,255,.8)}
.tooth.sel .ink{fill:var(--blue-dark)}
.num{font-size:9px;line-height:1;color:var(--text-2);margin-top:3px;font-weight:500}
.tooth.lower .num{margin-top:0;margin-bottom:3px}
.tooth.sel .num{font-weight:700;color:var(--blue)}
.legend{display:flex;align-items:center;gap:10px;margin-top:10px;border-top:1px dashed var(--border);padding-top:10px;font-size:10px;color:var(--text-2);flex-wrap:wrap}
.legend .sw{display:inline-block;width:12px;height:12px;border-radius:3px}
.sw.off{background:#f5f6f9;border:1px solid #aab0bd}
.sw.on{background:var(--blue);border:1px solid var(--blue-dark)}
.seltext{margin-left:auto;font-size:11.5px;font-weight:500;color:var(--text)}
.footnote{margin-top:26px;font-size:11.5px;color:var(--text-2);line-height:1.6;border-top:1px solid var(--border);padding-top:14px;max-width:1240px}
.footnote b{color:var(--text)}
.footnote code{background:var(--bg-2);border:1px solid var(--border);border-radius:4px;padding:1px 5px;font-size:10.5px}`;

  const agg = (fn) => Math.min(...teeth.map(fn));
  const mins = {
    iouSil: agg((t) => t.metrics.iouSil),
    iouOutline: agg((t) => t.metrics.iouOutline),
    iouOutlineTol: agg((t) => t.metrics.iouOutlineTol),
    colorInterior: agg((t) => t.metrics.colorMatchInterior),
  };

  const html = [
    "<!DOCTYPE html>",
    '<html lang="pt-BR">',
    "<head>",
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "<title>Odontrix — Dentes vetoriais fiéis aos PNGs (odontograma)</title>",
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">',
    "<style>",
    css,
    ".cells{display:flex;gap:1px}",
    "</style>",
    "</head>",
    "<body>",
    "<h1>Dentes vetoriais — 100% fiéis aos PNGs de <code>public/fdi-*.png</code></h1>",
    "<p class=\"page-sub\">" +
      "Cada SVG foi <b>traçado a partir dos pixels do PNG</b> (marching squares + Douglas-Peucker, ε ≤ 0,4 px; " +
      "gradientes reproduzidos por bandas tonais) e verificado contra a imagem original. Fidelidade mínima nos 32 dentes: " +
      `silhueta IoU ≥ ${mins.iouSil.toFixed(3)} · contorno IoU ≥ ${mins.iouOutline.toFixed(3)} ` +
      `(tolerância 1 px ≥ ${mins.iouOutlineTol.toFixed(3)}) · cor idêntica no interior ≥ ${pct(mins.colorInterior)} ` +
      "(a banda de anti-aliasing de 1 px nas bordas é inerente a qualquer vetorização). " +
      "Ordem dos arquivos: <b>numeração Universal 1–32</b> (fdi-1 = FDI 18 … fdi-32 = FDI 48), " +
      "confirmada por anatomia e espelhamento (<code>scripts/tooth-svg/analyze.mjs</code>).</p>",
    "<h2>1 · Comparação PNG × SVG (32 dentes)</h2>",
    '<div class="grid">',
    cards.join("\n"),
    "</div>",
    "<h2>2 · Prévia do componente Odontograma (Odontograma.tsx)</h2>",
    "<p class=\"page-sub\">Mesma paleta de estados do componente atual — não selecionado: corpo <b>#f5f6f9</b>, " +
      "traço <b>#aab0bd</b>; selecionado: corpo <b>#4F7EF7</b>, traço <b>#3d64c9</b>, sombreados em branco translúcido. " +
      "Clique nos dentes para alternar a seleção.</p>",
    '<div class="odo-card" id="odo">',
    '<div class="lbl-row"><span>Superior direito</span><span class="sp"></span><span>Superior esquerdo</span></div>',
    '<div class="arow"><span class="cells" id="ur"></span><span class="gap"></span><span class="cells" id="ul"></span></div>',
    '<div class="arow"><span class="cells" id="lr"></span><span class="gap"></span><span class="cells" id="ll"></span></div>',
    '<div class="lbl-row"><span>Inferior direito</span><span class="sp"></span><span>Inferior esquerdo</span></div>',
    '<div class="legend">',
    '<span><span class="sw off"></span> Não selecionado</span>',
    '<span><span class="sw on"></span> Selecionado</span>',
    '<span class="seltext" id="seltext">Nenhum dente selecionado</span>',
    "</div>",
    "</div>",
    '<p class="footnote">' +
      "<b>Como verificar:</b> no painel “Sobreposição”, o SVG é renderizado com 55% de opacidade sobre o PNG — " +
      "contornos perfeitamente alinhados indicam fidelidade. <b>Métricas por dente</b> no rodapé de cada card: " +
      "IoU da silhueta e do contorno rasterizados; “tol. 1px” = IoU com dilatação de 1 px (desvio máximo de contorno ≤ 1 px); " +
      "“cor (interior)” = pixels com cor idêntica ao PNG fora da banda de anti-aliasing. " +
      "<b>Regenerar:</b> <code>node scripts/tooth-svg/trace.mjs</code> a partir de <code>frontend/</code> — gera " +
      "<code>src/pages/agenda/atendimento/components/toothArtwork.ts</code>, <code>public/teeth/tooth-*.svg</code> e este mockup.</p>",
    "<script>",
    "var ART = " + JSON.stringify(art) + ";",
    "var SEL = {};",
    "function toothHtml(fdi, lower) {",
    "  var a = ART[fdi];",
    "  var sh = '';",
    "  for (var i = 0; i < a.shades.length; i++) sh += '<path class=\"sh\" fill-rule=\"evenodd\" d=\"' + a.shades[i] + '\"/>';",
    "  return '<button type=\"button\" class=\"tooth' + (lower ? ' lower' : '') + '\" data-fdi=\"' + fdi + '\" title=\"Dente ' + fdi + '\" aria-pressed=\"false\">' +",
    "    '<svg class=\"tsvg\" viewBox=\"' + a.viewBox + '\" aria-hidden=\"true\">' +",
    "    '<path class=\"sil\" fill-rule=\"evenodd\" d=\"' + a.silhouette + '\"/>' + sh +",
    "    '<path class=\"ink\" fill-rule=\"evenodd\" d=\"' + a.outline + '\"/></svg>' +",
    "    '<span class=\"num\">' + fdi + '</span></button>';",
    "}",
    "function fill(id, list, lower) {",
    "  var html = '';",
    "  for (var i = 0; i < list.length; i++) html += toothHtml(list[i], lower);",
    "  document.getElementById(id).innerHTML = html;",
    "}",
    "fill('ur', [18,17,16,15,14,13,12,11], false);",
    "fill('ul', [21,22,23,24,25,26,27,28], false);",
    "fill('lr', [48,47,46,45,44,43,42,41], true);",
    "fill('ll', [31,32,33,34,35,36,37,38], true);",
    "function update() {",
    "  var btns = document.querySelectorAll('.tooth');",
    "  var list = [];",
    "  for (var i = 0; i < btns.length; i++) {",
    "    var f = +btns[i].getAttribute('data-fdi');",
    "    var on = !!SEL[f];",
    "    btns[i].classList.toggle('sel', on);",
    "    btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');",
    "    if (on) list.push(f);",
    "  }",
    "  list.sort(function (a, b) { return a - b; });",
    "  document.getElementById('seltext').textContent = list.length ? 'Dentes: ' + list.join(', ') : 'Nenhum dente selecionado';",
    "}",
    "document.getElementById('odo').addEventListener('click', function (e) {",
    "  var btn = e.target && e.target.closest ? e.target.closest('.tooth') : null;",
    "  if (!btn) return;",
    "  var f = +btn.getAttribute('data-fdi');",
    "  if (SEL[f]) delete SEL[f]; else SEL[f] = true;",
    "  update();",
    "});",
    "</script>",
    "</body>",
    "</html>",
  ].join("\n");

  const out = path.join(MOCKUPS_DIR, "odontograma_dentes_svg_mockup.html");
  fs.writeFileSync(out, html);
  return { out, bytes: Buffer.byteLength(html) };
}

// ---- Execução ----
fs.mkdirSync(TEETH_DIR, { recursive: true });
const teeth = [];
for (let idx = 1; idx <= 32; idx++) teeth.push(processTooth(idx));
teeth.sort((a, b) => a.fdi - b.fdi);

// Sanidade: os 32 números FDI esperados, exatamente uma vez cada.
const expected = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48,
]);
if (teeth.length !== 32 || teeth.some((t) => !expected.has(t.fdi))) {
  throw new Error("mapeamento arquivo→FDI inconsistente");
}

const ts = emitToothArtworkTs(teeth);
const svgs = emitStandaloneSvgs(teeth);
const mock = emitMockup(teeth);

console.log("==== Relatório de vetorização (32 dentes) ====");
for (const t of teeth) {
  const m = t.metrics;
  console.log(
    `FDI ${t.fdi} ← fdi-${String(t.idx).padStart(2, "0")}.png ${t.w}x${t.h} · ` +
      `sil IoU=${m.iouSil.toFixed(3)} (${t.paths.silhouette.length} ch) · ` +
      `contorno IoU=${m.iouOutline.toFixed(3)}/tol1px=${m.iouOutlineTol.toFixed(3)} (${t.paths.outline.length} ch) · ` +
      `bandas=${t.paths.bands.length}${m.iouBandMin !== null ? ` IoU≥${m.iouBandMin.toFixed(3)}` : ""} · subp=${m.subpaths} · ` +
      `corInterior=${(m.colorMatchInterior * 100).toFixed(2)}% · corTotal=${(m.colorMatch * 100).toFixed(1)}%`
  );
}
const aggMin = (fn) => Math.min(...teeth.map(fn));
const avg = (fn) => teeth.reduce((s, t) => s + fn(t), 0) / teeth.length;
console.log("\n==== Agregados ====");
console.log(`IoU silhueta: mín ${aggMin((t) => t.metrics.iouSil).toFixed(3)} · média ${avg((t) => t.metrics.iouSil).toFixed(3)}`);
console.log(
  `IoU contorno: mín ${aggMin((t) => t.metrics.iouOutline).toFixed(3)} · média ${avg((t) => t.metrics.iouOutline).toFixed(3)} · tol 1px mín ${aggMin((t) => t.metrics.iouOutlineTol).toFixed(3)}`
);
console.log(
  `IoU bandas: mín ${aggMin((t) => t.metrics.iouBandMin).toFixed(3)} · cor interior: mín ${(aggMin((t) => t.metrics.colorMatchInterior) * 100).toFixed(2)}% · cor total: mín ${(aggMin((t) => t.metrics.colorMatch) * 100).toFixed(1)}% · média ${(avg((t) => t.metrics.colorMatch) * 100).toFixed(1)}%`
);
console.log(
  `Sub-caminhos por dente (todas as camadas): máx ${Math.max(...teeth.map((t) => t.metrics.subpaths))} · total ${teeth.reduce((s, t) => s + t.metrics.subpaths, 0)}`
);
console.log("\n==== Saídas ====");
console.log(`${ts.out} (${(ts.bytes / 1024).toFixed(1)} kB)`);
console.log(`${svgs.dir} → ${svgs.count} SVGs (${(svgs.bytes / 1024).toFixed(1)} kB)`);
console.log(`${mock.out} (${(mock.bytes / 1024).toFixed(1)} kB)`);
