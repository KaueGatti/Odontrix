import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PaymentRecord {
  id: number;
  date: string;
  value: number;
  method: string;
}

interface ParcelaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  patientName: string;
  dueDate: string;
  totalValue: number;
}

const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 1, date: "30/05/2025 12:00", value: 400, method: "Pix" },
  { id: 2, date: "30/05/2025 12:30", value: 400, method: "Cartão débito" },
  { id: 3, date: "30/05/2025 12:30", value: 400, method: "Dinheiro" },
  { id: 4, date: "30/05/2025 12:30", value: 400, method: "Pix" },
  { id: 5, date: "30/05/2025 12:30", value: 400, method: "Boleto" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ParcelaDialog({
  open,
  onOpenChange,
  description,
  patientName,
  dueDate,
  totalValue,
}: ParcelaDialogProps) {
  const totalPaid = MOCK_PAYMENTS.reduce((acc, p) => acc + p.value, 0);
  const remaining = totalValue - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Parcela</DialogTitle>
            <Badge variant="warning">Pendente</Badge>
          </div>
          <DialogDescription>
            {description} — {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left column */}
          <div>
            <Card className="bg-muted/30">
              <div className="border-b border-border px-5 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                  Detalhes da parcela
                </p>
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <p className="text-[11px] text-muted-foreground">Data de vencimento</p>
                  <p className="text-[13px] font-medium text-foreground">{dueDate}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Valor bruto (R$)</p>
                    <p className="text-[13px] font-medium text-foreground">
                      {formatCurrency(totalValue)}
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
                      {formatCurrency(totalValue)}
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
                  <Label htmlFor="parc-obs">Observações</Label>
                  <textarea
                    id="parc-obs"
                    className="mt-1 flex min-h-[72px] w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                    placeholder="Observações internas sobre esta parcela..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                Pagamentos
              </span>
              <Button type="button" size="sm" variant="outline" className="gap-1">
                <Plus className="h-3 w-3" />
                Registrar pagamento
              </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-muted text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Data e hora</th>
                    <th className="px-3 py-2 font-medium">Valor</th>
                    <th className="px-3 py-2 font-medium">Forma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {MOCK_PAYMENTS.map((pay) => (
                    <tr key={pay.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2.5 text-foreground">{pay.id}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{pay.date}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {formatCurrency(pay.value)}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{pay.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
