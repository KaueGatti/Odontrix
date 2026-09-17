import { useState, useRef, useEffect } from "react";
import { Search, UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DentistAgenda } from "../types";
import {
  addMockPatient,
  findMockPatientByName,
  listMockPatientNames,
  type MockPatientInput,
} from "@/pages/patients/mock-data";
import { NovoPacienteDialog } from "@/pages/patients/dialogs/NovoPacienteDialog";

interface NovaConsultaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dentists: DentistAgenda[];
  selectedDate: string;
  selectedDentistId?: string;
  selectedTime?: string;
  onSave: (data: {
    patientName: string;
    /** Id do paciente quando ele consta no registro (seed ou cadastro rápido). */
    patientId?: string;
    dentistId: string;
    date: string;
    startTime: string;
    durationMin: number;
    type: string;
    notes: string;
  }) => void;
}

const APPOINTMENT_TYPES = [
  { value: "consulta", label: "Consulta" },
  { value: "retorno", label: "Retorno" },
  { value: "procedimento", label: "Procedimento" },
  { value: "emergencia", label: "Emergência" },
  { value: "avaliacao", label: "Avaliação" },
  { value: "implante", label: "Implante" },
  { value: "manutencao", label: "Manutenção" },
];

export function NovaConsultaDialog({
  open,
  onOpenChange,
  dentists,
  selectedDate,
  selectedDentistId,
  selectedTime,
  onSave,
}: NovaConsultaDialogProps) {
  const [patientName, setPatientName] = useState("");
  const [dentistId, setDentistId] = useState(selectedDentistId || "");
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState(selectedTime || "08:00");
  const [durationMin, setDurationMin] = useState(60);
  const [type, setType] = useState("consulta");
  const [notes, setNotes] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [novoPacienteOpen, setNovoPacienteOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setPatientName("");
      setDentistId(selectedDentistId || "");
      setDate(selectedDate);
      setStartTime(selectedTime || "08:00");
      setDurationMin(60);
      setType("consulta");
      setNotes("");
      setSearchValue("");
      setNovoPacienteOpen(false);
    }
  }, [open, selectedDentistId, selectedDate, selectedTime]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Relê o registro a cada render para que um paciente criado pelo cadastro
  // rápido já apareça nas próximas buscas.
  const filteredPatients = listMockPatientNames().filter(
    (name) =>
      name.toLowerCase().includes(searchValue.toLowerCase()) &&
      name !== patientName
  );

  const typedName = searchValue.trim();
  const suggestions = patientName ? [patientName] : filteredPatients.slice(0, 8);

  function handleSave() {
    if (!patientName || !dentistId || !date || !startTime) return;
    onSave({
      patientName,
      patientId: findMockPatientByName(patientName)?.id,
      dentistId,
      date,
      startTime,
      durationMin,
      type,
      notes,
    });
    onOpenChange(false);
  }

  /** Abre o cadastro rápido mantendo o texto digitado (usado como nome). */
  function handleOpenNewPatient() {
    setShowSuggestions(false);
    setNovoPacienteOpen(true);
  }

  function handleNewPatientSaved(payload: MockPatientInput) {
    const patient = addMockPatient(payload);
    setPatientName(patient.fullName);
    setSearchValue("");
    setNovoPacienteOpen(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova consulta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-[6px]">
            <Label className="text-[14px]">Paciente</Label>
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-[11px] top-[11px] h-4 w-4 text-[var(--gray-400)]" />
              <input
                value={patientName || searchValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (patientName) {
                    setPatientName("");
                    setSearchValue(val);
                  } else {
                    setSearchValue(val);
                  }
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Buscar paciente..."
                className="h-10 w-full rounded-[10px] border border-border bg-[var(--gray-50)] px-3 pl-10 text-[14px] text-[var(--gray-900)] outline-none transition-all focus:border-[var(--blue)] focus:bg-card focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
              />
              {patientName && (
                <button
                  onClick={() => {
                    setPatientName("");
                    setSearchValue("");
                  }}
                  className="absolute right-[7px] top-[6px]"
                >
                  <X className="h-3.5 w-3.5 text-[var(--gray-400)]" />
                </button>
              )}
              {showSuggestions && (searchValue || !patientName) && (
                <div className="absolute left-0 right-0 top-10 z-20 max-h-[240px] overflow-auto rounded-[10px] border border-border bg-card shadow-[0_12px_28px_rgba(15,32,80,0.12)]">
                  {/* Cadastro rápido com o nome digitado — sempre a 1ª opção */}
                  {!patientName && typedName && (
                    <div
                      onClick={handleOpenNewPatient}
                      className="flex cursor-pointer items-center gap-2 border-b border-[var(--gray-100)] p-[10px_12px] text-[13.5px] font-semibold text-[var(--blue)] hover:bg-[rgba(79,126,247,0.07)]"
                    >
                      <UserPlus className="h-3.5 w-3.5 shrink-0" />
                      Cadastrar &quot;{typedName}&quot;
                    </div>
                  )}
                  {suggestions.length === 0 ? (
                    <div className="p-[10px] text-[13px] italic text-[var(--gray-400)]">
                      Nenhum paciente encontrado
                    </div>
                  ) : (
                    suggestions.map((name) => (
                      <div
                        key={name}
                        onClick={() => {
                          setPatientName(name);
                          setSearchValue("");
                          setShowSuggestions(false);
                        }}
                        className="cursor-pointer border-b border-[var(--gray-100)] p-[10px_12px] text-[14px] text-[var(--gray-700)] last:border-b-0 hover:bg-[var(--gray-50)]"
                      >
                        {name}
                        {name === patientName && (
                          <span className="ml-2 text-[11px] text-[var(--blue)]">
                            (selecionado)
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-[6px]">
            <Label className="text-[14px]">Dentista</Label>
            <select
              value={dentistId}
              onChange={(e) => setDentistId(e.target.value)}
              className="h-10 w-full rounded-[10px] border border-border bg-[var(--gray-50)] px-3 pr-9 text-[14px] text-[var(--gray-900)] outline-none transition-all focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
            >
              <option value="">Selecione um dentista</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} - {d.specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-[6px]">
              <Label className="text-[14px]">Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-[14px]"
              />
            </div>
            <div className="space-y-[6px]">
              <Label className="text-[14px]">Horário</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 text-[14px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-[6px]">
              <Label className="text-[14px]">Duração (min)</Label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="h-10 w-full rounded-[10px] border border-border bg-[var(--gray-50)] px-3 pr-9 text-[14px] text-[var(--gray-900)] outline-none transition-all focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
              >
                {[30, 45, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-[6px]">
              <Label className="text-[14px]">Tipo</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-10 w-full rounded-[10px] border border-border bg-[var(--gray-50)] px-3 pr-9 text-[14px] text-[var(--gray-900)] outline-none transition-all focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-[6px]">
            <Label className="text-[14px]">Observações</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
              className="h-20 w-full rounded-[10px] border border-border bg-[var(--gray-50)] px-3 py-2 text-[14px] text-[var(--gray-900)] outline-none transition-all focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!patientName || !dentistId}>
            Salvar
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cadastro rápido aberto pela opção "Cadastrar «nome digitado»" do
          combobox de paciente — mantém este dialog aberto por baixo. */}
      <NovoPacienteDialog
        open={novoPacienteOpen}
        onOpenChange={setNovoPacienteOpen}
        initialFullName={typedName}
        onSave={handleNewPatientSaved}
      />
    </>
  );
}
