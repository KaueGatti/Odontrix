/**
 * Decodificador PNG minimalista (bit depth 8, sem interlace) usando apenas
 * módulos nativos do Node — nenhuma dependência externa.
 *
 * Usado pelos scripts de vetorização dos dentes (scripts/tooth-svg).
 * Suporta colortypes 0 (gray), 2 (rgb), 3 (palette), 4 (gray+alpha), 6 (rgba)
 * e retorna { w, h, ctype, texts, rgba: Uint8Array(w*h*4) }.
 */
import fs from "node:fs";
import zlib from "node:zlib";

const PNG_SIG = 0x89504e47;

export function decodePng(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== PNG_SIG) throw new Error(`${file}: não é um PNG`);

  let off = 8;
  let w = 0;
  let h = 0;
  let depth = 0;
  let ctype = 0;
  let interlace = 0;
  const idat = [];
  let plte = null;
  let trns = null;
  const texts = [];

  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("latin1", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    switch (type) {
      case "IHDR":
        w = data.readUInt32BE(0);
        h = data.readUInt32BE(4);
        depth = data[8];
        ctype = data[9];
        interlace = data[12];
        break;
      case "PLTE":
        plte = data;
        break;
      case "tRNS":
        trns = data;
        break;
      case "IDAT":
        idat.push(data);
        break;
      case "tEXt": {
        const z = data.indexOf(0);
        if (z > 0) {
          texts.push(
            `${data.toString("latin1", 0, z)}=${data.toString("latin1", z + 1)}`
          );
        }
        break;
      }
      default:
        break;
    }
    off += 12 + len;
  }

  if (depth !== 8) throw new Error(`${file}: bit depth ${depth} não suportado`);
  if (interlace) throw new Error(`${file}: PNG interlaced não suportado`);
  const nch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype];
  if (!nch) throw new Error(`${file}: colortype ${ctype} não suportado`);

  // Infla os scanlines e desfaz os filtros PNG (None/Sub/Up/Average/Paeth).
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * nch;
  const img = Buffer.alloc(h * stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[p++];
    const rowStart = y * stride;
    const prevRow = rowStart - stride;
    for (let x = 0; x < stride; x++) {
      const v = raw[p + x];
      const a = x >= nch ? img[rowStart + x - nch] : 0;
      const b = y > 0 ? img[prevRow + x] : 0;
      const c = x >= nch && y > 0 ? img[prevRow + x - nch] : 0;
      let f;
      if (ft === 0) f = v;
      else if (ft === 1) f = (v + a) & 255;
      else if (ft === 2) f = (v + b) & 255;
      else if (ft === 3) f = (v + ((a + b) >> 1)) & 255;
      else {
        const q = a + b - c;
        const pa = Math.abs(q - a);
        const pb = Math.abs(q - b);
        const pc = Math.abs(q - c);
        f = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
      img[rowStart + x] = f;
    }
    p += stride;
  }

  // Normaliza para RGBA.
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const s = i * nch;
    const d = i * 4;
    if (ctype === 6) {
      rgba[d] = img[s];
      rgba[d + 1] = img[s + 1];
      rgba[d + 2] = img[s + 2];
      rgba[d + 3] = img[s + 3];
    } else if (ctype === 2) {
      rgba[d] = img[s];
      rgba[d + 1] = img[s + 1];
      rgba[d + 2] = img[s + 2];
      rgba[d + 3] = 255;
    } else if (ctype === 0) {
      rgba[d] = img[s];
      rgba[d + 1] = img[s];
      rgba[d + 2] = img[s];
      rgba[d + 3] = 255;
    } else if (ctype === 4) {
      rgba[d] = img[s];
      rgba[d + 1] = img[s];
      rgba[d + 2] = img[s];
      rgba[d + 3] = img[s + 1];
    } else {
      const idx = img[s];
      rgba[d] = plte[idx * 3];
      rgba[d + 1] = plte[idx * 3 + 1];
      rgba[d + 2] = plte[idx * 3 + 2];
      rgba[d + 3] = trns && idx < trns.length ? trns[idx] : 255;
    }
  }
  return { w, h, ctype, texts, rgba };
}
