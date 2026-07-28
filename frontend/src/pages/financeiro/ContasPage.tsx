import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Receipt,
} from "lucide-react";

import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import { Card } from "@/components/ui/card";
import {
  MOCK_PROXIMOS_VENCIMENTOS,
} from "@/pages/financeiro/mock-data";
import { StatusBadge } from "@/pages/financeiro/components/StatusBadge";
import { TypeTag } from "@/pages/financeiro/components/TypeTag";
import { RegistrarRecebimentoDialog } from "@/pages/financeiro/components/RegistrarRecebimentoDialog";
import { RegistrarPagamentoDialog } from "@/pages/financeiro/components/RegistrarPagamentoDialog";

export default function ContasPage() {
  const [receberOpen, setReceberOpen] = useState(false);
  const [pagarOpen, setPagarOpen] = useState(false);
  const [selectedReceber, setSelectedReceber] = useState({ paciente: "", parcela: "", valor: "" });
  const [selectedPagar, setSelectedPagar] = useState({ descricao: "", valor: "" });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-background px-9 py-4.5 shadow-[var(--shadow-topbar)]">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">
            Financeiro
          </p>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            Contas
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-9 py-7">
        <div className="grid grid-cols-4 gap-[14px]">
          <KpiCard
            icon={ArrowDownLeft}
            iconBg="bg-success/10"
            iconColor="#16a34a"
            label="A receber (pendente)"
            value="R$ 18.420,00"
            sub="32 parcelas em aberto"
          />
          <KpiCard
            icon={ArrowUpRight}
            iconBg="bg-destructive/10"
            iconColor="#dc2626"
            label="A pagar (pendente)"
            value="R$ 6.150,00"
            sub="9 contas em aberto"
          />
          <KpiCard
            icon={DollarSign}
            iconBg="bg-primary/[0.12]"
            iconColor="var(--blue)"
            label="Recebido no mês"
            value="R$ 24.780,00"
            sub="Maio de 2025"
          />
          <KpiCard
            icon={Receipt}
            iconBg="bg-warning/10"
            iconColor="#b45309"
            label="Pago no mês"
            value="R$ 8.930,00"
            sub="Maio de 2025"
          />
        </div>

        <div className="mt-4">
          <Card>
            <div className="px-6 pt-5">
              <p className="mb-0.5 text-[15px] font-bold tracking-tight text-foreground">
                Próximos vencimentos
              </p>
              <p className="mb-4.5 text-[11.5px] text-muted-foreground">
                Contas a receber e a pagar, ordenadas por data de vencimento
              </p>
            </div>
            <div className="overflow-x-auto px-6 pb-5">
              <table className="w-full border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b-[1.5px] border-[var(--gray-100)]">
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Tipo</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Descrição</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Vencimento</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Valor</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Status</th>
                    <th className="px-2 pb-[10px]" />
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PROXIMOS_VENCIMENTOS.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--gray-100)] last:border-b-0">
                      <td className="px-2 py-3 align-middle">
                        <TypeTag type={item.type} />
                      </td>
                      <td className="px-2 py-3 align-middle font-semibold text-foreground">
                        {item.descricao}
                      </td>
                      <td className="px-2 py-3 align-middle text-muted-foreground">
                        {item.vencimento}
                      </td>
                      <td className="px-2 py-3 align-middle text-foreground">
                        {item.valor}
                      </td>
                      <td className="px-2 py-3 align-middle">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-2 py-3 align-middle">
                        {item.type === "receber" ? (
                          <button
                            className="inline-flex h-[28px] cursor-pointer items-center gap-[7px] rounded-[10px] border-[1.5px] border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.12)] px-3 text-[11.5px] font-semibold text-[#16a34a] transition-all hover:bg-[rgba(74,222,128,0.2)]"
                            onClick={() => {
                              setSelectedReceber({
                                paciente: item.descricao.split(" — ")[0],
                                parcela: item.descricao.includes("parcela") ? item.descricao.split(" — ")[1] : "À vista",
                                valor: item.valor,
                              });
                              setReceberOpen(true);
                            }}
                          >
                            Receber
                          </button>
                        ) : (
                          <button
                            className="inline-flex h-[28px] cursor-pointer items-center gap-[7px] rounded-[10px] border-[1.5px] border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.12)] px-3 text-[11.5px] font-semibold text-[#dc2626] transition-all hover:bg-[rgba(248,113,113,0.2)]"
                            onClick={() => {
                              setSelectedPagar({
                                descricao: item.descricao,
                                valor: item.valor,
                              });
                              setPagarOpen(true);
                            }}
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <RegistrarRecebimentoDialog
        open={receberOpen}
        onOpenChange={setReceberOpen}
        paciente={selectedReceber.paciente}
        parcela={selectedReceber.parcela}
        valor={selectedReceber.valor}
      />
      <RegistrarPagamentoDialog
        open={pagarOpen}
        onOpenChange={setPagarOpen}
        descricao={selectedPagar.descricao}
        valor={selectedPagar.valor}
      />
    </div>
  );
}
