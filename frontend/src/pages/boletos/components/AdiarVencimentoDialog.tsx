import { useState } from "react";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Boleto } from "../types";

interface AdiarVencimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boleto: Boleto | null;
  onConfirm: (novoVencimento: string, motivo: string) => void;
}

function brToIso(br: string): string {
  const [d, m, y] = br.split("/");
  return d && m && y ? `${y}-${m}-${d}` : "";
}

function isoToBr(iso: string): string {
  return iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "";
}

export function AdiarVencimentoDialog({
  open,
  onOpenChange,
  boleto,
  onConfirm,
}: AdiarVencimentoDialogProps) {
  const [novoVencimento, setNovoVencimento] = useState("");
  const [motivo, setMotivo] = useState("");

  if (!boleto) return null;

  const vencimentoAtualIso = brToIso(boleto.vencimento);

  function handleConfirm() {
    if (!novoVencimento) return;
    onConfirm(isoToBr(novoVencimento), motivo);
    onOpenChange(false);
    setNovoVencimento("");
    setMotivo("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold tracking-tight">Adiar vencimento</DialogTitle>
          <DialogDescription>
            {boleto.paciente} — Nosso número {boleto.nossoNumero}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-[6px]">
            <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">Vencimento atual</Label>
            <Input value={boleto.vencimento} disabled className="h-10 rounded-[10px] text-[13px] opacity-60" />
          </div>
          <div className="space-y-[6px]">
            <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Novo vencimento <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={novoVencimento}
              min={vencimentoAtualIso}
              onChange={(e) => setNovoVencimento(e.target.value)}
              className="h-10 rounded-[10px] text-[13px]"
            />
          </div>
        </div>

        <div className="mt-3.5 space-y-[6px]">
          <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
            Motivo <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex: solicitação do paciente"
            className="h-10 rounded-[10px] text-[13px]"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!novoVencimento}>
            <CalendarClock className="h-3.5 w-3.5" />
            Confirmar novo vencimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}