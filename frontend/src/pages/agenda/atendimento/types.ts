/** Tipos da tela de atendimento / finalização de consulta. */

export interface ProcedimentoRealizado {
  id: string;
  nome: string;
  /** Dentes envolvidos (notação FDI), opcional. */
  dentes: number[];
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
