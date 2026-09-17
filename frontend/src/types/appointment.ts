export type AppointmentStatus =
  | "agendada"
  | "confirmada"
  | "em_espera"
  | "em_atendimento"
  | "realizada"
  | "cancelada"
  | "nao_compareceu";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  status: AppointmentStatus;
  type: string;
  notes?: string;
}

export type AppointmentType =
  | "consulta"
  | "retorno"
  | "procedimento"
  | "emergencia"
  | "avaliacao"
  | "implante"
  | "manutencao";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendada: "Agendada",
  confirmada: "Confirmada",
  em_espera: "Em espera",
  em_atendimento: "Em atendimento",
  realizada: "Atendido",
  cancelada: "Cancelada",
  nao_compareceu: "Não compareceu",
};
