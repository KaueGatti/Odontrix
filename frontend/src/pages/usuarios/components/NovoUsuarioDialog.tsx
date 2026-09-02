import { useState } from "react";
import { Check, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface NovoUsuarioPayload {
  name: string;
  email: string;
}

interface NovoUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: NovoUsuarioPayload) => void;
}

export function NovoUsuarioDialog({ open, onOpenChange, onSave }: NovoUsuarioDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSave() {
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim() });
    onOpenChange(false);
    setName("");
    setEmail("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold tracking-tight">Novo usuário</DialogTitle>
          <DialogDescription>Cria uma nova conta de acesso Gerente</DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex items-center gap-2.5 rounded-[10px] border border-[rgba(79,126,247,0.18)] bg-[rgba(79,126,247,0.07)] px-3.5 py-2.5 text-[11.5px] font-medium text-primary">
          <Info className="h-4 w-4 shrink-0" />
          Dentistas e recepcionistas são cadastrados na etapa &quot;Acesso&quot; do respectivo formulário de perfil.
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="space-y-[6px]">
            <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Nome completo <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ana Beatriz Lima"
              className="h-10 rounded-[10px] text-[13px]"
            />
          </div>
          <div className="space-y-[6px]">
            <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              E-mail <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ana.lima@odontosys.com"
              className="h-10 rounded-[10px] text-[13px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-[6px]">
              <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">Perfil</Label>
              <Select disabled className="h-10 rounded-[10px] text-[13px] opacity-60">
                <option>Gerente</option>
              </Select>
            </div>
            <div className="space-y-[6px]">
              <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
                Senha provisória <span className="text-destructive">*</span>
              </Label>
              <Input disabled value="Gerada automaticamente" className="h-10 rounded-[10px] text-[13px] opacity-60" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim() || !email.trim()}>
            <Check className="h-3.5 w-3.5" />
            Criar usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}