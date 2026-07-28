import { ArrowDownLeft, Receipt, CalendarClock, ClockAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import { BadgeStatus } from "@/pages/dashboard/components/BadgeStatus";
import {
  MOCK_RECEPTIONIST_KPIS,
  MOCK_RECEPTIONIST_TODAY,
  MOCK_RECEPTIONIST_WAITING,
  MOCK_RECEPTIONIST_FREE_SLOTS,
} from "@/pages/dashboard/mock-data";

export function ReceptionistDashboard() {
  const kpiIcons = [ArrowDownLeft, Receipt, CalendarClock, ClockAlert];
  const kpiColors = [
    { bg: "bg-success/10", icon: "#16a34a" },
    { bg: "bg-warning/10", icon: "#b45309" },
    { bg: "bg-primary/[0.12]", icon: "var(--blue)" },
    { bg: "bg-red-400/10", icon: "#dc2626" },
  ];

  return (
    <div className="flex flex-col gap-4 px-9 py-7">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-[14px]">
        {MOCK_RECEPTIONIST_KPIS.map((kpi, i) => (
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

      {/* Grid 2-col */}
      <div className="grid grid-cols-[1.3fr_1fr] gap-4">
        {/* Consultas de hoje */}
        <Card>
          <div className="px-[22px] pt-5">
            <p className="mb-0.5 text-[14px] font-bold tracking-tight text-foreground">
              Consultas de hoje
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
                    Dentista
                  </th>
                  <th className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECEPTIONIST_TODAY.map((row) => {
                  const statusLabel: Record<string, string> = {
                    confirmado: "Confirmado",
                    agendado: "Agendado",
                    a_confirmar: "A confirmar",
                    realizada: "Realizada",
                  };
                  return (
                    <tr
                      key={row.time + row.patient}
                      className="border-b border-[var(--gray-100)] last:border-b-0"
                    >
                      <td className="px-2 py-[9px] align-middle text-foreground">
                        {row.time}
                      </td>
                      <td className="px-2 py-[9px] align-middle text-foreground">
                        {row.patient}
                      </td>
                      <td className="px-2 py-[9px] align-middle text-muted-foreground">
                        {row.dentist}
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

        {/* Pacientes aguardando */}
        <Card>
          <div className="px-[22px] pt-5">
            <p className="mb-0.5 text-[14px] font-bold tracking-tight text-foreground">
              Pacientes aguardando
            </p>
            <p className="mb-4 text-[11px] text-muted-foreground">
              Na recepção agora
            </p>
          </div>
          <div className="px-[22px] pb-5">
            {MOCK_RECEPTIONIST_WAITING.map((w) => (
              <div
                key={w.name}
                className="flex items-center gap-[10px] border-b border-[var(--gray-100)] py-[7px] last:border-b-0"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/[0.14] text-[11px] font-bold text-primary">
                  {w.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground">
                    {w.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {w.appointment} · chegou às {w.arrivedAt}
                  </p>
                </div>
              </div>
            ))}
            {MOCK_RECEPTIONIST_WAITING.length === 0 && (
              <p className="py-4 text-center text-[12px] text-muted-foreground">
                Nenhum paciente aguardando no momento.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Próximo horário livre por dentista */}
      <Card>
        <div className="px-[22px] pt-5">
          <p className="mb-0.5 text-[14px] font-bold tracking-tight text-foreground">
            Próximo horário livre por dentista
          </p>
          <p className="mb-4 text-[11px] text-muted-foreground">
            Útil para encaixar um paciente sem consultar a agenda inteira
          </p>
        </div>
        <div className="px-[22px] pb-5">
          {MOCK_RECEPTIONIST_FREE_SLOTS.map((slot) => (
            <div
              key={slot.dentistName}
              className="flex items-center justify-between border-b border-[var(--gray-100)] py-[8px] text-[13px] last:border-b-0"
            >
              <span className="flex items-center gap-2 font-semibold text-foreground">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: slot.isAvailable ? "#16a34a" : "#f59e0b",
                  }}
                />
                {slot.dentistName}
              </span>
              <span className="font-bold text-primary">{slot.nextTime}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
