import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode } from "../types";

interface AgendaHeaderProps {
  title: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewAppointment: () => void;
}

export function AgendaHeader({
  title,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onNewAppointment,
}: AgendaHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4 shadow-[var(--shadow-topbar)]">
      <div className="flex min-w-[200px] flex-1 items-center gap-[10px] text-[15px] font-bold tracking-tight text-[var(--gray-900)]">
        <span
          onClick={onPrev}
          className="cursor-pointer text-[var(--gray-400)] hover:text-[var(--gray-700)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
        {title}
        <span
          onClick={onNext}
          className="cursor-pointer text-[var(--gray-400)] hover:text-[var(--gray-700)]"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>

      <button
        onClick={onToday}
        className="fm-hbtn h-8 rounded-[10px] border border-border bg-card px-[14px] text-[12px] font-medium text-[var(--gray-700)] hover:border-[var(--gray-300)]"
      >
        Hoje
      </button>

      <button
        onClick={() => onViewModeChange("dia")}
        className={cn(
          "fm-hbtn h-8 rounded-[10px] border px-[14px] text-[12px] font-medium transition-all",
          viewMode === "dia"
            ? "border-[var(--blue)] bg-[var(--blue)] text-white"
            : "border-border bg-card text-[var(--gray-700)] hover:border-[var(--gray-300)]"
        )}
      >
        Dia
      </button>

      <button
        onClick={() => onViewModeChange("semana")}
        className={cn(
          "fm-hbtn h-8 rounded-[10px] border px-[14px] text-[12px] font-medium transition-all",
          viewMode === "semana"
            ? "border-[var(--blue)] bg-[var(--blue)] text-white"
            : "border-border bg-card text-[var(--gray-700)] hover:border-[var(--gray-300)]"
        )}
      >
        Semana
      </button>

      <button
        onClick={() => onViewModeChange("mes")}
        className={cn(
          "fm-hbtn h-8 rounded-[10px] border px-[14px] text-[12px] font-medium transition-all",
          viewMode === "mes"
            ? "border-[var(--blue)] bg-[var(--blue)] text-white"
            : "border-border bg-card text-[var(--gray-700)] hover:border-[var(--gray-300)]"
        )}
      >
        Mês
      </button>

      <button
        onClick={onNewAppointment}
        className="flex h-8 items-center gap-[6px] rounded-[10px] border border-[var(--blue)] bg-[var(--blue)] px-[14px] text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(79,126,247,0.3)] hover:bg-[#3a6af3]"
      >
        <Plus className="h-3.5 w-3.5" />
        Novo Agendamento
      </button>
    </div>
  );
}
