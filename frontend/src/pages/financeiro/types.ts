export type PaymentStatus = "pago" | "pendente" | "atrasado" | "a_vencer" | "cancelado";
export type PaymentType = "receber" | "pagar";
export type PaymentMethod = "dinheiro" | "debito" | "credito" | "boleto";

export interface ProximoVencimento {
  id: string;
  type: PaymentType;
  descricao: string;
  vencimento: string;
  valor: string;
  status: PaymentStatus;
}

export interface Recebivel {
  id: string;
  paciente: string;
  consulta: string;
  parcela: string;
  valor: string;
  vencimento: string;
  status: PaymentStatus;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  centroCusto: string;
  valor: string;
  vencimento: string;
  status: PaymentStatus;
}

export interface KpiFinanceiro {
  label: string;
  value: string;
  sub: string;
}
