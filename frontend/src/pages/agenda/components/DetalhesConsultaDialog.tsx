import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointment";
import { getStatusBadgeVariant } from "../mock-data";
import { useNavigate } from "react-router";
import { RegistrarPagamentoDialog } from "@/pages/patients/tabs/dialogs/RegistrarPagamentoDialog";

interface DetalhesConsultaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onStatusChange: (id: string, newStatus: AppointmentStatus, motivo?: string) => void;
  onConfirmAction: (
    title: string,
    description: string,
    onConfirm: () => void
  ) => void;
}

const TYPE_LABELS: Record<string, string> = {
  consulta: "Consulta",
  retorno: "Retorno",
  procedimento: "Procedimento",
  emergencia: "Emergência",
  avaliacao: "Avaliação",
  implante: "Implante",
  manutencao: "Manutenção",
};

/** Converte data ISO (YYYY-MM-DD) para DD/MM/AAAA */
function isoToBr(iso: string): string {
  return iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "";
}

type Action = {
  label: string;
  nextStatus: AppointmentStatus;
  variant?: "default" | "destructive" | "outline";
  requiresMotivo?: boolean;
  /** Rota para onde navegar após aplicar a ação (ex: tela de atendimento). */
  navigateTo?: string;
  /** Ação especial: abre o recebimento (RegistrarPagamentoDialog) sem mudar status. */
  pagamento?: boolean;
};

/** Mock: valor da consulta — virá da Billing (appointment_procedure) quando a API client existir */
const MOCK_APPT_TOTAL = 320;

function getAvailableActions(
  status: AppointmentStatus
): Action[] {
  const actions: Record<AppointmentStatus, Action[]> = {
    agendada: [
      { label: "Confirmar", nextStatus: "confirmada" },
      {
        label: "Cancelar",
        nextStatus: "cancelada",
        variant: "destructive",
        requiresMotivo: true,
      },
    ],
    confirmada: [
      { label: "Check-in (Em espera)", nextStatus: "em_espera" },
      {
        label: "Cancelar",
        nextStatus: "cancelada",
        variant: "destructive",
        requiresMotivo: true,
      },
      {
        label: "Não compareceu",
        nextStatus: "nao_compareceu",
        variant: "outline",
      },
    ],
    em_espera: [
      {
        label: "Iniciar atendimento",
        nextStatus: "em_atendimento",
        navigateTo: "/agenda/atendimento",
      },
      {
        label: "Cancelar",
        nextStatus: "cancelada",
        variant: "destructive",
        requiresMotivo: true,
      },
    ],
    em_atendimento: [
      { label: "Finalizar consulta", nextStatus: "realizada" },
      {
        label: "Cancelar",
        nextStatus: "cancelada",
        variant: "destructive",
        requiresMotivo: true,
      },
    ],
    realizada: [
      // Fluxo de balcão: paciente sai da consulta e o recepcionista registra
      // o recebimento. Gate por perfil (manager/receptionist) quando houver auth.
      { label: "Registrar pagamento", nextStatus: "realizada", pagamento: true },
    ],
    cancelada: [],
    nao_compareceu: [
      { label: "Reativar (Em espera)", nextStatus: "em_espera" },
    ],
  };

  return actions[status] || [];
}

export function DetalhesConsultaDialog({
  open,
  onOpenChange,
  appointment,
  onStatusChange,
  onConfirmAction,
}: DetalhesConsultaDialogProps) {
  const navigate = useNavigate();
  const [pagamentoOpen, setPagamentoOpen] = useState(false);

  if (!appointment) return null;

  const actions = getAvailableActions(appointment.status);

  function handleAction(action: Action) {
    if (action.pagamento) {
      setPagamentoOpen(true);
      return;
    }
    if (action.requiresMotivo) {
      onConfirmAction(
        `${action.label} consulta`,
        `Tem certeza que deseja ${action.label.toLowerCase()} a consulta de ${appointment.patientName}?`,
        () => {
          onStatusChange(appointment.id, action.nextStatus);
          onOpenChange(false);
        }
      );
    } else {
      onStatusChange(appointment.id, action.nextStatus);
      onOpenChange(false);
      if (action.navigateTo) {
        navigate(`${action.navigateTo}/${appointment.id}`);
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Consulta</DialogTitle>
          <DialogDescription>
            Visualize os dados da consulta e realize ações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-[10px] border border-border bg-[var(--gray-50)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[17px] font-bold text-[var(--gray-900)]">
                {appointment.patientName}
              </span>
              <Badge variant={getStatusBadgeVariant(appointment.status)}>
                {APPOINTMENT_STATUS_LABELS[appointment.status]}
              </Badge>
            </div>

            <div className="space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-[var(--gray-500)]">Dentista</span>
                <span className="font-medium text-[var(--gray-900)]">
                  {appointment.dentistName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--gray-500)]">Data</span>
                <span className="font-medium text-[var(--gray-900)]">
                  {isoToBr(appointment.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--gray-500)]">Horário</span>
                <span className="font-medium text-[var(--gray-900)]">
                  {appointment.startTime} – {appointment.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--gray-500)]">Duração</span>
                <span className="font-medium text-[var(--gray-900)]">
                  {appointment.durationMin} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--gray-500)]">Tipo</span>
                <span className="font-medium text-[var(--gray-900)]">
                  {TYPE_LABELS[appointment.type] || appointment.type}
                </span>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-3 border-t border-border pt-3">
                <span className="text-[11px] font-medium text-[var(--gray-500)]">
                  OBSERVAÇÕES
                </span>
                <p className="mt-1 text-[14px] text-[var(--gray-700)]">
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>

          {actions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold tracking-[0.05em] text-[var(--gray-500)]">
                Ações disponíveis
              </p>
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.nextStatus}
                    variant={action.variant || "default"}
                    onClick={() => handleAction(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      {/* Recebimento no balcão (mock) — abre a partir da consulta Realizada.
          Valor/combinado mockados; virão da Billing quando a API client existir. */}
      <RegistrarPagamentoDialog
        open={pagamentoOpen}
        onOpenChange={setPagamentoOpen}
        installments={[
          { id: 1, dueDate: isoToBr(appointment.date), value: MOCK_APPT_TOTAL },
        ]}
        combinadoOrcamento="Cartão de Débito"
        onConfirm={(payload) => console.log("Pagamento registrado (mock):", payload)}
      />
    </>
  );
}
