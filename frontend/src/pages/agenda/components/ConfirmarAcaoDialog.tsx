import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmarAcaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: (motivo?: string) => void;
}

export function ConfirmarAcaoDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: ConfirmarAcaoDialogProps) {
  const [motivo, setMotivo] = useState("");

  function handleConfirm() {
    onConfirm(motivo || undefined);
    setMotivo("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-[6px]">
          <label className="text-[14px] font-medium text-[var(--gray-700)]">
            Motivo <span className="text-[var(--red)]">*</span>
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Descreva o motivo..."
            rows={3}
            className="h-20 w-full rounded-[10px] border border-border bg-[var(--gray-50)] px-3 py-2 text-[14px] text-[var(--gray-900)] outline-none transition-all focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!motivo.trim()}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
