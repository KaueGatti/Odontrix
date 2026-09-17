/**
 * Tipos derivados de V1__create-database.sql
 * (tabelas: patient, address, responsible, referral_source, referral_type)
 */

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

export interface Responsible {
  fullName: string;
  cpf?: string;
  rg?: string;
}

export interface ReferralSource {
  id: number;
  description: string;
}

/** Tipo de indicação — classifica QUEM indicou o paciente (tabela referral_type) */
export interface ReferralType {
  id: number;
  description: string;
  requiresReferrer: boolean;
}

export interface Patient {
  id: number;
  fullName: string;
  cpf?: string;
  rg?: string;
  landlinePhone: string;
  cellPhone: string;
  emergencyPhone: string;
  email?: string;
  birthDate: string;
  address: Address;
  referralSource: ReferralSource;
  /** Opcional — quando informado, `referredByName` é obrigatório se requiresReferrer = true */
  referralType?: ReferralType;
  /** Nome de quem indicou o paciente */
  referredByName?: string;
  active: boolean;
  responsible?: Responsible;
  createdAt: string;
}
