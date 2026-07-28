import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PaymentType } from "../types";

const TYPE_STYLE: Record<PaymentType, string> = {
  receber: "bg-[rgba(74,222,128,0.12)] text-[#16a34a]",
  pagar: "bg-[rgba(248,113,113,0.12)] text-[#dc2626]",
};

const TYPE_LABEL: Record<PaymentType, string> = {
  receber: "Receber",
  pagar: "Pagar",
};

const TYPE_ICON = {
  receber: ArrowDownLeft,
  pagar: ArrowUpRight,
};

interface TypeTagProps {
  type: PaymentType;
}

export function TypeTag({ type }: TypeTagProps) {
  const Icon = TYPE_ICON[type];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-[6px] px-[8px] py-[2px] text-[10px] font-semibold", TYPE_STYLE[type])}>
      <Icon className="h-[10px] w-[10px]" />
      {TYPE_LABEL[type]}
    </span>
  );
}
