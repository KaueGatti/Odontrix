import { useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";

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

interface ProcedureLine {
  id: number;
  name: string;
  unitValue: number;
  discountPercent: number;
  quantity: number;
}

interface NovoOrcamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
}

const MOCK_PROCEDURES_LIST: ProcedureLine[] = [
  { id: 1, name: "Limpeza", unitValue: 750, discountPercent: 10, quantity: 1 },
  { id: 2, name: "Canal", unitValue: 1500, discountPercent: 15, quantity: 1 },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function NovoOrcamentoDialog({
  open,
  onOpenChange,
  patientName,
}: NovoOrcamentoDialogProps) {
  const [procedures] = useState<ProcedureLine[]>(MOCK_PROCEDURES_LIST);

  const subtotal = procedures.reduce(
    (acc, p) => acc + p.unitValue * p.quantity,
    0,
  );
  const totalDiscount = procedures.reduce(
    (acc, p) => acc + (p.unitValue * p.quantity * p.discountPercent) / 100,
    0,
  );
  const total = subtotal - totalDiscount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
          <DialogDescription>
            Vinculado a {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left column */}
          <div>
            <div className="mb-4">
              <Label htmlFor="orc-descricao">
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Input id="orc-descricao" placeholder="Ex: Profilaxia 04/25" className="mt-1" />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="orc-validade">Válido até</Label>
                <Input id="orc-validade" type="date" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="orc-status">Status</Label>
                <Select id="orc-status" className="mt-1">
                  <option value="draft">Rascunho</option>
                  <option value="sent">Enviado</option>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="orc-obs">Observações</Label>
              <textarea
                id="orc-obs"
                className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                placeholder="Observações sobre o orçamento..."
              />
            </div>

            <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                Procedimentos
              </span>
              <Button type="button" size="sm" variant="outline" className="gap-1">
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-muted text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Procedimento</th>
                    <th className="px-3 py-2 font-medium">Vlr. unit.</th>
                    <th className="px-3 py-2 font-medium">Desc.</th>
                    <th className="px-3 py-2 font-medium">Qtd.</th>
                    <th className="px-3 py-2 font-medium">Total</th>
                    <th className="w-8 px-3 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {procedures.map((p) => {
                    const lineTotal =
                      p.unitValue * p.quantity * (1 - p.discountPercent / 100);
                    return (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2.5 font-semibold text-foreground">
                          {p.name}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {formatCurrency(p.unitValue)}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {p.discountPercent}%
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {p.quantity}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            className="text-muted-foreground/50 transition-colors hover:text-destructive"
                            aria-label="Remover procedimento"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div>
            <Card className="bg-muted/30">
              <div className="border-b border-border px-5 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
                  Totalização
                </p>
              </div>
              <div className="space-y-2 p-5">
                <div className="flex items-center justify-between text-[12.5px] text-muted-foreground">
                  <span>Subtotal (sem desconto)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[12.5px] text-muted-foreground">
                  <span>Total de descontos</span>
                  <span className="text-destructive">- {formatCurrency(totalDiscount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 text-[15px] font-bold text-foreground">
                  <span>Total geral</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="border-t border-border px-5 py-4">
                <div className="mb-3">
                  <Label htmlFor="orc-forma-pagto">Forma de pagamento</Label>
                  <Select id="orc-forma-pagto" className="mt-1">
                    <option value="">Selecione...</option>
                    <option value="pix">Pix</option>
                    <option value="cartao">Cartão</option>
                    <option value="boleto">Boleto</option>
                    <option value="dinheiro">Dinheiro</option>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="orc-entrada">Entrada (R$)</Label>
                    <Input id="orc-entrada" placeholder="500" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="orc-parcelas">Nº de parcelas</Label>
                    <Input id="orc-parcelas" placeholder="3" className="mt-1" />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Valor por parcela: <strong>3x de R$ 508,33</strong> · 1x de R$ 508,34
                </p>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            <Save className="h-4 w-4" />
            Salvar orçamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
