import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/appointment";
import { APPOINTMENT_STATUS_LABELS } from "@/types/appointment";
import type { DentistAgenda, FilterState } from "../types";
import { MOCK_PATIENTS } from "../mock-data";

interface AdvancedFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  dentists: DentistAgenda[];
  onApply: (filters: FilterState) => void;
}

const STATUS_LIST: AppointmentStatus[] = [
  "agendada",
  "confirmada",
  "em_espera",
  "em_atendimento",
  "realizada",
  "cancelada",
  "nao_compareceu",
];

const TYPE_OPTIONS = [
  { value: "consulta", label: "Consulta" },
  { value: "retorno", label: "Retorno" },
  { value: "procedimento", label: "Procedimento" },
  { value: "emergencia", label: "Emergência" },
  { value: "avaliacao", label: "Avaliação" },
  { value: "implante", label: "Implante" },
  { value: "manutencao", label: "Manutenção" },
];

export function AdvancedFiltersDialog({
  open,
  onOpenChange,
  filters,
  dentists,
  onApply,
}: AdvancedFiltersDialogProps) {
  const [draft, setDraft] = useState<FilterState>(filters);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredPatients = MOCK_PATIENTS.filter(
    (name) =>
      name.toLowerCase().includes(searchValue.toLowerCase()) &&
      !draft.patientNames.includes(name)
  );

  function toggleStatus(status: AppointmentStatus) {
    setDraft((prev) => ({
      ...prev,
      statusList: prev.statusList.includes(status)
        ? prev.statusList.filter((s) => s !== status)
        : [...prev.statusList, status],
    }));
  }

  function toggleType(type: string) {
    setDraft((prev) => ({
      ...prev,
      typeList: prev.typeList.includes(type)
        ? prev.typeList.filter((t) => t !== type)
        : [...prev.typeList, type],
    }));
  }

  function toggleDentist(id: string) {
    setDraft((prev) => ({
      ...prev,
      dentistIds: prev.dentistIds.includes(id)
        ? prev.dentistIds.filter((d) => d !== id)
        : [...prev.dentistIds, id],
    }));
  }

  function addPatient(name: string) {
    setDraft((prev) => ({
      ...prev,
      patientNames: [...prev.patientNames, name],
    }));
    setSearchValue("");
    setShowSuggestions(false);
  }

  function removePatient(name: string) {
    setDraft((prev) => ({
      ...prev,
      patientNames: prev.patientNames.filter((n) => n !== name),
    }));
  }

  function handleClearAll() {
    setDraft({
      specialties: filters.specialties,
      patientNames: [],
      dentistIds: dentists.map((d) => d.id),
      statusList: [],
      typeList: [],
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Filtros avançados</DialogTitle>
          <DialogDescription>
            Combine critérios para refinar os agendamentos exibidos na agenda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <p className="mb-[10px] text-[11px] font-bold tracking-[0.05em] text-[var(--gray-500)]">
              PACIENTE
            </p>
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-[9px] top-[9px] h-3 w-3 text-[var(--gray-400)]" />
              <input
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Buscar paciente por nome..."
                className="h-10 w-full rounded-[10px] border border-border bg-[var(--gray-50)] px-3 pl-8 text-[14px] text-[var(--gray-900)] outline-none transition-all focus:border-[var(--blue)] focus:bg-card focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
              />
              {showSuggestions && searchValue && (
                <div className="absolute left-0 right-0 top-9 z-20 overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_12px_28px_rgba(15,32,80,0.12)]">
                  {filteredPatients.length === 0 ? (
                    <div className="p-[10px] text-[11px] italic text-[var(--gray-400)]">
                      Nenhum paciente encontrado
                    </div>
                  ) : (
                    filteredPatients.slice(0, 5).map((name) => (
                      <div
                        key={name}
                        onClick={() => addPatient(name)}
                        className="cursor-pointer border-b border-[var(--gray-100)] p-[10px_12px] text-[14px] text-[var(--gray-700)] last:border-b-0 hover:bg-[var(--gray-50)]"
                      >
                        {name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {draft.patientNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-[6px]">
                {draft.patientNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-[6px] rounded-full border border-[rgba(79,126,247,0.25)] bg-[rgba(79,126,247,0.1)] px-[10px] py-[4px] text-[13px] font-medium text-[var(--blue)]"
                  >
                    {name}
                    <button
                      onClick={() => removePatient(name)}
                      className="border-none bg-transparent p-0 text-[var(--blue)] opacity-70 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-[10px] text-[11px] font-bold tracking-[0.05em] text-[var(--gray-500)]">
              STATUS DO AGENDAMENTO
            </p>
            <div className="flex flex-wrap gap-[7px]">
              {STATUS_LIST.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={cn(
                    "rounded-full border border-[var(--gray-200)] px-[13px] py-[6px] text-[14px] transition-all",
                    draft.statusList.includes(status)
                      ? "border-transparent bg-[var(--blue)] text-white"
                      : "bg-[var(--gray-50)] text-[var(--gray-700)] hover:border-[var(--gray-300)]"
                  )}
                >
                  {APPOINTMENT_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-[10px] text-[11px] font-bold tracking-[0.05em] text-[var(--gray-500)]">
              TIPO DE CONSULTA
            </p>
            <div className="flex flex-wrap gap-[7px]">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleType(t.value)}
                  className={cn(
                    "rounded-full border border-[var(--gray-200)] px-[13px] py-[6px] text-[14px] transition-all",
                    draft.typeList.includes(t.value)
                      ? "border-transparent bg-[var(--blue)] text-white"
                      : "bg-[var(--gray-50)] text-[var(--gray-700)] hover:border-[var(--gray-300)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-[10px] text-[11px] font-bold tracking-[0.05em] text-[var(--gray-500)]">
              DENTISTA
            </p>
            <div className="space-y-2">
              {dentists.map((dentist) => (
                <div
                  key={dentist.id}
                  className="flex items-center gap-2 py-[4px]"
                >
                  <span
                    className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
                    style={{ background: dentist.color }}
                  />
                  <div className="flex-1">
                    <span className="text-[14px] font-medium text-[var(--gray-900)]">
                      {dentist.name}
                    </span>
                    <span className="ml-2 text-[12px] text-[var(--gray-400)]">
                      {dentist.specialty}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleDentist(dentist.id)}
                    className={cn(
                      "relative h-[17px] w-[30px] flex-shrink-0 cursor-pointer rounded-[9px] border-none transition-colors",
                      draft.dentistIds.includes(dentist.id)
                        ? "bg-[var(--blue)]"
                        : "bg-[var(--gray-200)]"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-[2px] top-[2px] h-[13px] w-[13px] rounded-full bg-white transition-all",
                        draft.dentistIds.includes(dentist.id) && "left-[15px]"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="items-center justify-between">
          <button
            onClick={handleClearAll}
            className="border-none bg-transparent text-[12px] text-[var(--gray-500)] underline hover:text-[var(--gray-700)]"
          >
            Limpar tudo
          </button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { onApply(draft); onOpenChange(false); }}>
              Aplicar filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
