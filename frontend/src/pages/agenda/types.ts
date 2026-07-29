import type { AppointmentStatus } from "@/types/appointment";

export type ViewMode = "mes" | "semana" | "dia";

export interface DentistAgenda {
  id: string;
  name: string;
  specialty: string;
  color: string;
  workHours: { start: string; end: string };
  isActive: boolean;
}

export interface FilterState {
  specialties: string[];
  patientNames: string[];
  dentistIds: string[];
  statusList: AppointmentStatus[];
  typeList: string[];
}

export const SPECIALTIES = [
  "Ortodontia",
  "Implante",
  "Dentística",
  "Periodontia",
  "Endodontia",
];
