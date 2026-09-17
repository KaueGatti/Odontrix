import * as Tabs from "@radix-ui/react-tabs";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/patient";

import { DadosCadastraisTab } from "./tabs/DadosCadastraisTab";
import { DocumentosTab } from "./tabs/DocumentosTab";
import { AgendamentosTab } from "./tabs/AgendamentosTab";
import { ConsultasProcedimentosTab } from "./tabs/ConsultasProcedimentosTab";
import { OrcamentosTab } from "./tabs/OrcamentosTab";
import { FinanceiroTab } from "./tabs/FinanceiroTab";

const TABS = [
  { id: "dados-cadastrais", label: "Dados Cadastrais" },
  { id: "documentos", label: "Documentos" },
  { id: "agendamentos", label: "Agendamentos" },
  { id: "consultas-procedimentos", label: "Consultas e Procedimentos" },
  { id: "orcamentos", label: "Orçamentos" },
  { id: "financeiro", label: "Financeiro" },
] as const;

// TODO: substituir pelo paciente vindo da API (useParams + fetch/query)
const MOCK_PATIENT: Patient = {
  id: 1,
  fullName: "Kauê Vinícius Gatti",
  cpf: "538.350.558-01",
  cellPhone: "(19) 99871-9313",
  landlinePhone: "(19) 3251-4470",
  emergencyPhone: "(19) 99900-1122",
  email: "kaue.gatti@email.com",
  birthDate: "2007-02-23",
  active: true,
  createdAt: "2026-04-25T00:00:00Z",
  referralSource: { id: 1, description: "Indicação de paciente" },
  referralType: { id: 1, description: "Paciente", requiresReferrer: true },
  referredByName: "Ana Costa",
  address: {
    cep: "13500-000",
    street: "Rua das Palmeiras",
    number: "482",
    complement: "Apto 12",
    neighborhood: "Centro",
    city: "Rio Claro",
    state: "SP",
    country: "Brasil",
  },
  responsible: {
    fullName: "Vinícius Gatti",
    cpf: "412.220.118-45",
  },
};

function formatDate(iso: string) {
  return new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function PacienteDetalhesPage() {
  const patient = MOCK_PATIENT;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Tabs.Root
        defaultValue="dados-cadastrais"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="border-b border-border bg-background px-9 py-5 shadow-[var(--shadow-topbar)]">
          <div className="mb-4 flex items-center gap-4">
            <Avatar
              name={patient.fullName}
              className="h-[46px] w-[46px] text-[15px]"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[18px] font-bold tracking-tight text-foreground">
                  {patient.fullName}
                </h1>
                <Badge variant={patient.active ? "success" : "neutral"}>
                  {patient.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                {patient.cpf && <span>CPF: {patient.cpf}</span>}
                <span>·</span>
                <span>Data de Nascimento: {formatDate(patient.birthDate)}</span>
                <span>·</span>
                <span>Celular: {patient.cellPhone}</span>
                {patient.referredByName && (
                  <>
                    <span>·</span>
                    <span>
                      Indicado por: {patient.referredByName}
                      {patient.referralType
                        ? ` (${patient.referralType.description})`
                        : ""}
                    </span>
                  </>
                )}
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
            <DadosCadastraisTab patient={patient} />
          </Tabs.Content>
          <Tabs.Content value="documentos" className="flex flex-1 flex-col overflow-hidden">
            <DocumentosTab />
          </Tabs.Content>
          <Tabs.Content value="agendamentos">
            <AgendamentosTab />
          </Tabs.Content>
          <Tabs.Content value="consultas-procedimentos">
            <ConsultasProcedimentosTab />
          </Tabs.Content>
          <Tabs.Content value="orcamentos">
            <OrcamentosTab />
          </Tabs.Content>
          <Tabs.Content value="financeiro">
            <FinanceiroTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
