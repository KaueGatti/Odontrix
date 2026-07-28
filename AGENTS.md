# Odontrix — Sistema de Gestão para Clínicas Odontológicas

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

**Sidebar:** gradiente `linear-gradient(180deg, var(--blue-dark), var(--blue-mid))`, largura 216px, texto branco.

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

### Sessão — Telas Financeiro (Contas / A Receber / A Pagar)

**Arquivos criados:**

```
src/pages/financeiro/
├── ContasPage.tsx              # Visão geral: 4 KPIs + tabela "Próximos vencimentos"
├── AReceberPage.tsx            # 3 KPIs + filtros (Status/Período/Paciente/Forma) + tabela recebíveis
├── APagarPage.tsx              # 3 KPIs + botão "Nova despesa" + filtros + tabela despesas
├── types.ts                    # PaymentStatus, PaymentType, interfaces
├── mock-data.ts                # MOCK_PROXIMOS_VENCIMENTOS, MOCK_RECEBER, MOCK_A_PAGAR
└── components/
    ├── StatusBadge.tsx          # Dot + texto: pago/pendente/atrasado/a_vencer/cancelado
    ├── TypeTag.tsx              # Tag "Receber" (verde) / "Pagar" (vermelho)
    ├── RegistrarRecebimentoDialog.tsx  # Modal: valor, data, forma pagamento, obs
    ├── RegistrarPagamentoDialog.tsx    # Modal: valor, data, forma pagamento
    └── NovaDespesaDialog.tsx          # Modal: descrição, centro custo, valor, vencimento, obs
```

**Arquivos modificados:**
- `src/main.tsx` — imports + rotas `contas` → `<ContasPage/>`, `a-pagar` → `<APagarPage/>`, `a-receber` → `<AReceberPage/>`

**Componentes reutilizados:**
- `KpiCard` (dashboard/components) — KPIs das 3 páginas
- `Card` (ui/card) — cards das tabelas
- `Dialog` (ui/dialog) — os 3 modais

**Observações importantes:**
- `shadcn/tailwind.css` **não existe** no projeto; cores semânticas como `bg-success/10` não funcionam. Usar valores explícitos com `bg-[rgba(...)]` e `text-[#hex]`.
- Modais usam Radix Dialog, nunca `Modal` customizado.
- Tamanho mínimo de campos em formulários/diálogos: inputs/selects `h-10`, `text-[13px]`, `px-3`; labels `text-[12.5px]`; gap label→campo `gap-[6px]`; entre seções `gap-4`/`mt-4`.

**Status atual:**
- Telas de Financeiro implementadas com dados mockados (`MOCK_*`).
- 3 páginas funcionais via rota: `/contas`, `/a-receber`, `/a-pagar`.
- Modais abrem mas não persistem dados (sem backend nem estado global).
- Sidebar já possui grupo Financeiro com os 3 links (existente antes da sessão).

**Não implementado (pendente para próxima sessão):**
- Integração com API REST (envio real de dados).
- Estado global ou cache dos dados financeiros.
- Lógica de filtros (status, período, centro de custo, busca) — selects e inputs são placeholders estáticos.
- Validação de formulários nos modais.
- Responsividade (telas pensadas para desktop).

---

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
