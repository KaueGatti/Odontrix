# Design System (Fonte Única da Verdade)

> Documento oficial e definitivo para todo trabalho de UI daqui em diante. Toda tela nova — mockup ou implementação 
> React — deve seguir exatamente o que está aqui.

**Versão:** 2.0 (final) · **Data:** 22/07/2026

---

## 1. Filosofia

- Interface minimalista, muito espaço em branco, pouco ruído visual.
- Componentes grandes, hierarquia visual extremamente clara.
- A experiência deve transmitir: confiança, organização, tecnologia, facilidade, profissionalismo.
- Jamais criar interfaces "cheias" — sempre preferir respirar o layout.
- **Regra de ouro:** toda tela nova deve parecer que foi criada pelo mesmo designer. Nunca alterar estilo entre páginas.

---

## 2. Stack

React · TypeScript · Vite · TailwindCSS · shadcn/ui · **Lucide Icons** · Framer Motion (quando necessário).

> **Nota de migração:** os mockups HTML já existentes usam Tabler Icons (CDN). Isso fica valendo só para os arquivos já entregues — qualquer mockup novo e toda a implementação React devem usar Lucide desde já. Não misturar as duas bibliotecas dentro do mesmo componente.

---

## 3. Tipografia

Fonte: **Inter**, exclusivamente.

| Elemento | Tamanho | Peso |
|---|---|---|
| H1 | 48px | 700 |
| H2 | 36px | 600–700 |
| H3 | 30px | 600–700 |
| Título de Card | 20px | 600–700 |
| Texto | 16px | 400–500 |
| Descrição | 14px | 400 |
| Caption | 12px | 400–500 |

Pesos permitidos: 400, 500, 600, 700. Jamais usar fontes diferentes de Inter.

---

## 4. Espaçamento

Sistema baseado em múltiplos de 4: **4, 8, 12, 16, 20, 24, 32, 40, 48, 64**.
Nunca criar elementos "colados" — toda interface deve respirar.

---

## 5. Border Radius

| Elemento | Radius | Token CSS |
|---|---|---|
| Cards | 14px | `--border-radius-lg` |
| Inputs / Botões | 10px | `--border-radius-md` |
| Modal | 20px | *(sem token dedicado ainda — usar valor fixo)* |

---

## 6. Sombras

Muito suaves. `shadow-sm` como padrão; `shadow-md` apenas em cards importantes. Jamais sombras fortes.

---

## 7. Cores

| Token | Hex | Uso |
|---|---|---|
| Primária (`--blue`) | `#4F7EF7` | Ações principais, ícone do logo, elementos de destaque |
| Primária hover | `#3a6af3` | Hover de botão primário |
| Sidebar — topo do gradiente (`--blue-dark`) | `#0f2050` | Início do gradiente da sidebar |
| Sidebar — base do gradiente (`--blue-mid`) | `#1a3580` | Fim do gradiente da sidebar |
| Fundo | `#FFFFFF` | Background principal |
| Fundo secundário | `#F8FAFC` | Background de seções internas |
| Bordas | `#E5E7EB` | Bordas suaves |
| Texto principal | `#111827` | — |
| Texto secundário | `#6B7280` | — |
| Placeholder | `#94A3B8` | — |
| Sucesso | `#22C55E` | — |
| Erro | `#EF4444` | — |
| Warning | `#F59E0B` | — |
| Info | `#3B82F6` | — |

### 7.1 Sidebar

```css
--blue-dark: #0f2050;
--blue-mid:  #1a3580;
background: linear-gradient(180deg, var(--blue-dark) 0%, var(--blue-mid) 100%);
```
Padrão oficial e único de sidebar do produto. Texto branco / branco translúcido sobre o gradiente. Não usar sidebar branca em nenhuma tela.

---

## 8. Componentes de layout

### 8.1 Sidebar
- Gradiente azul escuro (Seção 7.1), largura fixa (~216px nos mockups).
- Logo no topo: quadrado azul (`--blue`) + "OdontoSys" + subtítulo "Gestão de Clínicas" em cinza translúcido.
- Itens de menu: ícone + texto, hover com fundo branco translúcido leve (`rgba(255,255,255,0.06)`), item ativo com fundo branco translúcido mais forte + borda sutil interna.
- Seções agrupadas por rótulo maiúsculo pequeno translúcido (ex: "FINANCEIRO"), com sub-itens indentados (ex: Contas / A receber / A pagar, cada um com ícone direcional).
- Rodapé fixo: "Configurações" sempre por último.

### 8.2 Header / Topbar

**Padrão A — Dashboard (saudação + título)**
```
BOM DIA, JULIANA        ← caption azul, uppercase, pequeno
Dashboard                ← H2/H3, bold
```
Sem borda/card ao redor — fica direto no fundo da página.

**Padrão B — Entidade com contexto (perfil, finalização de consulta)**
```
[Avatar circular] Nome da entidade [Badge de status — pill]
                  metadado · metadado · metadado
[Ações no canto direito: botão(ões) ou timer]
```
Fundo branco, borda inferior sutil, `shadow-sm` separando do conteúdo. Abaixo, tabs de navegação secundária (ver 10.6).

### 8.3 Filtro de período (dropdown)
Canto superior direito do Dashboard do Gerente ("Este mês ▾"). Componente visual definido: dropdown simples, borda cinza, radius de input (10px), texto 12–13px. Lógica funcional de filtro fica para depois — o componente visual já está fixado.

---

## 9. Mapeamento de Status → Cor

### Variantes-base

| Variante | Cor | Hex |
|---|---|---|
| Neutro | Cinza | `#6B7280` (texto) / `#F1F5F9` (fundo pill) |
| Info | Azul | `#3B82F6` |
| Sucesso | Verde | `#22C55E` |
| Warning | Âmbar | `#F59E0B` |
| Erro | Vermelho | `#EF4444` |

**Regra de outline:** quando dois status da mesma variante precisam ser diferenciados (ex: Cancelada vs. NãoCompareceu), o secundário usa versão outline (borda colorida, fundo transparente) da mesma cor — nunca uma 6ª cor nova.

### 9.1 Consulta (`appointment_status`, 7 valores)

| Status (enum) | PT-BR | Variante | Ícone (Lucide) |
|---|---|---|---|
| `scheduled` | Agendada | Neutro | `calendar` |
| `confirmed` | Confirmada | Info | `circle-check` |
| `checked_in` | EmEspera | Warning | `clock` |
| `in_progress` | EmAtendimento | Warning (com pulse/animação) | `activity` |
| `completed` | Realizada | Sucesso | `circle-check-big` |
| `cancelled` | Cancelada | Erro (sólido) | `x` |
| `no_show` | NaoCompareceu | Erro (outline) | `user-x` |

### 9.2 Boleto (`boleto_status`, 4 valores + 1 computado)

| Status | PT-BR | Variante |
|---|---|---|
| `issued` | Emitido | Neutro |
| `registered` | Registrado | Info |
| `paid` | Pago | Sucesso |
| `cancelled` | Cancelado | Erro (sólido) |
| *(computado)* | Vencido | Warning — calculado em runtime (`registered` + `due_date < hoje`), nunca armazenado |

### 9.3 Orçamento (`quote_status`, 5 valores)

| Status | PT-BR | Variante |
|---|---|---|
| `draft` | Rascunho | Neutro |
| `sent` | Enviado | Info |
| `approved` | Aprovado | Sucesso |
| `rejected` | Rejeitado | Erro (sólido) |
| `expired` | Expirado | Warning |

### 9.4 Contrato (`contract_status`, 4 valores)

| Status | PT-BR | Variante |
|---|---|---|
| `generated` | Gerado | Neutro |
| `awaiting_signature` | Aguardando Assinatura | Warning |
| `signed` | Assinado | Sucesso |
| `cancelled` | Cancelado | Erro (sólido) |

### 9.5 Regra geral para status futuros
1. Estado inicial/passivo → Neutro
2. Estado confirmado mas não finalizado → Info
3. Estado resolvido com sucesso → Sucesso
4. Estado que requer ação/atenção → Warning
5. Estado negativo/cancelado/falho → Erro
6. Dois status na mesma categoria que precisam se diferenciar → outline, nunca cor nova.

---

## 10. Componentes de conteúdo

### 10.1 Card
Fundo branco, borda cinza suave, `shadow-sm`, **padding 20–22px**. Nunca colocar muitos elementos dentro de um único card.

### 10.2 KPI Card (Dashboard)
Ícone dentro de um quadrado com fundo pastel (cor combinando com o significado da métrica) no canto superior esquerdo; abaixo, label pequeno cinza; abaixo, valor grande e bold.

### 10.3 Lista com avatar (padrão "linha de entidade")
```
[Avatar circular com iniciais, cor pastel] Nome da pessoa       [Badge de status — dot]
                                            metadado secundário
```
Reutilizar para qualquer lista de pessoas (pacientes, dentistas, recepcionistas).

### 10.4 Ranking / Barra de progresso
Número de posição em círculo pequeno azul claro, nome, valor à direita, barra de progresso horizontal arredondada abaixo — azul sólido para 1º lugar, cinza claro para os demais.

### 10.5 Info Banner
Fundo azul bem claro (`rgba(79,126,247,0.07)`), borda azul clara, ícone de informação, texto pequeno azul. Usar para avisos não-bloqueantes no topo de formulários.

### 10.6 Tabs
Componente oficial `Tabs`, reaproveitando o padrão já usado no perfil do dentista (Dados Cadastrais / Especialidades / Horários / Agendamentos / Financeiro). Mesmo padrão para qualquer entidade com múltiplas seções (ex: ficha do paciente: Dados / Anamnese / Anexos / Financeiro).

### 10.7 Tabelas
Header cinza claro, linhas altas, hover suave, sem bordas pesadas.

### 10.8 Timer / Contador (fluxo clínico)
Bloco mostrando horário real de início, horário estimado de término e tempo decorrido. Usado na tela de Finalização de Consulta — deve ser consistente sempre que houver atendimento em andamento (web e, futuramente, mobile do dentista).

### 10.9 Anexos
Área de drop com borda tracejada + texto "Arraste arquivos aqui ou clique para selecionar" + subtexto de contexto. Abaixo, lista de arquivos já anexados com ícone de tipo + nome + badge de categoria + ícone de remover.

---

## 11. Badge — regra de estilo por contexto

Dois estilos oficiais, escolhidos pelo contexto de exibição — não pelo status em si:

| Contexto | Estilo de badge |
|---|---|
| Destaque isolado (cabeçalho de card/página, badge único) | **Pill sólido** (fundo colorido cheio) |
| Dentro de tabela ou lista com várias linhas | **Dot + texto** (ponto colorido + texto sem fundo) |

As cores seguem sempre a tabela da Seção 9 — só muda o container visual.

---

## 12. Componentes pendentes de implementação

Ainda não existem como componente formal, especificados aqui para quando forem construídos:

- **Toast/Snackbar** — feedback de ação (ex: "Consulta cancelada com sucesso"). Reaproveitar as 5 cores da Seção 9. Canto inferior direito, empilhável (máx. 3).
- **EmptyState** — para qualquer lista/tabela vazia. Ícone discreto + título + descrição + ação opcional.
- **DatePicker/TimePicker dedicados** — necessário para agendamento (bloquear datas passadas, mostrar horários ocupados do dentista) e vencimentos. Hoje só existe `Input` genérico nos mockups.

---

## 13. Pendente de decisão (fora do escopo deste documento)

- **Biblioteca de calendário/agenda** — ainda em avaliação. Qualquer lib escolhida precisa alimentar tanto a grade principal da Agenda quanto o TimePicker da Seção 12 com a mesma fonte de horários ocupados (`dentist_work_schedule` + `dentist_schedule_exception` + consultas já marcadas), para não duplicar lógica de disponibilidade.

---

## 14. Referência cruzada de telas já construídas

| Tela | Arquivo / Origem | O que valida neste documento |
|---|---|---|
| Perfil do Dentista (aba Horários) | `dentist_profile_mockup.html` | Sidebar, tabs, tabela de exceções, histórico expansível, badge pill |
| Cadastro de Dentista | `dentist_registration_mockup.html` | Stepper, radio group, form-grid, day-chip |
| Dashboard (Recepcionista) | screenshot de referência | KPI cards, lista com avatar, badge dot, ranking simples |
| Dashboard (Gerente) | screenshot de referência | Dropdown de período, ranking com barra, centro de custos, consultas por status |
| Finalização de Consulta (Dentista) | screenshot de referência | Header com timer, info banner, tabela de procedimentos, anamnese expansível, anexos |

---

## 15. Ações pendentes decorrentes deste documento

- [ ] Migrar `recuperar-senha.html` e `redefinir_senha_mockup.html` para o gradiente de sidebar oficial (já registrado como pendência no projeto).
- [ ] Ao construir novos mockups HTML, usar Lucide em vez de Tabler.
- [ ] Ao construir os componentes Toast, EmptyState e DatePicker/TimePicker (Seção 12), seguir exatamente as specs aqui descritas.

---

## 16. Como manter este documento vivo

Toda vez que uma tela nova introduzir um padrão visual que não está aqui, esse padrão deve ser adicionado a este arquivo antes de ser reutilizado em uma terceira tela.
