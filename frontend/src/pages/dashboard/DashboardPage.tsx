import { UserCog, Stethoscope, UserCheck } from "lucide-react";

import { ManagerDashboard } from "@/pages/dashboard/ManagerDashboard";
import { DentistDashboard } from "@/pages/dashboard/DentistDashboard";
import { ReceptionistDashboard } from "@/pages/dashboard/ReceptionistDashboard";
import { useAuth } from "@/auth/AuthContext";
import { PROFILE_LABELS } from "@/types/auth";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.profile ?? "manager";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-9 py-5 shadow-[var(--shadow-topbar)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">
            Visão geral
          </p>
          <p className="mt-1 text-[22px] font-bold tracking-tight text-foreground">
            Dashboard
          </p>
        </div>
        {/* Perfil do usuário logado — dashboard fixo por perfil */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-[12px] font-medium text-foreground">
          {role === "manager" && <UserCog className="h-3.5 w-3.5 text-primary" />}
          {role === "dentist" && <Stethoscope className="h-3.5 w-3.5 text-primary" />}
          {role === "receptionist" && <UserCheck className="h-3.5 w-3.5 text-primary" />}
          {PROFILE_LABELS[role]}
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
