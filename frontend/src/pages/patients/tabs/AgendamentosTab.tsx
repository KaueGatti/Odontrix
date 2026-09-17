import { useState } from "react";
import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointment";
import {
  DetalhesConsultaDialog,
  type ConfirmActionOptions,
} from "@/pages/agenda/components/DetalhesConsultaDialog";
import { NovaConsultaDialog } from "@/pages/agenda/components/NovaConsultaDialog";
import { ConfirmarAcaoDialog } from "@/pages/agenda/components/ConfirmarAcaoDialog";
import { MOCK_DENTISTS } from "@/pages/agenda/mock-data";

interface PatientAppointment extends Appointment {
  createdBy: string;
}

const MOCK_APPOINTMENTS: PatientAppointment[] = [
  { id: "1", patientId: "pat-kaue", patientName: "Kauê Vinícius Gatti", dentistId: "marcos", dentistName: "Dr. Marcos Silva", date: "2026-07-28", startTime: "14:00", endTime: "14:50", durationMin: 50, createdBy: "Kamily Vitória", status: "confirmada", type: "consulta", notes: "Paciente confirmou presença por WhatsApp." },
  { id: "2", patientId: "pat-kaue", patientName: "Kauê Vinícius Gatti", dentistId: "camila", dentistName: "Dra. Camila Freitas", date: "2026-08-10", startTime: "09:00", endTime: "09:30", durationMin: 30, createdBy: "Kamily Vitória", status: "agendada", type: "retorno", notes: "Retorno para avaliação da contenção." },
  { id: "3", patientId: "pat-kaue", patientName: "Kauê Vinícius Gatti", dentistId: "camila", dentistName: "Dra. Camila Freitas", date: "2026-02-10", startTime: "11:00", endTime: "12:30", durationMin: 90, createdBy: "Kamily Vitória", status: "realizada", type: "procedimento", notes: "Procedimento concluído sem intercorrências." },
  { id: "4", patientId: "pat-kaue", patientName: "Kauê Vinícius Gatti", dentistId: "marcos", dentistName: "Dr. Marcos Silva", date: "2026-01-14", startTime: "15:30", endTime: "16:20", durationMin: 50, createdBy: "Fernanda Souza", status: "cancelada", type: "consulta", notes: "Cancelado a pedido do paciente." },
  { id: "5", patientId: "pat-kaue", patientName: "Kauê Vinícius Gatti", dentistId: "marcos", dentistName: "Dr. Marcos Silva", date: "2025-12-02", startTime: "08:30", endTime: "09:00", durationMin: 30, createdBy: "Kamily Vitória", status: "nao_compareceu", type: "retorno", notes: "Paciente não compareceu e não justificou ausência." },
];

function getBadgeVariant(status: Appointment["status"]): "neutral" | "info" | "success" | "warning" | "error" {
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

export function AgendamentosTab() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>(MOCK_APPOINTMENTS);
  const [showAll, setShowAll] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionOptions>({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [newOpen, setNewOpen] = useState(false);

  const displayed = showAll ? appointments : appointments.slice(0, 3);

  function openDetail(appt: Appointment) {
    setSelectedAppointment(appt);
    setDetailOpen(true);
  }

  function handleStatusChange(id: string, newStatus: AppointmentStatus) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    // Mantém o modal de detalhes aberto refletindo o novo status.
    setSelectedAppointment((prev) =>
      prev?.id === id ? { ...prev, status: newStatus } : prev
    );
  }

  function handleConfirmAction(options: ConfirmActionOptions) {
    setConfirmAction(options);
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
    const startHour = Number(data.startTime.split(":")[0]);
    const startMin = Number(data.startTime.split(":")[1]);
    const totalEndMin = startHour * 60 + startMin + data.durationMin;
    const endHour = Math.floor(totalEndMin / 60);
    const endMin = totalEndMin % 60;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
    const dentist = MOCK_DENTISTS.find((d) => d.id === data.dentistId);

    const newAppt: PatientAppointment = {
      id: `appt-new-${Date.now()}`,
      patientId: `pat-${data.patientName.toLowerCase().replace(/\s/g, "-")}`,
      patientName: data.patientName,
      dentistId: data.dentistId,
      dentistName: dentist?.name || "",
      date: data.date,
      startTime: data.startTime,
      endTime,
      durationMin: data.durationMin,
      createdBy: "Kamily Vitória",
      status: "agendada",
      type: data.type,
      notes: data.notes || undefined,
    };

    setAppointments((prev) => [...prev, newAppt]);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Próximos e histórico de agendamentos
          </p>
          <Button size="sm" className="gap-1.5" onClick={() => setNewOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Novo agendamento
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Data e Horário</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Profissional</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Observação</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Status</th>
                <th className="px-6 pb-3 pt-4 text-right text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {displayed.map((appt) => (
                <tr key={appt.id} className="border-b border-border/50 last:border-b-0">
                  <td className="px-6 py-3 font-semibold text-foreground">
                    {formatDate(appt.date)} {appt.startTime} – {appt.endTime}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{appt.dentistName}</td>
                  <td className="px-6 py-3">
                    <span
                      className="block max-w-[220px] truncate text-muted-foreground"
                      title={appt.notes || undefined}
                    >
                      {appt.notes || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {appt.status === "nao_compareceu" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-2.5 py-1 text-[11px] font-semibold leading-none text-destructive">
                        {APPOINTMENT_STATUS_LABELS[appt.status]}
                      </span>
                    ) : (
                      <Badge variant={getBadgeVariant(appt.status)}>
                        {APPOINTMENT_STATUS_LABELS[appt.status]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openDetail(appt)}
                      className="inline-flex items-center gap-1 border-none bg-transparent p-0 text-[11px] text-muted-foreground hover:text-foreground"
                      aria-label="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-muted-foreground">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {appointments.length > 3 && (
          <div className="border-t border-border px-6 py-3">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-[12px] font-medium text-primary hover:text-primary/80"
            >
              {showAll
                ? "Mostrar menos"
                : `Ver todos (${appointments.length} agendamentos)`}
            </button>
          </div>
        )}
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
        dentists={MOCK_DENTISTS}
        selectedDate={today}
        onSave={handleSave}
      />

      <ConfirmarAcaoDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        requiresMotivo={confirmAction.requiresMotivo}
        confirmLabel={confirmAction.confirmLabel}
        confirmVariant={confirmAction.confirmVariant}
        onConfirm={(motivo) => {
          confirmAction.onConfirm(motivo);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
