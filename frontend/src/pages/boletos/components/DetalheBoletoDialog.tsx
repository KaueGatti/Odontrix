import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  Check,
  Copy,
  DollarSign,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BoletoStatusBadge } from "./BoletoStatusBadge";
import { centsToNumber, formatMoney } from "@/lib/masks";
import type { Boleto } from "../types";

interface DetalheBoletoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boleto: Boleto | null;
  onRegistrarPagamento: (boleto: Boleto) => void;
  onAdiarVencimento: (boleto: Boleto) => void;
  onCancelar: (boleto: Boleto) => void;
}

interface TimelineStep {
  label: string;
  date: string;
  done: boolean;
  danger?: boolean;
  warn?: boolean;
}

export function DetalheBoletoDialog({
  open,
  onOpenChange,
  boleto,
  onRegistrarPagamento,
  onAdiarVencimento,
  onCancelar,
}: DetalheBoletoDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showPdfNote, setShowPdfNote] = useState(false);

  if (!boleto) return null;

  const statusDisponivel =
    boleto.status === "issued" || boleto.status === "registered" || boleto.status === "overdue";

  const steps: TimelineStep[] = [
    { label: "Boleto emitido", date: boleto.emitidoEm, done: Boolean(boleto.emitidoEm) },
    {
      label: "Registrado no banco (Sicredi)",
      date: boleto.registradoEm ?? "",
      done: Boolean(boleto.registradoEm),
    },
  ];
  if (boleto.status === "cancelled") {
    steps.push({ label: "Cancelado", date: boleto.canceladoEm ?? "", done: true, danger: true });
  } else if (boleto.status === "paid") {
    steps.push({ label: "Pagamento confirmado", date: boleto.pagoEm ?? "", done: true });
  } else if (boleto.status === "overdue") {
    steps.push({
      label: "Vencido — aguardando pagamento",
      date: boleto.vencimento,
      done: false,
      warn: true,
    });
  } else {
    steps.push({ label: "Aguardando pagamento", date: "", done: false });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(boleto!.linhaDigitable);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard indisponível — ignora silenciosamente */
    }
  }
return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <DialogTitle className="text-[15px] font-bold tracking-tight text-foreground">
                {boleto.paciente}
              </DialogTitle>
              <DialogDescription className="mt-[3px] text-[11.5px] text-muted-foreground">
                {boleto.parcela}
              </DialogDescription>
              <p className="mt-1 text-[22px] font-bold tracking-tight text-foreground">
                {formatMoney(centsToNumber(boleto.valorCents))}
              </p>
            </div>
            <BoletoStatusBadge status={boleto.status} className="shrink-0" />
          </div>
        </DialogHeader>

        <div className="rounded-[10px] border border-border bg-[var(--gray-50)] px-4 py-1.5">
          <KVRow label="Nosso número" mono>
            {boleto.nossoNumero}
          </KVRow>
          <KVRow label="Vencimento">{boleto.vencimento}</KVRow>
          <div className="flex items-center justify-between gap-2.5 border-b border-dashed border-[var(--gray-200)] py-2 last:border-b-0">
            <div className="shrink-0 text-[11px] text-muted-foreground">Linha digitável</div>
            <div className="flex items-center gap-1.5">
              <span className="break-all text-right font-mono text-[12px] font-medium text-foreground">
                {boleto.linhaDigitable}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copiar linha digitável"
                className="inline-flex shrink-0 items-center gap-1 rounded p-1 text-primary transition-colors hover:text-primary/70"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Linha do tempo
          </p>
          <div className="flex flex-col gap-0">
            {steps.map((step, index) => {
              const dotColor = step.danger
                ? "#dc2626"
                : step.warn
                  ? "#b45309"
                  : step.done
                    ? "var(--blue)"
                    : "var(--gray-300)";
              return (
                <div key={step.label} className={index < steps.length - 1 ? "flex gap-2.5 pb-4" : "flex gap-2.5"}>
                  <div className="flex flex-col items-center">
                    <span
                      className="mt-1 h-[9px] w-[9px] shrink-0 rounded-full"
                      style={{ background: dotColor }}
                    />
                    {index < steps.length - 1 && <span className="w-px flex-1 bg-[var(--gray-200)]" />}
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">{step.date || "Pendente"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showPdfNote && (
          <p className="mt-3 rounded-[10px] border border-border bg-[var(--gray-50)] px-3 py-2 text-[11.5px] text-muted-foreground">
            Em produção: abre o PDF do boleto (gerado a partir do bank_payload / linha digitável).
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-[#3b82f6] hover:bg-[rgba(59,130,246,0.08)] hover:text-[#2563eb]"
            onClick={() => setShowPdfNote((v) => !v)}
          >
            <FileText className="h-3.5 w-3.5" />
            Visualizar PDF
          </Button>
          {statusDisponivel && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[#16a34a] hover:bg-[rgba(34,197,94,0.1)] hover:text-[#15803d]"
                onClick={() => {
                  onOpenChange(false);
                  onRegistrarPagamento(boleto);
                }}
              >
                <DollarSign className="h-3.5 w-3.5" />
                Registrar pagamento manual
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[#b45309] hover:bg-[rgba(245,158,11,0.12)] hover:text-[#92400e]"
                onClick={() => {
                  onOpenChange(false);
                  onAdiarVencimento(boleto);
                }}
              >
                <CalendarClock className="h-3.5 w-3.5" />
                Adiar vencimento
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => {
                  onOpenChange(false);
                  onCancelar(boleto);
                }}
              >
                <Ban className="h-3.5 w-3.5" />
                Cancelar boleto
              </Button>
            </>
          )}
        </div>

        <span className="sr-only">
          <AlertTriangle className="sr-only" />
        </span>
      </DialogContent>
    </Dialog>
  );
}

function KVRow({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-b border-dashed border-[var(--gray-200)] py-2 last:border-b-0">
      <div className="shrink-0 text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-right text-[12px] font-medium text-foreground ${mono ? "font-mono" : ""}`}>
        {children}
      </div>
    </div>
  );
}