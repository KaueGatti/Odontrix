import { useEffect, useState } from "react";
import { ChevronDown, History, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  CARD_CLASS,
  FIELD_LABEL_CLASS,
  SEC_LABEL_CLASS,
  TEXTAREA_CLASS,
} from "../shared";
import type { AnamneseData, AnamneseHistorico } from "../types";

interface AnamneseCardProps {
  anamnese: AnamneseData;
  atualizadaEm: string;
  anterior: AnamneseHistorico | null;
  onAtualizar: (nova: AnamneseData) => void;
}

function FieldItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[3px]">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[12.5px] leading-relaxed text-[var(--gray-900)]">
        {value || "—"}
      </span>
    </div>
  );
}

export function AnamneseCard({
  anamnese,
  atualizadaEm,
  anterior,
  onAtualizar,
}: AnamneseCardProps) {
  const [open, setOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [draft, setDraft] = useState<AnamneseData>(anamnese);

  useEffect(() => {
    if (open) setDraft(anamnese);
  }, [open, anamnese]);

  function handleSalvar() {
    onAtualizar(draft);
    setOpen(false);
  }

  return (
    <div className={CARD_CLASS}>
      <div className={SEC_LABEL_CLASS}>
        <span className="flex items-center gap-2">
          Anamnese
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-green-600">
            atualizada em {atualizadaEm}
          </span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-[10px] text-[12px] font-semibold"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Atualizar anamnese
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldItem label="Alergias" value={anamnese.alergias} />
        <FieldItem label="Medicamentos em uso" value={anamnese.medicamentos} />
      </div>
      <div className="mt-3">
        <FieldItem label="Doenças preexistentes" value={anamnese.doencas} />
      </div>

      {anterior && (
        <div className="mt-3 overflow-hidden rounded-[10px] border-[1.5px] border-border">
          <button
            type="button"
            onClick={() => setHistOpen((v) => !v)}
            className="flex w-full cursor-pointer items-center justify-between bg-muted px-3.5 py-2.5 transition-colors hover:bg-[var(--gray-100)]"
          >
            <span className="flex items-center gap-2 text-[11.5px] font-medium text-[var(--gray-900)]">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              Registro anterior — {anterior.data}
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 text-muted-foreground transition-transform",
                histOpen && "rotate-180"
              )}
            />
          </button>
          {histOpen && (
            <div className="border-t border-border px-3.5 py-3.5 text-[11.5px] leading-relaxed text-[var(--gray-500)]">
              <div className="mb-1.5">
                <b className="text-[var(--gray-900)]">Alergias:</b>{" "}
                {anterior.anamnese.alergias}
              </div>
              <div className="mb-1.5">
                <b className="text-[var(--gray-900)]">Medicamentos em uso:</b>{" "}
                {anterior.anamnese.medicamentos}
              </div>
              <div>
                <b className="text-[var(--gray-900)]">Doenças preexistentes:</b>{" "}
                {anterior.anamnese.doencas}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de atualização da anamnese */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold tracking-[-0.2px]">
              Atualizar anamnese
            </DialogTitle>
            <DialogDescription className="text-[11.5px]">
              O registro anterior será preservado no histórico
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-col gap-[6px]">
              <label className={FIELD_LABEL_CLASS}>Alergias</label>
              <textarea
                rows={2}
                value={draft.alergias}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, alergias: e.target.value }))
                }
                className={TEXTAREA_CLASS}
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className={FIELD_LABEL_CLASS}>Medicamentos em uso</label>
              <textarea
                rows={2}
                value={draft.medicamentos}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, medicamentos: e.target.value }))
                }
                className={TEXTAREA_CLASS}
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className={FIELD_LABEL_CLASS}>
                Doenças preexistentes
              </label>
              <textarea
                rows={2}
                value={draft.doencas}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, doencas: e.target.value }))
                }
                className={TEXTAREA_CLASS}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
