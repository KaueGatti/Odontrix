import { ArrowDownLeft, ArrowUpRight, ClipboardCheck, UserPlus, CalendarX, AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import { StatRow } from "@/pages/dashboard/components/StatRow";
import { MiniListRow } from "@/pages/dashboard/components/MiniListRow";
import { RankRow } from "@/pages/dashboard/components/RankRow";
import {
  MOCK_MANAGER_KPIS,
  MOCK_MANAGER_DENTIST_RANK,
  MOCK_MANAGER_RECEPTIONIST_RANK,
  MOCK_MANAGER_COST_CENTERS,
  MOCK_MANAGER_STATUS,
  MOCK_MANAGER_APPT_TYPES,
  MOCK_MANAGER_PROCEDURES,
} from "@/pages/dashboard/mock-data";

export function ManagerDashboard() {
  const kpiIcons = [ArrowDownLeft, ArrowUpRight, ClipboardCheck, UserPlus, CalendarX, AlertTriangle];
  const kpiColors = [
    { bg: "bg-success/10", icon: "#16a34a" },
    { bg: "bg-red-400/10", icon: "#dc2626" },
    { bg: "bg-primary/[0.12]", icon: "var(--blue)" },
    { bg: "bg-primary/[0.12]", icon: "var(--blue)" },
    { bg: "bg-warning/10", icon: "#b45309" },
    { bg: "bg-red-400/10", icon: "#dc2626" },
  ];

  return (
    <div className="flex flex-col gap-4 px-9 py-7">
      {/* 6 KPIs */}
      <div className="grid grid-cols-6 gap-3">
        {MOCK_MANAGER_KPIS.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            icon={kpiIcons[i]}
            iconBg={kpiColors[i].bg}
            iconColor={kpiColors[i].icon}
            label={kpi.label}
            value={kpi.value}
            size="sm"
          />
        ))}
      </div>

      {/* Row 1: Rankings */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="px-[22px] pt-5">
            <p className="mb-0.5 text-[13.5px] font-bold tracking-tight text-foreground">
              Ranking de dentistas
            </p>
            <p className="mb-4 text-[11px] text-muted-foreground">
              Por valor total das consultas realizadas
            </p>
          </div>
          <div className="px-[22px] pb-5">
            {MOCK_MANAGER_DENTIST_RANK.map((item) => (
              <RankRow key={item.name} {...item} />
            ))}
          </div>
        </Card>

        <Card>
          <div className="px-[22px] pt-5">
            <p className="mb-0.5 text-[13.5px] font-bold tracking-tight text-foreground">
              Ranking de recepcionistas
            </p>
            <p className="mb-4 text-[11px] text-muted-foreground">
              Por quantidade de consultas agendadas
            </p>
          </div>
          <div className="px-[22px] pb-5">
            {MOCK_MANAGER_RECEPTIONIST_RANK.map((item) => (
              <RankRow key={item.name} {...item} />
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Cost centers + Status */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="px-[22px] pt-5">
            <p className="mb-0.5 text-[13.5px] font-bold tracking-tight text-foreground">
              Centro de custos
            </p>
            <p className="mb-4 text-[11px] text-muted-foreground">
              Gastos do período por categoria
            </p>
          </div>
          <div className="px-[22px] pb-5">
            {MOCK_MANAGER_COST_CENTERS.map((item) => (
              <StatRow key={item.label} {...item} />
            ))}
          </div>
        </Card>

        <Card>
          <div className="px-[22px] pt-5">
            <p className="mb-0.5 text-[13.5px] font-bold tracking-tight text-foreground">
              Consultas por status
            </p>
            <p className="mb-4 text-[11px] text-muted-foreground">
              Período selecionado
            </p>
          </div>
          <div className="px-[22px] pb-5">
            {MOCK_MANAGER_STATUS.map((item) => (
              <StatRow key={item.label} {...item} />
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Types + Procedures */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="px-[22px] pt-5">
            <p className="mb-0.5 text-[13.5px] font-bold tracking-tight text-foreground">
              Tipos de consulta mais realizados
            </p>
          </div>
          <div className="px-[22px] pb-5">
            {MOCK_MANAGER_APPT_TYPES.map((item) => (
              <MiniListRow key={item.name} {...item} />
            ))}
          </div>
        </Card>

        <Card>
          <div className="px-[22px] pt-5">
            <p className="mb-0.5 text-[13.5px] font-bold tracking-tight text-foreground">
              Procedimentos mais realizados
            </p>
          </div>
          <div className="px-[22px] pb-5">
            {MOCK_MANAGER_PROCEDURES.map((item) => (
              <MiniListRow key={item.name} {...item} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
