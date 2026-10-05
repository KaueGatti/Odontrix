import {Link} from "react-router";
import {ShieldAlert} from "lucide-react";

import {Button} from "@/components/ui/button";

/** 403 — perfil sem permissão para a rota acessada diretamente por URL. */
export function ForbiddenPage() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-7 w-7 text-destructive"/>
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    Acesso não autorizado
                </h1>
                <p className="mt-1.5 max-w-[380px] text-sm leading-relaxed text-muted-foreground">
                    Você não tem permissão para acessar esta área com o seu
                    perfil de usuário.
                </p>
            </div>
            <Button asChild>
                <Link to="/dashboard">Voltar ao dashboard</Link>
            </Button>
        </div>
    );
}
