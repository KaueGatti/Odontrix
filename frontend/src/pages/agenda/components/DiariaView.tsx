import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { Appointment } from "@/types/appointment";
import type { DentistAgenda, FilterState } from "../types";
import { AppointmentCard } from "./AppointmentCard";

interface DiariaViewProps {
  currentDate: Date;
  appointments: Appointment[];
  dentists: DentistAgenda[];
  filters: FilterState;
  onAppointmentClick: (appointment: Appointment) => void;
  onSlotClick: (dentistId: string, time: string) => void;
}

const START_HOUR = 8;
const END_HOUR = 19;
const HOUR_HEIGHT = 60;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function DiariaView({
  currentDate,
  appointments,
  dentists,
  filters,
  onAppointmentClick,
  onSlotClick,
}: DiariaViewProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{
    dentistId: string;
    hour: number;
  } | null>(null);

  const visibleDentists = useMemo(() => {
    let list = dentists.filter((d) => filters.dentistIds.includes(d.id));
    if (filters.specialties.length > 0) {
      list = list.filter((d) => filters.specialties.includes(d.specialty));
    }
    return list;
  }, [dentists, filters.dentistIds, filters.specialties]);

  const filteredAppointments = useMemo(() => {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    return appointments.filter((a) => {
      if (a.date !== dateStr) return false;
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
  }, [appointments, currentDate, filters, dentists]);

  const hours = useMemo(
    () =>
      Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i),
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

  const numDentistCols = visibleDentists.length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        className="grid border-b border-border bg-card px-6 pb-[14px] pt-[14px]"
        style={{
          gridTemplateColumns: `56px repeat(${numDentistCols}, 1fr)`,
        }}
      >
        <div />
        {visibleDentists.map((dentist) => (
          <div key={dentist.id} className="px-[14px]">
            <div className="text-[13.5px] font-bold text-[var(--gray-900)]">
              {dentist.name}
            </div>
            <span
              className="mr-[6px] mt-1 inline-block rounded-full border px-[9px] py-[2px] text-[10.5px]"
              style={{
                background: `${dentist.color}1A`,
                borderColor: `${dentist.color}40`,
                color: dentist.color,
              }}
            >
              {dentist.specialty}
            </span>
            <span className="text-[11px] text-[var(--gray-400)]">
              {dentist.workHours.start} – {dentist.workHours.end}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-6 pb-5">
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: `56px repeat(${numDentistCols}, 1fr)`,
          }}
        >
          {hours.map((hour) => (
            <div key={hour} style={{ gridColumn: "1 / -1" }}>
              <div
                className="flex items-start"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                <div className="w-[56px] pt-[2px] text-[11px] text-[var(--gray-400)]">
                  {hour}:00
                </div>
                <div
                  className="flex-1"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${numDentistCols}, 1fr)`,
                  }}
                >
                  {visibleDentists.map((dentist) => {
                    const isHovered =
                      hoveredSlot?.dentistId === dentist.id &&
                      hoveredSlot?.hour === hour;

                    return (
                      <div
                        key={dentist.id}
                        onClick={() => {
                          const time = `${String(hour).padStart(2, "0")}:00`;
                          onSlotClick(dentist.id, time);
                        }}
                        onMouseEnter={() =>
                          setHoveredSlot({
                            dentistId: dentist.id,
                            hour,
                          })
                        }
                        onMouseLeave={() => setHoveredSlot(null)}
                        className="relative cursor-pointer border-l border-border transition-colors"
                        style={{
                          height: `${HOUR_HEIGHT}px`,
                          background: isHovered
                            ? "rgba(79,126,247,0.05)"
                            : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div
                className="h-[1px] bg-[var(--gray-200)]"
                style={{ gridColumn: "1 / -1" }}
              />
            </div>
          ))}

          {filteredAppointments.map((appt) => {
            const dentist = dentists.find((d) => d.id === appt.dentistId);
            const colIndex = visibleDentists.findIndex(
              (d) => d.id === appt.dentistId
            );
            if (colIndex === -1) return null;

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
                onClick={() => onAppointmentClick(appt)}
                style={{
                  ...getAppointmentStyle(appt),
                  gridColumn: `${colIndex + 2} / span 1`,
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
