import type { Appointment } from "@/types/appointment";
import { getAppointmentStatusColor, getStatusBadgeVariant } from "../mock-data";
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointment";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: Appointment;
  dentistColor: string;
  dimmed?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const variantStyles: Record<string, string> = {
  neutral: "bg-[rgba(107,114,128,0.12)] text-[#6B7280]",
  info: "bg-[rgba(59,130,246,0.12)] text-[#3B82F6]",
  success: "bg-[rgba(34,197,94,0.14)] text-[#16A34A]",
  warning: "bg-[rgba(245,158,11,0.14)] text-[#B45309]",
  error: "bg-[rgba(239,68,68,0.14)] text-[#DC2626]",
};

export function AppointmentCard({
  appointment,
  dentistColor,
  dimmed,
  highlighted,
  onClick,
  style,
}: AppointmentCardProps) {
  const statusColors = getAppointmentStatusColor(appointment.status);
  const badgeVariant = getStatusBadgeVariant(appointment.status);
  const typeLabel: Record<string, string> = {
    consulta: "Consulta",
    retorno: "Retorno",
    procedimento: "Procedimento",
    emergencia: "Emergência",
    avaliacao: "Avaliação",
    implante: "Implante",
    manutencao: "Manutenção",
  };

  return (
    <div
      onClick={onClick}
      style={{
        ...style,
        background: statusColors.bg,
        borderColor: statusColors.border,
        borderLeftColor: dentistColor,
      }}
      className={cn(
        "absolute left-[6px] right-[6px] cursor-pointer rounded-[10px] border border-l-[3px] p-[7px_9px] text-[11.5px] transition-opacity",
        dimmed && "opacity-28 saturate-[0.4]",
        highlighted && "shadow-[0_0_0_2px_var(--blue)]"
      )}
    >
      <p className="mb-[2px] font-semibold text-[var(--gray-900)]">
        {appointment.patientName}
      </p>
      <p className="mb-[4px] text-[10.5px] text-[var(--gray-500)]">
        {appointment.startTime} – {appointment.endTime} ·{" "}
        {typeLabel[appointment.type] || appointment.type}
      </p>
      <span
        className={cn(
          "inline-block rounded-full px-[7px] py-[1px] text-[9.5px] font-semibold leading-none",
          variantStyles[badgeVariant]
        )}
      >
        {APPOINTMENT_STATUS_LABELS[appointment.status]}
      </span>
    </div>
  );
}
