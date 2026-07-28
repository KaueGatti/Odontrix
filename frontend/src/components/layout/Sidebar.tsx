import { useState } from "react";
import { NavLink } from "react-router";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    type LucideIcon, Stethoscope, User, SlidersVertical, Star, FileText, CircleDollarSign, TrendingUp,
    TrendingDown,
    ChevronRight,
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
];

const NAV_GROUPS: NavGroupConfig[] = [
    {
        label: "Financeiro",
        defaultOpen: true,
        items: [
            { to: "contas", label: "Contas", icon: CircleDollarSign },
            { to: "a-receber", label: "A Receber", icon: TrendingUp },
            { to: "a-pagar", label: "A Pagar", icon: TrendingDown },
        ],
    },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
    return cn(
        "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[12.5px] font-medium text-white/55 transition-colors",
        "hover:bg-white/[0.06] hover:text-white/85",
        isActive &&
        "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:text-white",
    );
}

function NavItemLink({ to, label, icon: Icon }: NavItem) {
    return (
        <NavLink to={to} className={navLinkClass}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
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
                className="flex items-center justify-between px-2.5 pt-3 pb-1 text-[10.5px] font-semibold tracking-wide text-white/35 uppercase transition-colors hover:text-white/60"
            >
                <span>{label}</span>
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
    return (
        <aside className="flex w-[216px] flex-shrink-0 flex-col bg-[linear-gradient(180deg,var(--blue-dark)_0%,var(--blue-mid)_100%)] px-4 py-6.5">
            <div className="mb-10 flex items-center gap-2.5 px-1.5">
                <img src="../../../public/logo.png" alt="logo" className="w-8" />
                <div>
                    <div className="text-[13px] font-semibold text-white">
                        Odontrix
                    </div>
                    <div className="text-[10px] font-normal text-white/40">
                        Gestão de Clínicas
                    </div>
                </div>
            </div>

            <nav className="flex flex-col gap-0.5">
                {TOP_NAV_ITEMS.map((item) => (
                    <NavItemLink key={item.to} {...item} />
                ))}

                {NAV_GROUPS.map((group) => (
                    <CollapsibleNavGroup key={group.label} {...group} />
                ))}

                {BOTTOM_NAV_ITEMS.map((item) => (
                    <NavItemLink key={item.to} {...item} />
                ))}
            </nav>

            <div className="flex-1" />

            <NavLink to="configuracoes" className={navLinkClass}>
                <Settings className="h-4 w-4 flex-shrink-0" />
                Configurações
            </NavLink>

            <div className="px-1.5 pt-2.5 text-[10.5px] text-white/25">
                © {new Date().getFullYear()} Odontrix
            </div>
        </aside>
    );
}