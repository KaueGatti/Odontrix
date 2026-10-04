import { useState } from "react";
import type { Appointment } from "@/types/appointment";
import { getAppointmentStatusColor, getStatusBadgeVariant } from "../mock-data";
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointment";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Clock, MoreHorizontal } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment;
  dimmed?: boolean;
  highlighted?: boolean;
  /**
   * Faixa (0-based) do card na cascata — cards que se cruzam no tempo nunca
   * compartilham a faixa.
   */
  overlapIndex?: number;
  /** Nº de faixas do cluster — define o recuo horizontal da cascata. */
  overlapCount?: number;
  /** Ordem cronológica no cluster (0 = mais antiga) — mais recente fica no topo. */
  stackOrder?: number;
  /** Nº de consultas conflitantes no cluster — badge «×N». */
  conflictCount?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const CASCADE_STEP = 12; // px de deslocamento horizontal por faixa de conflito
/** Altura mínima (px) para o layout completo; abaixo disso usa o layout compacto. */
const FULL_LAYOUT_MIN_HEIGHT = 70;

const statusBadgeStyles: Record<string, { pill: string; dot: string }> = {
  neutral: {
    pill: "border border-[var(--gray-200)] bg-white text-[var(--gray-600)]",
    dot: "#6B7280",
  },
  info: {
    pill: "border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
    dot: "#3B82F6",
  },
  success: {
    pill: "bg-[#DCFCE7] text-[#15803D]",
    dot: "#16A34A",
  },
  warning: {
    pill: "border border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
    dot: "#F59E0B",
  },
  error: {
    pill: "border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
    dot: "#EF4444",
  },
};

const typeLabels: Record<string, string> = {
  consulta: "Consulta",
  retorno: "Retorno",
  procedimento: "Procedimento",
  emergencia: "Emergência",
  avaliacao: "Avaliação",
  implante: "Implante",
  manutencao: "Manutenção",
};

export function AppointmentCard({
  appointment,
  dimmed,
  highlighted,
  overlapIndex = 0,
  overlapCount = 1,
  stackOrder = 0,
  conflictCount = 1,
  onClick,
  style,
}: AppointmentCardProps) {
  const [hovered, setHovered] = useState(false);
  const statusColors = getAppointmentStatusColor(appointment.status);
  const badgeVariant = getStatusBadgeVariant(appointment.status);
  const badge = statusBadgeStyles[badgeVariant];
  const isActive = appointment.status === "em_atendimento";
  const typeLabel = typeLabels[appointment.type] || appointment.type;

  const cardHeight = style?.height != null ? parseFloat(String(style.height)) : 0;
  const compact = cardHeight > 0 && cardHeight < FULL_LAYOUT_MIN_HEIGHT;

  const statusBadge = (
    <span
      className={cn(
        "inline-flex flex-shrink-0 items-center gap-[4px] rounded-full px-[7px] py-[2.5px] text-[9.5px] font-semibold leading-none",
        badge.pill
      )}
    >
      {badgeVariant === "success" ? (
        <Check size={9} strokeWidth={3.5} />
      ) : (
        <span
          className="h-[5px] w-[5px] flex-shrink-0 rounded-full"
          style={{ background: badge.dot }}
        />
      )}
      {APPOINTMENT_STATUS_LABELS[appointment.status]}
    </span>
  );

  // Ação/informação do rodapé — os botões abrem o dialog de detalhes,
  // onde a ação é confirmada (mesmo fluxo de sempre).
  let footerRight: React.ReactNode = null;
  if (!compact) {
    if (appointment.status === "realizada") {
      footerRight = (
        <span className="ml-auto whitespace-nowrap text-[10px] font-medium text-[#16A34A]">
          Finalizado às {appointment.endTime}
        </span>
      );
    } else if (appointment.status === "em_espera") {
      footerRight = (
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-[2px] rounded px-[3px] py-[1px] text-[10px] font-semibold text-[var(--blue)] transition-colors hover:bg-[rgba(79,126,247,0.08)]"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          Chamar sala
          <ChevronRight size={11} />
        </button>
      );
    } else if (isActive) {
      footerRight = (
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-[3px] rounded-full bg-[#DCFCE7] px-[7px] py-[2.5px] text-[9.5px] font-semibold leading-none text-[#15803D] transition-colors hover:bg-[#BBF7D0]"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <Check size={9} strokeWidth={3.5} />
          Concluir
        </button>
      );
    }
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        background: "#FFFFFF",
        borderStyle: "solid",
        borderColor: isActive ? statusColors.border : "var(--gray-200)",
        borderTopWidth: isActive ? 1.5 : 1,
        borderRightWidth: isActive ? 1.5 : 1,
        borderBottomWidth: isActive ? 1.5 : 1,
        borderLeftWidth: 3,
        borderLeftColor: statusColors.border,
        left: 6 + overlapIndex * CASCADE_STEP,
        right: 6 + (overlapCount - 1 - overlapIndex) * CASCADE_STEP,
        // Empilhamento pela ordem cronológica: a consulta mais recente fica no topo.
        zIndex: hovered ? 40 : 10 + stackOrder,
      }}
      className={cn(
        "absolute flex cursor-pointer flex-col overflow-hidden rounded-[10px] px-[8px] py-[5px] shadow-[0_1px_2px_rgba(15,32,80,0.05)] transition-[opacity,transform,box-shadow] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(15,32,80,0.22)]",
        dimmed && "opacity-28 saturate-[0.4]",
        highlighted && "shadow-[0_0_0_2px_var(--blue)]"
      )}
    >
      {compact ? (
        <>
          <p className="flex items-center gap-[4px] text-[11px] font-semibold leading-[1.2] text-[var(--gray-900)]">
            <span className="truncate">{appointment.patientName}</span>
            {isActive && (
              <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#F59E0B]" />
            )}
          </p>
          <p className="mt-[2px] flex items-center gap-[3px] text-[9.5px] leading-[1.2] text-[var(--gray-500)]">
            <Clock size={9} className="flex-shrink-0 text-[var(--gray-400)]" />
            <span className="whitespace-nowrap">
              {appointment.startTime} – {appointment.endTime}
            </span>
            <span className="ml-auto min-w-0 truncate rounded-full border border-[var(--gray-200)] px-[5px] py-[1.5px] text-[8.5px] leading-none text-[var(--gray-600)]">
              {typeLabel}
            </span>
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-[4px]">
            <p className="truncate text-[11.5px] font-semibold leading-[1.25] text-[var(--gray-900)]">
              {appointment.patientName}
            </p>
            {isActive && (
              <span className="h-[5px] w-[5px] flex-shrink-0 animate-pulse rounded-full bg-[#F59E0B]" />
            )}
            {conflictCount > 1 && stackOrder === 0 && (
              <span className="flex-shrink-0 rounded-full bg-[var(--gray-900)] px-[4px] py-[1px] text-[8px] font-bold leading-none text-white">
                ×{conflictCount}
              </span>
            )}
            <button
              type="button"
              aria-label="Opções da consulta"
              className="ml-auto flex-shrink-0 rounded p-[1px] leading-none text-[var(--gray-400)] transition-colors hover:bg-[var(--gray-100)] hover:text-[var(--gray-600)]"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <MoreHorizontal size={13} />
            </button>
          </div>
          <div className="mt-[3px] flex items-center gap-[4px] text-[10px] leading-none text-[var(--gray-500)]">
            <Clock size={10} className="flex-shrink-0 text-[var(--gray-400)]" />
            <span className="whitespace-nowrap">
              {appointment.startTime} – {appointment.endTime}
            </span>
            <span className="ml-[2px] min-w-0 truncate rounded-full border border-[var(--gray-200)] px-[6px] py-[2px] text-[9px] leading-none text-[var(--gray-600)]">
              {typeLabel}
            </span>
          </div>
          <div className="min-h-[4px] flex-1" />
          <div className="flex items-center gap-[4px] border-t border-[var(--gray-100)] pt-[4px]">
            {statusBadge}
            {footerRight}
          </div>
        </>
      )}
    </div>
  );
}

