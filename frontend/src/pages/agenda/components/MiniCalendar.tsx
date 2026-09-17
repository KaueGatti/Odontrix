import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/appointment";
import type { ViewMode } from "../types";

interface MiniCalendarProps {
  /** Data selecionada na agenda (currentDate da AgendaPage). */
  selected: Date;
  /** Salta a agenda para a data escolhida (mantém a vista, exceto no modo Mês → Dia). */
  onSelect: (date: Date) => void;
  /** Navegação de mês no modo "Mês": move o mês selecionado da agenda mantendo a vista. */
  onMonthChange?: (date: Date) => void;
  /** Consultas usadas para marcar (dot) os dias que possuem agendamentos. */
  appointments: Appointment[];
  /** Vista atual da agenda — define o estilo de destaque do calendário. */
  viewMode: ViewMode;
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

/** Avança/retrocede um mês preservando o dia (clampado ao último dia do mês). */
function shiftMonthKeepingDay(date: Date, delta: number): Date {
  const target = addMonths(date, delta);
  const lastDay = endOfMonth(target).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function MiniCalendar({
  selected,
  onSelect,
  onMonthChange,
  appointments,
  viewMode,
}: MiniCalendarProps) {
  // Referência de "hoje" para os destaques de dia/semana/mês atuais.
  const today = new Date();

  // Mês exibido no mini-calendário — navegação interna independente da seleção.
  const [displayMonth, setDisplayMonth] = useState(selected);

  // Mantém o mês exibido em sincronia quando a data muda de fora
  // (setas / botão "Hoje" do header ou clique num dia da MensalView).
  useEffect(() => {
    setDisplayMonth(selected);
  }, [selected]);

  // 6 semanas do mês exibido — mesmo padrão de grade da MensalView.
  const days = useMemo(() => {
    const calStart = startOfWeek(startOfMonth(displayMonth), {
      weekStartsOn: 0,
    });
    const calEnd = endOfWeek(endOfMonth(displayMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [displayMonth]);

  // Dias (yyyy-MM-dd) que possuem pelo menos uma consulta — exibem dot azul.
  const daysWithAppointments = useMemo(
    () => new Set(appointments.map((a) => a.date)),
    [appointments]
  );

  const monthLabel = (() => {
    const label = format(displayMonth, "MMMM 'de' yyyy", { locale: ptBR });
    return label.charAt(0).toUpperCase() + label.slice(1);
  })();

  return (
    <div>
      {/* Cabeçalho: navegação de mês independente da data selecionada.
          No modo "Mês", avançar/retroceder também move o mês selecionado da agenda. */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => {
            const prev = shiftMonthKeepingDay(displayMonth, -1);
            setDisplayMonth(prev);
            if (viewMode === "mes") onMonthChange?.(prev);
          }}
          aria-label="Mês anterior"
          className="rounded-[10px] p-1 text-[var(--gray-400)] transition-colors hover:bg-[var(--gray-50)] hover:text-[var(--gray-700)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span
          className={cn(
            "text-[12.5px] font-semibold",
            // Modo "Mês": rótulo em azul quando o mês exibido é o mês selecionado.
            viewMode === "mes" && isSameMonth(displayMonth, selected)
              ? "text-[var(--blue)]"
              : "text-[var(--gray-900)]"
          )}
        >
          {monthLabel}
        </span>
        <button
          onClick={() => {
            const next = shiftMonthKeepingDay(displayMonth, 1);
            setDisplayMonth(next);
            if (viewMode === "mes") onMonthChange?.(next);
          }}
          aria-label="Próximo mês"
          className="rounded-[10px] p-1 text-[var(--gray-400)] transition-colors hover:bg-[var(--gray-50)] hover:text-[var(--gray-700)]"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cabeçalho dos dias da semana (DOM–SÁB, mesma ordem da MensalView) */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((dow, i) => (
          <div
            key={`${dow}-${i}`}
            className="flex h-6 items-center justify-center text-[10.5px] font-bold tracking-[0.04em] text-[var(--gray-400)]"
          >
            {dow}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isOtherMonth = !isSameMonth(day, displayMonth);
          const hasAppointments = daysWithAppointments.has(
            format(day, "yyyy-MM-dd")
          );

          // Dia: dia atual (de hoje) e dia selecionado.
          // Semana: semana atual (de hoje) e semana da data selecionada.
          // Mês: hoje com anel; dias do mês selecionado enfatizados.
          const isCurrent =
            (viewMode === "dia" && isToday(day)) ||
            (viewMode === "semana" &&
              isWithinInterval(day, {
                start: startOfWeek(today, { weekStartsOn: 0 }),
                end: endOfWeek(today, { weekStartsOn: 0 }),
              }));
          const isSelected =
            (viewMode === "dia" && isSameDay(day, selected)) ||
            (viewMode === "semana" &&
              isWithinInterval(day, {
                start: startOfWeek(selected, { weekStartsOn: 0 }),
                end: endOfWeek(selected, { weekStartsOn: 0 }),
              }));
          const isTodayRing = viewMode === "mes" && isToday(day);
          const isSelectedMonth = viewMode === "mes" && isSameMonth(day, selected);
          // Mesmo estilo do modo Dia: atual = preenchido; selecionado = outlined.

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              aria-label={format(day, "dd'/'MM'/'yyyy")}
              className={cn(
                "flex h-9 w-full flex-col items-center justify-center rounded-[10px] border text-[12px] leading-none transition-all",
                isCurrent
                  ? "border-transparent bg-[var(--blue)] font-semibold text-white"
                  : isSelected
                    ? "border-[var(--blue)] bg-transparent font-medium text-[var(--blue)] hover:bg-[var(--gray-50)]"
                    : "border-transparent hover:bg-[var(--gray-50)]",
                isTodayRing &&
                  "ring-1 ring-inset ring-[var(--blue)] font-semibold text-[var(--blue)] hover:bg-[var(--gray-50)]",
                !isCurrent &&
                  !isSelected &&
                  !isTodayRing &&
                  (isOtherMonth
                    ? "text-[var(--gray-300)]"
                    : isSelectedMonth
                      ? "text-[var(--gray-900)] font-medium"
                      : "text-[var(--gray-700)]")
              )}
            >
              <span>{format(day, "d")}</span>
              {/* Dot: dia com consultas (invisível nos demais, preserva o alinhamento).
                  Em células preenchidas (fundo azul) o dot é branco. */}
              <span
                className={cn(
                  "mt-[3px] h-[3px] w-[3px] rounded-full",
                  hasAppointments && !isOtherMonth
                    ? isCurrent
                      ? "bg-white"
                      : "bg-[var(--blue)]"
                    : "bg-transparent"
                )}
              />
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSelect(new Date())}
        className="mt-2 w-full rounded-[10px] border border-border bg-card py-[6px] text-[12px] font-medium text-[var(--gray-600)] transition-all hover:border-[var(--gray-300)] hover:text-[var(--gray-900)]"
      >
        Ir para hoje
      </button>
    </div>
  );
}