import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { useState } from "react";

const FIELD_CLASS = "h-10 rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] px-3 text-[13px] text-foreground outline-none transition-[border-color,box-shadow,background] focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]";
const SELECT_CLASS = FIELD_CLASS + " appearance-none bg-no-repeat";

interface NovaDespesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaDespesaDialog({
  open,
  onOpenChange,
}: NovaDespesaDialogProps) {
  const [valorCents, setValorCents] = useState<number | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[480px]">
        <DialogHeader>
          <DialogTitle>Nova despesa</DialogTitle>
          <DialogDescription>
            Cria uma conta a pagar pendente
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-[6px]">
          <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
            Descrição <span className="text-destructive">*</span>
          </label>
          <input
            className={FIELD_CLASS}
            placeholder="Ex: Conta de energia — maio"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Centro de custo <span className="text-destructive">*</span>
            </label>
            <select
              className={SELECT_CLASS}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E\")", backgroundPosition: "right 12px center" }}
            >
              <option>Materiais</option>
              <option>Aluguel</option>
              <option>Salários</option>
              <option>Outros</option>
            </select>
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Valor <span className="text-destructive">*</span>
            </label>
            <MoneyInput
              value={valorCents}
              onCentsChange={setValorCents}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Emissão <span className="text-destructive">*</span>
            </label>
            <input
              className={FIELD_CLASS}
              placeholder="DD/MM/AAAA"
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Vencimento <span className="text-destructive">*</span>
            </label>
            <input
              className={FIELD_CLASS}
              placeholder="DD/MM/AAAA"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-[6px]">
          <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
            Observação
          </label>
          <input
            className={FIELD_CLASS}
            placeholder="Opcional"
          />
        </div>

        <DialogFooter>
          <button
            className="inline-flex h-[36px] cursor-pointer items-center gap-[7px] rounded-[10px] border-[1.5px] border-border bg-background px-5 text-[13px] font-semibold text-[var(--gray-700)] transition-all hover:border-[var(--gray-300)]"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </button>
          <button
            className="inline-flex h-[36px] cursor-pointer items-center gap-[7px] rounded-[10px] border-[1.5px] border-primary bg-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-[0_6px_16px_rgba(79,126,247,0.3)] transition-all hover:bg-[#3a6af3]"
            onClick={() => onOpenChange(false)}
          >
            Criar despesa
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
