import { useState } from "react";
import { Check } from "lucide-react";

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
import type { SystemUser } from "../types";

interface EditarEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: SystemUser | null;
  onSave: (novoEmail: string) => void;
}

export function EditarEmailDialog({ open, onOpenChange, user, onSave }: EditarEmailDialogProps) {
  const [novoEmail, setNovoEmail] = useState("");

  if (!user) return null;

  function handleSave() {
    if (!novoEmail.trim()) return;
    onSave(novoEmail.trim());
    onOpenChange(false);
    setNovoEmail("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold tracking-tight">Alterar e-mail</DialogTitle>
          <DialogDescription>{user.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-[6px]">
            <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">E-mail atual</Label>
            <Input value={user.email} disabled className="h-10 rounded-[10px] text-[13px] opacity-60" />
          </div>
          <div className="space-y-[6px]">
            <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Novo e-mail <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              placeholder="novo.email@odontosys.com"
              className="h-10 rounded-[10px] text-[13px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!novoEmail.trim()}>
            <Check className="h-3.5 w-3.5" />
            Salvar e-mail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}