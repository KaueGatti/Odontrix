import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const FIELD_CLASS = "h-10 rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] px-3 text-[13px] text-foreground outline-none transition-[border-color,box-shadow,background] focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]";
const SELECT_CLASS = FIELD_CLASS + " appearance-none bg-no-repeat";

interface RegistrarRecebimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: string;
  parcela: string;
  valor: string;
}

export function RegistrarRecebimentoDialog({
  open,
  onOpenChange,
  paciente,
  parcela,
  valor,
}: RegistrarRecebimentoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[480px]">
        <DialogHeader>
          <DialogTitle>Registrar recebimento</DialogTitle>
          <DialogDescription>
            {paciente} — {parcela} · {valor}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Valor recebido <span className="text-destructive">*</span>
            </label>
            <input
              className={FIELD_CLASS}
              defaultValue={valor}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Data do recebimento <span className="text-destructive">*</span>
            </label>
            <input
              className={FIELD_CLASS}
              defaultValue="11/07/2026"
            />
          </div>
        </div>

        <div className="mb-4 mt-4 flex flex-col gap-[6px]">
          <label className="text-[12.5px] font-medium text-[var(--gray-700)]">
            Forma de pagamento <span className="text-destructive">*</span>
          </label>
          <select
            className={SELECT_CLASS}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E\")", backgroundPosition: "right 12px center" }}
          >
            <option>Dinheiro</option>
            <option>Cartão de Débito</option>
            <option>Cartão de Crédito</option>
            <option>Boleto</option>
          </select>
        </div>

        <div className="flex flex-col gap-[6px]">
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
            Confirmar recebimento
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
