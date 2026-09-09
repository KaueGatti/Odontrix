# Odontrix

Sistema de gestão para clínicas odontológicas — pacientes, dentistas, agenda, planos, financeiro (boletos, pagamentos, inadimplência) e contratos digitais.

> 🚧 **Projeto em desenvolvimento.** Frontend com telas navegáveis e dados mockados; backend com schema de banco completo e scaffold inicial. Veja [Estado atual](#estado-atual) para detalhes.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · React Hook Form + Zod |
| Backend | Java 25 · Spring Boot 4 · Maven · Flyway · PostgreSQL 16 |
| Infra | Docker Compose (postgres + api + frontend) |

## Arquitetura

```
Frontend SPA (porta 5173)  →  API REST (porta 8080, /api)  →  PostgreSQL (porta 5432)
```

- **API REST** com envelope padronizado `{ data, meta }` e erros no formato RFC 7807
- **Arquitetura hexagonal (Port/Adapter)** para integrações externas (ex: gateway de boleto bancário), permitindo trocar implementações via `@Profile` do Spring sem alterar regras de negócio
- **Autenticação** via JWT, com controle de permissões por perfil de usuário

## Perfis de usuário

| Perfil | Acesso |
|---|---|
| **Gerente** | Acesso completo a todas as áreas do sistema |
| **Recepcionista** | Consultas, pagamentos, cadastro de pacientes/dentistas e cobranças |
| **Dentista** | Finalização e preenchimento de dados após a consulta |

## Principais funcionalidades

- **Pacientes**: cadastro completo, anamnese (histórico de saúde), anexos (radiografias/fotos), plano odontológico vinculado
- **Dentistas**: especialidades, horários de disponibilidade, comissão por consulta
- **Agenda**: agendamento sem conflitos de horário (validado a nível de banco via *exclusion constraints*), fluxo de status controlado (`Agendada → Confirmada → Realizada`, cancelamento a qualquer momento antes de concluída)
- **Financeiro**: pagamentos, parcelamento, boletos, controle de inadimplência
- **Contratos digitais**: templates versionados de forma imutável, geração de contrato com *snapshot* dos dados do paciente no momento da assinatura (garante rastreabilidade jurídica mesmo se os dados do paciente mudarem depois)
- **Dashboards por perfil**: indicadores financeiros e operacionais adaptados a cada tipo de usuário
- **Log de auditoria**: registro completo (quem, quando, o quê) de toda alteração no sistema

## Modelo de dados — destaques

- Mais de 30 tabelas, com regras de negócio garantidas a nível de banco (não só na aplicação)
- **Exclusion constraints (GIST)** para impedir sobreposição de horários na agenda e nos turnos dos dentistas
- **JSONB** para dados flexíveis (payload bancário do boleto, snapshot de contrato, log de auditoria)
- **Soft-delete** em quase todas as entidades — nada é excluído de fato, apenas inativado, preservando histórico
- Versionamento imutável de templates de contrato (nunca atualiza, sempre insere nova versão)

## Máquinas de estado

O sistema modela explicitamente os fluxos de:
- **Consulta**: `scheduled → confirmed → checked_in → in_progress → completed`, com caminhos de cancelamento e no-show
- **Boleto**: `issued → registered → paid`, com cancelamento
- **Contrato**: `generated → awaiting_signature → signed`, sendo `signed` um estado terminal (não editável)

## Estado atual

| Camada | Situação |
|---|---|
| Frontend | Telas de listagem/cadastro/detalhes de pacientes implementadas; dados mockados (`MOCK_*`); sem autenticação real ainda |
| Backend | Schema de banco completo via Flyway (30+ tabelas, enums, triggers, exclusion constraints); camada de aplicação (entities, services, controllers) em desenvolvimento |
| Infra | Docker Compose configurado (PostgreSQL + API + Frontend) |

## Rodando localmente

```bash
docker compose up
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8080/api`
- PostgreSQL: porta `5432`

## Roadmap

1. Login e autenticação JWT
2. Configurações da clínica
3. Cadastros principais (dentistas, recepcionistas, pacientes)
4. Dashboards
5. Agenda/calendário (drag-and-drop, maior complexidade — desenvolvida por último)
