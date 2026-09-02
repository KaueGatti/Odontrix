import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { centsToNumber, formatMoneyFromCents } from "@/lib/masks";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = ["PIX", "Dinheiro", "Cartão débito", "Cartão crédito", "Boleto"];

export interface NovoRegistroPayload {
  descricao: string;
  valorTotal: number;
  descontos: number;
  acrescimos: number;
  entrada: number;
  valorLiquido: number;
  forma: string;
  parcelas: number;
  /** Vencimento da 1ª parcela (DD/MM/AAAA). */
  vencimentoBR: string;
  observacoes: string;
}

interface NovoRegistroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  onSave?: (data: NovoRegistroPayload) => void;
}

function isoToBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : "";
}

function isPastDate(iso: string): boolean {
  if (!iso) return false;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Data de hoje em ISO (YYYY-MM-DD), sem depender de timezone (UTC).
 */
function todayIso(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export function NovoRegistroDialog({
  open,
  onOpenChange,
  patientName,
  onSave,
}: NovoRegistroDialogProps) {
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState(0);
  const [descontos, setDescontos] = useState(0);
  const [acrescimos, setAcrescimos] = useState(0);
  const [entrada, setEntrada] = useState(0);
  const [forma, setForma] = useState("PIX");
  const [parcelas, setParcelas] = useState(1);
  const [vencimentoIso, setVencimentoIso] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!open) return;
    setDescricao("");
    setValorTotal(0);
    setDescontos(0);
    setAcrescimos(0);
    setEntrada(0);
    setForma("PIX");
    setParcelas(1);
    setVencimentoIso("");
    setObservacoes("");
  }, [open]);

  const valorLiquidoCents = Math.max(0, valorTotal - descontos + acrescimos);
  const saldoCents = Math.max(0, valorLiquidoCents - entrada);
  // A entrada pode ir até o maior entre total e líquido (desconto reduz o devido; acréscimo aumenta).
  const entradaInvalida = entrada > Math.max(valorTotal, valorLiquidoCents);
  const vencimentoInvalido = vencimentoIso !== "" && isPastDate(vencimentoIso);

  // Pagamento à vista: entrada integral quita a cobrança — sem parcelamento e sem vencimento.
  const isPagamentoAVista = valorLiquidoCents > 0 && entrada === valorLiquidoCents;

  // Mesma regra do NovoOrcamentoDialog: parcela inteira e resto na última.
  const installmentLabel = useMemo(() => {
    if (saldoCents <= 0) return null;
    const n = Math.max(1, parcelas);
    const perCents = Math.floor(saldoCents / n);
    const remCents = saldoCents % n;
    if (n === 1) return `1x de ${formatMoneyFromCents(saldoCents)}`;
    if (remCents === 0) return `${n}x de ${formatMoneyFromCents(perCents)}`;
    return `${n - 1}x de ${formatMoneyFromCents(perCents)} e 1x de ${formatMoneyFromCents(
      perCents + remCents,
    )}`;
  }, [saldoCents, parcelas]);

  const canSave =
    descricao.trim().length > 0 &&
    valorLiquidoCents > 0 &&
    !entradaInvalida &&
    (isPagamentoAVista || (vencimentoIso !== "" && !vencimentoInvalido));

  function handleSave() {
    if (!canSave) return;
    onSave?.({
      descricao: descricao.trim(),
      valorTotal: centsToNumber(valorTotal),
      descontos: centsToNumber(descontos),
      acrescimos: centsToNumber(acrescimos),
      entrada: centsToNumber(entrada),
      valorLiquido: centsToNumber(valorLiquidoCents),
      forma,
      parcelas: isPagamentoAVista ? 1 : parcelas,
      vencimentoBR: isPagamentoAVista ? isoToBR(todayIso()) : isoToBR(vencimentoIso),
      observacoes,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-[640px] overflow-y-auto p-0 gap-0 sm:max-w-[640px]">
        {/* Acessibilidade: título real fica no layout, header sr-only para o Radix */}
        <DialogHeader className="sr-only">
          <DialogTitle>Novo registro de conta</DialogTitle>
          <DialogDescription>
            Registrar nova conta para o paciente com valores, parcelamento e observações.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-5">
          <h2 className="text-[22px] font-bold leading-none tracking-tight text-primary">
            NOVO REGISTRO
          </h2>

          {/* Paciente + Descrição */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="nreg-paciente" className="text-[12px] font-semibold">
                Paciente
              </Label>
              <Input
                id="nreg-paciente"
                value={patientName}
                readOnly
                disabled
                className="h-10 rounded-[10px] bg-muted/50 text-[13px] opacity-100"
              />
              <p className="text-[11px] text-muted-foreground">preenchido automaticamente</p>
            </div>
            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="nreg-descricao" className="text-[12px] font-semibold">
                Descrição
              </Label>
              <Input
                id="nreg-descricao"
                placeholder="Ex: Tratamento de canal"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="h-10 rounded-[10px] text-[13px]"
              />
            </div>
          </div>

          {/* VALORES */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-bold tracking-tight text-muted-foreground">VALORES</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-[6px]">
                <Label htmlFor="nreg-total" className="text-[11px] font-medium text-muted-foreground">
                  Valor Total
                </Label>
                <MoneyInput id="nreg-total" value={valorTotal} onCentsChange={setValorTotal} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label
                  htmlFor="nreg-descontos"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Descontos
                </Label>
                <MoneyInput id="nreg-descontos" value={descontos} onCentsChange={setDescontos} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label
                  htmlFor="nreg-acrescimos"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Acréscimos
                </Label>
                <MoneyInput id="nreg-acrescimos" value={acrescimos} onCentsChange={setAcrescimos} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label
                  htmlFor="nreg-entrada"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Valor de entrada
                </Label>
                <MoneyInput id="nreg-entrada" value={entrada} onCentsChange={setEntrada} />
              </div>
            </div>

            {/* Total das parcelas: valor líquido com desconto da entrada */}
            <div className="flex flex-col gap-[6px]">
              <Label
                htmlFor="nreg-total-parcelas"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Total das parcelas
              </Label>
              <div
                id="nreg-total-parcelas"
                aria-live="polite"
                className="flex h-10 items-center justify-center rounded-[10px] border border-[#c9d9fc] bg-[#eaf0fe] px-3 text-[13px] font-bold text-[#2f57ea]"
              >
                {formatMoneyFromCents(saldoCents)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                valor líquido com desconto do valor de entrada
              </p>
            </div>

            {/* Resumo derivado */}
            <div className="rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">
              Valor líquido:{" "}
              <strong className="font-semibold text-foreground">
                {formatMoneyFromCents(valorLiquidoCents)}
              </strong>
              {" · "}
              {isPagamentoAVista ? (
                <strong className="font-semibold text-[#16a34a]">Pagamento à vista</strong>
              ) : (
                <>
                  Valor por parcela:{" "}
                  {installmentLabel ? (
                    <strong className="font-semibold text-foreground">{installmentLabel}</strong>
                  ) : (
                    <span>—</span>
                  )}
                </>
              )}
            </div>

            {entradaInvalida && (
              <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-[11px] font-medium text-amber-700">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                O valor de entrada não pode ser maior que o valor total da cobrança.
              </div>
            )}
          </div>

          {/* PARCELAMENTO — oculto quando o pagamento é à vista (entrada integral) */}
          {!isPagamentoAVista && (
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-bold tracking-tight text-muted-foreground">
              PARCELAMENTO
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-[6px]">
                <Label htmlFor="nreg-forma" className="text-[11px] font-medium text-muted-foreground">
                  Forma de pagamento
                </Label>
                <Select
                  id="nreg-forma"
                  value={forma}
                  onChange={(e) => setForma(e.target.value)}
                  className="h-10 rounded-[10px] text-[13px]"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label
                  htmlFor="nreg-parcelas"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Qtd. de parcelas
                </Label>
                <Input
                  id="nreg-parcelas"
                  aria-label="Quantidade de parcelas"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={12}
                  value={parcelas}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setParcelas(Number.isNaN(v) ? 1 : Math.min(12, Math.max(1, v)));
                  }}
                  className="h-10 rounded-[10px] text-[13px]"
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label
                  htmlFor="nreg-vencimento"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Vencimento (1ª parcela)
                </Label>
                <Input
                  id="nreg-vencimento"
                  type="date"
                  min={todayIso()}
                  value={vencimentoIso}
                  onChange={(e) => setVencimentoIso(e.target.value)}
                  aria-invalid={vencimentoInvalido}
                  className={cn(
                    "h-10 rounded-[10px] text-[13px]",
                    vencimentoInvalido &&
                      "border-amber-300 bg-amber-50/50 focus-visible:border-amber-400 focus-visible:ring-amber-200",
                  )}
                />
                {vencimentoInvalido && (
                  <p className="text-[11px] font-medium text-amber-700">
                    A data de vencimento não pode ser anterior à data atual.
                  </p>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Observações */}
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="nreg-obs" className="text-[12px] font-semibold">
              Observações
            </Label>
            <textarea
              id="nreg-obs"
              placeholder="Observações..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="min-h-[96px] w-full resize-none rounded-[10px] border border-input bg-background px-3 py-2 text-[13px] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-background px-6 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
            className="h-7 gap-1.5 rounded-md px-3 text-xs"
          >
            <X className="h-3 w-3" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            size="sm"
            className="h-7 gap-1.5 rounded-md px-3 text-xs"
            title={!canSave ? "Preencha descrição, valor total e vencimento para salvar" : undefined}
          >
            <Save className="h-3 w-3" />
            Salvar registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
