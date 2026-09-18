/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NovoOrcamentoDialog } from "./dialogs/NovoOrcamentoDialog";
import { formatMoney } from "@/lib/masks";
import {
  addQuote,
  getQuotesByPatient,
  updateQuote,
  type QuoteRecord,
  type QuoteStatus,
} from "../plano-ficha-mock-data";

/**
 * TODO: substituir pelo paciente vindo da API (useParams) — mock único
 * (mesmo paciente da ficha `PacienteDetalhes`).
 */
const PATIENT_ID = "1";

function getBadgeVariant(status: QuoteStatus): "neutral" | "info" | "success" | "warning" | "error" {
  const map: Record<QuoteStatus, "neutral" | "info" | "success" | "warning" | "error"> = {
    approved: "success",
    draft: "neutral",
    sent: "info",
    rejected: "error",
    expired: "error",
  };
  return map[status];
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  approved: "Aprovado",
  draft: "Rascunho",
  sent: "Enviado",
  rejected: "Recusado",
  expired: "Expirado",
};

const PATIENT_NAME = "Kauê Vinícius Gatti";

function formatCurrency(value: number) {
  return formatMoney(value);
}

export function isExpiredValidUntil(validUntil: string): boolean {
  if (!validUntil) return false;
  let date: Date | null = null;
  if (validUntil.includes("/")) {
    const [d, m, y] = validUntil.split("/").map(Number);
    if (!d || !m || !y) return false;
    date = new Date(y, m - 1, d);
  } else if (validUntil.includes("-")) {
    const [y, m, d] = validUntil.split("-").map(Number);
    if (!y || !m || !d) return false;
    date = new Date(y, m - 1, d);
  } else {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

export function getEffectiveStatus(q: QuoteRecord): QuoteRecord["status"] {
  const past = isExpiredValidUntil(q.validUntil);
  if (past) {
    if (q.status === "draft" || q.status === "sent" || q.status === "expired") return "expired";
    return q.status;
  }
  if (q.status === "expired") return "draft";
  return q.status;
}

function brToIso(br: string): string {
  if (!br || !br.includes("/")) return br;
  const [d, m, y] = br.split("/");
  if (!d || !m || !y) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function isoToBr(iso: string): string {
  if (!iso || !iso.includes("-")) return iso;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export function OrcamentosTab() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>(() =>
    getQuotesByPatient(PATIENT_ID).map((q) => ({ ...q, items: q.items.map((i) => ({ ...i })) })),
  );
  const [isNewOpen, setNewOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null);

  /** Recopia o registry para o estado (mock em runtime é mutável). */
  const syncFromRegistry = () => {
    setQuotes(
      getQuotesByPatient(PATIENT_ID).map((q) => ({ ...q, items: q.items.map((i) => ({ ...i })) })),
    );
  };

  const handleNew = () => {
    setSelectedQuote(null);
    setNewOpen(true);
  };

  const handleView = (q: QuoteRecord) => {
    setSelectedQuote(q);
    setNewOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setNewOpen(open);
    if (!open) setSelectedQuote(null);
  };

  const handleSave = (data: {
    description: string;
    validUntilIso: string;
    status: QuoteRecord["status"];
    totalValue: number;
    items: {
      procedureName: string;
      toothFdi: number | null;
      unitPrice: number;
      discount: number;
      quantity: number;
      finalPrice: number;
    }[];
  }) => {
    const validUntilBr = isoToBr(data.validUntilIso) || new Date().toLocaleDateString("pt-BR");
    if (selectedQuote) {
      updateQuote(PATIENT_ID, selectedQuote.id, {
        description: data.description || selectedQuote.description,
        validUntil: validUntilBr,
        status: data.status,
        totalValue: data.totalValue !== 0 ? data.totalValue : selectedQuote.totalValue,
        // Sem linhas preenchidas, mantém os itens atuais (e as baixas já feitas).
        items: data.items.length
          ? data.items.map((item, idx) => ({
              ...item,
              id: `q${selectedQuote.id}-edit-${idx + 1}`,
              realized: false,
            }))
          : null,
      });
    } else {
      addQuote(PATIENT_ID, {
        description: data.description || "Novo orçamento",
        validUntil: validUntilBr,
        createdBy: "Kamily Vitória",
        totalValue: data.totalValue,
        items: data.items,
      });
    }
    syncFromRegistry();
    setNewOpen(false);
    setSelectedQuote(null);
  };

  const rows = useMemo(
    () =>
      quotes.map((q) => {
        const effective = getEffectiveStatus(q);
        return { q, effective };
      }),
    [quotes],
  );

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Orçamentos
          </p>
          <Button size="sm" className="gap-1.5" onClick={handleNew}>
            <Plus className="h-3.5 w-3.5" />
            Novo Orçamento
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">#</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Descrição</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Valor total</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Válido até</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Criado por</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Status</th>
                <th className="px-6 pb-3 pt-4 text-right text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ q, effective }) => (
                <tr key={q.id} className="border-b border-border/50 last:border-b-0">
                  <td className="px-6 py-3 text-muted-foreground">{q.id}</td>
                  <td className="px-6 py-3 font-semibold text-foreground">{q.description}</td>
                  <td className="px-6 py-3 text-foreground">
                    {formatCurrency(q.totalValue)}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{q.validUntil}</td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      className="border-none bg-transparent p-0 text-[13px] text-primary underline decoration-transparent transition-colors hover:decoration-primary/30"
                    >
                      {q.createdBy}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    {effective === "expired" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-2.5 py-1 text-[11px] font-semibold leading-none text-destructive">
                        Expirado
                      </span>
                    ) : (
                      <Badge variant={getBadgeVariant(effective)}>
                        {STATUS_LABELS[effective]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleView(q)}
                      className="inline-flex items-center gap-1 border-none bg-transparent p-0 text-[11px] text-muted-foreground hover:text-foreground"
                      aria-label={`Ver orçamento ${q.id}`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[13px] text-muted-foreground">
                    Nenhum orçamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <NovoOrcamentoDialog
        open={isNewOpen}
        onOpenChange={handleOpenChange}
        patientName={PATIENT_NAME}
        patientLocked
        quote={
          selectedQuote
            ? {
                id: selectedQuote.id,
                description: selectedQuote.description,
                validUntilIso: brToIso(selectedQuote.validUntil),
                status: getEffectiveStatus(selectedQuote),
                // keep original status for revert logic
                originalStatus: selectedQuote.status,
              }
            : null
        }
        onSave={handleSave}
      />
    </div>
  );
}
