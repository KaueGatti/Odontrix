import { useState } from "react";
import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NovoOrcamentoDialog } from "./dialogs/NovoOrcamentoDialog";

interface QuoteRecord {
  id: number;
  description: string;
  totalValue: number;
  validUntil: string;
  createdBy: string;
  status: "approved" | "draft" | "sent" | "rejected" | "expired";
}

const MOCK_QUOTES: QuoteRecord[] = [
  { id: 1, description: "Profilaxia 04/25", totalValue: 100, validUntil: "01/04/2025", createdBy: "Kamily Vitória", status: "approved" },
  { id: 2, description: "Canal dente 36", totalValue: 500, validUntil: "10/04/2025", createdBy: "Kamily Vitória", status: "draft" },
  { id: 3, description: "Restauração 02/25", totalValue: 220, validUntil: "12/02/2025", createdBy: "Kamily Vitória", status: "sent" },
  { id: 4, description: "Clareamento", totalValue: 400, validUntil: "05/01/2025", createdBy: "Kamily Vitória", status: "rejected" },
  { id: 5, description: "Clareamento", totalValue: 400, validUntil: "05/01/2025", createdBy: "Kamily Vitória", status: "expired" },
];

function getBadgeVariant(status: QuoteRecord["status"]): "neutral" | "info" | "success" | "warning" | "error" {
  const map: Record<QuoteRecord["status"], "neutral" | "info" | "success" | "warning" | "error"> = {
    approved: "success",
    draft: "neutral",
    sent: "info",
    rejected: "error",
    expired: "error",
  };
  return map[status];
}

const STATUS_LABELS: Record<QuoteRecord["status"], string> = {
  approved: "Aprovado",
  draft: "Rascunho",
  sent: "Enviado",
  rejected: "Recusado",
  expired: "Expirado",
};

const PATIENT_NAME = "Kauê Vinícius Gatti";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OrcamentosTab() {
  const [isNewOpen, setNewOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Orçamentos
          </p>
          <Button size="sm" className="gap-1.5" onClick={() => setNewOpen(true)}>
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
              {MOCK_QUOTES.map((q) => (
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
                    {q.status === "expired" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-2.5 py-1 text-[11px] font-semibold leading-none text-destructive">
                        Expirado
                      </span>
                    ) : (
                      <Badge variant={getBadgeVariant(q.status)}>
                        {STATUS_LABELS[q.status]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 border-none bg-transparent p-0 text-[11px] text-muted-foreground hover:text-foreground"
                      aria-label="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {MOCK_QUOTES.length === 0 && (
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
        onOpenChange={setNewOpen}
        patientName={PATIENT_NAME}
      />
    </div>
  );
}
