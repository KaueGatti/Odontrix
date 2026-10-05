import type { User, UserProfile } from "@/types/auth";

export const ALL_ROLES: UserProfile[] = ["manager", "receptionist", "dentist"];

/**
 * Rota (caminho absoluto) → perfis autorizados.
 *
 * Fonte de verdade: `x-required-roles` da spec OpenAPI (api/entities/*.yaml)
 * + matriz-permissoes.md. Rotas NÃO mapeadas exigem apenas autenticação —
 * guards finos de ações vêm com a integração de cada módulo.
 */
export const ROUTE_ROLES: Record<string, UserProfile[]> = {
    "/dashboard": ALL_ROLES,
    "/agenda": ALL_ROLES,
    // ficha clínica: dentista preenche; os demais visualizam
    "/agenda/atendimento/:id": ALL_ROLES,
    // GET /patients = manager+receptionist (dentista vê fichas via agenda)
    "/pacientes": ["manager", "receptionist"],
    "/pacientes/register": ["manager", "receptionist"],
    "/pacientes/details": ["manager", "receptionist"],
    "/recepcionistas": ["manager", "receptionist"],
    "/recepcionistas/register": ["manager"],
    "/recepcionistas/details": ["manager", "receptionist"],
    "/dentistas": ["manager", "receptionist"],
    "/dentistas/register": ["manager", "receptionist"],
    "/dentistas/details": ["manager", "receptionist"],
    "/contas": ["manager", "receptionist"],
    "/a-receber": ["manager", "receptionist"],
    // pagamentos tipo "gasto" (expense) = apenas gerente (matriz)
    "/a-pagar": ["manager"],
    "/boletos": ["manager", "receptionist"],
    "/auxiliares": ["manager", "receptionist"],
    "/usuarios": ["manager"],
    "/configuracoes": ["manager"],
};

/** Perfis que podem VER um item da sidebar (to relativo, ex: "dashboard"). */
export function navItemRoles(to: string): UserProfile[] {
    return ROUTE_ROLES[`/${to}`] ?? ALL_ROLES;
}

export function hasRole(user: User | null, roles: UserProfile[]): boolean {
    return Boolean(user && roles.includes(user.profile));
}

/** Guarda por rota — usado pelo AppLayout. Normaliza ids numéricos. */
export function canAccess(user: User | null, path: string): boolean {
    if (!user) return false;
    const normalized = path.replace(/\/\d+(?=\/|$)/, "/:id");
    const roles = ROUTE_ROLES[normalized] ?? ROUTE_ROLES[path];
    if (!roles) return true;
    return roles.includes(user.profile);
}
