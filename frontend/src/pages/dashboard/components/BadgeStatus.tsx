import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { bg: string; dot: string }> = {
  realizada: { bg: "bg-muted text-muted-foreground", dot: "bg-current" },
  confirmado: { bg: "bg-success/10 text-success", dot: "bg-current" },
  agendado: { bg: "bg-info/10 text-info", dot: "bg-current" },
  a_confirmar: { bg: "bg-warning/10 text-warning", dot: "bg-current" },
};

interface BadgeStatusProps {
  status: string;
  label: string;
}

export function BadgeStatus({ status, label }: BadgeStatusProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.realizada;

  return (
    <span className={cn("inline-flex items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[11px] font-semibold", style.bg)}>
      <span className={cn("h-[5px] w-[5px] rounded-full", style.dot)} />
      {label}
    </span>
  );
}
