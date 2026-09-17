import { useState } from "react";
import { NavLink } from "react-router";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    type LucideIcon, Stethoscope, User, SlidersVertical, CircleDollarSign, TrendingUp,
    TrendingDown,
    ChevronRight, Receipt, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/lib/utils.ts";

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

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "flex flex-shrink-0 flex-col overflow-hidden bg-[linear-gradient(180deg,var(--blue-dark)_0%,var(--blue-mid)_100%)] transition-[width] duration-200 ease-in-out",
                collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W,
                collapsed ? "items-center px-2 py-6.5" : "px-4 py-6.5",
            )}
        >
            {/* Cabeçalho: logo + toggle de recolhimento */}
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
                <button
                    type="button"
                    onClick={() => setCollapsed((prev) => !prev)}
                    aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
                    title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
                    className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/85",
                        collapsed && "order-first",
                    )}
                >
                    {collapsed ? (
                        <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                        <PanelLeftClose className="h-4 w-4" />
                    )}
                </button>
            </div>

            <nav className={cn("flex flex-col gap-0.5", collapsed && "w-full items-center")}>
                {TOP_NAV_ITEMS.map((item) => (
                    <NavItemLink key={item.to} {...item} collapsed={collapsed} />
                ))}

                {collapsed ? (
                    /* Recolhido: o grupo Financeiro vira um único ícone ($).
                       Clicar expande a sidebar com o grupo aberto. */
                    <button
                        type="button"
                        onClick={() => setCollapsed(false)}
                        title="Financeiro"
                        className="flex items-center justify-center rounded-sm p-2 text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/85"
                    >
                        <CircleDollarSign className="h-4 w-4 flex-shrink-0" />
                    </button>
                ) : (
                    NAV_GROUPS.map((group) => (
                        <CollapsibleNavGroup key={group.label} {...group} />
                    ))
                )}

                {BOTTOM_NAV_ITEMS.map((item) => (
                    <NavItemLink key={item.to} {...item} collapsed={collapsed} />
                ))}
            </nav>

            <div className="flex-1" />

            <NavLink
                to="configuracoes"
                title={collapsed ? "Configurações" : undefined}
                className={collapsed ? navLinkCollapsedClass : navLinkClass}
            >
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!collapsed && "Configurações"}
            </NavLink>

            {!collapsed && (
                <div className="px-1.5 pt-2.5 text-[10.5px] text-white/25">
                    © {new Date().getFullYear()} Odontrix
                </div>
            )}
        </aside>
    );
}