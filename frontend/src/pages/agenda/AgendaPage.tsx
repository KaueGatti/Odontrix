import { useState, useMemo, useCallback } from "react";
import { addMonths, subMonths, format, addDays, subDays, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import type { ViewMode, FilterState } from "./types";
import { generateMockAppointments } from "./mock-data";
import { MOCK_DENTISTS } from "./mock-data";
import { AgendaHeader } from "./components/AgendaHeader";
import { AgendaFilters } from "./components/AgendaFilters";
import { MensalView } from "./components/MensalView";
import { SemanalView } from "./components/SemanalView";
import { DiariaView } from "./components/DiariaView";
import { NovaConsultaDialog } from "./components/NovaConsultaDialog";
import { DetalhesConsultaDialog } from "./components/DetalhesConsultaDialog";
import { ConfirmarAcaoDialog } from "./components/ConfirmarAcaoDialog";
import { AdvancedFiltersDialog } from "./components/AdvancedFiltersDialog";

const INITIAL_FILTERS: FilterState = {
  specialties: [],
  patientNames: [],
  dentistIds: MOCK_DENTISTS.filter((d) => d.isActive).map((d) => d.id),
  statusList: [],
  typeList: [],
};

export default function AgendaPage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("mes");
  const [currentDate, setCurrentDate] = useState(today);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    generateMockAppointments(today.getFullYear(), today.getMonth())
  );

  const [novaDialogOpen, setNovaDialogOpen] = useState(false);
  const [novaPrefill, setNovaPrefill] = useState<{
    dentistId?: string;
    time?: string;
    date?: string;
  }>({});
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ title: "", description: "", onConfirm: () => {} });
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  const headerTitle = useMemo(() => {
    if (viewMode === "mes") {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
    if (viewMode === "semana") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, "d'/'MM", { locale: ptBR })} — ${format(weekEnd, "d'/'MM'/'yyyy", { locale: ptBR })}`;
    }
    return format(currentDate, "EEEE', 'd' de 'MMMM' de 'yyyy", {
      locale: ptBR,
    });
  }, [viewMode, currentDate]);

  const handlePrev = useCallback(() => {
    if (viewMode === "mes") setCurrentDate((d) => subMonths(d, 1));
    else if (viewMode === "semana") setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subDays(d, 1));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    if (viewMode === "mes") setCurrentDate((d) => addMonths(d, 1));
    else if (viewMode === "semana") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addDays(d, 1));
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setCurrentDate(today);
    setViewMode("mes");
  }, [today]);

  const handleNewAppointment = useCallback(
    (dentistId?: string, time?: string, date?: string) => {
      setNovaPrefill({ dentistId, time, date });
      setNovaDialogOpen(true);
    },
    []
  );

  const handleSaveAppointment = useCallback(
    (data: {
      patientName: string;
      dentistId: string;
      date: string;
      startTime: string;
      durationMin: number;
      type: string;
      notes: string;
    }) => {
      const startHour = Number(data.startTime.split(":")[0]);
      const startMin = Number(data.startTime.split(":")[1]);
      const totalEndMin = startHour * 60 + startMin + data.durationMin;
      const endHour = Math.floor(totalEndMin / 60);
      const endMin = totalEndMin % 60;
      const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
      const dentist = MOCK_DENTISTS.find((d) => d.id === data.dentistId);

      const newAppt: Appointment = {
        id: `appt-new-${Date.now()}`,
        patientId: `pat-${data.patientName.toLowerCase().replace(/\s/g, "-")}`,
        patientName: data.patientName,
        dentistId: data.dentistId,
        dentistName: dentist?.name || "",
        date: data.date,
        startTime: data.startTime,
        endTime,
        durationMin: data.durationMin,
        status: "agendada",
        type: data.type,
        notes: data.notes || undefined,
      };

      setAppointments((prev) => [...prev, newAppt]);
    },
    []
  );

  const handleAppointmentClick = useCallback((appt: Appointment) => {
    setSelectedAppointment(appt);
    setDetalhesDialogOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    (id: string, newStatus: AppointmentStatus) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    },
    []
  );

  const handleConfirmAction = useCallback(
    (title: string, description: string, onConfirm: () => void) => {
      setConfirmAction({ title, description, onConfirm });
      setConfirmDialogOpen(true);
    },
    []
  );

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setViewMode("dia");
  }, []);

  return (
    <div className="flex h-full flex-col">
      <AgendaHeader
        title={headerTitle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewAppointment={() => handleNewAppointment()}
      />

      <div className="flex flex-1 overflow-hidden">
        <AgendaFilters
          filters={filters}
          dentists={MOCK_DENTISTS}
          onFilterChange={setFilters}
        />

        {viewMode === "mes" ? (
          <MensalView
            currentDate={currentDate}
            appointments={appointments}
            dentists={MOCK_DENTISTS}
            onDayClick={handleDayClick}
            onAppointmentClick={handleAppointmentClick}
            onAddAppointment={(date) =>
              handleNewAppointment(undefined, undefined, format(date, "yyyy-MM-dd"))
            }
          />
        ) : viewMode === "semana" ? (
          <SemanalView
            currentDate={currentDate}
            appointments={appointments}
            dentists={MOCK_DENTISTS}
            onDayClick={handleDayClick}
            onAppointmentClick={handleAppointmentClick}
            onAddAppointment={(date) =>
              handleNewAppointment(undefined, undefined, format(date, "yyyy-MM-dd"))
            }
          />
        ) : (
          <DiariaView
            currentDate={currentDate}
            appointments={appointments}
            dentists={MOCK_DENTISTS}
            filters={filters}
            onAppointmentClick={handleAppointmentClick}
            onSlotClick={(dentistId, time) =>
              handleNewAppointment(dentistId, time)
            }
          />
        )}
      </div>

      <NovaConsultaDialog
        open={novaDialogOpen}
        onOpenChange={setNovaDialogOpen}
        dentists={MOCK_DENTISTS}
        selectedDate={novaPrefill.date || format(currentDate, "yyyy-MM-dd")}
        selectedDentistId={novaPrefill.dentistId}
        selectedTime={novaPrefill.time}
        onSave={handleSaveAppointment}
      />

      <DetalhesConsultaDialog
        open={detalhesDialogOpen}
        onOpenChange={setDetalhesDialogOpen}
        appointment={selectedAppointment}
        onStatusChange={handleStatusChange}
        onConfirmAction={handleConfirmAction}
      />

      <ConfirmarAcaoDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        onConfirm={confirmAction.onConfirm}
      />

      <AdvancedFiltersDialog
        open={advancedFiltersOpen}
        onOpenChange={setAdvancedFiltersOpen}
        filters={filters}
        dentists={MOCK_DENTISTS}
        onApply={setFilters}
      />
    </div>
  );
}
