import { CalendarClock, CalendarDays, ClipboardList } from "lucide-react";

import { Card } from "@/components/ui/card";
import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import { BadgeStatus } from "@/pages/dashboard/components/BadgeStatus";
import {
  MOCK_DENTIST_KPIS,
  MOCK_DENTIST_TODAY,
  MOCK_DENTIST_TREATMENTS,
} from "@/pages/dashboard/mock-data";

export function DentistDashboard() {
  const kpiIcons = [CalendarClock, CalendarDays, ClipboardList];
  const kpiColors = [
    { bg: "bg-primary/[0.12]", icon: "var(--blue)" },
    { bg: "bg-success/10", icon: "#16a34a" },
    { bg: "bg-warning/10", icon: "#b45309" },
  ];

  return (
    <div className="flex flex-col gap-4 px-9 py-7">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-[14px]">
        {MOCK_DENTIST_KPIS.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            icon={kpiIcons[i]}
            iconBg={kpiColors[i].bg}
            iconColor={kpiColors[i].icon}
            label={kpi.label}
            value={kpi.value}
            sub={kpi.sub}
          />
        ))}
      </div>

      {/* Próximo paciente */}
      <div className="rounded-[14px] border-[1.5px] border-primary/20 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] p-5 shadow-[0_4px_24px_rgba(15,32,80,0.05)]">
        <div className="mb-4 flex items-center gap-[14px]">
          <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground">
            KG
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-foreground">
              Kauê V. Gatti
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Próxima consulta · 10:15 · Consulta de rotina · 50 min
            </p>
          </div>
          <span className="ml-auto rounded-full bg-primary px-3 py-[5px] text-[11px] font-semibold text-primary-foreground">
            Em 25 min
          </span>
        </div>
        <div className="grid grid-cols-2 gap-[14px]">
          <div className="rounded-[10px] border border-border bg-background p-[14px]">
            <p className="mb-[6px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground/70">
              Anamnese
            </p>
            <p className="text-[12px] leading-[1.55] text-[var(--gray-700)]">
              <b>Alergias:</b> Penicilina<br />
              <b>Doenças preexistentes:</b> Hipertensão controlada
            </p>
          </div>
          <div className="rounded-[10px] border border-border bg-background p-[14px]">
            <p className="mb-[6px] text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground/70">
              Última consulta — 21/04/2025
            </p>
            <p className="text-[12px] leading-[1.55] text-[var(--gray-700)]">
              Restauração em resina no dente 36. Plano: acompanhar em 30
              dias, avaliar dente 37.
            </p>
          </div>
        </div>
      </div>

      {/* Consultas a realizar hoje */}
      <Card>
        <div className="px-[22px] pt-5">
          <p className="mb-0.5 text-[14px] font-bold tracking-tight text-foreground">
            Consultas a realizar hoje
          </p>
          <p className="mb-4 text-[11px] text-muted-foreground">
            Ordenadas por horário
          </p>
        </div>
        <div className="overflow-x-auto px-[22px] pb-5">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b-[1.5px] border-[var(--gray-100)]">
                <th className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Horário
                </th>
                <th className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Paciente
                </th>
                <th className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Tipo
                </th>
                <th className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DENTIST_TODAY.map((row) => {
                const statusLabel: Record<string, string> = {
                  realizada: "Realizada",
                  confirmado: "Confirmado",
                  agendado: "Agendado",
                  a_confirmar: "A confirmar",
                };
                return (
                  <tr
                    key={row.time + row.patient}
                    className="border-b border-[var(--gray-100)] last:border-b-0"
                  >
                    <td
                      className={`px-2 py-[9px] align-middle ${
                        row.isCurrent
                          ? "font-semibold text-foreground"
                          : row.status === "realizada"
                            ? "text-muted-foreground/60"
                            : "text-muted-foreground"
                      }`}
                    >
                      {row.time}
                    </td>
                    <td
                      className={`px-2 py-[9px] align-middle ${
                        row.isCurrent
                          ? "font-semibold text-foreground"
                          : row.status === "realizada"
                            ? "text-muted-foreground/60"
                            : "text-foreground"
                      }`}
                    >
                      {row.patient}
                    </td>
                    <td className="px-2 py-[9px] align-middle text-foreground">
                      {row.type}
                    </td>
                    <td className="px-2 py-[9px] align-middle">
                      <BadgeStatus
                        status={row.status}
                        label={statusLabel[row.status]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tratamentos em andamento */}
      <Card>
        <div className="px-[22px] pt-5">
          <p className="mb-0.5 text-[14px] font-bold tracking-tight text-foreground">
            Tratamentos em andamento
          </p>
          <p className="mb-4 text-[11px] text-muted-foreground">
            Planos de tratamento ainda incompletos
          </p>
        </div>
        <div className="px-[22px] pb-5">
          {MOCK_DENTIST_TREATMENTS.map((tx) => {
            const progress = Math.round(
              (tx.currentStep / tx.totalSteps) * 100,
            );
            return (
              <div
                key={tx.patientName}
                className="border-b border-[var(--gray-100)] py-2 last:border-b-0"
              >
                <div className="mb-[6px] flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-foreground">
                    {tx.patientName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {tx.currentStep} de {tx.totalSteps} etapas
                  </span>
                </div>
                <div className="mb-[5px] h-[6px] overflow-hidden rounded-[3px] bg-muted">
                  <div
                    className="h-full rounded-[3px] bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Próximo passo: {tx.nextStep} · recomendado para{" "}
                  {tx.recommendedDate}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
