import { useEffect, useState } from "react";
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
  /** Exige preenchimento do motivo para poder confirmar (ex: cancelamento). */
  requiresMotivo?: boolean;
  /** Texto do botão de confirmação. */
  confirmLabel?: string;
  /** Variante visual do botão de confirmação. */
  confirmVariant?: "default" | "destructive";
  onConfirm: (motivo?: string) => void;
}

export function ConfirmarAcaoDialog({
  open,
  onOpenChange,
  title,
  description,
  requiresMotivo = false,
  confirmLabel = "Confirmar",
  confirmVariant = "default",
  onConfirm,
}: ConfirmarAcaoDialogProps) {
  const [motivo, setMotivo] = useState("");

  // Limpa o motivo sempre que o diálogo é (re)aberto.
  useEffect(() => {
    if (open) setMotivo("");
  }, [open]);

  function handleConfirm() {
    onConfirm(motivo || undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {requiresMotivo && (
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
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={requiresMotivo && !motivo.trim()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
