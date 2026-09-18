# Odontrix — Sistema de Gestão para Clínicas Odontológicas

Este projeto segue regras específicas descritas nos arquivos abaixo.
Leia todos antes de iniciar qualquer tarefa:

- [WORKFLOW.md](./WORKFLOW.md) — fluxo obrigatório de git worktrees e merge

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 · TypeScript 6 · Vite 5 · Tailwind CSS v4 · shadcn/ui · Lucide React · Framer Motion |
| Backend | Java 25 · Spring Boot 4.0.5 · Maven · Flyway · PostgreSQL 16 |
| Infra | Docker Compose (postgres + api + frontend) |

---

## Arquitetura — Visão Geral

```
Frontend SPA (porta 5173)  →  API REST (porta 8080, context-path /api)  →  PostgreSQL (porta 5432)
```

- **Frontend:** React Router v7, SPA com layout autenticado (`AppLayout`) + rotas públicas (login, recuperar senha)
- **Backend:** REST API com envelope `{ data, meta }`, erros RFC 7807, paginação offset-based
- **Integrações externas:** Padrão Port/Adapter (Hexagonal) com interfaces + implementações trocáveis via `@Profile`

---

## Design System

### Fonte
**Inter**, exclusivamente. Pesos permitidos: 400, 500, 600, 700.

| Elemento | Tamanho | Peso |
|----------|---------|------|
| H1 | 48px | 700 |
| H2 | 36px | 600–700 |
| H3 | 30px | 600–700 |
| Título de Card | 20px | 600–700 |
| Texto | 16px | 400–500 |
| Descrição | 14px | 400 |
| Caption | 12px | 400–500 |

### Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--blue` | `#4F7EF7` | Ações principais, primária |
| `--blue-dark` | `#0f2050` | Topo gradiente sidebar |
| `--blue-mid` | `#1a3580` | Base gradiente sidebar |
| Fundo | `#FFFFFF` | Background principal |
| Fundo secundário | `#F8FAFC` | Seções internas |
| Bordas | `#E5E7EB` | Bordas suaves |
| Texto principal | `#111827` | — |
| Texto secundário | `#6B7280` | — |

**Sidebar:** gradiente `linear-gradient(180deg, var(--blue-dark), var(--blue-mid))`, largura 184px (reduzida de 216px ~10% e depois de 194px em 5%), recolhível para 64px (apenas logo + ícones; grupo Financeiro vira ícone $ que expande), texto branco.

### Status → Cor

| Variante | Hex | Uso |
|----------|-----|-----|
| Neutro | `#6B7280` / `#F1F5F9` | Estado inicial/passivo |
| Info | `#3B82F6` | Confirmado, registrado |
| Sucesso | `#22C55E` | Resolvido com sucesso |
| Warning | `#F59E0B` | Requer ação/atenção |
| Erro | `#EF4444` | Negativo/cancelado/falha |

Dois status na mesma categoria → outline (borda colorida, fundo transparente), nunca cor nova.

### Badges
- **Pill sólido** (fundo cheio): cabeçalho de card/página, badge único
- **Dot + texto** (ponto + texto sem fundo): dentro de tabelas/linhas

### Border Radius
- Cards: 14px
- Inputs/Botões: 10px
- Modal: 20px

### Espaçamento
Sistema baseado em múltiplos de 4: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

---

## Convenções de Código — Frontend

### Estrutura de diretórios

```
src/
  components/
    layout/        # AppLayout, Sidebar
    ui/            # button, input, card, badge, select, avatar, label, dialog (shadcn-style)
  hooks/           # use-mobile
  lib/
    utils.ts       # cn() — clsx + tailwind-merge
    masks.ts       # maskCPF, maskCNPJ, maskRG, maskTelefone, maskCEP
    mask-register.ts  # withMask(register, maskFn)
    validations/   # Schemas Zod (login, cadastro-paciente, etc.)
  pages/           # Organizadas por domínio
    patients/      # PacientesList, CadastroPaciente, PacienteDetalhes, tabs/
    receptionists/ # RecepcionistasList, CadastroRecepcionista, RecepcionistaDetalhes, tabs/
  styles/
    design-tokens.css  # Tokens CSS para mockups HTML
  types/           # Interfaces por entidade (Patient, Receptionist, Address, etc.)
```

### Padrões de componente

- **UI primitives:** `React.forwardRef`, `cn()`, CVA para variantes, Radix Slot para `asChild`
- **Dialog (modal):** `@radix-ui/react-dialog` via `@/components/ui/dialog` — usar `Dialog`, `DialogContent` (inclui overlay + close), `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`. **Não** criar modais customizados.
- **Pages:** default export para rotas, named export para páginas dentro do layout
- **Detalhes:** tabs extraídas para `tabs/` subdiretório com named exports (`export function DadosCadastraisTab`)
- **Componentes auxiliares** co-localizados no mesmo arquivo da página quando pequenos

### Formulários
- `react-hook-form` + `zodResolver` + `zod`
- `noValidate` no `<form>`, `aria-invalid={!!errors.field}`
- Erros: `<p className="mt-1.5 text-xs text-destructive">{errors.field.message}</p>`
- Multi-step: `IntersectionObserver` + `scrollIntoView` com flag `isClickScrolling`
- Input masking: `withMask(register("field"), maskFn)` + `inputMode="numeric"`
- Schema cross-field validation: `.superRefine()` / `.refine()`
- **Campos de data (padrão obrigatório):**
  - **Input:** sempre `<Input type="date">` — ícone de calendário nativo à direita; valor em **ISO** (`YYYY-MM-DD`); classes de referência: `h-10 border-[1.5px] bg-[var(--gray-50)] px-3 text-[13px]` (ver `financeiro/NovaDespesaDialog`). Não usar `appearance-none` (remove o ícone).
  - **Exibição** (tabelas, textos somente leitura): sempre **DD/MM/AAAA** via helper local `isoToBr` (convenção de `BoletosPage`, `OrcamentosTab`, `AdiarVencimentoDialog`, `DetalhesConsultaDialog`).
  - **Proibido:** input textual com placeholder "DD/MM/AAAA" + máscara manual (`maskDataBR` — removida do projeto).
- **Tamanho mínimo de campos:** inputs/selects `h-10` (40px), fonte `text-[13px]`, padding horizontal `px-3`. Labels em `text-[12.5px]`. Espaçamento label→campo `gap-[6px]`, entre campos/seções `gap-4` ou `mt-4`. Proibido campos `h-8` ou `text-[12px]` — são muito pequenos e prejudicam a legibilidade.

### Estilização
- Tailwind CSS v4, classes inline (sem CSS modules)
- `@theme inline {}` para design tokens
- shadcn CSS variables mapeadas no `:root`
- Custom properties para sombras: `shadow-[var(--shadow-card)]`

### Navegação
- `createBrowserRouter` no `main.tsx`
- Rotas públicas: `/login`, `/recover-password`, `/reset-password`
- Layout autenticado: `AppLayout` com `<Outlet/>` + `Sidebar`
- `NavLink` com callback `isActive` para estilo ativo na sidebar
- Sidebar: gradiente azul escuro, grupo Financeiro colapsável

### Ícones
**Lucide React** exclusivamente. Nunca misturar com Tabler.

### Estado atual (frontend)
- Sem API client — dados mockados com `MOCK_*` + `useState`
- Sem estado global — todo estado é local
- Sem autenticação — login faz apenas `console.log`
- Sem roles/permissões — sidebar mostra todos os itens

## Backend

### Estado atual
- **Java:** scaffold (2 classes: `TemplateApplication` + `Test` controller hello-world)
- **Schema:** completo (Flyway V1 — 30+ tabelas, enums, triggers, exclusion constraints GIST, índices)
- **Seed data:** dev/local (Flyway V2 — usuários, pacientes, consultas, cobranças)
- **Config:** `application.yaml` com PostgreSQL via Docker, `ddl-auto: validate`

### Direção de implementação

```
controller/  →  service/  →  repository/  →  entity/
     ↓
   dto/  (records ou Lombok)
     ↓
  exception/  (@RestControllerAdvice + RFC 7807)
     ↓
  security/  (Spring Security + JWT)
     ↓
  config/  (CORS, perfis)
```

### Pacotes esperados
- `entity/` — JPA entities mapeando o schema Flyway
- `repository/` — Spring Data JPA repositories
- `service/` — `@Service` + `@Transactional` com regras de negócio
- `controller/` — `@RestController` com endpoints REST
- `dto/` — records ou Lombok `@Data` para request/response
- `config/` — CORS, perfis, beans
- `security/` — Spring Security, JWT filter, `UserDetailsService`
- `exception/` — `@RestControllerAdvice`, RFC 7807 `Problem` response

### Dependências futuras necessárias
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `springdoc-openapi` (ou similar para OpenAPI)
- `jjwt` (ou similar para JWT)

### API REST (OpenAPI)
- Base: `/api` (dev: `http://localhost:8080/api`)
- Autenticação: Bearer JWT (exceto `POST /auth/login`)
- Resposta: `{ data, meta }` com `PaginationMeta { total, page, perPage, totalPages }`
- Erros: `application/problem+json` (RFC 7807)
- Paginação: `?page=1&limit=20` (max 100)
- Ações não-CRUD: `POST /appointments/{id}/confirm`
- `x-required-roles` em cada operação

---

## Modelo de Dados

### Entidades principais

| Entidade | Relacionamentos | Observações |
|----------|----------------|-------------|
| `users` | 1:1 → receptionist/dentist | `profile` enum (manager, receptionist, dentist) |
| `patient` | N:1 → address, responsible, dental_plan | Documento único, soft-delete (active) |
| `dentist` | N:N → specialty (via dentist_specialty) | Documento único, comissão, preço consulta |
| `receptionist` | 1:1 → users | Documento obrigatório |
| `appointment` | N:1 → patient, dentist, users | Exclusion constraint GIST p/ evitar sobreposição |
| `billing` | 1:1 → appointment, N → installment | Gerada automaticamente ao finalizar consulta |
| `boleto` | N:1 → installment | JSONB `bank_payload`, nosso número, linha digitável |
| `dentist_work_schedule` | N:1 → dentist | Versionado (valid_from/valid_to), GIST exclusion |
| `contract_template` | N → contract_template_version | Versões imutáveis (sempre insert, nunca update) |
| `contract` | N:1 → patient, appointment, template_version | JSONB `snapshot_data` |
| `audit_log` | — | Read-only, JSONB `previous_data`/`new_data` |

### Enums do banco
```
user_profile: manager | receptionist | dentist
appointment_status: scheduled | confirmed | checked_in | in_progress | completed | cancelled | no_show
boleto_status: issued | registered | paid | cancelled
quote_status: draft | sent | approved | rejected | expired
contract_status: generated | awaiting_signature | signed | cancelled
payment_type: income | expense
audit_action: create | update | deactivate
person_type: legal_entity | natural_person
discount_type: percent | number
day_of_week: monday .. sunday
```

### Convenções do banco
- Soft-delete via `active` boolean (exceto `attachment` com DELETE físico e `audit_log` read-only)
- JSONB para dados flexíveis: `boleto.bank_payload`, `contract.snapshot_data`, `audit_log.*_data`
- Exclusion constraints (btree_gist) para sobreposição temporal
- Triggers: `set_appointment_time_range()` (popula `time_range` TSTZRANGE)
- Versões imutáveis: `contract_template_version` (nunca atualizar, sempre inserir nova)

---

## Máquinas de Estado

### Appointment
```
[*] → scheduled → confirmed → checked_in → in_progress → completed → [*]
scheduled/confirmed → no_show → [*]
scheduled/confirmed/checked_in/in_progress → cancelled → [*]
no_show → checked_in (reativação se paciente chegar atrasado)
```
- `confirmed` = confirmação prévia (contato antes do dia)
- `checked_in` = check-in físico (walk-in ou após confirmação)
- Quem aciona: recepcionista/gerente agenda e confirma; **dentista** aciona `in_progress` e `completed`
- Cancelamento permitido em qualquer estado exceto após `completed`
- `no_show` é automático (job) após tolerância sem check-in

### Boleto
```
[*] → issued → registered → paid → [*]
issued/registered → cancelled → [*]
registered → (vencido computado)
```
- `vencido`: computado em runtime (`registered` + `due_date < hoje`)
- Confirmação de pagamento: webhook (primário) + manual (fallback)

### Quote
```
[*] → draft → sent → approved/rejected/expired → [*]
```

### Contract
```
[*] → generated → awaiting_signature → signed → [*]
generated/awaiting_signature → cancelled → [*]
```
- `signed` é terminal — contrato assinado não pode ser editado nem cancelado

---

## Matriz de Permissões

| Área | Gerente | Recepcionista | Dentista |
|------|:-------:|:-------------:|:--------:|
| Pacientes (CRUD) | ✅ | ✅ | ❌ |
| Pacientes (visualizar) | ✅ todos | ✅ todos | ✅ só seus atendimentos |
| Dentistas (CRUD) | ✅ | ✅ | ❌ |
| Dentistas (editar horários) | ✅ | ✅ | ❌ |
| Consultas (agendar/cancelar) | ✅ | ✅ | ❌ |
| Consultas (finalizar) | ❌ | ❌ | ✅ própria |
| Planos odontológicos (CRUD) | ✅ | ❌ | ❌ |
| Pagamentos (income) | ✅ | ✅ | ❌ |
| Pagamentos (expense) | ✅ | ❌ | ❌ |
| Estornar pagamento | ✅ | ❌ | ❌ |
| Contratos (templates) | ✅ | ❌ | ❌ |
| Usuários (CRUD) | ✅ | ❌ | ❌ |
| Audit log (visualizar) | ✅ | ❌ | ❌ |
| Configurações da clínica | ✅ | ❌ | ❌ |
| Alterar próprio perfil | ❌ | ❌ | ❌ |

---

## Ordem de Desenvolvimento

1. **Login** — base para tudo (autenticação JWT)
2. **Configurações** — dados da clínica, horário de funcionamento
3. **Auxiliares** — tabelas de apoio (especialidades, tipos, motivos)
4. **Dentistas, Recepcionistas, Pacientes** — cadastros principais
5. **Dashboards** — agregam dados dos módulos anteriores
6. **Agenda/Calendário** — por último (maior complexidade, depende de componentes amadurecerem)

### Agenda — construída por conta própria (ADR)
- Grid estático → clique p/ criar → drag-to-reschedule → resize → polimento
- `@dnd-kit` para drag-and-drop, `date-fns` para datas
- CSS Grid em **rem**, desktop-only no MVP

---

## Infraestrutura

### Docker Compose
```yaml
postgres:16-alpine (5432) → api:8080 → frontend:5173
```
- Variáveis de ambiente via `.env` (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)
- Volume persistente `postgres_data`
- Frontend com hot-reload (volumes bind + chokidar polling)

### Backend Dockerfile
- Multi-stage: `eclipse-temurin:25-jdk-alpine` (build) → `eclipse-temurin:25-jre-alpine` (run)
- Cache de dependências com `dependency:go-offline`

### Integrações externas (Port/Adapter)
- **Boleto:** `BoletoGateway` → `MockSicrediAdapter` (dev) / `SicrediAdapter` (prod)
- **Notificações:** `NotificationGateway` → `NoOpNotificationAdapter` (dev, só loga)
- Trocas de adapters via `@Profile` do Spring

---

## Referências arquiteturais

| Documento | Conteúdo |
|-----------|----------|
| `design-system.md` | Spec completa de UI (cores, tipografia, componentes, status) |
| `MINI-WORLD.md` | Regras de negócio, perfis, funcionalidades |
| `maquinas-de-estado.md` | Transições de Appointment, Boleto, Quote, Contract |
| `matriz-permissoes.md` | Permissões por perfil (Gerente, Recepcionista, Dentista) |
| `infraestrutura-externa.md` | Decisões sobre integrações (boleto, notificações) |
| `adr-agenda-calendario-custom.md` | ADR sobre construção própria da agenda |
| `api/openapi.yaml` | Spec completa da API REST |
| `frontend/src/styles/design-tokens.css` | Tokens CSS para mockups HTML |

---

## Próxima Sessão — Pendencias / Mudanças (documentado 13/09/2026)

> Lista de pendencias/mudanças acordadas para a próxima sessão. Apenas documentação —
> os detalhes de implementação serão definidos no momento de implementar cada item.

5. **Odontograma/Caras para procedimento do orçamento** — o `Odontograma` da finalización (`atendimento/components/Odontograma.tsx`) selecciona dentes FDI (32) mas **não faces**; `NovoOrcamentoDialog` não tem odontograma. Estender com selección por **faces** (mesial/distal/oclusal/vestibular/lingual/palatina…) e integrá-lo no orçamento (linhas de `ProcedureLine`); avaliar reuso em `ProcedimentosCard`.

6. **Consultas e Procedimentos Realizados (Plano e Ficha), Procedimentos do Orçamento Aprovado, Baixa nos Procedimentos e Registrar Atendimento Avulso** — construir o fluxo clínico completo em torno de `patients/tabs/ConsultasProcedimentosTab.tsx` (hoje mock): consultas/procedimentos realizados em vistas **Plano** (por consulta) e **Ficha** (histórico do paciente); visualizar os procedimentos pendentes do orçamento aprovado; **baixa** (marcar como realizado) ao finalizar a consulta — `appointment_procedure.quote_procedure_id` (Plano item 2 já agendado); e **registrar atendimento avulso** (procedimento/servicio sem orçamento aprovado).

8. **Pagamento antes do check-in. Não liberar check-in caso o paciente possua pendências em aberto** — regra de negocio: bloquear o check-in se o paciente tem pendências em aberto. Backend: `POST /appointments/{id}/check-in` → `409 problem+json` (RFC 7807); frontend: aviso em `DetalhesConsultaDialog` + derivar a "Registrar pagamento" (já disponível no modal). Definir o que conta como pendência (toda / só vencida / limiar de tolerancia).

9. **Analizar e reformular Financeiro do Paciente (está muito confuso)** — revisar `patients/tabs/FinanceiroTab.tsx` + dialogs (`CobrancaDialog`, `NovoRegistroDialog`, `ParcelaDialog`) e a relação com A Receber / Boletos / Orçamentos; sessão de análise/redesign (KPIs, hierarquia, ações, nomenclatura consistente) antes de implementar.

## Última Sessão — 16/09/2026

### Agenda: mini-calendário por vista + grids de 15 min + Sidebar recolhível

- **Mini-calendário (`agenda/components/MiniCalendar.tsx`)** — comportamento por vista: **Dia** → clique altera só o dia; **Semana** → clique altera só a semana (destaque da semana já existente); **Mês** → clique num dia muda a vista para Dia, e as **setas de mês movem o mês selecionado da agenda** (mesmo dia clampado ao último dia do mês, via `shiftMonthKeepingDay` + nova prop `onMonthChange`) mantendo a vista Mensal. Destaques na vista Mês: hoje com anel azul, dias do mês selecionado em negrito, dias de outros meses acinzentados; rótulo do mês azul quando corresponde ao mês selecionado. Wired via `AgendaPage` (`handleSelectDate` agora mantém a vista; só força "dia" quando `viewMode === "mes"`; novo `handleMonthChange`) e `AgendaFilters` (passa `onMonthChange`).
- **`SemanalView.tsx` reestruturada em grade de tempo** — de grade de chips por dia para vista semanal estilo Google Calendar: coluna de rótulos 56px, **linhas de 15 min** (08:00–18:45, `SLOT_HEIGHT` 15px, `HOUR_HEIGHT` 60px), 7 colunas de dias, consultas posicionadas por `startTime`/`endTime` com `AppointmentCard` (cor por dentista, cancelada/no-show esmaecida, highlight por filtro); clique num slot vazio → `NovaConsultaDialog` pré-preenchido com data + hora de 15 em 15 min (`onSlotClick(date, time)`); coluna de hoje com tinta azul sutil; aplica os mesmos filtros da visão Dia (nova prop `filters`). Removidos `onDayClick`/`onAddAppointment`/chips.
- **`DiariaView.tsx` com grid de 15 em 15 min** — grade trocada de hora-em-hora para slots de 15 min (44 slots, 60px/hora mantidos — posicionamento das consultas inalterado); rótulos a cada 15 min no gutter (hora inteira destacada, quartos em texto 9px); **clique no slot com granularidade de 15 min** (`onSlotClick(dentistId, "HH:15"...)`) e hover highlight por slot.
- **`Sidebar.tsx` recolhível** — largura expandida 194px → **184px** (−5%); recolhida 64px (logo + ícones, tooltips via `title`, copyright oculto); toggle `PanelLeftClose`/`PanelLeftOpen` no cabeçalho; grupo **Financeiro** com **ícone $ no cabeçalho (ícone + título + chevron)** e, recolhido, vira um único ícone $ que **expande a sidebar** ao clicar; estado ativo preservado nos dois modos (`navLinkCollapsedClass`).
- Lint: ✅ (6 arquivos alterados, sem erros) · tsc: ✅ nenhum erro nos arquivos alterados (pré-existentes em outros módulos) · Build: ✅ (~1.006 kB)

### Cadastro rápido de paciente no agendamento (item 4 ✅)

- **`patients/mock-data.ts` (novo)** — a lista `MOCK_PATIENTS` saiu de `agenda/mock-data.ts` para cá e ganhou um registro em runtime (`patientRegistry`) no mesmo padrão do `appointmentRegistry`: `listMockPatientNames()` (seed + cadastrados), `addMockPatient()` (id `pat-<slug>` com sufixo em colisão) e `findMockPatientByName()`. Registro criado pelo cadastro rápido fica `incomplete: true` (sem CPF/RG, nascimento, endereço, telefone fixo/emergência e origem) e deve ser completado na ficha do paciente — mapeamento futuro direto para o `PatientInput` de `POST /patients`.
- **`patients/dialogs/NovoPacienteDialog.tsx` + `lib/validations/cadastro-paciente-rapido.schema.ts` (novos)** — cadastro rápido com **Nome + Celular** e checkbox "Paciente é menor de idade ou incapaz" que revela a seção **Responsável** (nome + ao menos CPF ou RG, mesma regra do `superRefine` do cadastro completo). Máscaras via `withMask` (`maskTelefone`, `maskCPF`, `maskRG`), banner avisando que os demais dados ficam pendentes; aberto como dialog aninhado (o agendamento continua aberto por baixo).
- **`NovaConsultaDialog.tsx`** — o combobox de paciente passou a listar `listMockPatientNames()` (8 sugestões) e exibe **sempre em primeiro lugar** a opção **`+ Cadastrar "«nome digitado»"`** (ícone `UserPlus`, azul) quando há texto digitado; ao salvar no cadastro rápido o paciente volta **já selecionado** e passa a aparecer nas buscas seguintes. O `onSave` agora envia `patientId` (opcional), resolvido no registro.
- **`AgendaPage.tsx` / `patients/tabs/AgendamentosTab.tsx`** — `patientId: data.patientId ?? pat-<slug do nome>` na consulta criada.
- **Propagação do registro** — `AdvancedFiltersDialog.tsx` e `NovoOrcamentoDialog.tsx` passaram a usar `listMockPatientNames()`, então o paciente cadastrado no agendamento aparece nos filtros avançados e no select de orçamentos (e o filtro por esse nome retorna a consulta criada).
- **Fora do escopo (pendente)** — exibir o registro em `PacientesList` (hoje placeholder "Nenhum paciente encontrado") fica para o PR da lista real de pacientes, junto com `PacienteDetalhes` recebendo `useParams`; o formulário completo (`/pacientes/register`) continua sem persistência.
- Lint: ✅ nenhum erro nos 9 arquivos tocados/criados (repo mantém 11 erros + 2 warnings pré-existentes em outros módulos) · tsc: ✅ 0 erros (`--ignoreDeprecations 6.0`; o TS5101 do `baseUrl` deprecado no TS 6 é pré-existente no tsconfig) · Build: ✅ (~1.013 kB)

## Última Sessão — 13/09/2026

### Confirmação de status do agendamento + modal de detalhes permanece aberto

- **`agenda/components/ConfirmarAcaoDialog.tsx`** — generalizado: novas props `requiresMotivo?: boolean` (default false), `confirmLabel?: string` (default "Confirmar") e `confirmVariant?: "default" | "destructive"` (default "default"); o textarea de Motivo (obrigatório) só aparece com `requiresMotivo`; o motivo é limpo via `useEffect` ao (re)abrir o diálogo.
- **`agenda/components/DetalhesConsultaDialog.tsx`** — exportado `ConfirmActionOptions`; `onConfirmAction` agora recebe um objeto `{ title, description, requiresMotivo?, confirmLabel?, confirmVariant?, onConfirm(motivo?) }`; **toda** ação que muda status passa pelo diálogo de confirmação (Confirmar, Check-in, Não compareceu, Iniciar atendimento, Finalizar consulta, Reativar e Cancelar), cada uma com `confirmTitle`/`confirmDescription` próprios; após confirmar, o modal **não fecha mais** (removido `onOpenChange(false)`) — o pai atualiza o appointment selecionado e badge/ações recalculam; "Iniciar atendimento" continua navegando para `/agenda/atendimento/:id`; o `motivo` capturado no diálogo agora é repassado a `onStatusChange`; referência não-nula `appt` preserva o narrowing nos closures.
- **Pais** (`AgendaPage`, `patients/tabs/AgendamentosTab`, `dentists/tabs/AgendamentosTab`) — `handleConfirmAction` aceita o objeto `ConfirmActionOptions` (estado único `confirmAction`) e repassa as novas props ao `ConfirmarAcaoDialog`; `handleStatusChange` também atualiza `selectedAppointment` para o modal aberto refletir o novo status; `dentists/tabs/AgendamentosTab` ganhou `setAppointments` para a tabela refletir a mudança.
- Lint: ✅ (sem erros novos; repo mantém os pré-existentes) · tsc: ✅ para os 5 arquivos (erros de tipo restantes são pré-existentes) · Build: ✅ (~1.005 kB)

### Pendente (próximas sessões)

- Backend: entities, repositories, services, controllers, security (orçamentos: `quote_status` expirado computado + validação de bloqueio no serviço)
- API Client no frontend (orçamentos)
- Autenticação real
- Listas (Pacientes, Dentistas, Recepcionistas) com dados reais
- Planos odontológicos e Contratos
- Upload de documentos
- Persistir os dados do atendimento (procedimentos, avaliação clínica, anamnese, anexos, horários reais) quando o backend/API estiver disponível — hoje são estado local mockado; apenas o **status da consulta** persiste entre rotas via registro compartilhado em `mock-data.ts`
- Integrar a sugestão automática de agendamento do card "Retorno" com a Agenda (criar rascunho de consulta na data recomendada)
