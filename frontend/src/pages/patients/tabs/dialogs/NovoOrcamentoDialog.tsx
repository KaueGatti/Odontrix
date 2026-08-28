import { useEffect, useRef, useState, type TextareaHTMLAttributes } from "react";
import { AlertTriangle, Lock, Plus, Save, X } from "lucide-react";

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
import { maskCurrency } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { MOCK_PATIENTS } from "@/pages/agenda/mock-data";

type DiscountType = "currency" | "percent";

interface ProcedureLine {
  id: number;
  procedureName: string;
  unitValue: string;
  discountValue: string;
  discountType: DiscountType;
  quantity: number;
  observation: string;
}

type QuoteStatus = "approved" | "draft" | "sent" | "rejected" | "expired";

interface QuoteView {
  id: number;
  description: string;
  validUntilIso: string; // YYYY-MM-DD
  status: QuoteStatus;
  originalStatus: QuoteStatus;
}

interface NovoOrcamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientLocked?: boolean;
  quote?: QuoteView | null;
  onSave?: (data: { description: string; validUntilIso: string; status: QuoteStatus; totalValue: number }) => void;
}

interface CurrencyInputProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

const MOCK_PROCEDURES = [
  { name: "Limpeza", price: 180 },
  { name: "Extração", price: 250 },
  { name: "Clareamento", price: 1200 },
  { name: "Restauração", price: 350 },
  { name: "Canal", price: 750 },
];

function parseCurrency(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) / 100 : 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeDiscountInput(value: string, type: DiscountType): string {
  if (type === "percent") {
    return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 4);
  }
  return maskCurrency(value);
}

function isExpiredIso(dateStr: string): boolean {
  if (!dateStr) return false;
  // expects YYYY-MM-DD
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return false;
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

function CurrencyInput({
  value,
  onValueChange,
  id,
  className,
  placeholder,
  "aria-label": ariaLabel,
  disabled,
}: CurrencyInputProps) {
  return (
    <Input
      id={id}
      aria-label={ariaLabel}
      inputMode="numeric"
      placeholder={placeholder ?? "0,00"}
      value={value}
      disabled={disabled}
      onChange={(e) => onValueChange(maskCurrency(e.target.value))}
      className={className}
    />
  );
}

function TextArea({ className, disabled, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { disabled?: boolean }) {
  return (
    <textarea
      disabled={disabled}
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function NovoOrcamentoDialog({
  open,
  onOpenChange,
  patientName,
  patientLocked = false,
  quote = null,
  onSave,
}: NovoOrcamentoDialogProps) {
  const [patient, setPatient] = useState(patientName);
  const [description, setDescription] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState<QuoteStatus>("draft");
  const [originStatus, setOriginStatus] = useState<QuoteStatus>("draft");
  const [observations, setObservations] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [entrada, setEntrada] = useState("");
  const [installments, setInstallments] = useState(1);
  const [paymentObservations, setPaymentObservations] = useState("");

  const idRef = useRef(1);
  const createRow = (): ProcedureLine => ({
    id: idRef.current++,
    procedureName: "",
    unitValue: "",
    discountValue: "",
    discountType: "percent",
    quantity: 1,
    observation: "",
  });
  const [procedures, setProcedures] = useState<ProcedureLine[]>([createRow()]);

  const selectedPatient = patientLocked ? patientName : patient;
  const patientOptions =
    patientName && !MOCK_PATIENTS.includes(patientName)
      ? [patientName, ...MOCK_PATIENTS]
      : MOCK_PATIENTS;

  const isLocked = isExpiredIso(validUntil);

  const handleValidUntilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValidUntil(newVal);
    // Liberação imediata no onChange: se deixou de ser expirado, reverte status e remove aviso já neste evento
    if (!isExpiredIso(newVal) && status === "expired") {
      const fallback: QuoteStatus = originStatus !== "expired" ? originStatus : "draft";
      setStatus(fallback === "draft" || fallback === "sent" ? fallback : "draft");
    }
  };

  // Sync when opening with quote
  useEffect(() => {
    if (!open) return;
    if (quote) {
      setDescription(quote.description ?? "");
      setValidUntil(quote.validUntilIso ?? "");
      setStatus(quote.status ?? "draft");
      setOriginStatus(quote.originalStatus ?? quote.status ?? "draft");
      // reset other fields for existing quote (keep empty for now, could hydrate from quote if available)
      setObservations("");
      // keep at least one procedure row
      setProcedures((prev) => (prev.length ? prev : [createRow()]));
      setPatient(patientName);
    } else {
      // new quote defaults
      setDescription("");
      setValidUntil("");
      setStatus("draft");
      setOriginStatus("draft");
      setObservations("");
      setPaymentMethod("");
      setEntrada("");
      setInstallments(1);
      setPaymentObservations("");
      setProcedures([createRow()]);
      setPatient(patientName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, quote?.id]);

  // When unlocking an expired quote, revert status from expired to original draft/sent
  useEffect(() => {
    if (!isLocked && status === "expired") {
      const fallback: QuoteStatus = originStatus !== "expired" ? originStatus : "draft";
      // Only revert if original was expirable (draft/sent). If fallback is approved/rejected, keep draft to avoid inconsistency
      if (fallback === "draft" || fallback === "sent") setStatus(fallback);
      else setStatus("draft");
    }
  }, [isLocked, status, originStatus]);

  const updateRow = (id: number, patch: Partial<ProcedureLine>) => {
    if (isLocked) return;
    setProcedures((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeRow = (id: number) => {
    if (isLocked) return;
    setProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  const handleProcedureSelect = (id: number, name: string) => {
    if (isLocked) return;
    const proc = MOCK_PROCEDURES.find((p) => p.name === name);
    updateRow(id, { procedureName: name, unitValue: proc ? maskCurrency(String(proc.price)) : "" });
  };

  const lineDiscount = (p: ProcedureLine) => {
    const unit = parseCurrency(p.unitValue);
    if (p.discountType === "currency") return parseCurrency(p.discountValue);
    const pct = parseFloat(p.discountValue.replace(",", ".")) || 0;
    return (unit * pct) / 100;
  };

  const subtotal = procedures.reduce(
    (acc, p) => acc + parseCurrency(p.unitValue) * p.quantity,
    0,
  );
  const totalDiscount = procedures.reduce((acc, p) => acc + lineDiscount(p) * p.quantity, 0);
  const total = subtotal - totalDiscount;

  const base = total - parseCurrency(entrada);
  let installmentLabel: string | null = null;
  if (base > 0) {
    const n = Math.max(1, installments);
    const totalCents = Math.round(base * 100);
    const perCents = Math.floor(totalCents / n);
    const remCents = totalCents % n;
    if (n === 1) {
      installmentLabel = `1x de ${formatCurrency(base)}`;
    } else if (remCents === 0) {
      installmentLabel = `${n}x de ${formatCurrency(perCents / 100)}`;
    } else {
      installmentLabel = `${n - 1}x de ${formatCurrency(perCents / 100)} e 1x de ${formatCurrency(
        (perCents + remCents) / 100,
      )}`;
    }
  }

  const handleSave = () => {
    if (isLocked) return;
    const totalValue = total;
    const effectiveStatus: QuoteStatus = status;
    if (onSave) {
      onSave({ description, validUntilIso: validUntil, status: effectiveStatus, totalValue });
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] max-w-6xl flex-col overflow-hidden p-0 gap-0 sm:max-w-6xl">
        {/* Acessibilidade: título real fica no layout, mas mantemos header sr-only para Radix */}
        <DialogHeader className="sr-only">
          <DialogTitle>Orçamento</DialogTitle>
          <DialogDescription>
            {patientLocked ? `Vinculado a ${patientName}` : "Crie um orçamento para um paciente"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[440px_1fr] divide-x divide-border overflow-hidden">
          {/* ------------------------- Esquerda ------------------------- */}
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[22px] font-bold leading-none tracking-tight text-primary">
                ORÇAMENTO
              </h2>
              <Select
                id="orc-status"
                aria-label="Status do orçamento"
                value={status}
                disabled={isLocked}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className={cn(
                  "h-8 w-[150px] shrink-0 rounded-[10px] bg-background px-2.5 pr-8 text-[12px] font-medium",
                  isLocked && "opacity-60",
                )}
              >
                <option value="draft">Rascunho</option>
                <option value="sent">Enviado</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Recusado</option>
                <option value="expired">Expirado</option>
              </Select>
            </div>

            {isLocked && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2.5"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12px] font-semibold leading-none text-amber-800">
                    Orçamento expirado
                  </p>
                  <p className="text-[11px] leading-snug text-amber-700">
                    Altere a data de <strong>validade</strong> para uma data futura para liberar a edição dos demais campos.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="orc-paciente" className="text-[12px] font-semibold">
                Paciente
              </Label>
              <Select
                id="orc-paciente"
                value={selectedPatient}
                disabled={patientLocked || isLocked}
                onChange={(e) => setPatient(e.target.value)}
                className={cn("h-10 rounded-[10px] text-[13px]", isLocked && "opacity-60")}
              >
                <option value="">Select option...</option>
                {patientOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="orc-descricao" className="text-[12px] font-semibold">
                Descrição
              </Label>
              <Input
                id="orc-descricao"
                placeholder="Enter text..."
                value={description}
                disabled={isLocked}
                onChange={(e) => setDescription(e.target.value)}
                className={cn("h-10 rounded-[10px] text-[13px]", isLocked && "opacity-60")}
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="orc-validade" className="text-[12px] font-semibold">
                Válido até
              </Label>
              <Input
                id="orc-validade"
                placeholder="Enter text..."
                type="date"
                value={validUntil}
                onChange={handleValidUntilChange}
                className={cn(
                  "h-10 rounded-[10px] text-[13px]",
                  isLocked
                    ? "border-amber-300 bg-amber-50/50 focus-visible:border-amber-400 focus-visible:ring-amber-200"
                    : "",
                )}
                aria-invalid={isLocked}
              />
              {isLocked && (
                <p className="text-[11px] font-medium text-amber-700">
                  Esta data está no passado. Selecione uma data futura.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-[6px]">
              <Label htmlFor="orc-obs" className="text-[12px] font-semibold">
                Observações
              </Label>
              <TextArea
                id="orc-obs"
                placeholder="Enter multiple lines..."
                value={observations}
                disabled={isLocked}
                onChange={(e) => setObservations(e.target.value)}
                className={cn("min-h-[230px] rounded-[10px]", isLocked && "opacity-60")}
              />
            </div>

            {isLocked && (
              <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-2 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Campos bloqueados até a validade ser corrigida
              </div>
            )}
          </div>

          {/* ------------------------- Direita ------------------------- */}
          <div className={cn("flex flex-col h-full overflow-hidden p-3", isLocked && "opacity-70")}>
            <h3 className="text-[18px] font-bold tracking-tight text-muted-foreground">
              PROCEDIMENTOS
            </h3>

            {/* Header da tabela */}
            <div className="mt-1 grid grid-cols-[1.5fr_0.85fr_0.9fr_0.45fr_0.85fr_1.2fr_28px] gap-1.5 rounded-md bg-slate-50 px-2 py-1.5">
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-primary">
                Procedimento
              </span>
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-primary">
                Valor unit.
              </span>
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-primary">
                Desconto
              </span>
              <span className="text-center text-[12px] font-bold uppercase tracking-[0.05em] text-primary">
                Qtd.
              </span>
              <span className="text-center text-[12px] font-bold uppercase tracking-[0.05em] text-primary">
                Total
              </span>
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-primary">
                Observação
              </span>
              <span />
            </div>

            {/* Linhas */}
            <div className="mt-2 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
              {procedures.map((p) => {
                const unit = parseCurrency(p.unitValue);
                const lineTotal = (unit - lineDiscount(p)) * p.quantity;
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1.5fr_0.85fr_0.9fr_0.45fr_0.85fr_1.2fr_28px] items-center gap-1.5"
                  >
                    <Select
                      aria-label="Procedimento"
                      value={p.procedureName}
                      disabled={isLocked}
                      onChange={(e) => handleProcedureSelect(p.id, e.target.value)}
                      className={cn("h-7 rounded-[8px] px-1.5 pr-5 text-[10px]", isLocked && "opacity-60")}
                    >
                      <option value=""># - LIMPEZA</option>
                      {MOCK_PROCEDURES.map((proc) => (
                        <option key={proc.name} value={proc.name}>
                          # - {proc.name.toUpperCase()}
                        </option>
                      ))}
                    </Select>

                    <CurrencyInput
                      aria-label="Valor unitário"
                      value={p.unitValue}
                      disabled={isLocked}
                      onValueChange={(v) => updateRow(p.id, { unitValue: v })}
                      placeholder="R$ 150,00"
                      className={cn("h-7 rounded-[8px] px-1.5 text-center text-[10px]", isLocked && "opacity-60")}
                    />

                    <div className="relative">
                      {p.discountType === "currency" ? (
                        <CurrencyInput
                          aria-label="Desconto"
                          value={p.discountValue}
                          disabled={isLocked}
                          onValueChange={(v) => updateRow(p.id, { discountValue: v })}
                          placeholder="0,00"
                          className={cn("h-7 rounded-[8px] pr-7 text-center text-[10px]", isLocked && "opacity-60")}
                        />
                      ) : (
                        <Input
                          aria-label="Desconto"
                          inputMode="numeric"
                          value={p.discountValue}
                          disabled={isLocked}
                          onChange={(e) =>
                            updateRow(p.id, {
                              discountValue: normalizeDiscountInput(e.target.value, "percent"),
                            })
                          }
                          placeholder="10,00"
                          className={cn("h-7 rounded-[8px] pr-7 text-center text-[10px]", isLocked && "opacity-60")}
                        />
                      )}
                      <button
                        type="button"
                        aria-label="Alternar tipo de desconto"
                        disabled={isLocked}
                        onClick={() => {
                          const next: DiscountType = p.discountType === "percent" ? "currency" : "percent";
                          updateRow(p.id, {
                            discountType: next,
                            discountValue: normalizeDiscountInput(p.discountValue, next),
                          });
                        }}
                        className={cn(
                          "absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded border border-input bg-muted text-[9px] font-bold leading-none text-muted-foreground hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                      >
                        {p.discountType === "percent" ? "%" : "R$"}
                      </button>
                    </div>

                    <Input
                      aria-label="Quantidade"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={p.quantity}
                      disabled={isLocked}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        updateRow(p.id, { quantity: Number.isNaN(v) || v < 1 ? 1 : v });
                      }}
                      className={cn("h-7 rounded-[8px] px-1 text-center text-[10px]", isLocked && "opacity-60")}
                    />

                    <div className="flex h-7 items-center justify-center rounded-[8px] border border-input bg-muted px-1 text-center text-[10px] font-medium text-foreground">
                      {formatCurrency(lineTotal)}
                    </div>

                    <Input
                      aria-label="Observação do procedimento"
                      value={p.observation}
                      disabled={isLocked}
                      onChange={(e) => updateRow(p.id, { observation: e.target.value })}
                      placeholder="Dente 2 com carie"
                      className={cn("h-7 rounded-[8px] px-1.5 text-[10px]", isLocked && "opacity-60")}
                    />

                    <button
                      type="button"
                      aria-label="Remover procedimento"
                      disabled={isLocked}
                      onClick={() => removeRow(p.id)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {procedures.length === 0 && (
                <div className="py-2 text-center text-[13px] text-muted-foreground">
                  Nenhum procedimento adicionado.
                </div>
              )}
                <div className="mt-1 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isLocked}
                        onClick={() => setProcedures((prev) => [...prev, createRow()])}
                        className="h-7 gap-1 rounded-full border-emerald-200 bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus className="h-3 w-3" />
                        Adicionar Procedimento
                    </Button>
                </div>
            </div>

            <div className={cn("mt-auto grid shrink-0 grid-cols-[1.15fr_1.85fr] gap-6 border-t border-border pt-2", isLocked && "pointer-events-none opacity-60")}>
              {/* Totalização */}
              <div>
                <h4 className="text-[18px] font-bold tracking-tight text-emerald-600">TOTALIZAÇÃO</h4>
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-[13px] text-muted-foreground">
                    <span>Subtotal (sem desconto)</span>
                    <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-muted-foreground">
                    <span>Total de descontos</span>
                    <span className="font-medium text-destructive">- {formatCurrency(totalDiscount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 text-[13px] font-bold text-foreground">
                    <span>Total geral</span>
                    <span className="text-[15px] text-emerald-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-[6px]">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Forma de pagamento
                    </Label>
                    <Select
                      id="orc-forma-pagto"
                      value={paymentMethod}
                      disabled={isLocked}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={cn("h-9 rounded-[10px] text-[13px]", isLocked && "opacity-60")}
                    >
                      <option value="">Cartão</option>
                      <option value="pix">Pix</option>
                      <option value="cartao">Cartão</option>
                      <option value="boleto">Boleto</option>
                      <option value="dinheiro">Dinheiro</option>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <Label htmlFor="orc-entrada" className="text-[11px] font-medium text-muted-foreground">
                      Entrada (R$)
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                        R$
                      </span>
                      <CurrencyInput
                        id="orc-entrada"
                        value={entrada}
                        disabled={isLocked}
                        onValueChange={setEntrada}
                        placeholder="500"
                        className={cn("h-9 rounded-[10px] pl-7 text-[13px]", isLocked && "opacity-60")}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <Label htmlFor="orc-parcelas" className="text-[11px] font-medium text-muted-foreground">
                      Nº de parcelas
                    </Label>
                    <Select
                      id="orc-parcelas"
                      value={String(installments)}
                      disabled={isLocked}
                      onChange={(e) => setInstallments(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className={cn("h-9 rounded-[10px] text-[13px]", isLocked && "opacity-60")}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">
                  Valor por parcela:{" "}
                  {installmentLabel ? (
                    <strong className="font-semibold text-foreground">{installmentLabel}</strong>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>

                <div className="flex flex-col gap-[6px]">
                  <Label htmlFor="orc-obs-pagto" className="text-[11px] font-medium text-muted-foreground">
                    Observações do pagamento
                  </Label>
                  <TextArea
                    id="orc-obs-pagto"
                    placeholder="Observações..."
                    value={paymentObservations}
                    disabled={isLocked}
                    onChange={(e) => setPaymentObservations(e.target.value)}
                    className={cn("min-h-[96px] rounded-[10px]", isLocked && "opacity-60")}
                  />
                </div>
              </div>
            </div>
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
            disabled={isLocked}
            size="sm"
            className="h-7 gap-1.5 rounded-md px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            title={isLocked ? "Corrija a validade para habilitar o salvamento" : undefined}
          >
            <Save className="h-3 w-3" />
            Salvar orçamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
