import { cn } from "@/lib/utils";
import type { PaymentStatus } from "../types";

const STATUS_STYLE: Record<PaymentStatus, { bg: string; dot: string }> = {
  pago: { bg: "bg-[rgba(74,222,128,0.14)] text-[#16a34a]", dot: "bg-current" },
  pendente: { bg: "bg-[rgba(245,158,11,0.14)] text-[#b45309]", dot: "bg-current" },
  atrasado: { bg: "bg-[rgba(248,113,113,0.14)] text-[#dc2626]", dot: "bg-current" },
  a_vencer: { bg: "bg-[rgba(79,126,247,0.12)] text-primary", dot: "bg-current" },
  cancelado: { bg: "bg-[var(--gray-100)] text-[var(--gray-400)]", dot: "bg-current" },
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
  a_vencer: "A vencer",
  cancelado: "Cancelado",
};

interface StatusBadgeProps {
  status: PaymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLE[status];
  return (
    <span className={cn("inline-flex items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[11px] font-semibold", style.bg)}>
      <span className={cn("h-[5px] w-[5px] rounded-full", style.dot)} />
      {STATUS_LABEL[status]}
    </span>
  );
}
