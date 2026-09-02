import { useMemo, useState } from "react";
import { Lock, Mail, Power, Search, UserCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/pages/dashboard/components/KpiCard";
import { MOCK_USERS } from "./mock-data";
import type { SystemUser, UserStatus, UserConfirmMode } from "./types";
import { EditarEmailDialog } from "./components/EditarEmailDialog";
import { ConfirmarUsuarioDialog } from "./components/ConfirmarUsuarioDialog";
import { NovoUsuarioDialog } from "./components/NovoUsuarioDialog";
import type { NovoUsuarioPayload } from "./components/NovoUsuarioDialog";

const PROFILE_LABELS: Record<SystemUser["profile"], string> = {
  manager: "Gerente",
  dentist: "Dentista",
  receptionist: "Recepcionista",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export default function UsuariosPage() {
  const [busca, setBusca] = useState("");
  const [tab, setTab] = useState<"active" | "inactive">("active");

  const [novoOpen, setNovoOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<UserConfirmMode>("inativar");

  const usuarios = useMemo(() => {
    const filtered = MOCK_USERS.filter((u) => {
      const termo = busca.trim().toLowerCase();
      if (termo === "") return true;
      return u.name.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo);
    });
    return filtered.filter((u) => u.status === tab);
  }, [busca, tab]);

  const total = MOCK_USERS.length;
  const ativos = MOCK_USERS.filter((u) => u.status === "active").length;
  const inativos = MOCK_USERS.filter((u) => u.status === "inactive").length;
  const gerentes = MOCK_USERS.filter((u) => u.profile === "manager").length;
  const dentistas = MOCK_USERS.filter((u) => u.profile === "dentist").length;
  const recepcionistas = MOCK_USERS.filter((u) => u.profile === "receptionist").length;

  function abrirEmail(u: SystemUser) {
    setSelectedUser(u);
    setEmailOpen(true);
  }

  function abrirConfirm(u: SystemUser, mode: UserConfirmMode) {
    setSelectedUser(u);
    setConfirmMode(mode);
    setConfirmOpen(true);
  }

  function handleSaveEmail(novoEmail: string) {
    if (!selectedUser) return;
    const idx = MOCK_USERS.findIndex((u) => u.id === selectedUser.id);
    if (idx >= 0) MOCK_USERS[idx].email = novoEmail;
  }

  function handleConfirmStatus() {
    if (!selectedUser) return;
    const idx = MOCK_USERS.findIndex((u) => u.id === selectedUser.id);
    if (idx >= 0) {
      MOCK_USERS[idx].status = selectedUser.status === "active" ? "inactive" : "active";
    }
  }

  function handleNovo(payload: NovoUsuarioPayload) {
    const id = `u-${Math.random().toString(36).slice(2, 9)}`;
    const initials = payload.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    MOCK_USERS.unshift({
      id,
      name: payload.name,
      email: payload.email,
      initials,
      avatarColor: "bg-primary",
      profile: "manager",
      status: "active",
      createdAt: new Date().toLocaleDateString("pt-BR"),
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* PAGE_TOP */}
      <div className="flex items-center justify-between border-b border-border bg-background px-9 py-4.5 shadow-[var(--shadow-topbar)]">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">Gerenciamento</p>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Usuários</h1>
        </div>
        <Button type="button" onClick={() => setNovoOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Novo usuário
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-9 py-7">
        <div className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard icon={UserCheck} iconBg="bg-primary/[0.12]" iconColor="var(--blue)" label="Total" value={String(total)} size="sm" />
          <KpiCard icon={UserCheck} iconBg="bg-[rgba(34,197,94,0.14)]" iconColor="#22c55e" label="Ativos" value={String(ativos)} size="sm" />
          <KpiCard icon={Power} iconBg="bg-[rgba(148,153,158,0.14)]" iconColor="#6b7280" label="Inativos" value={String(inativos)} size="sm" />
          <KpiCard icon={UserCheck} iconBg="bg-primary/[0.12]" iconColor="var(--blue)" label="Gerentes" value={String(gerentes)} size="sm" />
          <KpiCard icon={UserCheck} iconBg="bg-[rgba(5,166,214,0.14)]" iconColor="#06b6d4" label="Dentistas" value={String(dentistas)} size="sm" />
          <KpiCard icon={UserCheck} iconBg="bg-primary/[0.12]" iconColor="var(--blue)" label="Recepcionistas" value={String(recepcionistas)} size="sm" />
        </div>

        <Card>
          <div className="px-6 pt-5">
            <p className="text-[15px] font-bold tracking-tight text-foreground">Acesso ao sistema</p>
            <p className="text-[11.5px] text-muted-foreground">
              Usuários que realizam login na plataforma. Dentistas e recepcionistas são gerenciados em seus respectivos cadastros.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2.5 px-6 pb-4.5">
            <div className="relative flex min-w-[360px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="h-8 rounded-[10px] border-[1.5px] border-border bg-[var(--gray-50)] pl-9 text-[12.5px] outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-1 rounded-full border border-border p-1 text-[11.5px] font-medium">
              <button
                type="button"
                onClick={() => setTab("active")}
                className={
                  tab === "active"
                    ? "rounded-full bg-primary px-3 py-1 text-white"
                    : "rounded-full px-3 py-1 text-muted-foreground hover:text-foreground"
                }
              >
                Ativos ({ativos})
              </button>
              <button
                type="button"
                onClick={() => setTab("inactive")}
                className={
                  tab === "inactive"
                    ? "rounded-full bg-primary px-3 py-1 text-white"
                    : "rounded-full px-3 py-1 text-muted-foreground hover:text-foreground"
                }
              >
                Inativos ({inativos})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto px-2 pb-2">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <th className="px-2 pb-[10px] text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Usuário</th>
                  <th className="px-2 pb-[10px] text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">E-mail</th>
                  <th className="px-2 pb-[10px] text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Perfil</th>
                  <th className="px-2 pb-[10px] text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Situação</th>
                  <th className="px-2 pb-[10px] text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Último login</th>
                  <th className="px-2 pb-[10px] text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Criado em</th>
                  <th className="px-2 pb-[10px] text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {/* PAGE_BODY */}
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[var(--gray-100)] last:border-b-0 transition-colors hover:bg-[var(--gray-50)]/50"
                  >
                    <td className="px-2 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white ${u.avatarColor}`}
                        >
                          {u.initials}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{u.name}</span>
                          {u.isSelf && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-[1px] text-[10px] font-semibold text-primary">
                              Você
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 align-middle text-muted-foreground">{u.email}</td>
                    <td className="px-2 py-3 align-middle text-foreground">{PROFILE_LABELS[u.profile]}</td>
                    <td className="px-2 py-3 align-middle">
                      <span
                        className={
                          u.status === "active"
                            ? "inline-flex items-center gap-1 rounded-full bg-[rgba(34,197,94,0.13)] px-2.5 py-[3px] text-[10.5px] font-semibold text-[#16a34a]"
                            : "inline-flex items-center gap-1 rounded-full bg-[rgba(148,153,158,0.13)] px-2.5 py-[3px] text-[10.5px] font-semibold text-[#6b7280]"
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-[#22c55e]" : "bg-[#9ca3af]"}`}
                        />
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    <td className="px-2 py-3 align-middle text-muted-foreground">{u.ultimoLogin ?? "—"}</td>
                    <td className="px-2 py-3 align-middle text-muted-foreground">{u.createdAt}</td>
                    <td className="px-2 py-3 align-middle">
                      <div className="flex justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => abrirEmail(u)}
                          title="Alterar e-mail"
                          className="inline-flex rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Alterar senha"
                          className="inline-flex rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                                                                        <button
                          type="button"
                          title={u.status === "active" ? "Inativar usuário" : "Reativar usuário"}
                          onClick={() => abrirConfirm(u, u.status === "active" ? "inativar" : "reativar")}
                          className="inline-flex rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {u.status === "active" ? (
                            <Power className="h-3.5 w-3.5 text-[#b45309]" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5 text-[#16a34a]" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-2 py-8 text-center text-[12px] italic text-muted-foreground">
                      Nenhum usuário corresponde aos filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
                </Card>
      </div>

      <NovoUsuarioDialog open={novoOpen} onOpenChange={setNovoOpen} onSave={handleNovo} />
      <EditarEmailDialog open={emailOpen} onOpenChange={setEmailOpen} user={selectedUser} onSave={handleSaveEmail} />
      <ConfirmarUsuarioDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        user={selectedUser}
        mode={confirmMode}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
}