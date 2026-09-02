export type BoletoStatus =
  | "issued"
  | "registered"
  | "paid"
  | "overdue"
  | "cancelled";

export interface Boleto {
  id: string;
  paciente: string;
  parcela: string;
  nossoNumero: string;
  /** Valor em centavos (inteiro). */
  valorCents: number;
  /** DD/MM/AAAA */
  vencimento: string;
  /** DD/MM/AAAA */
  emitidoEm: string;
  /** DD/MM/AAAA (presente quando registrado no banco) */
  registradoEm?: string;
  /** DD/MM/AAAA (presente quando pago) */
  pagoEm?: string;
  /** DD/MM/AAAA (presente quando cancelado) */
  canceladoEm?: string;
  linhaDigitable: string;
  status: BoletoStatus;
}