import { useState } from "react";
import { Hourglass, CalendarCheck, DollarSign } from "lucide-react";

import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import { Card } from "@/components/ui/card";
import { MOCK_RECEBER } from "@/pages/financeiro/mock-data";
import { StatusBadge } from "@/pages/financeiro/components/StatusBadge";
import { RegistrarRecebimentoDialog } from "@/pages/financeiro/components/RegistrarRecebimentoDialog";

export default function AReceberPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState({ paciente: "", parcela: "", valor: "" });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-background px-9 py-4.5 shadow-[var(--shadow-topbar)]">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">
            Financeiro
          </p>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            A receber
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-9 py-7">
        <div className="grid grid-cols-3 gap-[14px]">
          <KpiCard
            icon={Hourglass}
            iconBg="bg-warning/10"
            iconColor="#b45309"
            label="Total pendente"
            value="R$ 2.500,00"
            sub="Todos os pacientes, todos os status em aberto"
          />
          <KpiCard
            icon={CalendarCheck}
            iconBg="bg-success/10"
            iconColor="#16a34a"
            label="Recebido hoje"
            value="R$ 800,00"
            sub="11/07/2026"
          />
          <KpiCard
            icon={DollarSign}
            iconBg="bg-primary/[0.12]"
            iconColor="var(--blue)"
            label="Recebido no mês"
            value="R$ 24.780,00"
            sub="Julho de 2026"
          />
        </div>

        <div className="mt-4">
          <Card>
            <div className="px-6 pt-5">
              <p className="mb-0.5 text-[15px] font-bold tracking-tight text-foreground">
                A receber
              </p>
              <p className="mb-4.5 text-[11.5px] text-muted-foreground">
                Parcelas geradas a partir de consultas concluídas
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-2.5 px-6 pb-4.5">
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10.5px] font-medium text-muted-foreground">Status</label>
                <select
                  className="h-8 appearance-none rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] bg-no-repeat px-[10px] text-[12px] text-foreground outline-none transition-[border-color,box-shadow,background] focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E\")", backgroundPosition: "right 10px center" }}
                >
                  <option>Todos</option>
                  <option>Pendente</option>
                  <option>A vencer</option>
                  <option>Atrasado</option>
                  <option>Pago</option>
                  <option>Cancelado</option>
                </select>
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10.5px] font-medium text-muted-foreground">Período</label>
                <select
                  className="h-8 appearance-none rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] bg-no-repeat px-[10px] text-[12px] text-foreground outline-none transition-[border-color,box-shadow,background] focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E\")", backgroundPosition: "right 10px center" }}
                >
                  <option>Este mês</option>
                  <option>Mês passado</option>
                  <option>Próximos 30 dias</option>
                  <option>Personalizado</option>
                </select>
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10.5px] font-medium text-muted-foreground">Paciente</label>
                <input
                  className="h-8 min-w-[170px] rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] px-[10px] text-[12px] text-foreground outline-none transition-[border-color,box-shadow,background] focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
                  placeholder="Buscar paciente..."
                />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10.5px] font-medium text-muted-foreground">Forma de pagamento</label>
                <select
                  className="h-8 appearance-none rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] bg-no-repeat px-[10px] text-[12px] text-foreground outline-none transition-[border-color,box-shadow,background] focus:border-primary focus:bg-background focus:shadow-[0_0_0_3px_rgba(79,126,247,0.13)]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E\")", backgroundPosition: "right 10px center" }}
                >
                  <option>Todas</option>
                  <option>Dinheiro</option>
                  <option>Cartão de Débito</option>
                  <option>Cartão de Crédito</option>
                  <option>Boleto</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto px-6 pb-5">
              <table className="w-full border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b-[1.5px] border-[var(--gray-100)]">
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Paciente</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Consulta vinculada</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Parcela</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Valor</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Vencimento</th>
                    <th className="px-2 pb-[10px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Status</th>
                    <th className="px-2 pb-[10px]" />
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RECEBER.map((item) => {
                    const isDisabled = item.status === "pago" || item.status === "cancelado";
                    return (
                      <tr key={item.id} className="border-b border-[var(--gray-100)] last:border-b-0">
                        <td className="px-2 py-3 align-middle font-semibold text-foreground">
                          {item.paciente}
                        </td>
                        <td className="px-2 py-3 align-middle text-muted-foreground">
                          {item.consulta}
                        </td>
                        <td className="px-2 py-3 align-middle text-foreground">
                          {item.parcela}
                        </td>
                        <td className="px-2 py-3 align-middle text-foreground">
                          {item.valor}
                        </td>
                        <td className="px-2 py-3 align-middle text-muted-foreground">
                          {item.vencimento}
                        </td>
                        <td className="px-2 py-3 align-middle">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-2 py-3 align-middle">
                          <button
                            className={`inline-flex h-[28px] cursor-pointer items-center gap-[7px] rounded-[10px] border-[1.5px] px-3 text-[11.5px] font-semibold transition-all ${
                              isDisabled
                                ? "cursor-default border-border bg-background text-muted-foreground/50 opacity-50"
                                : "border-primary bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(79,126,247,0.3)] hover:bg-[#3a6af3]"
                            }`}
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return;
                              setSelected({
                                paciente: item.paciente,
                                parcela: item.parcela,
                                valor: item.valor,
                              });
                              setDialogOpen(true);
                            }}
                          >
                            Registrar recebimento
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <RegistrarRecebimentoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paciente={selected.paciente}
        parcela={selected.parcela}
        valor={selected.valor}
      />
    </div>
  );
}
