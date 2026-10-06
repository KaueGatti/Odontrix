import { useState } from "react";
import { NavLink } from "react-router";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    type LucideIcon, Stethoscope, User, SlidersVertical, CircleDollarSign, TrendingUp,
    TrendingDown,
    ChevronRight, Receipt, PanelLeftClose, PanelLeftOpen, LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils.ts";
import { useAuth } from "@/auth/AuthContext";
import { PROFILE_LABELS } from "@/types/auth";
import { hasRole, navItemRoles } from "@/lib/permissions";

interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
}

interface NavGroupConfig {
    label: string;
    items: NavItem[];
    defaultOpen?: boolean;
}

const TOP_NAV_ITEMS: NavItem[] = [
    { to: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "agenda", label: "Agenda", icon: Calendar },
    { to: "pacientes", label: "Pacientes", icon: Users },
    { to: "dentistas", label: "Dentistas", icon: Stethoscope },
    { to: "recepcionistas", label: "Recepcionistas", icon: User },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
    /* { to: "contratos", label: "Contratos", icon: FileText },
    { to: "planos", label: "Planos", icon: Star }, */
    { to: "auxiliares", label: "Auxiliares", icon: SlidersVertical },
    { to: "usuarios", label: "Usuários", icon: Users },
];

const NAV_GROUPS: NavGroupConfig[] = [
    {
        label: "Financeiro",
        defaultOpen: true,
        items: [
            { to: "contas", label: "Contas", icon: CircleDollarSign },
            { to: "a-receber", label: "A Receber", icon: TrendingUp },
            { to: "a-pagar", label: "A Pagar", icon: TrendingDown },
            { to: "boletos", label: "Boletos", icon: Receipt },
        ],
    },
];

/** Larguras da sidebar: expandida (−5% dos 194px anteriores) e recolhida. */
const SIDEBAR_EXPANDED_W = "w-[184px]";
const SIDEBAR_COLLAPSED_W = "w-16";

function navLinkClass({ isActive }: { isActive: boolean }) {
    return cn(
        "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[12.5px] font-medium text-white/55 transition-colors",
        "hover:bg-white/[0.06] hover:text-white/85",
        isActive &&
        "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:text-white",
    );
}

/** Classe para o modo recolhido: ícone centralizado, tooltip nativo. */
function navLinkCollapsedClass({ isActive }: { isActive: boolean }) {
    return cn(
        "flex items-center justify-center rounded-sm p-2 text-white/55 transition-colors",
        "hover:bg-white/[0.06] hover:text-white/85",
        isActive &&
        "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:text-white",
    );
}

interface NavItemLinkProps extends NavItem {
    collapsed?: boolean;
}

function NavItemLink({ to, label, icon: Icon, collapsed = false }: NavItemLinkProps) {
    return (
        <NavLink
            to={to}
            title={collapsed ? label : undefined}
            className={collapsed ? navLinkCollapsedClass : navLinkClass}
        >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && label}
        </NavLink>
    );
}

/**
 * Grupo colapsável reutilizável de itens de navegação (ex: "Financeiro").
 * Qualquer nova seção futura (Estoque, Relatórios, etc.) pode reaproveitar
 * este componente adicionando uma entrada em NAV_GROUPS acima — sem
 * precisar escrever markup novo.
 */
function CollapsibleNavGroup({ label, items, defaultOpen = false }: NavGroupConfig) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="flex flex-col">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className="flex items-center gap-1.5 px-2.5 pt-3 pb-1 text-[10.5px] font-semibold tracking-wide text-white/35 uppercase transition-colors hover:text-white/60"
            >
                <CircleDollarSign className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                <ChevronRight
                    className={cn(
                        "h-3 w-3 flex-shrink-0 transition-transform duration-200",
                        isOpen && "rotate-90",
                    )}
                />
            </button>

            <div
                className={cn(
                    "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
            >
                <div className="flex min-h-0 flex-col gap-0.5 pl-2">
                    {items.map((item) => (
                        <NavItemLink key={item.to} {...item} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Iniciais do avatar: primeiras letras do username ("gerente.ana" → "GA"). */
function iniciais(username: string): string {
    const parts = username.split(/[._\s-]/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
}

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();

    // Itens visíveis para o perfil logado (fonte: lib/permissions.ts)
    const visibleTopItems = TOP_NAV_ITEMS.filter((item) =>
        hasRole(user, navItemRoles(item.to)),
    );
    const visibleGroups = NAV_GROUPS
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => hasRole(user, navItemRoles(item.to))),
        }))
        .filter((group) => group.items.length > 0);
    const visibleBottomItems = BOTTOM_NAV_ITEMS.filter((item) =>
        hasRole(user, navItemRoles(item.to)),
    );
    const canSeeConfiguracoes = hasRole(user, navItemRoles("configuracoes"));

    return (
        <div className="relative flex-shrink-0">
        <aside
            className={cn(
                "flex h-full flex-col overflow-hidden bg-[linear-gradient(180deg,var(--blue-dark)_0%,var(--blue-mid)_100%)] transition-[width] duration-200 ease-in-out",
                collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W,
                collapsed ? "items-center px-2 py-6.5" : "px-4 py-6.5",
            )}
        >
            {/* Cabeçalho: logo (o toggle é o botão flutuante na borda direita) */}
            <div
                className={cn(
                    "mb-10 flex w-full items-center",
                    collapsed ? "flex-col gap-2.5" : "gap-2.5 px-1.5",
                )}
            >
                <img src="../../../public/logo.png" alt="logo" className="w-8 flex-shrink-0" />
                {!collapsed && (
                    <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-white">
                            Odontrix
                        </div>
                        <div className="text-[10px] font-normal text-white/40">
                            Gestão de Clínicas
                        </div>
                    </div>
                )}
            </div>

            <nav className={cn("flex flex-col gap-0.5", collapsed && "w-full items-center")}>
                {visibleTopItems.map((item) => (
                    <NavItemLink key={item.to} {...item} collapsed={collapsed} />
                ))}

                {collapsed ? (
                    /* Recolhido: o grupo Financeiro vira um único ícone ($).
                       Clicar expande a sidebar com o grupo aberto. */
                    visibleGroups.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setCollapsed(false)}
                            title="Financeiro"
                            className="flex items-center justify-center rounded-sm p-2 text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/85"
                        >
                            <CircleDollarSign className="h-4 w-4 flex-shrink-0" />
                        </button>
                    )
                ) : (
                    visibleGroups.map((group) => (
                        <CollapsibleNavGroup key={group.label} {...group} />
                    ))
                )}

                {visibleBottomItems.map((item) => (
                    <NavItemLink key={item.to} {...item} collapsed={collapsed} />
                ))}
            </nav>

            <div className="flex-1" />

            {canSeeConfiguracoes && (
                <NavLink
                    to="configuracoes"
                    title={collapsed ? "Configurações" : undefined}
                    className={collapsed ? navLinkCollapsedClass : navLinkClass}
                >
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && "Configurações"}
                </NavLink>
            )}

            {/* Usuário logado + sair */}
            <div
                className={cn(
                    "mt-2.5 flex items-center gap-2.5 rounded-sm px-1.5 py-2",
                    collapsed && "flex-col gap-2 px-0",
                )}
            >
                <div
                    title={user?.username}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/90 text-[10.5px] font-bold uppercase text-white"
                >
                    {iniciais(user?.username ?? "")}
                </div>
                {!collapsed && (
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-medium text-white/85">
                            {user?.username}
                        </div>
                        <div className="text-[10px] text-white/40">
                            {user ? PROFILE_LABELS[user.profile] : ""}
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => void logout()}
                    title="Sair"
                    aria-label="Sair"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/85"
                >
                    <LogOut className="h-4 w-4"/>
                </button>
            </div>

            {!collapsed && (
                <div className="px-1.5 pt-2.5 text-[10.5px] text-white/25">
                    © {new Date().getFullYear()} Odontrix
                </div>
            )}
        </aside>

        {/* Botão flutuante na borda direita da sidebar — colapsar/expandir.
            Metade sobre o gradiente, metade sobre o conteúdo da página;
            z-10 mantém acima do main. Fora do aside para não ser cortado
            pelo overflow-hidden; o wrapper relative acompanha a borda
            durante a transição de largura. */}
        <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            className="absolute -right-3.5 top-[28px] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-[0_2px_8px_rgba(15,32,80,0.16)] transition-colors hover:text-foreground"
        >
            {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
            ) : (
                <PanelLeftClose className="h-4 w-4" />
            )}
        </button>
        </div>
    );
}