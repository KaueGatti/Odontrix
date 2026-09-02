import { useState } from "react";
import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CobrancaDialog } from "./dialogs/CobrancaDialog";
import { NovoRegistroDialog, type NovoRegistroPayload } from "./dialogs/NovoRegistroDialog";
import { formatMoney } from "@/lib/masks";

interface BillingRecord {
  id: number;
  description: string;
  issueDate: string;
  dueDate: string;
  total: number;
  paid: number | null;
  balance: number;
  paymentMethod: string | null;
  generatedBy: string;
  isConsulta: boolean;
  status: "paid" | "partial" | "open" | "overdue";
}

const MOCK_BILLINGS: BillingRecord[] = [
  { id: 1, description: "Profilaxia 04/25", issueDate: "01/04/2025", dueDate: "30/04/2025", total: 180, paid: 180, balance: 0, paymentMethod: "Pix", generatedBy: "Consulta #041", isConsulta: true, status: "paid" },
  { id: 2, description: "Canal dente 36", issueDate: "10/04/2025", dueDate: "15/05/2025", total: 750, paid: 250, balance: 500, paymentMethod: "Cartão", generatedBy: "Consulta #038", isConsulta: true, status: "partial" },
  { id: 3, description: "Restauração 02/25", issueDate: "12/02/2025", dueDate: "28/02/2025", total: 220, paid: null, balance: 220, paymentMethod: null, generatedBy: "Dr. Marcos S.", isConsulta: false, status: "open" },
  { id: 4, description: "Clareamento", issueDate: "05/01/2025", dueDate: "10/01/2025", total: 400, paid: null, balance: 400, paymentMethod: "Boleto", generatedBy: "Consulta #031", isConsulta: true, status: "overdue" },
];

function getBadgeVariant(status: BillingRecord["status"]): "neutral" | "info" | "success" | "warning" | "error" {
  const map: Record<BillingRecord["status"], "neutral" | "info" | "success" | "warning" | "error"> = {
    paid: "success",
    partial: "warning",
    open: "neutral",
    overdue: "error",
  };
  return map[status];
}

const STATUS_LABELS: Record<BillingRecord["status"], string> = {
  paid: "Pago",
  partial: "Parcial",
  open: "Em aberto",
  overdue: "Vencido",
};

const PATIENT_NAME = "Kauê Vinícius Gatti";

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return formatMoney(value);
}

export function FinanceiroTab() {
  const [cobrancaOpen, setCobrancaOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [novoRegistroOpen, setNovoRegistroOpen] = useState(false);
  const [billings, setBillings] = useState<BillingRecord[]>(MOCK_BILLINGS);

  const totalValue = billings.reduce((acc, b) => acc + b.total, 0);
  const totalPaid = billings.reduce((acc, b) => acc + (b.paid ?? 0), 0);
  const openBalance = billings.reduce((acc, b) => acc + b.balance, 0);
  const overdueCount = billings.filter((b) => b.status === "overdue").length;
  const isDelinquent = overdueCount > 0;

  function handleNovoRegistro(data: NovoRegistroPayload) {
    const total = data.valorLiquido;
    const record: BillingRecord = {
      id: billings.reduce((max, b) => Math.max(max, b.id), 0) + 1,
      description: data.descricao,
      issueDate: new Date().toLocaleDateString("pt-BR"),
      dueDate: data.vencimentoBR,
      total,
      paid: data.entrada > 0 ? data.entrada : null,
      balance: Math.max(0, total - data.entrada),
      paymentMethod: data.forma,
      generatedBy: "Registro manual",
      isConsulta: false,
      status: total - data.entrada <= 0 ? "paid" : "open",
    };
    setBillings((prev) => [record, ...prev]);
  }

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <Card>
        <div className="border-b border-border px-4 py-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Resumo financeiro
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4 p-2">
          <div className="rounded-[10px] bg-muted/50 p-2">
            <p className="mb-0.5 text-[11px] text-muted-foreground">Total já pago</p>
            <p className="text-[18px] font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="rounded-[10px] bg-muted/50 p-2">
            <p className="mb-0.5 text-[11px] text-muted-foreground">Saldo em aberto</p>
            <p className="text-[18px] font-bold text-destructive">
              {formatCurrency(openBalance)}
            </p>
          </div>
          <div className="rounded-[10px] bg-muted/50 p-2">
            <p className="mb-0.5 text-[11px] text-muted-foreground">Parcelas vencidas</p>
            <p className="text-[18px] font-bold text-destructive">{overdueCount}</p>
          </div>
          <div className="rounded-[10px] bg-muted/50 p-2">
            <p className="mb-0.5 text-[11px] text-muted-foreground">Situação</p>
            <Badge variant={isDelinquent ? "error" : "success"}>
              {isDelinquent ? "Inadimplente" : "Em dia"}
            </Badge>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Contas
          </p>
          <Button size="sm" className="gap-1.5" onClick={() => setNovoRegistroOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Novo registro
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Descrição</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Emissão</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Vencimento</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Total</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Pago</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Saldo</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Pagamento</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Gerado por</th>
                <th className="px-6 pb-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Status</th>
                <th className="px-6 pb-3 pt-4 text-right text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {billings.map((b) => (
                <tr key={b.id} className={`border-b border-border/50 last:border-b-0 ${b.status === "overdue" ? "bg-destructive/[0.06]" : ""}`}>
                  <td className="px-6 py-3 font-semibold text-foreground">{b.description}</td>
                  <td className="px-6 py-3 text-muted-foreground">{b.issueDate}</td>
                  <td className="px-6 py-3 text-muted-foreground">{b.dueDate}</td>
                  <td className="px-6 py-3 text-foreground">{formatCurrency(b.total)}</td>
                  <td className="px-6 py-3 text-foreground">{formatCurrency(b.paid)}</td>
                  <td className="px-6 py-3 font-medium text-foreground">
                    {formatCurrency(b.balance)}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {b.paymentMethod ?? "—"}
                  </td>
                  <td className="px-6 py-3">
                    {b.isConsulta ? (
                      <button
                        type="button"
                        className="border-none bg-transparent p-0 text-[13px] text-primary underline decoration-transparent transition-colors hover:decoration-primary/30"
                      >
                        {b.generatedBy}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">{b.generatedBy}</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={getBadgeVariant(b.status)}>
                      {STATUS_LABELS[b.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecord(b);
                        setCobrancaOpen(true);
                      }}
                      className="inline-flex items-center gap-1 border-none bg-transparent p-0 text-[11px] text-muted-foreground hover:text-foreground"
                      aria-label="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <td className="px-6 py-3.5 text-[13px] font-bold text-foreground">Total</td>
                <td colSpan={2} />
                <td className="px-6 py-3.5 text-[13px] font-bold text-foreground">
                  {formatCurrency(totalValue)}
                </td>
                <td className="px-6 py-3.5 text-[13px] font-bold text-green-600">
                  {formatCurrency(totalPaid)}
                </td>
                <td className="px-6 py-3.5 text-[13px] font-bold text-destructive">
                  {formatCurrency(openBalance)}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <CobrancaDialog
        key={selectedRecord?.id ?? "none"}
        open={cobrancaOpen}
        onOpenChange={setCobrancaOpen}
        quoteDescription={selectedRecord?.description ?? ""}
        quoteTotal={selectedRecord?.total ?? 0}
        patientName={PATIENT_NAME}
      />

      <NovoRegistroDialog
        open={novoRegistroOpen}
        onOpenChange={setNovoRegistroOpen}
        patientName={PATIENT_NAME}
        onSave={handleNovoRegistro}
      />
    </div>
  );
}
