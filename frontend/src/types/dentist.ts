export interface Dentist {
  id: number;
  userId: number;
  fullName: string;
  cpf?: string | null;
  rg?: string | null;
  cnpj?: string | null;
  croNumber: string;
  croState: string;
  phone: string;
  email?: string | null;
  birthDate?: string | null;
  appointmentPrice?: number | null;
  commissionPercent?: number | null;
  personType: "natural_person" | "legal_entity";
  active: boolean;
  specialtyIds: number[];
  createdAt: string;
  access: {
    username: string;
    email: string;
  };
}

export interface Specialty {
  id: number;
  name: string;
  active: boolean;
}
