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

## Última Sessão — 28/08/2026

### O que foi feito

#### 1. Financeiro — modal de Cobrança fiel à [Imagem 1] (Clientes > Financeiro > Olho)

**`patients/tabs/dialogs/CobrancaDialog.tsx`** — reescrito para layout 2 colunas:
- **Estrutura:** `DialogContent max-w-[1360px] p-0` com `grid grid-cols-[40%_60%] divide-x` (esquerda `COBRANÇA` 40% / direita `PARCELAS` 60%); `DialogHeader` sr-only para a11y
- **Esquerda — COBRANÇA:** título `22px font-bold text-primary` (design system igual ao `ORÇAMENTO`), pill `Pendente #e6f7f0`; card `PACIENTE` com avatar `KVG #e0f0ff`, `CPF/DN` + `preenchido automaticamente`; grid `Orçamento vinculado (border-emerald-400)` + `Data de emissão 30/04/2025`; `VALORES` 3 col `Valor bruto/Desconto/Valor líquido 4000,00` + `do orçamento` + cards `Total/Pago/Restante R$ 4000,00` em `bg-[#f8fafc]`; `textarea Observações` `min-h-[150px] bg-[#f8fafc]`
- **Direita — PARCELAS:** título `18px font-bold text-muted-foreground` (igual `PROCEDIMENTOS`), botão `REGISTRAR PAGAMENTO EM LOTE` `rounded-full border-2 border-foreground`; tabela `bg-[#f8f9fb]` header `text-[#3b82f6] 11px` colunas `#/VENCIMENTO/VALOR/COMBINADO/FORMA/STATUS`; linhas 10x `30/05/2025 400,00 PIX` com `select` estilizado, pill `Pendente #ccfbf1` / `Vencido #ffe4e6`, checkbox `3.5` e ação `Banknote border-emerald-500`; seleção `Set([4])` com `bg-[#bbf7d0]/60`; `loteOpen` condicional
- Validação visual via Playwright (`/pacientes/details` → `Financeiro` → `Eye`) — screenshot confirma fidelidade

#### 2. Cobrança — ajustes finais de largura, faixa e proporção

- **Largura:** `max-w-[1180px]` → `max-w-[1360px]` (+180px) para respiro em `PARCELAS`
- **Faixa cinza:** `DialogContent !overflow-hidden !p-0 !gap-0 overflow-y-hidden bg-white !border-0 [&>button]:hidden` + `DialogFooter !m-0 !border-0 rounded-b-[20px] bg-white` — remove `border-t` e `p-6/overflow-y-auto` herdados de `ui/dialog` que geravam faixa horizontal `bg-[#f1f5f9]` acima do footer
- **Proporção 40%/60%:** `grid-cols-[400px_1fr]` → `grid-cols-[40%_60%]` (esquerda de ~29% para 40%)
- **Título design system:** `COBRANÇA 26px extrabold #1a8cff` → `22px font-bold leading-none tracking-tight text-primary`; `PARCELAS 20px #9aa0a6` → `18px font-bold tracking-tight text-muted-foreground` — idêntico ao `ORÇAMENTO`/`PROCEDIMENTOS`
- Lint: ✅ · Build: ✅ (918kB)

### Sessão anterior — 27/08/2026

### O que foi feito

#### 1. Orçamento — título + SELECT de status no header

**`patients/tabs/dialogs/NovoOrcamentoDialog.tsx`:**
- Título renomeado de `NOVO ORÇAMENTO` → `ORÇAMENTO` (`h2` + `DialogTitle` sr-only)
- `SELECT` de **Status** movido de dentro do grid `Válido até + Status` para **ao lado do título** (`flex justify-between`): `h-8 w-[150px] text-[12px]`, opções `Rascunho/Enviado/Aprovado/Recusado/Expirado`; campo `Válido até` passou a ocupar coluna única
- Lint: ✅ · Build: ✅

#### 2. Orçamentos — abertura via Olho + expirado automático + bloqueio com liberação imediata

**`patients/tabs/OrcamentosTab.tsx`:**
- `MOCK_QUOTES` → `useState` + `selectedQuote`; helpers `isExpiredValidUntil` (DD/MM/YYYY ou YYYY-MM-DD vs `today 00h`), `getEffectiveStatus` (deriva `expired` automaticamente para `draft/sent/expired` com `validUntil < hoje`; `approved/rejected` nunca expiram; `expired` futuro reverte para `draft`), `brToIso`/`isoToBr`
- Tabela usa `effective` para badge (`expired` → outline `destructive/30`, demais via `Badge` variant)
- Ícone `Eye` agora com `onClick={() => handleView(q)}` abre `NovoOrcamentoDialog` preenchido (`quote` + `originalStatus`); botão `Novo Orçamento` abre em modo criação (`selectedQuote=null`); `handleSave` atualiza lista (converte `YYYY-MM-DD` → `DD/MM/YYYY`, preserva `totalValue` se `0`, insere com `nextId`)

**`patients/tabs/dialogs/NovoOrcamentoDialog.tsx`:**
- Novas props `quote?: QuoteView | null` e `onSave?`; `QuoteView { id, description, validUntilIso, status, originalStatus }`
- `isExpiredIso()` + `const isLocked = isExpiredIso(validUntil)` (sem `useMemo`) e `handleValidUntilChange` que no **`onChange`** já seta `validUntil` + se `!expired && status==="expired"` reverte `status` para `originStatus/draft` — **liberação imediata** de campos e remoção do aviso sem aguardar `blur/save`
- `useEffect` sync ao `open` (hidrata `description/validUntil/status/originStatus` do `quote` ou reseta para criação) + `useEffect` fallback de desbloqueio
- **Quando `isLocked=true`:** banner `role="alert"` `border-amber-200 bg-amber-50` com `AlertTriangle` (“Orçamento expirado — Altere a data de validade…”) + hint sob `Válido até` + `Lock` footer; `Válido até` com `border-amber-300`; todos os demais desabilitados (`disabled + opacity-60`): `Status` (header), `Paciente` (`patientLocked || isLocked`), `Descrição`, `Observações`, cada linha de `Procedimentos` (Select, `CurrencyInput`, desconto, `Qtd`, observação, `Remover`, `Alternar R$/%`), `Adicionar Procedimento`, `Forma pagamento/Entrada/Parcelas/Obs pagamento` (`pointer-events-none opacity-60` no grid), `Salvar` (`disabled`, `title` explicativo). `Válido até` permanece habilitado e é o único que desbloqueia edição ao receber data futura
- `CurrencyInput` e `TextArea` estendidos para `disabled`; `handleSave` bloqueado se `isLocked`, senão chama `onSave({ description, validUntilIso, status, totalValue })` onde `totalValue` é o `total` calculado dos procedimentos

- Lint: ✅ · Build: ✅ (912kB)

### Sessão anterior — 14/08/2026

### O que foi feito

#### 1. Novo Orçamento — redesign completo do modal (Patient Profile)

**`lib/masks.ts`:**
- Nova máscara `maskCurrency` (dígitos → `1.234,56` pt-BR, funciona com backspace) — usada nos inputs de moeda do modal

**`patients/tabs/dialogs/NovoOrcamentoDialog.tsx`** — reescrito:
- **Layout 2 colunas `2fr_3fr`:** esquerda "Dados do orçamento" (Paciente Select, Descrição, Válido até + Status, Observações) | direita com Procedimentos + Totalização/Pagamento
- **Paciente:** nova prop `patientLocked` — select desabilitado quando aberto pela tela do paciente, editável em telas genéricas; opções vêm de `MOCK_PATIENTS` (agenda), com o paciente atual inserido no topo se ausente
- **Tabela de procedimentos (edição inline):** Procedimento (Select que preenche o valor unit. de referência), Valor Unit. (máscara R$), Desconto (input + Select `R$/%` por linha), Qtd, Total calculado, Observação, Delete (`Trash2`)
- **Botão "Adicionar procedimento"** (verde `emerald-600`) abaixo da tabela
- **Card único "Totalização + Pagamento"** com divisor vertical (`divide-x`): subtotal, total de descontos (vermelho), total geral (verde); Forma de pagamento, Entrada (máscara R$), `NumberSpinner` de parcelas (−/+), label "Valor por parcela" (resto na última parcela), observações do pagamento
- **Componentes auxiliares co-localizados:** `CurrencyInput`, `TextArea`, `NumberSpinner` (padrão do projeto)
- **Cálculo de parcelas em centavos** (`Math.round`/`Math.floor`/`%`) para evitar erro de ponto flutuante — ex: 2.033,33 em 4x → "3x de R$ 508,33 e 1x de R$ 508,34"
- **Dimensões do modal:** `max-w-7xl` + `max-h-[85vh]`, sem scroll no body (`overflow-hidden`, header/footer `shrink-0`); card de Procedimentos é `flex-1` e a **tabela rola internamente** (`min-h-0 flex-1 overflow-y-auto`)

**`patients/tabs/OrcamentosTab.tsx`:**
- Passa `patientLocked` ao abrir o modal pela tela do paciente

- Lint: ✅ · Build: ✅

### Sessão anterior — 12/08/2026

### O que foi feito

#### 1. Patient Profile — AgendamentosTab com dialogs funcionais

**`patients/tabs/AgendamentosTab.tsx`:**
- Botão "+ Novo agendamento" agora abre o `NovaConsultaDialog` (dentistas do mock da agenda, data atual pré-selecionada); ao salvar, o novo agendamento é adicionado à lista local
- Ícone "Olho" abre o `DetalhesConsultaDialog` com o agendamento selecionado; mudanças de status atualizam a tabela e cancelamentos passam pelo `ConfirmarAcaoDialog`
- Reutilizados os dialogs da agenda (`NovaConsultaDialog`, `DetalhesConsultaDialog`, `ConfirmarAcaoDialog`) e o tipo compartilhado `Appointment`, estendido localmente com `createdBy` para manter a coluna "Quem agendou" — mesmo padrão do `dentists/tabs/AgendamentosTab.tsx`
- Mantidos colunas, badge de "Não compareceu" (outline error) e toggle "Ver todos"
- Lint: ✅ · Build: ✅

### Sessão anterior — 29/07/2026

### O que foi feito

#### 1. Patient Profile — Implementação das 4 tabs (Agendamentos, Consultas e Procedimentos, Orçamentos, Financeiro)

**`tabs/AgendamentosTab.tsx`:**
- Tabela "Próximos e histórico de agendamentos" com colunas: Data/Hora, Dentista, Tipo, Duração, Quem agendou, Status (Badge), Ações
- Status: Confirmada (info), Agendada (neutral), Realizada (success), Cancelada (error), Não compareceu (error outline)
- Botão "+ Novo agendamento" (primary)
- Toggle "Ver todos" para expandir

**`tabs/ConsultasProcedimentosTab.tsx`:**
- Tabela "Consultas realizadas" com colunas: Data, Dentista, Tipo, Procedimentos, Dentes (tooth chips FDI), Diagnóstico, Valor, Ações
- Card "Plano de tratamento em andamento" comentado (aguardando definição)

**`tabs/OrcamentosTab.tsx`:**
- Tabela "Orçamentos" com colunas: #, Descrição, Valor total, Válido até, Criado por (link), Status (Badge), Ações
- Status: Aprovado (success), Rascunho (neutral), Enviado (info), Recusado (error), Expirado (error outline)
- Botão "Novo Orçamento" abre `NovoOrcamentoDialog`

**`tabs/FinanceiroTab.tsx`:**
- Card "Resumo financeiro" no topo com 4 KPIs: Total já pago (verde), Saldo em aberto (vermelho), Parcelas vencidas (vermelho), Situação (badge Inadimplente/Em dia)
- Tabela "Contas" com totalização no tfoot (Valor total + Valor pago + Saldo)
- Linhas vencidas com destaque vermelho (`bg-destructive/[0.06]`)
- Eye icon abre `CobrancaDialog` ou `ParcelaDialog` conforme status

#### 2. Patient Profile — 3 modais (dialogs)

**`tabs/dialogs/NovoOrcamentoDialog.tsx`:** Modal wide com grid 2 colunas — formulário + tabela de procedimentos + totalização (subtotal, descontos, total geral) + forma de pagamento/parcelas

**`tabs/dialogs/CobrancaDialog.tsx`:** Modal wide com card de valores + parcelas + painel "Registrar pagamento em lote" (toggle)

**`tabs/dialogs/ParcelaDialog.tsx`:** Modal wide com detalhes da parcela + tabela de pagamentos

#### 3. Ajustes de padding
- Card headers padronizados para `py-3` em todas as tabs do paciente (redução de `py-4`)
- KPIs do Resumo financeiro com padding reduzido (`p-3`, grid `p-4`)
- Lint: ✅ (zero erros novos)

### Próxima sessão — Tab Financeiro do perfil do paciente

**Alvo:** `frontend/src/pages/patients/tabs/FinanceiroTab.tsx` (+ `tabs/dialogs/CobrancaDialog.tsx` / `tabs/dialogs/ParcelaDialog.tsx`)
- Próxima tela a ser trabalhada — ajustes de layout/funcionalidades do Resumo financeiro, tabela de Contas e modais de cobrança/parcela, seguindo o mesmo padrão das tabs Orçamentos/Agendamentos.

### Pendente (próximas sessões)

- Backend: entities, repositories, services, controllers, security (orçamentos: `quote_status` expirado computado + validação de bloqueio no serviço)
- API Client no frontend (orçamentos)
- Autenticação real
- Listas (Pacientes, Dentistas, Recepcionistas) com dados reais
- Planos odontológicos e Contratos
- Upload de documentos
