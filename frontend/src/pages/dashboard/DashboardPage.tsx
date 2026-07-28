import { useState } from "react";
import { UserCog, Stethoscope, UserCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { ManagerDashboard } from "@/pages/dashboard/ManagerDashboard";
import { DentistDashboard } from "@/pages/dashboard/DentistDashboard";
import { ReceptionistDashboard } from "@/pages/dashboard/ReceptionistDashboard";

type Role = "manager" | "dentist" | "receptionist";

const ROLES: { id: Role; label: string; icon: typeof UserCog }[] = [
  { id: "manager", label: "Gerente", icon: UserCog },
  { id: "dentist", label: "Dentista", icon: Stethoscope },
  { id: "receptionist", label: "Recepcionista", icon: UserCheck },
];

export default function DashboardPage() {
  const [role, setRole] = useState<Role>("manager");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topbar com seletor de perfil */}
      <div className="flex items-center justify-between border-b border-border bg-background px-9 py-5 shadow-[var(--shadow-topbar)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">
            Visão geral
          </p>
          <p className="mt-1 text-[22px] font-bold tracking-tight text-foreground">
            Dashboard
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 p-1">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(79,126,247,0.3)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {r.label}
              </button>
            );
          })}
        </div>
        {/* Period selector - only shown for manager */}
        {role === "manager" && (
          <select
            className="h-8 rounded-[10px] border border-border bg-muted/40 px-3 text-[12px] text-foreground outline-none focus:border-primary"
            defaultValue="month"
          >
            <option value="today">Hoje</option>
            <option value="month" selected>
              Este mês
            </option>
            <option value="30days">Últimos 30 dias</option>
            <option value="year">Este ano</option>
          </select>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {role === "manager" && <ManagerDashboard />}
        {role === "dentist" && <DentistDashboard />}
        {role === "receptionist" && <ReceptionistDashboard />}
      </div>
    </div>
  );
}
