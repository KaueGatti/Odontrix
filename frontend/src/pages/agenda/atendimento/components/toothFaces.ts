import type { ToothFace } from "../types";

/**
 * Metadados das faces canônicas do odontograma e nome anatômico dos dentes
 * FDI. Arquivo separado de Odontograma.tsx para não quebrar o fast refresh
 * (react-refresh/only-export-components).
 */

/** Faces canônicas exibidas no painel (O = oclusal/incisal, L = lingual/palatina). */
export const TOOTH_FACES: { key: ToothFace; short: string; label: string }[] = [
  { key: "M", short: "M", label: "Mesial" },
  { key: "D", short: "D", label: "Distal" },
  { key: "O", short: "O/I", label: "Oclusal / Incisal" },
  { key: "V", short: "V", label: "Vestibular" },
  { key: "L", short: "L/P", label: "Lingual / Palatina" },
];

const TOOTH_TYPE = [
  "",
  "Incisivo central",
  "Incisivo lateral",
  "Canino",
  "Primeiro pré-molar",
  "Segundo pré-molar",
  "Primeiro molar",
  "Segundo molar",
  "Terceiro molar",
];
const ARCH_NAME: Record<number, string> = {
  1: "superior direito",
  2: "superior esquerdo",
  3: "inferior esquerdo",
  4: "inferior direito",
};

/** Nome anatômico do dente FDI (ex.: "Primeiro molar · superior direito"). */
export function toothName(num: number) {
  return `${TOOTH_TYPE[num % 10]} · ${ARCH_NAME[Math.floor(num / 10)]}`;
}
