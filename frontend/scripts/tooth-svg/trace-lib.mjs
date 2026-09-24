/**
 * Biblioteca de vetorização usada por scripts/tooth-svg/trace.mjs:
 *  - traceMask: marching squares sobre máscara binária → contornos fechados
 *    (pontos nos centros dos pixels; contornos passam entre pixels vizinhos);
 *  - simplifyLoop / rdp: simplificação Douglas-Peucker de polilinhas;
 *  - roundLoops: arredonda coordenadas (1 casa decimal) e remove duplicatas;
 *  - loopsToPath: loops → path SVG compacto ("Mx y Lx y ... Z", fill-rule evenodd);
 *  - rasterizeLoops: rasteriza os mesmos loops (scanline even-odd) para
 *    verificação de fidelidade (IoU contra a máscara original);
 *  - iou / dilate: métricas de verificação.
 *
 * Sem dependências externas — apenas Node puro.
 */

/**
 * Traça os contornos fechados de uma máscara binária (w×h) via marching
 * squares (convenção "meio-ponto": vértices nos meios das arestas das
 * células, desambiguação de selas pela maioria dos 4 cantos). Retorna
 * loops em coordenadas SVG (pixel (i,j) tem centro em (i+0.5, j+0.5)).
 */
export function traceMask(mask, w, h) {
  const at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? mask[y * w + x] : 0);

  // Segmentos orientados (a região preenchida fica à esquerda do sentido).
  const segs = [];
  for (let y = -1; y <= h; y++) {
    for (let x = -1; x <= w; x++) {
      const tl = at(x, y);
      const tr = at(x + 1, y);
      const br = at(x + 1, y + 1);
      const bl = at(x, y + 1);
      const c = tl | (tr << 1) | (br << 2) | (bl << 3);
      if (c === 0 || c === 15) continue;
      const T = [x + 0.5, y];
      const R = [x + 1, y + 0.5];
      const B = [x + 0.5, y + 1];
      const L = [x, y + 0.5];
      switch (c) {
        case 1:
          segs.push([L, T]);
          break;
        case 2:
          segs.push([T, R]);
          break;
        case 3:
          segs.push([L, R]);
          break;
        case 4:
          segs.push([R, B]);
          break;
        case 6:
          segs.push([T, B]);
          break;
        case 7:
          segs.push([L, B]);
          break;
        case 8:
          segs.push([B, L]);
          break;
        case 9:
          segs.push([B, T]);
          break;
        case 11:
          segs.push([B, R]);
          break;
        case 12:
          segs.push([R, L]);
          break;
        case 13:
          segs.push([R, T]);
          break;
        case 14:
          segs.push([T, L]);
          break;
        case 5: {
          // sela tl+br: majoritário 1 → ilha 0 em tr/bl (R→T e L→B, 1 à esquerda);
          // senão ilas 1 em tl/br (L→T e R→B)
          if (tl + tr + br + bl >= 2) {
            segs.push([R, T]);
            segs.push([L, B]);
          } else {
            segs.push([L, T]);
            segs.push([R, B]);
          }
          break;
        }
        case 10: {
          // sela tr+bl: majoritário 1 → ilha 0 em tl/br; senão ilha 1 em tr/bl
          if (tl + tr + br + bl >= 2) {
            segs.push([T, L]);
            segs.push([B, R]);
          } else {
            segs.push([T, R]);
            segs.push([B, L]);
          }
          break;
        }
        default:
          throw new Error(`marching squares: caso inesperado ${c}`);
      }
    }
  }

  // Costura os segmentos em loops fechados.
  const key = (p) => `${Math.round(p[0] * 2)}:${Math.round(p[1] * 2)}`;
  const byStart = new Map();
  segs.forEach((s, i) => {
    const k = key(s[0]);
    if (!byStart.has(k)) byStart.set(k, []);
    byStart.get(k).push(i);
  });

  const used = new Array(segs.length).fill(false);
  const loops = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    const loop = [];
    let cur = i;
    for (;;) {
      used[cur] = true;
      loop.push(segs[cur][0]);
      const endKey = key(segs[cur][1]);
      const candidates = (byStart.get(endKey) || []).filter((j) => !used[j]);
      if (candidates.length === 0) break;
      cur = candidates[0];
    }
    if (key(loop[0]) !== key(segs[cur][1])) {
      throw new Error("marching squares: contorno não fechou");
    }
    // desloca +0.5: espaço de amostras (centro do pixel) → coordenadas SVG
    loops.push(loop.map(([x, y]) => [x + 0.5, y + 0.5]));
  }
  return loops;
}

function segDist2(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) {
    const ex = p[0] - a[0];
    const ey = p[1] - a[1];
    return ex * ex + ey * ey;
  }
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = a[0] + t * dx - p[0];
  const py = a[1] + t * dy - p[1];
  return px * px + py * py;
}

/** Douglas-Peucker iterativo para polilinha aberta. */
export function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let dmax = -1;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = segDist2(pts[i], pts[s], pts[e]);
      if (d > dmax) {
        dmax = d;
        idx = i;
      }
    }
    if (idx >= 0 && dmax > eps * eps) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  const out = [];
  for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

/** Simplifica um loop fechado: divide no ponto mais distante do primeiro. */
export function simplifyLoop(pts, eps) {
  if (pts.length < 5) return pts;
  let far = 1;
  let fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[0][0];
    const dy = pts[i][1] - pts[0][1];
    const d = dx * dx + dy * dy;
    if (d > fd) {
      fd = d;
      far = i;
    }
  }
  const a = rdp(pts.slice(0, far + 1), eps);
  const b = rdp(pts.slice(far), eps);
  return a.concat(b.slice(1));
}

/** Arredonda para 1 casa decimal e remove pontos consecutivos duplicados. */
export function roundLoops(loops) {
  const out = [];
  for (const loop of loops) {
    const r = [];
    for (const [x, y] of loop) {
      const p = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      const last = r[r.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) r.push(p);
    }
    if (r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1]) r.pop();
    if (r.length >= 3) out.push(r);
  }
  return out;
}

/** Loops → string de path SVG (M/L/Z, coordenadas absolutas compactas). */
export function loopsToPath(loops) {
  let s = "";
  for (const loop of loops) {
    if (loop.length < 3) continue;
    s += `M${loop[0][0]} ${loop[0][1]}`;
    for (let i = 1; i < loop.length; i++) {
      s += `${i === 1 ? "L" : " "}${loop[i][0]} ${loop[i][1]}`;
    }
    s += "Z";
  }
  return s;
}

/** Rasteriza loops (scanline even-odd) em máscara w×h — mesma geometria do path. */
export function rasterizeLoops(loops, w, h) {
  const out = new Uint8Array(w * h);
  const segs = [];
  for (const loop of loops) {
    for (let i = 0; i < loop.length; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % loop.length];
      if (a[1] !== b[1]) segs.push([a[0], a[1], b[0], b[1]]);
    }
  }
  for (let j = 0; j < h; j++) {
    const y = j + 0.5;
    const xs = [];
    for (const [x1, y1, x2, y2] of segs) {
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xStart = Math.max(0, Math.ceil(xs[k] - 0.5));
      const xEnd = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = xStart; x <= xEnd; x++) out[j * w + x] = 1;
    }
  }
  return out;
}

/** Interseção sobre união de duas máscaras w×h. */
export function iou(a, b, w, h) {
  let inter = 0;
  let union = 0;
  for (let i = 0; i < w * h; i++) {
    if (a[i] && b[i]) inter++;
    if (a[i] || b[i]) union++;
  }
  return inter / Math.max(1, union);
}

/** Dilatação 3×3 (janela Chebyshev 1 px). */
export function dilate(mask, w, h) {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dy = -1; dy <= 1 && !v; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && mask[ny * w + nx]) {
            v = 1;
            break;
          }
        }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}
