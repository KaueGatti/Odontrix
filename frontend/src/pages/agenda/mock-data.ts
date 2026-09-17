import type { Appointment, AppointmentStatus } from "@/types/appointment";
import type { DentistAgenda } from "@/pages/agenda/types";

// A lista de nomes de pacientes (comboboxes) e o registro de pacientes
// cadastrados em runtime vivem em `@/pages/patients/mock-data`.

export const MOCK_DENTISTS: DentistAgenda[] = [
  {
    id: "marcos",
    name: "Dr. Marcos Silva",
    specialty: "Ortodontia",
    color: "#4F7EF7",
    workHours: { start: "08:00", end: "18:00" },
    isActive: true,
  },
  {
    id: "ana",
    name: "Dra. Ana Costa",
    specialty: "Implantodontia",
    color: "#16a34a",
    workHours: { start: "08:30", end: "17:30" },
    isActive: true,
  },
  {
    id: "julia",
    name: "Dra. Julia Reis",
    specialty: "Ortodontia",
    color: "#8b6fd6",
    workHours: { start: "08:00", end: "18:00" },
    isActive: true,
  },
  {
    id: "pedro",
    name: "Dr. Pedro L.",
    specialty: "Periodontia",
    color: "#f59e0b",
    workHours: { start: "09:00", end: "17:00" },
    isActive: false,
  },
];

const TYPES = [
  "consulta",
  "retorno",
  "procedimento",
  "emergencia",
  "avaliacao",
  "implante",
  "manutencao",
] as const;

export function generateMockAppointments(
  year: number,
  month: number
): Appointment[] {
  const appointments: Appointment[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dentists = MOCK_DENTISTS.filter((d) => d.isActive);

  const seedAppointments: Array<{
    day: number;
    dentistIdx: number;
    start: string;
    dur: number;
    patient: string;
    type: string;
    status: Appointment["status"];
  }> = [
    { day: 2, dentistIdx: 0, start: "08:00", dur: 90, patient: "Kauê V. Gatti", type: "consulta", status: "confirmada" },
    { day: 2, dentistIdx: 1, start: "08:30", dur: 60, patient: "Fernanda R. Souza", type: "implante", status: "confirmada" },
    { day: 4, dentistIdx: 2, start: "09:00", dur: 60, patient: "Maria S. Pereira", type: "manutencao", status: "realizada" },
    { day: 6, dentistIdx: 0, start: "10:00", dur: 45, patient: "Thiago Ferreira", type: "avaliacao", status: "agendada" },
    { day: 10, dentistIdx: 1, start: "11:00", dur: 60, patient: "Carla Mendes", type: "retorno", status: "confirmada" },
    { day: 15, dentistIdx: 0, start: "08:00", dur: 60, patient: "Kauê V. Gatti", type: "consulta", status: "confirmada" },
    { day: 15, dentistIdx: 1, start: "09:00", dur: 60, patient: "Maria S. Pereira", type: "procedimento", status: "agendada" },
    { day: 15, dentistIdx: 2, start: "10:00", dur: 30, patient: "Ana Lucia M.", type: "retorno", status: "confirmada" },
    { day: 20, dentistIdx: 0, start: "14:00", dur: 45, patient: "Roberto C. Lima", type: "emergencia", status: "agendada" },
    { day: 22, dentistIdx: 2, start: "08:00", dur: 90, patient: "Bruno Tavares", type: "avaliacao", status: "confirmada" },
    { day: 25, dentistIdx: 0, start: "09:00", dur: 60, patient: "Kauê V. Gatti", type: "retorno", status: "agendada" },
    { day: 25, dentistIdx: 2, start: "10:30", dur: 60, patient: "Thiago Ferreira", type: "consulta", status: "agendada" },
    { day: 28, dentistIdx: 0, start: "08:00", dur: 60, patient: "Marina T. Souza", type: "consulta", status: "realizada" },
    { day: 28, dentistIdx: 1, start: "09:00", dur: 90, patient: "Paulo Henrique", type: "implante", status: "em_atendimento" },
    { day: 28, dentistIdx: 2, start: "08:30", dur: 60, patient: "Juliana Costa", type: "manutencao", status: "em_espera" },
  ];

  for (const s of seedAppointments) {
    const dentist = dentists[s.dentistIdx];
    if (!dentist) continue;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(s.day).padStart(2, "0")}`;
    const startHour = Number(s.start.split(":")[0]);
    const startMin = Number(s.start.split(":")[1]);
    const totalStartMin = startHour * 60 + startMin;
    const totalEndMin = totalStartMin + s.dur;
    const endHour = Math.floor(totalEndMin / 60);
    const endMin = totalEndMin % 60;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    appointments.push({
      id: `appt-${year}-${month}-${s.day}-${dentist.id}-${s.start}`,
      patientId: `pat-${s.patient.toLowerCase().replace(/\s/g, "-")}`,
      patientName: s.patient,
      dentistId: dentist.id,
      dentistName: dentist.name,
      date: dateStr,
      startTime: s.start,
      endTime: endTime,
      durationMin: s.dur,
      status: s.status,
      type: s.type,
    });
  }

  return appointments;
}

/**
 * Registro compartilhado entre rotas (mock).
 * O estado das consultas vive dentro da AgendaPage, mas a tela de atendimento
 * (/agenda/atendimento/:id) precisa ler e atualizar uma consulta ao longo da
 * navegação. A AgendaPage sincroniza a lista aqui (syncMockAppointments) a cada
 * mudança, e status definidos fora dela (ex: "realizada" — exibida como
 * "Atendido" — ao finalizar o atendimento) são preservados via statusOverrides
 * e reaplicados quando a
 * AgendaPage regenera os dados mockados.
 */
const appointmentRegistry = new Map<string, Appointment>();
const statusOverrides = new Map<string, AppointmentStatus>();

export function syncMockAppointments(list: Appointment[]): void {
  for (const a of list) {
    const override = statusOverrides.get(a.id);
    appointmentRegistry.set(a.id, override ? { ...a, status: override } : a);
  }
}

export function getMockAppointmentById(
  id: string | undefined
): Appointment | null {
  if (!id) return null;
  const cached = appointmentRegistry.get(id);
  if (cached) return cached;

  // Fallback: regenera a partir do seed quando a página é aberta diretamente
  // (refresh). Os ids seguem o formato appt-<ano>-<mês 0-based>-<dia>-<dentista>-<hora>.
  const parts = id.split("-");
  if (parts.length >= 6 && parts[0] === "appt") {
    const year = Number(parts[1]);
    const month = Number(parts[2]);
    if (!Number.isNaN(year) && !Number.isNaN(month)) {
      const seeded = generateMockAppointments(year, month).find(
        (a) => a.id === id
      );
      if (seeded) {
        const override = statusOverrides.get(id);
        const result = override ? { ...seeded, status: override } : seeded;
        appointmentRegistry.set(id, result);
        return result;
      }
    }
  }
  return null;
}

export function setMockAppointmentStatus(
  id: string,
  status: AppointmentStatus
): void {
  statusOverrides.set(id, status);
  const current = appointmentRegistry.get(id);
  if (current) {
    appointmentRegistry.set(id, { ...current, status });
  }
}

export function getAppointmentStatusColor(status: Appointment["status"]): {
  bg: string;
  border: string;
  text: string;
} {
  const map: Record<
    Appointment["status"],
    { bg: string; border: string; text: string }
  > = {
    agendada: {
      bg: "rgba(107,114,128,0.08)",
      border: "#6B7280",
      text: "#6B7280",
    },
    confirmada: {
      bg: "rgba(59,130,246,0.1)",
      border: "#3B82F6",
      text: "#2563EB",
    },
    em_espera: {
      bg: "rgba(245,158,11,0.1)",
      border: "#F59E0B",
      text: "#D97706",
    },
    em_atendimento: {
      bg: "rgba(245,158,11,0.15)",
      border: "#F59E0B",
      text: "#B45309",
    },
    realizada: {
      bg: "rgba(34,197,94,0.1)",
      border: "#22C55E",
      text: "#16A34A",
    },
    cancelada: {
      bg: "rgba(239,68,68,0.08)",
      border: "#EF4444",
      text: "#DC2626",
    },
    nao_compareceu: {
      bg: "rgba(239,68,68,0.08)",
      border: "#EF4444",
      text: "#DC2626",
    },
  };
  return map[status];
}

export function getStatusBadgeVariant(
  status: Appointment["status"]
): "neutral" | "info" | "success" | "warning" | "error" {
  const map: Record<Appointment["status"], "neutral" | "info" | "success" | "warning" | "error"> = {
    agendada: "neutral",
    confirmada: "info",
    em_espera: "warning",
    em_atendimento: "warning",
    realizada: "success",
    cancelada: "error",
    nao_compareceu: "error",
  };
  return map[status];
}
