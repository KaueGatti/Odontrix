import * as Tabs from "@radix-ui/react-tabs";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Receptionist } from "@/types/receptionist";
import { TabPlaceholder } from "@/pages/patients/tabs/TabPlaceholder";

import { DadosCadastraisTab } from "./tabs/DadosCadastraisTab";

const TABS = [
  { id: "dados-cadastrais", label: "Dados Cadastrais" },
  /* { id: "agendamentos", label: "Agendamentos" }, */
] as const;

const MOCK_RECEPTIONIST: Receptionist = {
  id: 1,
  fullName: "Maria da Silva",
  cpf: "123.456.789-00",
  rg: "12.345.678-9",
  phone: "(19) 99999-8888",
  email: "maria.silva@email.com",
  birthDate: "1990-05-15",
  hireDate: "2026-01-10",
  active: true,
  createdAt: "2026-01-10T08:00:00Z",
  access: {
    username: "maria.silva",
    email: "maria.silva@clinica.com",
  },
};

function formatDate(iso: string) {
  return new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function RecepcionistaDetalhesPage() {
  const receptionist = MOCK_RECEPTIONIST;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Tabs.Root
        defaultValue="dados-cadastrais"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="border-b border-border bg-background px-9 py-5 shadow-[var(--shadow-topbar)]">
          <div className="mb-4 flex items-center gap-4">
            <Avatar
              name={receptionist.fullName}
              className="h-[46px] w-[46px] text-[15px]"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[18px] font-bold tracking-tight text-foreground">
                  {receptionist.fullName}
                </h1>
                <Badge variant={receptionist.active ? "success" : "neutral"}>
                  {receptionist.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                {receptionist.cpf && <span>CPF: {receptionist.cpf}</span>}
                <span>·</span>
                <span>Telefone: {receptionist.phone}</span>
                <span>·</span>
                <span>Admissão: {formatDate(receptionist.hireDate)}</span>
              </div>
            </div>
          </div>

          <Tabs.List className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "rounded-full border-[1.5px] border-border bg-background px-4 py-2 text-[12.5px] font-medium text-muted-foreground transition-all",
                  "hover:border-border/80 hover:text-foreground",
                  "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_6px_16px_rgba(79,126,247,0.32)]",
                )}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>

        <div className="flex flex-1 flex-col overflow-auto">
          <Tabs.Content value="dados-cadastrais">
            <DadosCadastraisTab receptionist={receptionist} />
          </Tabs.Content>
          <Tabs.Content value="agendamentos">
            <TabPlaceholder title="Agendamentos" />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
