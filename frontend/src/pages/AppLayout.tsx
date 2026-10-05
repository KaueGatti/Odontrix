import { Sidebar } from "@/components/layout/Sidebar";
import {Outlet, useLocation} from "react-router";

import {TrocarSenhaDialog} from "@/auth/TrocarSenhaDialog";
import {useAuth} from "@/auth/AuthContext";
import {canAccess} from "@/lib/permissions";
import {ForbiddenPage} from "@/pages/Forbidden";

export function AppLayout() {
  const {user} = useAuth();
  const location = useLocation();

  // Guarda de perfil por rota (fonte: lib/permissions + matriz-permissoes.md).
  // Sidebar e guard consomem o MESMO mapa — URL direta proibida → 403.
  if (!canAccess(user, location.pathname)) {
    return <ForbiddenPage/>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet/>
      </main>
      {user?.forcePasswordChange && <TrocarSenhaDialog/>}
    </div>
  );
}
