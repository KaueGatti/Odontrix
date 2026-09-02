import { useState, useMemo } from "react";
import { Calendar, DollarSign, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/masks";

interface FinanceiroTabProps {
  dentistId: number;
}

type PeriodFilter = "hoje" | "semana" | "mes" | "personalizado";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "personalizado", label: "Personalizado" },
];

const MOCK_FINANCEIRO = {
  consultasRealizadas: 18,
  totalFaturado: 4500.0,
  comissaoPercentual: 20,
  mes: "maio 2025",
};

function getPeriodLabel(period: PeriodFilter): string {
  switch (period) {
    case "hoje":
      return "21 de maio";
    case "semana":
      return "semana de 19 a 25 de maio";
    case "mes":
      return "maio 2025";
    case "personalizado":
      return "Período personalizado";
  }
}

export function FinanceiroTab({ dentistId: _dentistId }: FinanceiroTabProps) {
  const [period, setPeriod] = useState<PeriodFilter>("mes");
  const financeiro = MOCK_FINANCEIRO;

  const valorComissao = useMemo(
    () => (financeiro.totalFaturado * financeiro.comissaoPercentual) / 100,
    [financeiro.totalFaturado, financeiro.comissaoPercentual]
  );

  return (
    <div className="flex flex-col gap-4 px-9 py-7">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-primary">
            Resumo financeiro — {getPeriodLabel(period)}
          </h3>
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  period === opt.value
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-6">
          <div className="rounded-[10px] bg-muted/50 p-4">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-[9px] bg-blue-500/10">
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mb-[3px] text-[11px] text-muted-foreground">Consultas realizadas</p>
            <p className="text-[22px] font-bold tracking-tight text-foreground">
              {financeiro.consultasRealizadas}
            </p>
          </div>

          <div className="rounded-[10px] bg-muted/50 p-4">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-[9px] bg-green-500/10">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <p className="mb-[3px] text-[11px] text-muted-foreground">Total faturado</p>
            <p className="text-[22px] font-bold tracking-tight text-foreground">
              {formatMoney(financeiro.totalFaturado)}
            </p>
          </div>

          <div className="rounded-[10px] bg-muted/50 p-4">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-[9px] bg-amber-500/10">
              <Percent className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mb-[3px] text-[11px] text-muted-foreground">
              Comissão ({financeiro.comissaoPercentual}%)
            </p>
            <p className="text-[22px] font-bold tracking-tight text-foreground">
              {formatMoney(valorComissao)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
