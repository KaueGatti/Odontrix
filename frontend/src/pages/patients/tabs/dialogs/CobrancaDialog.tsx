import { useMemo, useState } from "react";
import { Banknote, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  RegistrarPagamentoDialog,
  type ConfirmPaymentPayload,
  type PaymentInstallment,
} from "./RegistrarPagamentoDialog";

interface CobrancaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteDescription: string;
  quoteTotal: number;
  patientName: string;
}

interface InstallmentRow {
  id: number;
  dueDate: string;
  value: string;
  pago: string;
  combinado: string;
  forma: string;
  status: "pending" | "overdue" | "paid";
}

const INITIAL_ROWS: InstallmentRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  dueDate: "30/05/2025",
  value: "400,00",
  pago: "",
  combinado: "PIX",
  forma: "",
  status: i + 1 === 2 ? "overdue" : "pending",
}));

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseInstallmentValue(raw: string): number {
  const cleaned = raw.replace(/R\$\s?/gi, "").replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function CobrancaDialog({
  open,
  onOpenChange,
  quoteDescription,
  quoteTotal,
  patientName,
}: CobrancaDialogProps) {
  const [rows, setRows] = useState<InstallmentRow[]>(INITIAL_ROWS);
  const [selected, setSelected] = useState<Set<number>>(new Set([4]));
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentInstallments, setPaymentInstallments] = useState<PaymentInstallment[]>([]);

  const toggle = (id: number) => {
    const row = rows.find((r) => r.id === id);
    if (!row || row.status === "paid") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectableRows = rows.filter((r) => r.status !== "paid");
  const allSelected = selectableRows.length > 0 && selected.size === selectableRows.length;
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(selectableRows.map((r) => r.id)));
  };

  // Valores da esquerda derivados das parcelas
  const totalParcelas = useMemo(
    () => rows.reduce((acc, r) => acc + parseInstallmentValue(r.value), 0),
    [rows],
  );
  const totalPago = useMemo(
    () =>
      rows
        .filter((r) => r.status === "paid")
        .reduce((acc, r) => acc + parseInstallmentValue(r.value), 0),
    [rows],
  );
  const totalRestante = totalParcelas - totalPago;
  const valorBruto = formatNumber(totalParcelas);
  const desconto = "0,00";
  const valorLiquido = formatNumber(totalParcelas);
  const headerPill =
    totalRestante <= 0 ? "Pago" : totalPago > 0 ? "Parcial" : "Pendente";
  const combinadoOrcamento = rows[0]?.combinado || "PIX";

  function openSinglePayment(r: InstallmentRow) {
    setPaymentInstallments([
      { id: r.id, dueDate: r.dueDate, value: parseInstallmentValue(r.value) },
    ]);
    setPaymentOpen(true);
  }

  function openLotePayment() {
    const rowsToPay = rows.filter((r) => r.status !== "paid" && selected.has(r.id));
    if (rowsToPay.length === 0) return;
    setPaymentInstallments(
      rowsToPay.map((r) => ({
        id: r.id,
        dueDate: r.dueDate,
        value: parseInstallmentValue(r.value),
      })),
    );
    setPaymentOpen(true);
  }

  function handlePaymentConfirm(payload: ConfirmPaymentPayload) {
    const paidIds = new Set(payload.installmentIds);
    setRows((prev) =>
      prev.map((r) =>
        paidIds.has(r.id) ? { ...r, status: "paid" as const, pago: r.value } : r,
      ),
    );
    setSelected(new Set());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-[1360px] flex-col !overflow-hidden !border-0 !p-0 !gap-0 overflow-y-hidden bg-white sm:max-w-[1360px] [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Cobrança</DialogTitle>
          <DialogDescription>
            {patientName} — {quoteDescription} — {formatCurrency(quoteTotal)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[40%_60%] divide-x divide-border overflow-hidden bg-white">
          {/* ESQUERDA — COBRANÇA */}
          <div className="flex flex-col gap-4 overflow-y-auto p-5">
            {/* Título — design system igual ao modal ORÇAMENTO */}
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] font-bold leading-none tracking-tight text-primary">COBRANÇA</h2>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  headerPill === "Pago"
                    ? "bg-[#e7f9ee] text-[#16a34a]"
                    : headerPill === "Parcial"
                      ? "bg-[#fef9ec] text-[#b45309]"
                      : "bg-[#e6f7f0] text-[#0f766e]"
                }`}
              >
                {headerPill}
              </span>
            </div>

            {/* PACIENTE */}
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Paciente</p>
              <div className="flex items-center gap-3 rounded-[10px] border border-border bg-white px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e0f0ff] text-[11px] font-bold text-[#1a8cff]">KVG</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold leading-none text-foreground">{patientName}</p>
                  <p className="truncate text-[11px] leading-none text-muted-foreground">CPF: 538.350.558-01 • DN: 23/02/2007</p>
                </div>
                <span className="shrink-0 text-[9px] text-muted-foreground/70">preenchido automaticamente</span>
              </div>
            </div>

            {/* ORÇAMENTO */}
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Orçamento</p>
              <div className="grid grid-cols-[1.55fr_0.9fr] gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Origem da Cobrança</span>
                  <span className="text-[12px] font-medium leading-snug text-foreground">
                    {quoteDescription || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Data de emissão</span>
                  <Input value="30/04/2025" readOnly className="h-8 rounded-[8px] border-input bg-muted/40 px-2.5 text-[12px] text-foreground" />
                </div>
              </div>
            </div>

            {/* VALORES */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Valores</p>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] leading-none text-muted-foreground">Valor bruto (R$)</span>
                    <Input value={valorBruto} readOnly className="h-8 rounded-[6px] border-input bg-[#f3f4f6] px-2 text-center text-[12px] font-medium text-foreground" />
                    <span className="pr-1 text-right text-[9px] leading-none text-muted-foreground/60">do orçamento</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] leading-none text-muted-foreground">Desconto (R$)</span>
                    <Input value={desconto} readOnly className="h-8 rounded-[6px] border-input bg-[#f3f4f6] px-2 text-center text-[12px] font-medium text-foreground" />
                    <span className="pr-1 text-right text-[9px] leading-none text-muted-foreground/60">do orçamento</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] leading-none text-muted-foreground">Valor líquido (R$)</span>
                    <Input value={valorLiquido} readOnly className="h-8 rounded-[6px] border-input bg-[#f3f4f6] px-2 text-center text-[12px] font-medium text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-[8px] border border-border bg-[#f8fafc] px-3 py-2">
                    <p className="text-[11px] leading-none text-muted-foreground">Total</p>
                    <p className="mt-1 flex items-baseline gap-1 text-[12px] font-bold text-[#0f766e]">
                      <span className="text-[11px] font-normal text-muted-foreground">R$</span> {formatNumber(totalParcelas)}
                    </p>
                  </div>
                  <div className="rounded-[8px] border border-border bg-[#f8fafc] px-3 py-2">
                    <p className="text-[11px] leading-none text-muted-foreground">Pago</p>
                    <p className="mt-1 flex items-baseline gap-1 text-[12px] font-bold text-foreground">
                      <span className="text-[11px] font-normal text-muted-foreground">R$</span> {formatNumber(totalPago)}
                    </p>
                  </div>
                  <div className="rounded-[8px] border border-border bg-[#f8fafc] px-3 py-2">
                    <p className="text-[11px] leading-none text-muted-foreground">Restante</p>
                    <p className="mt-1 flex items-baseline gap-1 text-[12px] font-bold text-[#15803d]">
                      <span className="text-[11px] font-normal text-muted-foreground">R$</span> {formatNumber(totalRestante)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* OBSERVAÇÕES */}
            <div className="flex flex-1 flex-col">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">Observações</p>
              <textarea
                placeholder="Observações internas sobre esta cobrança..."
                className="min-h-[150px] w-full flex-1 resize-none rounded-[10px] border border-input bg-[#f8fafc] px-3 py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15"
              />
            </div>
          </div>

          {/* DIREITA — PARCELAS */}
          <div className="flex min-h-0 flex-col overflow-hidden bg-white p-4">
            {/* Header parcelas — design system igual ao modal ORÇAMENTO (PROCEDIMENTOS) */}
            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
              <h3 className="text-[18px] font-bold tracking-tight text-muted-foreground">PARCELAS</h3>
              <Button
                type="button"
                size="sm"
                variant="default"
                disabled={selected.size === 0}
                title={
                  selected.size === 0
                    ? "Selecione ao menos uma parcela para registrar pagamento em lote"
                    : undefined
                }
                onClick={openLotePayment}
                className="shrink-0 gap-1.5 disabled:opacity-50"
              >
                <Banknote className="h-3.5 w-3.5" />
                Registrar pagamento em lote
              </Button>
            </div>

            {/* Tabela */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-border">
              <div className="overflow-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 bg-[#f8f9fb]">
                    <tr className="border-b border-border text-[11px] font-bold uppercase tracking-[0.04em] text-[#3b82f6]">
                      <th className="w-[28px] px-2 py-2">
                        <button
                          type="button"
                          aria-label="Selecionar todos"
                          onClick={toggleAll}
                          className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${allSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-[#e9ecef]"}`}
                        >
                          {allSelected && <Check className="h-2.5 w-2.5" />}
                        </button>
                      </th>
                      <th className="px-1 py-2 text-center font-bold">#</th>
                      <th className="px-2 py-2 font-bold">Vencimento</th>
                      <th className="px-2 py-2 font-bold">Valor</th>
                      <th className="px-2 py-2 font-bold">Pago</th>
                      <th className="px-2 py-2 font-bold">Combinado</th>
                      <th className="px-2 py-2 font-bold">Forma de pagamento</th>
                      <th className="px-2 py-2 font-bold">Status</th>
                      <th className="w-[36px] px-1 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {rows.map((r) => {
                      const isSel = selected.has(r.id);
                      return (
                        <tr
                          key={r.id}
                          className={`${isSel ? "bg-[#bbf7d0]/60" : "bg-white hover:bg-muted/20"}`}
                        >
                          <td className="px-2 py-1.5">
                            <button
                              type="button"
                              aria-label={`Selecionar parcela ${r.id}`}
                              onClick={() => toggle(r.id)}
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${isSel ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-[#e9ecef]"}`}
                            >
                              {isSel && <Check className="h-2.5 w-2.5" />}
                            </button>
                          </td>
                          <td className="px-1 py-1.5 text-center text-[12px] text-foreground">{r.id}</td>
                          <td className="px-2 py-1.5">
                            <div className="flex h-6 items-center justify-center rounded-[6px] border border-border bg-white px-2 text-[12px] text-foreground">
                              {r.dueDate}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex h-6 items-center justify-center rounded-[6px] border border-border bg-white px-2 text-[12px] text-foreground">
                              {r.value}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            {r.pago ? (
                              <div className="flex h-6 items-center justify-center rounded-[6px] border border-[#bbe7c7] bg-[#e7f9ee] px-2 text-[12px] font-semibold text-[#16a34a]">
                                {r.pago}
                              </div>
                            ) : (
                              <div className="flex h-6 items-center justify-center rounded-[6px] border border-border bg-[#f8f9fb] px-2 text-[12px] text-muted-foreground/50">
                                —
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex h-6 items-center justify-center rounded-[6px] border border-border bg-[#f3f4f6] px-2 text-[12px] text-foreground">
                              {r.combinado}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex h-6 items-center justify-center rounded-[6px] border border-border bg-[#f3f4f6] px-2 text-[12px] text-foreground">
                              {r.forma || "—"}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            {r.status === "paid" ? (
                              <span className="inline-flex rounded-full bg-[#e7f9ee] px-2.5 py-1 text-[10px] font-semibold leading-none text-[#16a34a]">Pago</span>
                            ) : r.status === "overdue" ? (
                              <span className="inline-flex rounded-full bg-[#ffe4e6] px-2.5 py-1 text-[10px] font-semibold leading-none text-[#be123c]">Vencido</span>
                            ) : (
                              <span className="inline-flex rounded-full bg-[#ccfbf1] px-2.5 py-1 text-[10px] font-semibold leading-none text-[#115e59]">Pendente</span>
                            )}
                          </td>
                          <td className="px-1 py-1.5 text-center">
                            <button
                              type="button"
                              aria-label={`Registrar pagamento da parcela ${r.id}`}
                              disabled={r.status === "paid"}
                              onClick={() => openSinglePayment(r)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] border border-emerald-500 bg-white text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-muted disabled:text-muted-foreground/40 disabled:hover:bg-white"
                            >
                              <Banknote className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <RegistrarPagamentoDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          installments={paymentInstallments}
          combinadoOrcamento={combinadoOrcamento}
          onConfirm={handlePaymentConfirm}
        />

      <DialogFooter className="shrink-0 !m-0 !border-0 bg-white px-5 py-3 rounded-b-[20px]">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm" className="h-7 gap-1.5 rounded-md px-3 text-xs">
            <X className="h-3 w-3" />
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
