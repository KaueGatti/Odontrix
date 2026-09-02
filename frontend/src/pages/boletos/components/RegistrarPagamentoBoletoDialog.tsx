import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { centsToNumber, formatMoney } from "@/lib/masks";
import type { Boleto } from "../types";

const FORMAS = ["Dinheiro", "PIX", "Cartão de Débito", "Cartão de Crédito", "Transferência bancária"];

interface RegistrarPagamentoBoletoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boleto: Boleto | null;
  onConfirm: (dados: {
    valorPagoCents: number;
    dataPagamento: string;
    forma: string;
    observacao: string;
  }) => void;
}

export function RegistrarPagamentoBoletoDialog({
  open,
  onOpenChange,
  boleto,
  onConfirm,
}: RegistrarPagamentoBoletoDialogProps) {
  const [valorCents, setValorCents] = useState(0);
  const [data, setData] = useState("");
  const [forma, setForma] = useState("PIX");
  const [obs, setObs] = useState("");

  if (!boleto) return null;

  const ipt = hojeIso();

  function handleConfirm() {
    if (valorCents <= 0 || !data) return;
    onConfirm({ valorPagoCents: valorCents, dataPagamento: data, forma, observacao: obs });
    onOpenChange(false);
    setValorCents(0);
    setData("");
    setForma("PIX");
    setObs("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold tracking-tight">Registrar pagamento</DialogTitle>
          <DialogDescription>
            {boleto.paciente} — Nosso número {boleto.nossoNumero} · {formatMoney(centsToNumber(boleto.valorCents))}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-[6px]">
            <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Valor pago <span className="text-destructive">*</span>
            </Label>
            <MoneyInput value={valorCents} onCentsChange={setValorCents} placeholder="0,00" />
          </div>
          <div className="space-y-[6px]">
            <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
              Data do pagamento <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={data}
              max={ipt}
              onChange={(e) => setData(e.target.value)}
              className="h-10 rounded-[10px] text-[13px]"
            />
          </div>
        </div>

        <div className="mt-3.5 space-y-[6px]">
          <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">
            Forma de pagamento <span className="text-destructive">*</span>
          </Label>
          <Select value={forma} onChange={(e) => setForma(e.target.value)} className="h-10 rounded-[10px] text-[13px]">
            {FORMAS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-3.5 space-y-[6px]">
          <Label className="text-[12.5px] font-medium text-[var(--gray-700)]">Observação</Label>
          <Input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Opcional — ex: pago diretamente na clínica"
            className="h-10 rounded-[10px] text-[13px]"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={valorCents <= 0 || !data}>
            <Check className="h-3.5 w-3.5" />
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function hojeIso(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}