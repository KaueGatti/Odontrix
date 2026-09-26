/** Tipos da tela de atendimento / finalização de consulta. */

/** Faces canônicas de um dente no odontograma:
 *  M = mesial, D = distal, O = oclusal/incisal, V = vestibular, L = lingual/palatina. */
export type ToothFace = "M" | "D" | "O" | "V" | "L";

export interface ProcedimentoRealizado {
  id: string;
  nome: string;
  /** Dentes envolvidos (notação FDI), opcional. */
  dentes: number[];
  /** Faces marcadas por dente (chave = FDI). Vazio/ausente = dente inteiro. */
  faces?: Record<number, ToothFace[]>;
  valorCents: number;
  descontoCents: number;
  valorFinalCents: number;
  obs?: string;
}

export interface AnamneseData {
  alergias: string;
  medicamentos: string;
  doencas: string;
}

export interface AnamneseHistorico {
  data: string;
  anamnese: AnamneseData;
}

export type AnexoIcone = "radiografia" | "foto" | "arquivo";

export interface AnexoItem {
  id: string;
  nome: string;
  tipo: string;
  icone: AnexoIcone;
  tamanho: string;
}
