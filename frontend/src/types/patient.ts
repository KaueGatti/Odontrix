/**
 * Tipos derivados de V1__create-database.sql
 * (tabelas: patient, address, responsible, referral_source)
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
  active: boolean;
  responsible?: Responsible;
  createdAt: string;
}
