/**
 * API client do Odontrix.
 *
 * - Envelope padronizado `{ data, meta }` (api/common.yaml)
 * - Erros RFC 7807 (problem+json) → ApiError { status, title, fields }
 * - Bearer JWT injetado automaticamente (token fornecido pelo AuthContext
 *   via bindApiAuth, evitando dependência circular auth → api)
 */

import type { LoginResult, User } from "@/types/auth";

const API_BASE_URL: string =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    "http://localhost:8080/api";

export interface PaginationMeta {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

export interface Envelope<T> {
    data: T;
    meta: PaginationMeta | null;
}

/** Erro devolvido pela API — corpo problem+json (RFC 7807). */
export class ApiError extends Error {
    readonly status: number;
    /** campo → mensagem (presente em 422 de validação). */
    readonly fields: Record<string, string>;

    constructor(status: number, title: string, fields: Record<string, string> = {}) {
        super(title);
        this.name = "ApiError";
        this.status = status;
        this.fields = fields;
    }
}

// ---------------------------------------------------------------------------
// Integração com o AuthContext (donos do token e do fim de sessão)
// ---------------------------------------------------------------------------

let tokenAccessor: () => string | null = () => null;
let unauthorizedHandler: () => void = () => {};

/** Registrado pelo AuthProvider no boot da aplicação. */
export function bindApiAuth(params: {
    getToken: () => string | null;
    onUnauthorized: () => void;
}): void {
    tokenAccessor = params.getToken;
    unauthorizedHandler = params.onUnauthorized;
}

// ---------------------------------------------------------------------------
// Núcleo de requisição
// ---------------------------------------------------------------------------

interface RequestOptions {
    method?: string;
    body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
    const token = tokenAccessor();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    // 204 No Content (logout, change-password)
    if (response.status === 204) {
        return { data: undefined as T, meta: null };
    }

    if (!response.ok) {
        // Sessão inválida/expirada — delega ao AuthContext (limpa sessão;
        // RequireAuth redireciona ao login e o banner de expiração aparece).
        if (response.status === 401) {
            unauthorizedHandler();
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("json")) {
            const problem = (await response.json().catch(() => null)) as {
                status?: number;
                title?: string;
                fields?: Record<string, string>;
            } | null;
            if (problem) {
                throw new ApiError(
                    problem.status ?? response.status,
                    problem.title ?? "Erro na requisição",
                    problem.fields ?? {},
                );
            }
        }
        throw new ApiError(response.status, `Erro HTTP ${response.status}`);
    }

    return (await response.json()) as Envelope<T>;
}

// ---------------------------------------------------------------------------
// Domínio: /auth — única área com backend real no momento
// ---------------------------------------------------------------------------

export const api = {
    auth: {
        login(input: { login: string; password: string }): Promise<LoginResult> {
            return request<LoginResult>("/auth/login", { method: "POST", body: input })
                .then((envelope) => envelope.data);
        },

        me(): Promise<User> {
            return request<User>("/auth/me").then((envelope) => envelope.data);
        },

        /** Sessão stateless: o servidor só registra; o cliente descarta o token. */
        logout(): Promise<void> {
            return request<void>("/auth/logout", { method: "POST" }).then(() => undefined);
        },

        changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
            return request<void>("/auth/change-password", { method: "POST", body: input })
                .then(() => undefined);
        },
    },
};
