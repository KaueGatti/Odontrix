import { AlertTriangle, Power, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { SystemUser } from "../types";

export type UserConfirmMode = "inativar" | "reativar";

interface ConfirmarUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: SystemUser | null;
  mode: UserConfirmMode;
  onConfirm: () => void;
}

export function ConfirmarUsuarioDialog({
  open,
  onOpenChange,
  user,
  mode,
  onConfirm,
}: ConfirmarUsuarioDialogProps) {
  if (!user) return null;

  const isInativar = mode === "inativar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold tracking-tight">
            {isInativar ? "Inativar usuário" : "Reativar usuário"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isInativar ? "Confirmação de inativação" : "Confirmação de reativação"}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
            isInativar ? "bg-[rgba(245,158,11,0.14)] text-[#b45309]" : "bg-[rgba(74,222,128,0.14)] text-[#16a34a]"
          }`}
        >
          {isInativar ? <AlertTriangle className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
        </div>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          {isInativar ? (
            <>
              Tem certeza que deseja inativar <b className="text-foreground">{user.name}</b>? O usuário perderá o
              acesso ao sistema imediatamente, mas seu histórico será mantido.
            </>
          ) : (
            <>
              Deseja reativar o acesso de <b className="text-foreground">{user.name}</b>? O usuário poderá fazer
              login normalmente novamente.
            </>
          )}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            className={isInativar ? "" : "bg-[#16a34a] text-white hover:bg-[#15803d]"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {isInativar ? <Power className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
            {isInativar ? "Inativar usuário" : "Reativar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}