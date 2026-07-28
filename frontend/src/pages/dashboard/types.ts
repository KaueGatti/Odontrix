export interface KpiData {
  value: string;
  label: string;
  sub?: string;
}

export interface StatItem {
  label: string;
  value: string;
  dotColor: string;
}

export interface MiniListItem {
  name: string;
  count: number;
}

export interface RankItem {
  position: number;
  name: string;
  value: string;
  barWidth: number;
  isTop?: boolean;
}

export interface AppointmentRow {
  time: string;
  patient: string;
  type?: string;
  dentist?: string;
  status: "realizada" | "confirmado" | "agendado" | "a_confirmar";
  isCurrent?: boolean;
}

export interface TreatmentProgress {
  patientName: string;
  currentStep: number;
  totalSteps: number;
  nextStep: string;
  recommendedDate: string;
}

export interface WaitingPatient {
  initials: string;
  name: string;
  appointment: string;
  arrivedAt: string;
}

export interface FreeSlot {
  dentistName: string;
  isAvailable: boolean;
  nextTime: string;
}
