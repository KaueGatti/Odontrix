import { useState } from "react";
import { Link } from "react-router";
import { Search, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PacientesListPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-background px-9 py-4.5 shadow-[var(--shadow-topbar)]">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-primary">
            Cadastros
          </p>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            Pacientes
          </h1>
        </div>
        <Button asChild>
          <Link to="register">
            <UserPlus className="h-4 w-4" />
            Cadastrar Paciente
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-9 py-7">
        <div className="mb-5 max-w-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome do paciente..."
              className="pl-10"
            />
          </div>
        </div>

        {/* TODO: substituir pelo grid/tabela real de pacientes, alimentado pela API */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mb-1 text-sm font-semibold text-foreground">
            Nenhum paciente encontrado
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Cadastre o primeiro paciente da clínica clicando em &#34;Cadastrar
            Paciente&#34; acima.
          </p>
        </div>
      </div>
    </div>
  );
}
