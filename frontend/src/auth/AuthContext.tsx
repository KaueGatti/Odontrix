import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { api, bindApiAuth } from "@/lib/api";
import type { LoginResult, User } from "@/types/auth";

/** Chave do localStorage com o JWT da sessão atual. */
const TOKEN_STORAGE_KEY = "odontrix.token";

/** Flag curta (sessionStorage) para o LoginPage avisar "sessão expirada". */
const SESSION_EXPIRED_KEY = "odontrix.session-expired";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
    status: AuthStatus;
    user: User | null;
    login: (credentials: { login: string; password: string }) => Promise<LoginResult>;
    logout: () => Promise<void>;
    changePassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Dono da sessão: guarda o JWT, expõe login/logout/troca de senha e reage
 * a 401s da API (o JWT vence conforme clinic_settings.session_timeout_minutes
 * — 15 min no seed).
 *
 * Vive FORA do RouterProvider de propósito: não usa hooks de navegação.
 * Quem redireciona é o RequireAuth, reagindo a mudanças de status.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<User | null>(null);

    const tokenRef = useRef<string | null>(null);
    const userRef = useRef<User | null>(null);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const clearSession = useCallback((options?: { expired?: boolean }) => {
        if (options?.expired && userRef.current) {
            // Só avisa quando HAVIA sessão carregada — o 401 do login em si
            // (credenciais erradas) não é "sessão expirada".
            try {
                sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
            } catch {
                /* storage indisponível — segue sem o aviso */
            }
        }
        tokenRef.current = null;
        try {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
            /* ignore */
        }
        setUser(null);
        setStatus("unauthenticated");
    }, []);

    // api.ts lê o token e avisa 401s por aqui (evita ciclo auth → api → auth)
    useEffect(() => {
        bindApiAuth({
            getToken: () => tokenRef.current,
            onUnauthorized: () => clearSession({ expired: true }),
        });
    }, [clearSession]);

    // Boot: restaura a sessão a partir do token salvo (GET /auth/me)
    useEffect(() => {
        let stored: string | null = null;
        try {
            stored = localStorage.getItem(TOKEN_STORAGE_KEY);
        } catch {
            /* ignore */
        }
        if (!stored) {
            setStatus("unauthenticated");
            return;
        }

        tokenRef.current = stored;
        api.auth
            .me()
            .then((me) => {
                setUser(me);
                setStatus("authenticated");
            })
            .catch(() => {
                // token morto/inválido — o handler de 401 já limpou; garante estado final
                clearSession();
            });
    }, [clearSession]);

    const login = useCallback(async (credentials: { login: string; password: string }) => {
        const result = await api.auth.login(credentials);
        tokenRef.current = result.token;
        try {
            localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
        } catch {
            /* ignore */
        }
        setUser(result.user);
        setStatus("authenticated");
        return result;
    }, []);

    const logout = useCallback(async () => {
        // Sessão stateless: encerrar = descartar o token; o POST é
        // fire-and-forget por compatibilidade com o contrato da spec.
        api.auth.logout().catch(() => undefined);
        clearSession();
    }, [clearSession]);

    const refreshUser = useCallback(async () => {
        const me = await api.auth.me();
        setUser(me);
    }, []);

    const changePassword = useCallback(
        async (input: { currentPassword: string; newPassword: string }) => {
            await api.auth.changePassword(input);
            // baixa a flag forcePasswordChange do usuário
            await refreshUser();
        },
        [refreshUser],
    );

    const value = useMemo<AuthContextValue>(
        () => ({ status, user, login, logout, changePassword, refreshUser }),
        [status, user, login, logout, changePassword, refreshUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
    }
    return ctx;
}

/** Consome (uma vez) a flag "sessão expirada" — o LoginPage usa para avisar. */
export function consumeSessionExpired(): boolean {
    try {
        const flag = sessionStorage.getItem(SESSION_EXPIRED_KEY) === "1";
        sessionStorage.removeItem(SESSION_EXPIRED_KEY);
        return flag;
    } catch {
        return false;
    }
}
