import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import type { ViewMode, FilterState } from "./types";
import {
  generateMockAppointments,
  getMockAppointmentById,
  setMockAppointmentStatus,
  syncMockAppointments,
} from "./mock-data";
import { MOCK_DENTISTS } from "./mock-data";
import { AgendaHeader } from "./components/AgendaHeader";
import { AgendaFilters } from "./components/AgendaFilters";
import { MensalView } from "./components/MensalView";
import { SemanalView } from "./components/SemanalView";
import { DiariaView } from "./components/DiariaView";
import { NovaConsultaDialog } from "./components/NovaConsultaDialog";
import {
  DetalhesConsultaDialog,
  type ConfirmActionOptions,
} from "./components/DetalhesConsultaDialog";
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

  // Ao montar (ou voltar de outra rota), reaplica os status persistidos no
  // registro compartilhado (ex: consulta finalizada na tela de atendimento).
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    generateMockAppointments(today.getFullYear(), today.getMonth()).map(
      (a) => getMockAppointmentById(a.id) ?? a
    )
  );

  // Mantém o registro compartilhado em sincronia com o estado local para que
  // outras telas (ex: /agenda/atendimento/:id) leiam os dados atuais.
  useEffect(() => {
    syncMockAppointments(appointments);
  }, [appointments]);

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
  const [confirmAction, setConfirmAction] = useState<ConfirmActionOptions>({
    title: "",
    description: "",
    onConfirm: () => {},
  });
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

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
      patientId?: string;
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
        patientId:
          data.patientId ??
          `pat-${data.patientName.toLowerCase().replace(/\s/g, "-")}`,
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
      // Mantém o modal de detalhes aberto refletindo o novo status.
      setSelectedAppointment((prev) =>
        prev?.id === id ? { ...prev, status: newStatus } : prev
      );
      // Persiste imediatamente no registro compartilhado — a navegação para a
      // tela de atendimento pode acontecer antes do useEffect sincronizar.
      setMockAppointmentStatus(id, newStatus);
    },
    []
  );

  const handleConfirmAction = useCallback((options: ConfirmActionOptions) => {
    setConfirmAction(options);
    setConfirmDialogOpen(true);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setViewMode("dia");
  }, []);

  // Mini-calendário: clique num dia —
  // • Dia/Semana: apenas muda o dia/semana selecionada (mantém a vista).
  // • Mês: muda para a vista Dia (clique em dia => dia específico).
  const handleSelectDate = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      if (viewMode === "mes") {
        setViewMode("dia");
      }
    },
    [viewMode]
  );

  // Mini-calendário: setas de mês no modo "Mês" — move o mês selecionado da
  // agenda (mesmo dia, clampado ao último dia do mês) mantendo a vista Mensal.
  const handleMonthChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar (mini-calendário + filtros): coluna esquerda com 100% de altura,
          ocupando também o espaço onde ficava a navegação do header. A seleção
          de data/semana/mês acontece apenas pelo mini-calendário. */}
      <AgendaFilters
        filters={filters}
        dentists={MOCK_DENTISTS}
        onFilterChange={setFilters}
        currentDate={currentDate}
        appointments={appointments}
        onSelectDate={handleSelectDate}
        onMonthChange={handleMonthChange}
        viewMode={viewMode}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AgendaHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewAppointment={() => handleNewAppointment()}
        />

        <div className="flex flex-1 overflow-hidden">

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
            filters={filters}
            onAppointmentClick={handleAppointmentClick}
            onSlotClick={(date, time) =>
              handleNewAppointment(
                undefined,
                time,
                format(date, "yyyy-MM-dd")
              )
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
        requiresMotivo={confirmAction.requiresMotivo}
        confirmLabel={confirmAction.confirmLabel}
        confirmVariant={confirmAction.confirmVariant}
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
