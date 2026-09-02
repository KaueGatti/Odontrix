import { useEffect, useMemo, useState } from "react";
import { Check, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_MONEY_CENTS, MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import {
  centsToNumber,
  formatMoneyFromCents,
  parseMoneyToCents,
} from "@/lib/masks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PaymentInstallment {
  id: number;
  dueDate: string;
  value: number;
}

export interface PaymentForma {
  id: number;
  tipo: string;
  /** Valor em centavos (inteiro). */
  valor: number;
  data: string;
}

export interface ConfirmPaymentPayload {
  installmentIds: number[];
  /** Valor pago em número puro (reais). Ex: 1234.56 */
  valorPago: number;
  /** Valor pago em centavos (inteiro). Ex: 123456 */
  valorPagoCents: number;
  /** Valor pago já formatado. Ex: "R$ 1.234,56" */
  valorPagoFormatado: string;
  forma: string;
  formas: PaymentForma[];
  observacoes: string;
  gerarComprovante: boolean;
}

interface RegistrarPagamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installments: PaymentInstallment[];
  combinadoOrcamento: string;
  onConfirm?: (payload: ConfirmPaymentPayload) => void;
}

const PAYMENT_METHODS = ["PIX", "Dinheiro", "Cartão débito", "Cartão crédito", "Boleto"];

function parseDateBR(s: string): number {
  const [d, m, y] = s.split("/").map(Number);
  if (!d || !m || !y) return 0;
  return y * 10000 + m * 100 + d;
}
export function RegistrarPagamentoDialog({
  open,
  onOpenChange,
  installments,
  combinadoOrcamento,
  onConfirm,
}: RegistrarPagamentoDialogProps) {
  const [desconto, setDesconto] = useState(0);
  const [acrescimo, setAcrescimo] = useState(0);
  const [forma, setForma] = useState("PIX");
  const [valor, setValor] = useState(0);
  const [multiFormas, setMultiFormas] = useState(false);
  const [formas, setFormas] = useState<PaymentForma[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [comprovante, setComprovante] = useState(false);

  const totalParcelasCents = useMemo(
    () => installments.reduce((acc, i) => acc + Math.round(i.value * 100), 0),
    [installments],
  );

  useEffect(() => {
    if (!open) return;
    setDesconto(0);
    setAcrescimo(0);
    setForma("PIX");
    setValor(totalParcelasCents);
    setMultiFormas(false);
    setFormas([{ id: 1, tipo: "PIX", valor: totalParcelasCents, data: "" }]);
    setObservacoes("");
    setComprovante(false);
  }, [open, totalParcelasCents]);

  const somaFormasCents = formas.reduce((acc, f) => acc + f.valor, 0);

  // Valor da parcela: alterado APENAS por Desconto/Acréscimo — nunca pelo campo Valor.
  const valorParcelaCents = Math.max(0, totalParcelasCents - desconto + acrescimo);

  // Total pago: controlado APENAS pelo campo Valor (ou soma das formas) — nunca altera o total das parcelas.
  const totalPagoBaseCents = multiFormas ? somaFormasCents : valor;
  const totalPagoCents = Math.min(totalPagoBaseCents, totalParcelasCents);
  const seraPagoCents = totalPagoCents;
  const correto = totalPagoCents === totalParcelasCents;
  const formaDiferente = forma.toUpperCase() !== combinadoOrcamento.toUpperCase();

  // O campo Valor não pode ser maior que o total da parcela (nem que R$ 100.000,00).
  const maxValorCents = Math.min(MAX_MONEY_CENTS, totalParcelasCents);

  const coverage = useMemo(() => {
    let remaining = totalPagoCents;
    return [...installments]
      .sort((a, b) => parseDateBR(a.dueDate) - parseDateBR(b.dueDate) || a.id - b.id)
      .map((inst) => {
        const valueCents = Math.round(inst.value * 100);
        if (remaining <= 0) return { ...inst, valueCents, coverage: "pending" as const };
        if (remaining >= valueCents) {
          remaining -= valueCents;
          return { ...inst, valueCents, coverage: "paid" as const };
        }
        remaining = 0;
        return { ...inst, valueCents, coverage: "partial" as const };
      });
  }, [installments, totalPagoCents]);

  function addForma() {
    setFormas((prev) => [...prev, { id: Date.now(), tipo: "PIX", valor: 0, data: "" }]);
  }

  function removeForma(id: number) {
    setFormas((prev) => (prev.length > 1 ? prev.filter((f) => f.id !== id) : prev));
  }

  function updateForma(id: number, field: keyof PaymentForma, value: string) {
    setFormas((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        if (field === "valor") return { ...f, valor: parseMoneyToCents(value) };
        if (field === "tipo") return { ...f, tipo: value };
        return { ...f, data: value };
      }),
    );
  }

  function handleConfirm() {
    if (installments.length === 0 || totalPagoCents <= 0) return;
    const paidIds = coverage.filter((c) => c.coverage === "paid").map((c) => c.id);
    onConfirm?.({
      installmentIds: paidIds,
      valorPago: centsToNumber(totalPagoCents),
      valorPagoCents: totalPagoCents,
      valorPagoFormatado: formatMoneyFromCents(totalPagoCents),
      forma,
      formas: multiFormas ? formas : [],
      observacoes,
      gerarComprovante: comprovante,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold tracking-[0.02em]">
            REGISTRAR PAGAMENTO
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Desconto / Acréscimo / Valor final */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-[6px]">
              <label className="block text-[12.5px] font-medium text-muted-foreground">
                Desconto (R$)
              </label>
              <MoneyInput value={desconto} onCentsChange={setDesconto} />
            </div>
            <div className="space-y-[6px]">
              <label className="block text-[12.5px] font-medium text-muted-foreground">
                Acréscimo / multa (R$)
              </label>
              <MoneyInput value={acrescimo} onCentsChange={setAcrescimo} />
            </div>
            <div className="space-y-[6px]">
              <label className="block text-[12.5px] font-medium text-muted-foreground">
                Valor final (R$)
              </label>
              <div className="flex h-10 items-center justify-center rounded-[10px] border border-[#c9d9fc] bg-[#eaf0fe] px-3 text-[13px] font-bold text-[#2f57ea]">
                {formatMoneyFromCents(valorParcelaCents, false)}
              </div>
            </div>
          </div>
          {/* Forma de pagamento / Valor — ocultos quando múltiplas formas estão ativas */}
          {!multiFormas && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-[6px]">
                <label className="block text-[12.5px] font-medium text-muted-foreground">
                  Forma de pagamento
                </label>
                <Select
                  value={forma}
                  onChange={(e) => setForma(e.target.value)}
                  className="h-10 text-[13px]"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-[6px]">
                <label className="block text-[12.5px] font-medium text-muted-foreground">Valor</label>
                <MoneyInput value={valor} onCentsChange={setValor} max={maxValorCents} />
              </div>
            </div>
          )}

          {/* Múltiplas formas */}
          <button
            type="button"
            role="checkbox"
            aria-checked={multiFormas}
            onClick={() => setMultiFormas((v) => !v)}
            className="flex items-center gap-2.5 text-[13px] font-medium text-foreground"
          >
            <span
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition-colors ${
                multiFormas ? "border-primary bg-primary text-white" : "border-border bg-white"
              }`}
            >
              {multiFormas && <Check className="h-3 w-3" />}
            </span>
            Múltiplas formas de pagamento
          </button>

          {!multiFormas && formaDiferente && (
            <div className="flex items-start gap-2.5 rounded-[12px] border border-[#fbe7b6] bg-[#fef9ec] px-4 py-3 text-[12.5px] leading-relaxed text-[#92620a]">
              <span className="font-semibold">⚠</span>
              <span>
                <strong>Combinado no orçamento:</strong> {combinadoOrcamento} — o paciente está
                pagando com forma diferente.
              </span>
            </div>
          )}
          {/* Formas de pagamento (múltiplas) */}
          {multiFormas && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Formas de pagamento
              </p>
              {formas.map((f, i) => (
                <div key={f.id} className="rounded-[14px] border border-border bg-[#f8fafc] p-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-primary">Forma {i + 1}</span>
                    {formas.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remover forma ${i + 1}`}
                        onClick={() => removeForma(f.id)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-[6px]">
                      <label className="block text-[12px] text-muted-foreground">Tipo</label>
                      <Select
                        value={f.tipo}
                        onChange={(e) => updateForma(f.id, "tipo", e.target.value)}
                        className="h-10 text-[13px]"
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-[6px]">
                      <label className="block text-[12px] text-muted-foreground">Valor (R$)</label>
                      <MoneyInput
                        value={f.valor}
                        onCentsChange={(cents) => updateForma(f.id, "valor", String(cents))}
                        className="h-10 text-[13px]"
                        max={maxValorCents}
                      />
                    </div>
                    <div className="space-y-[6px]">
                      <label className="block text-[12px] text-muted-foreground">
                        Data do pagamento
                      </label>
                      <Input
                        value={f.data}
                        onChange={(e) => updateForma(f.id, "data", e.target.value)}
                        placeholder="DD/MM/AAAA"
                        className="h-10 text-[13px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addForma}
                className="flex h-11 w-full items-center justify-center rounded-[12px] border-[1.5px] border-dashed border-border bg-white text-[13px] font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                + Adicionar forma
              </button>
            </div>
          )}
          {/* Summary */}
          <div className="flex items-center justify-between rounded-[14px] border border-[#c9d9fc] bg-[#eaf0fe] px-5 py-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Valor a pagar (R$)</p>
              <p className="text-[22px] font-bold leading-tight tracking-tight text-[#2f57ea]">
                {formatMoneyFromCents(totalPagoCents, false)}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Total</p>
                <p className="text-[14px] font-bold text-foreground">{formatMoneyFromCents(totalParcelasCents)}</p>
              </div>
              {correto ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f9ee] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                  <Check className="h-3 w-3" /> Correto
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3d6] px-2.5 py-1 text-[11px] font-semibold text-[#b45309]">
                  ⚠ Ajustar valor
                </span>
              )}
            </div>
          </div>

          {/* Parcelas selecionadas */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Parcelas selecionadas
              </p>
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {installments.length} {installments.length === 1 ? "parcela" : "parcelas"}
              </span>
            </div>

            <div className="mb-3 flex items-start gap-2.5 rounded-[12px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-[12.5px] leading-relaxed text-[#1d4ed8]">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Caso o valor não cubra todas as parcelas, as de vencimento mais próximo serão pagas
                primeiro.
              </span>
            </div>

            {installments.length === 0 ? (
              <p className="rounded-[12px] border border-dashed border-border p-6 text-center text-[12.5px] text-muted-foreground">
                Nenhuma parcela selecionada.
              </p>
            ) : (
              <>
            <div className="overflow-hidden rounded-[12px] border border-border">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Parcela</th>
                        <th className="px-3 py-2 font-medium">Vencimento</th>
                        <th className="px-3 py-2 font-medium">Valor</th>
                        <th className="px-3 py-2 font-medium">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {coverage.map((c) => (
                        <tr key={c.id}>
                          <td
                            className={`border-l-[3px] px-3 py-2.5 text-[13px] font-semibold ${
                              c.coverage === "paid"
                                ? "border-l-[#22c55e]"
                                : c.coverage === "partial"
                                  ? "border-l-[#f59e0b]"
                                  : "border-l-border"
                            }`}
                          >
                            {c.id}ª parcela
                          </td>
                          <td className="px-3 py-2.5 text-[13px] text-muted-foreground">
                            {c.dueDate}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] text-foreground">
                            {formatMoneyFromCents(c.valueCents)}
                          </td>
                          <td className="px-3 py-2.5">
                            {c.coverage === "paid" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f9ee] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                                <Check className="h-3 w-3" /> Será paga
                              </span>
                            ) : c.coverage === "partial" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3d6] px-2.5 py-1 text-[11px] font-semibold text-[#b45309]">
                                ⚠ Valor insuf.
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                                Pendente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[12.5px]">
                  <span className="text-muted-foreground">
                    Total das parcelas:{" "}
                    <b className="text-foreground">{formatMoneyFromCents(totalParcelasCents)}</b>
                  </span>
                  <span className="font-bold text-foreground">
                    Será pago: {formatMoneyFromCents(seraPagoCents)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-[6px]">
            <label className="block text-[12.5px] font-medium text-muted-foreground">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: paciente pagou no balcão, recibo entregue..."
              className="min-h-[72px] w-full resize-none rounded-[12px] border border-input bg-muted/40 px-3 py-2.5 text-[13px] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>
          {/* Registrado por */}
          <div className="flex items-center gap-2.5 rounded-[12px] bg-[#f8fafc] px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              KV
            </div>
            <span className="text-[12.5px] text-muted-foreground">
              Kamily Vitória — Recepção (usuário logado)
            </span>
            {comprovante && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#e7f9ee] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                <Check className="h-3 w-3" /> Comprovante
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setComprovante((v) => !v)}
            className={comprovante ? "border-[#22c55e] text-[#15803d] hover:bg-[#f0fdf4]" : ""}
          >
            Gerar comprovante
          </Button>
          <Button
            type="button"
            disabled={installments.length === 0 || totalPagoCents <= 0}
            onClick={handleConfirm}
            className="bg-[#1e5b41] text-white shadow-sm hover:bg-[#184a34]"
          >
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}