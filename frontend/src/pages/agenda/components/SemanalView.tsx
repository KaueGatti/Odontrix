import { useMemo, useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/appointment";
import type { DentistAgenda, FilterState } from "../types";
import { AppointmentCard } from "./AppointmentCard";

interface SemanalViewProps {
  currentDate: Date;
  appointments: Appointment[];
  dentists: DentistAgenda[];
  filters: FilterState;
  onAppointmentClick?: (appointment: Appointment) => void;
  /** Clique num slot vazio de 15 min: cria agendamento pré-preenchido (data + hora). */
  onSlotClick?: (date: Date, time: string) => void;
}

const START_HOUR = 8;
const END_HOUR = 19;
const HOUR_HEIGHT = 60; // px por hora (igual à visão Dia)
const SLOT_MIN = 15;
const SLOT_HEIGHT = HOUR_HEIGHT / 4; // 15px por slot de 15 min
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_SLOTS = TOTAL_HOURS * 4;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotLabel(minutesFromOpen: number): string {
  const total = START_HOUR * 60 + minutesFromOpen;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function SemanalView({
  currentDate,
  appointments,
  dentists,
  filters,
  onAppointmentClick,
  onSlotClick,
}: SemanalViewProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{
    dayKey: string;
    time: string;
  } | null>(null);

  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Mesmo critério de filtro da visão Dia (colunas são dias, não dentistas).
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (!filters.dentistIds.includes(a.dentistId)) return false;
      if (filters.specialties.length > 0) {
        const dentist = dentists.find((d) => d.id === a.dentistId);
        if (dentist && !filters.specialties.includes(dentist.specialty)) return false;
      }
      if (filters.patientNames.length > 0 && !filters.patientNames.includes(a.patientName)) return false;
      if (filters.statusList.length > 0 && !filters.statusList.includes(a.status)) return false;
      if (filters.typeList.length > 0 && !filters.typeList.includes(a.type)) return false;
      return true;
    });
  }, [appointments, filters, dentists]);

  // Slots de 15 min: 0 (08:00) a (TOTAL_SLOTS - 1) * 15 (18:45).
  const slots = useMemo(
    () => Array.from({ length: TOTAL_SLOTS }, (_, i) => i * SLOT_MIN),
    []
  );

  function getAppointmentStyle(appt: Appointment): React.CSSProperties {
    const clinicOpen = START_HOUR * 60;
    const startMin = timeToMinutes(appt.startTime);
    const top = ((startMin - clinicOpen) / 60) * HOUR_HEIGHT;
    const height = (appt.durationMin / 60) * HOUR_HEIGHT;
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  }

  const dayLabel = (day: Date) =>
    format(day, "EEE", { locale: ptBR }).toUpperCase().slice(0, 3);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Cabeçalho dos dias: gutter de horários + 7 colunas (DOM–SÁB) */}
      <div
        className="grid border-b border-border bg-card px-6 pb-[14px] pt-[14px]"
        style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
      >
        <div />
        {days.map((day) => {
          const isDayToday = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="flex flex-col items-center justify-center"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gray-500)]">
                {dayLabel(day)}
              </span>
              <span
                className={cn(
                  "mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-bold",
                  isDayToday
                    ? "bg-[var(--blue)] text-white"
                    : "text-[var(--gray-700)]"
                )}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grade de tempo: linhas de 15 min × 7 colunas de dias */}
      <div className="flex-1 overflow-auto px-6 pb-5">
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: "56px repeat(7, 1fr)",
          }}
        >
          {slots.map((minutes) => {
            const isHour = minutes % 60 === 0;
            const time = slotLabel(minutes);

            return (
              <div
                key={minutes}
                className="flex items-stretch"
                style={{ height: `${SLOT_HEIGHT}px`, gridColumn: "1 / -1" }}
              >
                {/* Rótulo de horário: hora inteira destacada, quartos menores */}
                <div
                  className={cn(
                    "w-[56px] flex-shrink-0 pt-[1px] leading-none",
                    isHour
                      ? "text-[11px] font-medium text-[var(--gray-500)]"
                      : "text-[9px] text-[var(--gray-300)]"
                  )}
                >
                  {time}
                </div>

                {days.map((day) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const isDayToday = isToday(day);
                  const isHovered =
                    hoveredSlot?.dayKey === dayKey && hoveredSlot?.time === time;

                  return (
                    <div
                      key={`${minutes}-${dayKey}`}
                      onClick={() => onSlotClick?.(day, time)}
                      onMouseEnter={() => setHoveredSlot({ dayKey, time })}
                      onMouseLeave={() => setHoveredSlot(null)}
                      className={cn(
                        "cursor-pointer border-b border-l border-border transition-colors",
                        isHour
                          ? "border-b-[var(--gray-200)]"
                          : "border-b-[var(--gray-100)]",
                        isDayToday && "bg-[var(--blue)]/[0.03]",
                        !isDayToday && "hover:bg-[var(--gray-50)]"
                      )}
                      style={{
                        background: isHovered
                          ? "rgba(79,126,247,0.05)"
                          : undefined,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}

          {/* Consultas posicionadas por startTime/endTime na coluna do dia */}
          {filteredAppointments.map((appt) => {
            const dentist = dentists.find((d) => d.id === appt.dentistId);
            const dayIndex = days.findIndex(
              (d) => format(d, "yyyy-MM-dd") === appt.date
            );
            if (dayIndex === -1) return null;

            const isDimmed =
              appt.status === "cancelada" || appt.status === "nao_compareceu";
            const isHighlighted =
              filters.patientNames.length > 0 &&
              filters.patientNames.includes(appt.patientName);

            return (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                dentistColor={dentist?.color || "#4F7EF7"}
                dimmed={isDimmed}
                highlighted={isHighlighted}
                onClick={() => onAppointmentClick?.(appt)}
                style={{
                  ...getAppointmentStyle(appt),
                  gridColumn: `${dayIndex + 2} / span 1`,
                  zIndex: 10,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}