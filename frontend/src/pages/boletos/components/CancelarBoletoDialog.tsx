import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Boleto } from "../types";

interface CancelarBoletoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boleto: Boleto | null;
  onConfirm: () => void;
}

export function CancelarBoletoDialog({
  open,
  onOpenChange,
  boleto,
  onConfirm,
}: CancelarBoletoDialogProps) {
  if (!boleto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold tracking-tight">Cancelar boleto</DialogTitle>
          <DialogDescription className="sr-only">Confirmação de cancelamento de boleto</DialogDescription>
        </DialogHeader>

        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <Ban className="h-5 w-5" />
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Tem certeza que deseja cancelar o boleto de <b className="text-foreground">{boleto.paciente}</b> (nosso
          número <b className="text-foreground">{boleto.nossoNumero}</b>)? Esta ação não pode ser desfeita — um
          novo boleto precisará ser emitido caso a cobrança continue válida.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button
            type="button"
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            <Ban className="h-3.5 w-3.5" />
            Cancelar boleto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}