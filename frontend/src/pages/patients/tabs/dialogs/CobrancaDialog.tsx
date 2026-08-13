import { useState } from "react";
import { Banknote, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface Installment {
  id: number;
  dueDate: string;
  value: number;
  paymentMethod: string;
  status: "pending" | "paid" | "overdue" | "selected";
}

interface CobrancaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteDescription: string;
  quoteTotal: number;
  patientName: string;
}

const MOCK_INSTALLMENTS: Installment[] = [
  { id: 1, dueDate: "30/05/2025", value: 400, paymentMethod: "Pix", status: "pending" },
  { id: 2, dueDate: "30/05/2025", value: 400, paymentMethod: "Pix", status: "pending" },
  { id: 3, dueDate: "30/05/2025", value: 400, paymentMethod: "Cartão débito", status: "overdue" },
  { id: 4, dueDate: "30/05/2025", value: 400, paymentMethod: "Pix", status: "selected" },
  { id: 5, dueDate: "30/05/2025", value: 400, paymentMethod: "Pix", status: "pending" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusBadge(status: Installment["status"]) {
  switch (status) {
    case "paid":
      return <Badge variant="success">Pago</Badge>;
    case "overdue":
      return <Badge variant="error">Vencido</Badge>;
    case "selected":
      return <Badge variant="info">Selecionada</Badge>;
    default:
      return <Badge variant="neutral">Pendente</Badge>;
  }
}

export function CobrancaDialog({
  open,
  onOpenChange,
  quoteDescription,
  quoteTotal,
  patientName,
}: CobrancaDialogProps) {
  const [showLote, setShowLote] = useState(false);

  const totalPaid = 0;
  const remaining = quoteTotal - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Cobrança</DialogTitle>
            <Badge variant="warning">Pendente</Badge>
          </div>
          <DialogDescription>
            Orçamento #{quoteDescription} — {formatCurrency(quoteTotal)} — {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left column */}
          <div>
            <Card className="bg-muted/30">
              <div className="border-b border-border px-5 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                  Valores
                </p>
              </div>
              <div className="space-y-3 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Valor bruto (R$)</p>
                    <p className="text-[13px] font-medium text-foreground">
                      {formatCurrency(quoteTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Desconto (R$)</p>
                    <p className="text-[13px] font-medium text-foreground">
                      {formatCurrency(0)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Total</p>
                    <p className="text-[13px] font-bold text-foreground">
                      {formatCurrency(quoteTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Pago / Restante</p>
                    <p className="text-[13px] font-medium text-foreground">
                      {formatCurrency(totalPaid)} / {formatCurrency(remaining)}
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cob-obs">Observações</Label>
                  <textarea
                    id="cob-obs"
                    className="mt-1 flex min-h-[72px] w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                    placeholder="Observações internas sobre esta cobrança..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                Parcelas
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => setShowLote(!showLote)}
              >
                <Banknote className="h-3 w-3" />
                Registrar pagamento em lote
              </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-muted text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Vencimento</th>
                    <th className="px-3 py-2 font-medium">Valor</th>
                    <th className="px-3 py-2 font-medium">Pagamento</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {MOCK_INSTALLMENTS.map((inst) => (
                    <tr
                      key={inst.id}
                      className={`hover:bg-muted/30 ${inst.status === "selected" ? "bg-primary/[0.06]" : ""}`}
                    >
                      <td className="px-3 py-2.5 text-foreground">{inst.id}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {inst.dueDate}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {formatCurrency(inst.value)}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {inst.paymentMethod}
                      </td>
                      <td className="px-3 py-2.5">{statusBadge(inst.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showLote && (
              <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                  Registrar pagamento
                </p>
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="lote-valor">Valor recebido (R$)</Label>
                    <Input id="lote-valor" placeholder="750,00" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lote-forma">Forma de pagamento</Label>
                    <Select id="lote-forma" className="mt-1">
                      <option value="">Pix — R$ 750,00</option>
                      <option value="pix">Pix</option>
                      <option value="cartao">Cartão</option>
                      <option value="boleto">Boleto</option>
                      <option value="dinheiro">Dinheiro</option>
                    </Select>
                  </div>
                </div>
                <label className="mb-3 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
                  Múltiplas formas de pagamento — combinado no mesmo pagamento
                </label>
                <div className="flex items-center justify-between border-t border-border pt-2 text-[15px] font-bold text-foreground">
                  <span>Valor a pagar</span>
                  <span>{formatCurrency(750)}</span>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowLote(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" className="gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Confirmar pagamento
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
