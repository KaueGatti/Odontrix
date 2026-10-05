import {Navigate, useLocation} from "react-router";
import {Loader2} from "lucide-react";
import type {ReactNode} from "react";

import {useAuth} from "@/auth/AuthContext";

/**
 * Guarda do layout autenticado (rota "/"): sem sessão → volta ao login
 * lembrando o destino (state.from) para redirecionar de volta após entrar.
 */
export function RequireAuth({children}: { children: ReactNode }) {
    const {status} = useAuth();
    const location = useLocation();

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-muted">
                <Loader2 className="h-6 w-6 animate-spin text-primary"/>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <Navigate
                to="/login"
                replace
                state={{from: location.pathname + location.search}}
            />
        );
    }

    return <>{children}</>;
}
