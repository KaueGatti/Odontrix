import { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointment";
import { DetalhesConsultaDialog } from "@/pages/agenda/components/DetalhesConsultaDialog";
import { NovaConsultaDialog } from "@/pages/agenda/components/NovaConsultaDialog";
import { ConfirmarAcaoDialog } from "@/pages/agenda/components/ConfirmarAcaoDialog";
import type { DentistAgenda } from "@/pages/agenda/types";

interface AgendamentosTabProps {
  dentistId: number;
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    patientId: "pat-kaue",
    patientName: "Kauê V. Gatti",
    dentistId: "1",
    dentistName: "Dr. Marcos Silva",
    date: "2025-05-21",
    startTime: "14:00",
    endTime: "14:50",
    durationMin: 50,
    status: "confirmada",
    type: "consulta",
  },
  {
    id: "2",
    patientId: "pat-ana",
    patientName: "Ana Lucia M.",
    dentistId: "1",
    dentistName: "Dr. Marcos Silva",
    date: "2025-05-22",
    startTime: "09:00",
    endTime: "09:30",
    durationMin: 30,
    status: "agendada",
    type: "retorno",
  },
  {
    id: "3",
    patientId: "pat-roberto",
    patientName: "Roberto C. Lima",
    dentistId: "1",
    dentistName: "Dr. Marcos Silva",
    date: "2025-05-22",
    startTime: "15:30",
    endTime: "17:00",
    durationMin: 90,
    status: "agendada",
    type: "procedimento",
  },
  {
    id: "4",
    patientId: "pat-marina",
    patientName: "Marina T. Souza",
    dentistId: "1",
    dentistName: "Dr. Marcos Silva",
    date: "2025-05-23",
    startTime: "08:00",
    endTime: "08:45",
    durationMin: 45,
    status: "confirmada",
    type: "consulta",
  },
  {
    id: "5",
    patientId: "pat-paulo",
    patientName: "Paulo Henrique",
    dentistId: "1",
    dentistName: "Dr. Marcos Silva",
    date: "2025-05-26",
    startTime: "10:00",
    endTime: "11:30",
    durationMin: 90,
    status: "agendada",
    type: "avaliacao",
  },
];

const MOCK_DENTIST_AGENDA: DentistAgenda = {
  id: "1",
  name: "Dr. Marcos Silva",
  specialty: "Ortodontia",
  color: "#4F7EF7",
  workHours: { start: "08:00", end: "18:00" },
  isActive: true,
};

const TYPE_LABELS: Record<string, string> = {
  consulta: "Consulta",
  retorno: "Retorno",
  procedimento: "Procedimento",
  emergencia: "Emergência",
  avaliacao: "Avaliação",
  implante: "Implante",
  manutencao: "Manutenção",
};

function getBadgeVariant(
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

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function AgendamentosTab({ dentistId: _dentistId }: AgendamentosTabProps) {
  const [appointments] = useState(MOCK_APPOINTMENTS);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDesc, setConfirmDesc] = useState("");
  const [confirmCb, setConfirmCb] = useState<() => void>(() => {});

  const [newOpen, setNewOpen] = useState(false);

  function handleStatusChange(_id: string, _newStatus: AppointmentStatus, _motivo?: string) {
    console.log("Status change:", _id, _newStatus, _motivo);
  }

  function handleConfirmAction(title: string, description: string, onConfirm: () => void) {
    setConfirmTitle(title);
    setConfirmDesc(description);
    setConfirmCb(() => onConfirm);
    setConfirmOpen(true);
  }

  function handleSave(data: {
    patientName: string;
    dentistId: string;
    date: string;
    startTime: string;
    durationMin: number;
    type: string;
    notes: string;
  }) {
    console.log("New appointment:", data);
  }

  function openDetail(appt: Appointment) {
    setSelectedAppointment(appt);
    setDetailOpen(true);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-4 px-9 py-7">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Próximos agendamentos
          </h3>
          <Button size="sm" className="gap-1.5" onClick={() => setNewOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Novo agendamento
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                  Paciente
                </th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                  Data / Hora
                </th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                  Tipo
                </th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                  Duração
                </th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                  Status
                </th>
                <th className="px-6 pb-3 pt-4 text-right text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-b border-border/50 last:border-b-0">
                  <td className="px-6 py-3 font-semibold text-foreground">
                    {appt.patientName}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {formatDate(appt.date)} {appt.startTime}
                  </td>
                  <td className="px-6 py-3 text-foreground">
                    {TYPE_LABELS[appt.type] || appt.type}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {appt.durationMin} min
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={getBadgeVariant(appt.status)}>
                      {APPOINTMENT_STATUS_LABELS[appt.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openDetail(appt)}
                      className="inline-flex items-center gap-1 border-none bg-transparent p-0 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-muted-foreground">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <DetalhesConsultaDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        appointment={selectedAppointment}
        onStatusChange={handleStatusChange}
        onConfirmAction={handleConfirmAction}
      />

      <NovaConsultaDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        dentists={[MOCK_DENTIST_AGENDA]}
        selectedDate={today}
        selectedDentistId={MOCK_DENTIST_AGENDA.id}
        onSave={handleSave}
      />

      <ConfirmarAcaoDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDesc}
        onConfirm={() => {
          confirmCb();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
