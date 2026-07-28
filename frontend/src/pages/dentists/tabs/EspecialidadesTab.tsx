import { useState } from "react";
import { Plus, X, CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* eslint-disable @typescript-eslint/no-unused-vars */

interface EspecialidadesTabProps {
  dentistId: number;
}

// TODO: substituir pela lista real vinda da API (tabela specialty)
const MOCK_ALL_SPECIALTIES = [
  { id: 1, name: "Ortodontia" },
  { id: 2, name: "Implantodontia" },
  { id: 3, name: "Dentística" },
  { id: 4, name: "Endodontia" },
  { id: 5, name: "Periodontia" },
  { id: 6, name: "Cirurgia Oral" },
  { id: 7, name: "Odontopediatria" },
  { id: 8, name: "Prótese Dentária" },
];

// TODO: integrar com o endpoint real GET /dentists/{id}/specialties
const MOCK_DENTIST_SPECIALTY_IDS = [1, 2, 3];

export function EspecialidadesTab({ dentistId: _dentistId }: EspecialidadesTabProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(MOCK_DENTIST_SPECIALTY_IDS);
  const [showAdder, setShowAdder] = useState(false);

  const available = MOCK_ALL_SPECIALTIES.filter(
    (s) => !selectedIds.includes(s.id),
  );

  const handleAdd = (id: number) => {
    setSelectedIds((prev) => [...prev, id]);
    setShowAdder(false);
  };

  const handleRemove = (id: number) => {
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  };

  return (
    <div className="flex flex-col gap-4 px-9 py-7">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Especialidades Vinculadas
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdder(true)}
            disabled={available.length === 0}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>

        <div className="p-5">
          {selectedIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma especialidade vinculada.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {MOCK_ALL_SPECIALTIES.filter((s) => selectedIds.includes(s.id)).map(
                (specialty) => (
                  <span
                    key={specialty.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-[12px] font-medium text-foreground"
                  >
                    <CircleCheck className="h-3.5 w-3.5 text-primary" />
                    {specialty.name}
                    <button
                      type="button"
                      onClick={() => handleRemove(specialty.id)}
                      className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remover ${specialty.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ),
              )}
            </div>
          )}
        </div>
      </Card>

      {showAdder && available.length > 0 && (
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              Adicionar Especialidade
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdder(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 p-5">
            {available.map((specialty) => (
              <button
                key={specialty.id}
                type="button"
                onClick={() => handleAdd(specialty.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="h-3 w-3" />
                {specialty.name}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
