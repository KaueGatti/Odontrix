import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DentistAgenda, FilterState } from "../types";
import { SPECIALTIES } from "../types";
import { MOCK_PATIENTS } from "../mock-data";

interface AgendaFiltersProps {
  filters: FilterState;
  dentists: DentistAgenda[];
  onFilterChange: (filters: FilterState) => void;
}

export function AgendaFilters({
  filters,
  dentists,
  onFilterChange,
}: AgendaFiltersProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      !filters.patientNames.includes(name)
  );

  const visibleDentists = useMemo(() => {
    if (filters.specialties.length === 0) return dentists;
    return dentists.filter((d) => filters.specialties.includes(d.specialty));
  }, [dentists, filters.specialties]);

  function addPatient(name: string) {
    onFilterChange({
      ...filters,
      patientNames: [...filters.patientNames, name],
    });
    setSearchValue("");
    setShowSuggestions(false);
  }

  function removePatient(name: string) {
    onFilterChange({
      ...filters,
      patientNames: filters.patientNames.filter((n) => n !== name),
    });
  }

  function toggleSpecialty(spec: string) {
    const newSpecs = filters.specialties.includes(spec)
      ? filters.specialties.filter((s) => s !== spec)
      : [...filters.specialties, spec];
    onFilterChange({ ...filters, specialties: newSpecs });
  }

  function toggleDentist(id: string) {
    const ids = filters.dentistIds.includes(id)
      ? filters.dentistIds.filter((d) => d !== id)
      : [...filters.dentistIds, id];
    onFilterChange({ ...filters, dentistIds: ids });
  }

  return (
    <div className="w-[228px] flex-shrink-0 overflow-y-auto border-r border-border bg-card px-[18px] py-5">
      <div className="mb-[18px]">
        <div className="mb-[10px] flex items-center justify-between text-[10.5px] font-bold tracking-[0.06em] text-[var(--gray-500)]">
          ESPECIALIDADE
        </div>
        <div className="flex flex-wrap gap-[6px]">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => toggleSpecialty(spec)}
              className={cn(
                "rounded-full border px-3 py-[5px] text-[12px] transition-all",
                filters.specialties.includes(spec)
                  ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                  : "border-border bg-card text-[var(--gray-700)] hover:border-[var(--gray-300)]"
              )}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-[18px]">
        <div className="mb-[10px] flex items-center justify-between text-[10.5px] font-bold tracking-[0.06em] text-[var(--gray-500)]">
          PACIENTE
        </div>
        <div className="relative mb-2" ref={searchRef}>
          <Search className="absolute left-[9px] top-[9px] h-3 w-3 text-[var(--gray-400)]" />
          <input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar paciente..."
            className="h-8 w-full rounded-[10px] border border-border bg-[var(--gray-50)] py-0 pl-7 pr-2 text-[12px] text-[var(--gray-900)] outline-none transition-all focus:border-[var(--blue)] focus:bg-card focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue("");
                inputRef.current?.focus();
              }}
              className="absolute right-[7px] top-[6px] h-[18px] w-[18px] rounded-full border-none bg-transparent text-[var(--gray-400)]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
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
                    className="cursor-pointer border-b border-[var(--gray-100)] p-[8px_10px] text-[12px] text-[var(--gray-700)] last:border-b-0 hover:bg-[var(--gray-50)]"
                  >
                    {name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {filters.patientNames.length > 0 && (
          <div className="mb-[18px] flex flex-wrap gap-[6px]">
            {filters.patientNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-[6px] rounded-full border border-[rgba(79,126,247,0.25)] bg-[rgba(79,126,247,0.1)] px-[10px] py-[4px] text-[11.5px] font-medium text-[var(--blue)]"
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

      <div className="mb-[10px] text-[10.5px] font-bold tracking-[0.06em] text-[var(--gray-500)]">
        DENTISTAS
      </div>
      {visibleDentists.map((dentist) => (
        <div
          key={dentist.id}
          className="flex items-center gap-2 py-[7px]"
        >
          <span
            className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
            style={{ background: dentist.color }}
          />
          <div className="flex-1">
            <div className="text-[12px] font-medium text-[var(--gray-900)]">
              {dentist.name}
            </div>
            <div className="text-[10.5px] text-[var(--gray-400)]">
              {dentist.specialty}
            </div>
          </div>
          <button
            onClick={() => toggleDentist(dentist.id)}
            className={cn(
              "relative h-[17px] w-[30px] flex-shrink-0 cursor-pointer rounded-[9px] border-none transition-colors",
              filters.dentistIds.includes(dentist.id)
                ? "bg-[var(--blue)]"
                : "bg-[var(--gray-200)]"
            )}
          >
            <span
              className={cn(
                "absolute left-[2px] top-[2px] h-[13px] w-[13px] rounded-full bg-white transition-all",
                filters.dentistIds.includes(dentist.id) && "left-[15px]"
              )}
            />
          </button>
        </div>
      ))}

      {visibleDentists.length === 0 && (
        <div className="mt-[14px] rounded-[10px] border border-border bg-[var(--gray-50)] p-[9px_11px] text-[11px] text-[var(--gray-500)]">
          Nenhum dentista encontrado para a especialidade selecionada.
        </div>
      )}

      <div className="mt-[14px] rounded-[10px] border border-border bg-[var(--gray-50)] p-[9px_11px] text-[11px] text-[var(--gray-500)]">
        Mostrando quem atende hoje.
      </div>
    </div>
  );
}
