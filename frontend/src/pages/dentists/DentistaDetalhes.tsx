import * as Tabs from "@radix-ui/react-tabs";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Dentist } from "@/types/dentist";
import { TabPlaceholder } from "@/pages/patients/tabs/TabPlaceholder";

import { DadosCadastraisTab } from "./tabs/DadosCadastraisTab";
import { EspecialidadesTab } from "./tabs/EspecialidadesTab";
import { HorariosTab } from "./tabs/HorariosTab";

const TABS = [
  { id: "dados-cadastrais", label: "Dados Cadastrais" },
  { id: "especialidades", label: "Especialidades" },
  { id: "horarios", label: "Horários" },
  { id: "agendamentos", label: "Agendamentos" },
  { id: "financeiro", label: "Financeiro" },
] as const;

const MOCK_DENTIST: Dentist = {
  id: 1,
  userId: 1,
  fullName: "Dr. Marcos Silva",
  cpf: "012.345.678-90",
  rg: "12.345.678-9",
  cnpj: null,
  croNumber: "45.231",
  croState: "SP",
  phone: "(11) 99876-5432",
  email: "marcos@clinica.com",
  birthDate: "1982-03-15",
  appointmentPrice: 250.0,
  commissionPercent: 20.0,
  personType: "natural_person",
  active: true,
  specialtyIds: [1, 2, 3],
  createdAt: "2025-01-15T08:00:00Z",
  access: {
    username: "marcos.silva",
    email: "marcos.silva@clinica.com",
  },
};

export default function DentistaDetalhesPage() {
  const dentist = MOCK_DENTIST;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Tabs.Root
        defaultValue="dados-cadastrais"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="border-b border-border bg-background px-9 py-5 shadow-[var(--shadow-topbar)]">
          <div className="mb-4 flex items-center gap-4">
            <Avatar
              name={dentist.fullName}
              className="h-[46px] w-[46px] text-[15px]"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[18px] font-bold tracking-tight text-foreground">
                  {dentist.fullName}
                </h1>
                <Badge variant={dentist.active ? "success" : "neutral"}>
                  {dentist.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <span>CRO-{dentist.croState} {dentist.croNumber}</span>
                <span>·</span>
                {dentist.cpf && <span>CPF: {dentist.cpf}</span>}
                <span>·</span>
                <span>Telefone: {dentist.phone}</span>
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
            <DadosCadastraisTab dentist={dentist} />
          </Tabs.Content>
          <Tabs.Content value="especialidades">
            <EspecialidadesTab dentistId={dentist.id} />
          </Tabs.Content>
          <Tabs.Content value="horarios">
            <HorariosTab dentistId={dentist.id} />
          </Tabs.Content>
          <Tabs.Content value="agendamentos">
            <TabPlaceholder title="Agendamentos" />
          </Tabs.Content>
          <Tabs.Content value="financeiro">
            <TabPlaceholder title="Financeiro" />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
