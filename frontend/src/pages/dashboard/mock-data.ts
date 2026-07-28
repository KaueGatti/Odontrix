import type {
  KpiData,
  StatItem,
  MiniListItem,
  RankItem,
  AppointmentRow,
  TreatmentProgress,
  WaitingPatient,
  FreeSlot,
} from "./types";

export const MOCK_MANAGER_KPIS: KpiData[] = [
  { label: "Total recebido", value: "R$ 24.780" },
  { label: "Total gasto", value: "R$ 8.930" },
  { label: "Consultas realizadas", value: "142" },
  { label: "Novos pacientes", value: "18" },
  { label: "Cancelamento / no-show", value: "9,2%" },
  { label: "Inadimplência total", value: "R$ 3.140" },
];

export const MOCK_MANAGER_DENTIST_RANK: RankItem[] = [
  { position: 1, name: "Dr. Marcos Silva", value: "R$ 9.200 · 38 consultas", barWidth: 92, isTop: true },
  { position: 2, name: "Dra. Camila Rocha", value: "R$ 7.400 · 31 consultas", barWidth: 74 },
  { position: 3, name: "Dr. Felipe Trigo", value: "R$ 5.800 · 24 consultas", barWidth: 58 },
];

export const MOCK_MANAGER_RECEPTIONIST_RANK: RankItem[] = [
  { position: 1, name: "Juliana Ramos", value: "76 agendamentos", barWidth: 88, isTop: true },
  { position: 2, name: "Pedro Alves", value: "53 agendamentos", barWidth: 61 },
];

export const MOCK_MANAGER_COST_CENTERS: StatItem[] = [
  { label: "Aluguel", value: "R$ 3.200", dotColor: "bg-blue-500" },
  { label: "Salários", value: "R$ 4.100", dotColor: "bg-amber-500" },
  { label: "Materiais", value: "R$ 1.280", dotColor: "bg-red-400" },
  { label: "Outros", value: "R$ 350", dotColor: "bg-muted-foreground/50" },
];

export const MOCK_MANAGER_STATUS: StatItem[] = [
  { label: "Realizadas", value: "142", dotColor: "bg-green-500" },
  { label: "Confirmadas", value: "21", dotColor: "bg-blue-500" },
  { label: "Agendadas", value: "34", dotColor: "bg-muted-foreground/50" },
  { label: "Canceladas", value: "15", dotColor: "bg-red-400" },
];

export const MOCK_MANAGER_APPT_TYPES: MiniListItem[] = [
  { name: "Consulta de rotina", count: 58 },
  { name: "Retorno", count: 44 },
  { name: "Emergência", count: 21 },
  { name: "Avaliação", count: 19 },
];

export const MOCK_MANAGER_PROCEDURES: MiniListItem[] = [
  { name: "Limpeza (Profilaxia)", count: 39 },
  { name: "Restauração em resina", count: 27 },
  { name: "Aplicação de flúor", count: 22 },
  { name: "Extração simples", count: 11 },
];

export const MOCK_DENTIST_KPIS: KpiData[] = [
  { label: "Consultas hoje", value: "8", sub: "2 já realizadas" },
  { label: "Consultas esta semana", value: "31" },
  { label: "Tratamentos em andamento", value: "6" },
];

export const MOCK_DENTIST_TODAY: AppointmentRow[] = [
  { time: "09:00", patient: "Marina T. Souza", type: "Consulta de rotina", status: "realizada" },
  { time: "10:15", patient: "Kauê V. Gatti", type: "Consulta de rotina", status: "confirmado", isCurrent: true },
  { time: "11:10", patient: "Roberto C. Lima", type: "Retorno", status: "confirmado" },
  { time: "14:00", patient: "Ana Lucia M.", type: "Emergência", status: "agendado" },
  { time: "15:30", patient: "Paulo Henrique", type: "Procedimento", status: "a_confirmar" },
];

export const MOCK_DENTIST_TREATMENTS: TreatmentProgress[] = [
  { patientName: "Kauê V. Gatti", currentStep: 2, totalSteps: 3, nextStep: "avaliar dente 37", recommendedDate: "20/06/2025" },
  { patientName: "Marina T. Souza", currentStep: 1, totalSteps: 4, nextStep: "canal no dente 26", recommendedDate: "02/06/2025" },
  { patientName: "Paulo Henrique", currentStep: 3, totalSteps: 4, nextStep: "restauração final", recommendedDate: "28/05/2025" },
];

export const MOCK_RECEPTIONIST_KPIS: KpiData[] = [
  { label: "Total a receber hoje", value: "R$ 2.500,00" },
  { label: "Pagamentos a cobrar", value: "7", sub: "parcelas pendentes hoje" },
  { label: "Consultas hoje", value: "24" },
  { label: "A confirmar", value: "5" },
];

export const MOCK_RECEPTIONIST_TODAY: AppointmentRow[] = [
  { time: "09:00", patient: "Marina T. Souza", dentist: "Dr. Marcos Silva", status: "confirmado" },
  { time: "09:40", patient: "Roberto C. Lima", dentist: "Dra. Camila Rocha", status: "a_confirmar" },
  { time: "10:15", patient: "Kauê V. Gatti", dentist: "Dr. Marcos Silva", status: "confirmado" },
  { time: "11:00", patient: "Ana Lucia M.", dentist: "Dr. Felipe Trigo", status: "agendado" },
  { time: "14:00", patient: "Paulo Henrique", dentist: "Dra. Camila Rocha", status: "a_confirmar" },
];

export const MOCK_RECEPTIONIST_WAITING: WaitingPatient[] = [
  { initials: "MS", name: "Marina T. Souza", appointment: "09:00 com Dr. Marcos Silva", arrivedAt: "08:52" },
  { initials: "KG", name: "Kauê V. Gatti", appointment: "10:15 com Dr. Marcos Silva", arrivedAt: "09:58" },
];

export const MOCK_RECEPTIONIST_FREE_SLOTS: FreeSlot[] = [
  { dentistName: "Dr. Marcos Silva", isAvailable: true, nextTime: "15:40" },
  { dentistName: "Dra. Camila Rocha", isAvailable: true, nextTime: "13:20" },
  { dentistName: "Dr. Felipe Trigo", isAvailable: false, nextTime: "Amanhã, 08:00" },
];
