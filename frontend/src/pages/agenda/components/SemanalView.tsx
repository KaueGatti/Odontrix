import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/appointment";
import type { DentistAgenda } from "../types";

interface SemanalViewProps {
  currentDate: Date;
  appointments: Appointment[];
  dentists: DentistAgenda[];
  onDayClick: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onAddAppointment?: (date: Date) => void;
}

export function SemanalView({
  currentDate,
  appointments,
  dentists,
  onDayClick,
  onAppointmentClick,
  onAddAppointment,
}: SemanalViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const key = appt.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(appt);
    }
    return map;
  }, [appointments]);

  const dentistColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of dentists) {
      map.set(d.id, d.color);
    }
    return map;
  }, [dentists]);

  function getApptsForDay(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    return appointmentsByDay.get(key) || [];
  }

  const dayLabel = (day: Date) =>
    format(day, "EEE", { locale: ptBR }).toUpperCase().slice(0, 3);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div
        className="grid border-l border-t border-border"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: "auto minmax(500px, 1fr)",
        }}
      >
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex flex-col items-center justify-center border-b border-r border-border bg-[#fafafa] px-3 py-3"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gray-500)]">
              {dayLabel(day)}
            </span>
            <span
              className={cn(
                "mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-bold",
                isToday(day)
                  ? "bg-[var(--blue)] text-white"
                  : "text-[var(--gray-700)]"
              )}
            >
              {format(day, "d")}
            </span>
          </div>
        ))}

        {days.map((day) => {
          const dayAppts = getApptsForDay(day);
          const isDayToday = isToday(day);

          return (
            <div
              key={`cell-${day.toISOString()}`}
              onClick={() => onDayClick(day)}
              className={cn(
                "relative cursor-pointer border-b border-r border-border bg-card p-2 transition-colors hover:bg-[var(--gray-50)] group/cell",
                isDayToday && "ring-2 ring-[var(--blue)] ring-inset"
              )}
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddAppointment?.(day);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--gray-300)] bg-card text-[var(--gray-400)] opacity-0 transition-all hover:border-[var(--blue)] hover:text-[var(--blue)] group-hover/cell:opacity-100"
                  title="Novo agendamento"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-[6px] space-y-[3px]">
                {dayAppts.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick?.(appt);
                    }}
                    className="cursor-pointer truncate rounded-[10px] border px-[8px] py-[5px] text-[12px]"
                    style={{
                      background: `${dentistColorMap.get(appt.dentistId)}1A`,
                      borderColor: `${dentistColorMap.get(appt.dentistId)}40`,
                    }}
                  >
                    <span className="font-medium">{appt.startTime}</span>{" "}
                    {appt.patientName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
