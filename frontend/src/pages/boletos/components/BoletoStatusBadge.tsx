import { cn } from "@/lib/utils";
import type { BoletoStatus } from "../types";

const STATUS_STYLE: Record<BoletoStatus, { bg: string; dot: string; label: string }> = {
  issued: { bg: "bg-[rgba(79,126,247,0.12)] text-primary", dot: "bg-current", label: "Emitido" },
  registered: { bg: "bg-[rgba(45,212,191,0.15)] text-[#0d9488]", dot: "bg-current", label: "Registrado" },
  paid: { bg: "bg-[rgba(74,222,128,0.14)] text-[#16a34a]", dot: "bg-current", label: "Pago" },
  overdue: { bg: "bg-[rgba(248,113,113,0.14)] text-[#dc2626]", dot: "bg-current", label: "Vencido" },
  cancelled: { bg: "bg-[var(--gray-100)] text-[var(--gray-400)]", dot: "bg-current", label: "Cancelado" },
};

interface BoletoStatusBadgeProps {
  status: BoletoStatus;
  className?: string;
}

export function BoletoStatusBadge({ status, className }: BoletoStatusBadgeProps) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[11px] font-semibold",
        style.bg,
        className,
      )}
    >
      <span className={cn("h-[5px] w-[5px] rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}