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

## Última Sessão — 31/08/2026

### O que foi feito

#### Tela de Atendimento / Finalização da Consulta (fiel ao `mockups/dentist_appointment_finalization_mockup.html`)

**Fluxo:** Agenda → modal de detalhes → **"Iniciar atendimento"** → `/agenda/atendimento/:id` (status `em_atendimento`) → **"Finalizar consulta"** → status `realizada` → volta para `/agenda` com o card verde.

- **Rota nova** `agenda/atendimento/:id` no `main.tsx`, dentro do `AppLayout`
- **Novo `pages/agenda/atendimento/AtendimentoPage.tsx`** — header (voltar à agenda, avatar, nome + badge "Em atendimento", meta tipo/agendado/duração estimada, **Início real / Término reais editáveis (`type=time`) + duração calculada**); banner de campos obrigatórios (fica vermelho quando há erros); footer fixo `Cancelar` / `Salvar rascunho` (feedback "Rascunho salvo às HH:MM") / `Finalizar consulta`
- **Novo `atendimento/components/Odontograma.tsx`** — odontograma FDI clicável de 32 dentes em SVG (coroa + raiz; inferiores espelhados com `flex-col-reverse`), quadrantes separados por vão central, legenda e texto "Dentes: 36, 37"
- **Novo `atendimento/components/ProcedimentosCard.tsx`** — painel "Adicionar procedimento" (Select com catálogo + **preço auto-preenchido**, obs, odontograma, Valor/Desconto em **centavos** via `MoneyInput` local + `maskMoney`/`parseMoneyToCents`, valor final estático) + tabela (Procedimento/Dentes em pills/Valor/Desconto/Valor final/Obs/remover) com empty state
- **Novo `atendimento/components/AnamneseCard.tsx`** — anamnese exibida (Alergias/Medicamentos/Doenças) + tag "atualizada em" + modal "Atualizar anamnese" (`ui/dialog`; o registro anterior vai para o histórico, data vira hoje) + "Registro anterior" expansível
- **Novo `atendimento/components/AnexosCard.tsx`** — dropzone funcional **local** (input file múltiplo, sem upload), itens com ícone (Bone/Image/FileText), badge de tipo, tamanho e remoção
- **Novo `atendimento/types.ts`** (`ProcedimentoRealizado`, `AnamneseData`, `AnamneseHistorico`, `AnexoItem`) e **`atendimento/shared.ts`** (classes de estilo compartilhadas CARD/SEC_LABEL/FIELD_LABEL/TEXTAREA + `maskDataBR`)
- **`pages/agenda/mock-data.ts`** — registro compartilhado entre rotas: `appointmentRegistry` + `statusOverrides` com `syncMockAppointments`, `getMockAppointmentById` (fallback regenera do seed pelo formato do id `appt-<ano>-<mês 0-based>-<dia>-<dentista>-<hora>`) e `setMockAppointmentStatus`
- **`pages/agenda/AgendaPage.tsx`** — sincroniza o estado com o registro (`useEffect`), reaplica status persistidos ao remontar e `handleStatusChange` persiste imediatamente (a navegação pode ocorrer antes do effect rodar)
- **`components/DetalhesConsultaDialog.tsx`** — `Action` ganhou `navigateTo?`; "Iniciar atendimento" navega para `/agenda/atendimento/:id` após mudar o status
- **Validação de finalização:** procedimentos + queixa principal + diagnóstico obrigatórios; banner vermelho + `aria-invalid` + mensagem inline + `scrollIntoView` até o primeiro card com erro
- Ícones 100% **Lucide** (o mockup usava Tabler — Bone p/ radiografia, Image p/ foto, CloudUpload, History…)
- Lint: ✅ (arquivos da sessão) · Build: ✅ (965 kB)

## Sessão anterior — 30/08/2026

### O que foi feito

#### 1. Cobrança — forma de pagamento read-only + modal de Registro de Pagamento real (fiel ao `mockups/registrar_pagamento.html`)

**Novo `patients/tabs/dialogs/RegistrarPagamentoDialog.tsx`** — modal de pagamento baseado no mockup:
- **Título** `REGISTRAR PAGAMENTO` (20px/700); `Desconto (R$)` + `Acréscimo / multa (R$)` + `Valor final (R$)` (quadro estático `#eaf0fe`/`#c9d9fc`); `Forma de pagamento` (Select PIX/Dinheiro/Cartão débito/Cartão crédito/Boleto) + `Valor`
- Checkbox **"Múltiplas formas de pagamento"** → cards `Forma 1..N` (Tipo/Valor/Data, remover por `X`) + botão dashed `+ Adicionar forma`; banner warning quando forma ≠ combinado do orçamento
- **Summary box**: `Valor a pagar` + `Total` + chip `✓ Correto` / `⚠ Ajustar valor`
- **Parcelas selecionadas**: badge `N parcelas`, banner info (vence primeiro paga primeiro), tabela `Parcela/Vencimento/Valor/Situação` com pills `Será paga`/`Valor insuf.`/`Pendente` (borda esquerda verde/âmbar/cinza) e totais `Total das parcelas` / `Será pago`
- **Observações** + **registrado por** (avatar KV) + footer `Cancelar` / `Gerar comprovante` (toggle verde) / `Confirmar pagamento` (verde)
- `valorFinal = valor − desconto + acréscimo` (nunca negativo); `coverage` ordenado por vencimento via `parseDateBR` (DD/MM/AAAA); props `installments`/`combinadoOrcamento`/`onConfirm`

**`patients/tabs/dialogs/CobrancaDialog.tsx`:**
- **Forma de pagamento read-only**: `<Select>` editável → display estático `r.forma || "—"` (padrão da coluna Combinado)
- **"Registrar pagamento em lote"** adaptado ao system design → componente `Button` (`size="sm"` `variant="default"` + `Banknote`), `disabled` sem seleção com `title` explicativo; painel inline `loteOpen` removido
- **Modal em 2 modos**: nota `Banknote` da linha abre modo **parcela única** (`openSinglePayment`); botão de lote abre modo **várias parcelas** (`openLotePayment` — só selecionadas e não pagas)
- **Pagamento funcional**: `onConfirm` marca parcelas como `paid` (pill `Pago #e7f9ee` + bloqueio de checkbox/nota); header pill dinâmico `Pendente`/`Parcial`/`Pago`; cards `Total/Pago/Restante` derivados do estado
- Lint: ✅ (arquivos da sessão — repo tem 13 erros pré-existentes em outros arquivos) · Build: ✅ (930 kB)

#### 2. Máscara de moeda baseada em centavos (inputs do modal de pagamento)

**`lib/masks.ts`** — novos helpers `parseMoneyToCents`, `formatMoneyFromCents`, `maskMoney` e `centsToNumber` (o `maskCurrency` antigo permanece intacto para o `NovoOrcamentoDialog`):
- `maskMoney` reconstrói a máscara apenas com dígitos a cada tecla: numérica entra pela direita (nos centavos) e desloca as anteriores à esquerda; backspace remove o último dígito; vírgula/ponto/não-numéricos são ignorados; sempre exibe `R$ 0,00` → `R$ 1.234,56` (milhar + 2 casas decimais)
- `parseMoneyToCents` extrai dígitos e devolve inteiro de centavos (ex: `"R$ 10,05"` → `1005`); `formatMoneyFromCents(cents, withSymbol)` formata; `centsToNumber` → número puro (ex: `123456` → `1234.56`)

**`RegistrarPagamentoDialog.tsx`:**
- Estados `desconto/acrescimo/valor` e `PaymentForma.valor` agora são **inteiros de centavos**; novo componente local `MoneyInput` (controlado com `maskMoney`/`parseMoneyToCents`, força o DOM correto quando digita não-numérico)
- Cálculos (valor final, soma das formas, cobertura das parcelas, `Será pago`) em centavos — sem aritmética de ponto flutuante
- Payload `ConfirmPaymentPayload` agora expõe `valorPago` (reais), `valorPagoCents` (centavos) e `valorPagoFormatado` (`"R$ 1.234,56"`)
- Lint: ✅ (arquivos da sessão) · Build: ✅ (930 kB)

### Sessão anterior — 28/08/2026

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

### Próxima sessão

- Persistir os dados do atendimento (procedimentos, avaliação clínica, anamnese, anexos, horários reais) quando o backend/API estiver disponível — hoje são estado local mockado; apenas o **status da consulta** persiste entre rotas via registro compartilhado em `mock-data.ts`
- Integrar a sugestão automática de agendamento do card "Retorno" com a Agenda (criar rascunho de consulta na data recomendada)

### Pendente (próximas sessões)

- Backend: entities, repositories, services, controllers, security (orçamentos: `quote_status` expirado computado + validação de bloqueio no serviço)
- API Client no frontend (orçamentos)
- Autenticação real
- Listas (Pacientes, Dentistas, Recepcionistas) com dados reais
- Planos odontológicos e Contratos
- Upload de documentos
