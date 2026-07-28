# ADR — Decisão de Arquitetura: Agenda/Calendário Construído por Conta Própria

> Registro de decisão (ADR — Architecture Decision Record) do OdontoSys. Documenta por que a tela de Agenda vai ser construída com peças próprias em vez de uma biblioteca de calendário pronta, e como isso se encaixa na ordem geral de desenvolvimento do projeto.

**Data da decisão:** 23/07/2026
**Status:** Decidido

---

## 1. Contexto

A Agenda é a tela mais usada do sistema — a recepcionista olha pra ela o dia inteiro. Precisa mostrar múltiplos dentistas lado a lado (resource view), com criação e reagendamento de consultas por arrastar-e-soltar.

Antes de decidir a implementação, avaliamos bibliotecas prontas de calendário/scheduler pra React.

---

## 2. Alternativas avaliadas e por que foram descartadas

| Biblioteca | Resource view grátis? | Motivo de descarte |
|---|---|---|
| **FullCalendar** | Não (Premium pago ou GPLv3) | Resource view (a funcionalidade central que precisávamos) fica atrás de licença paga ou GPLv3 — inviável pra um SaaS fechado |
| **react-big-calendar** | Sim (MIT) | Resource view funciona, mas não foi testado a fundo antes de avançar pras próximas opções |
| **Schedule-X** | Não (resource scheduler é plugin premium) | Testado — customização visual não bateu bem com o design system já fechado, e a experiência de uso (UX) ficou aquém do esperado |
| **MUI X Scheduler** | Sim (resource view inclusa no tier MIT/Community) | Testado — mesmo problema do Schedule-X: limitação de customização visual e UX aquém do esperado |

**Motivo central da decisão:** a fricção não foi falta de funcionalidade nem aversão a dependência de terceiros — foi especificamente **customização visual (não bate com o design system já fechado)** e **experiência de uso abaixo do esperado**. Como o design system do OdontoSys já está fechado e detalhado (cores, radius, tipografia, componentes — ver `odontosys-design-system-final.md`), brigar com o CSS de uma lib de terceiro pra forçar 100% de aderência visual tende a custar mais caro no longo prazo do que construir a camada visual por conta própria.

---

## 3. Por que o escopo é mais tratável do que "construir um calendário do zero" em geral

Existe bastante material na internet dizendo que "construir agendamento do zero é um erro" — mas essa literatura é sobre software de agendamento geral (sincronização com Google Calendar/Outlook via OAuth, múltiplos provedores, usuários em fusos horários diferentes, polls de disponibilidade entre pessoas externas). O caso do OdontoSys é bem mais estreito:

- **Sem sincronização com calendário externo** — sistema interno, fechado.
- **Sem múltiplos fusos horários** — uma clínica, um fuso.
- **Sem problema de sobreposição de eventos** — o banco já impede consultas conflitantes pro mesmo dentista via constraint `EXCLUDE USING GIST` na tabela `appointment` (`no_overlapping_dentist_appointment`). Isso elimina de cara o algoritmo mais espinhoso de UI de calendário: empilhar/organizar eventos que se sobrepõem lado a lado dentro da mesma coluna.
- **Volume baixo de eventos** — dezenas de consultas por dia, não milhares. Não exige virtualização agressiva.
- **Desktop only no MVP** — a Agenda em si roda só em desktop; mobile fica restrito à parte administrativa do Gerente, não à Agenda. Isso elimina a parte mais difícil de acertar em drag-and-drop (gestos de toque com precisão de horário).

O que sobra de fato como desafio real: **drag-and-drop com snap em horário, validando disponibilidade do dentista em tempo real durante o arrasto** (contra `dentist_work_schedule` + `dentist_schedule_exception`). Isso é lógica de negócio concreta e testável — não é o tipo de dificuldade vaga e ilimitada que aparece nos relatos de "scheduling software from scratch".

---

## 4. Decisão de arquitetura

Em vez de um framework de calendário pronto ou de escrever tudo 100% do zero, a abordagem escolhida separa o problema em duas camadas:

### Camada 1 — Partes difíceis, resolvidas por bibliotecas headless (sem opinião visual)

| Necessidade | Biblioteca escolhida | Por quê |
|---|---|---|
| Drag-and-drop + acessibilidade | **`@dnd-kit`** | Headless (não impõe nenhum estilo visual), padrão de fato do ecossistema React em 2026, suporte nativo a mouse/teclado (`KeyboardSensor` já pronto), anúncios ARIA automáticos pra leitor de tela — resolve acessibilidade de graça, que costuma ser a parte mais frequentemente deixada de lado em builds próprios |
| Matemática de datas/horário | **`date-fns`** ou API **`Temporal`** (via polyfill) | Cálculo de slots, duração, comparação de horários |

### Camada 2 — Totalmente própria (é onde a customização visual/UX que faltou nas libs prontas fica 100% sob controle)

- Grid de colunas por dentista (CSS Grid, unidades em **rem**, não px — decisão já tomada pra não precisar migrar depois)
- Renderização dos blocos de consulta usando as cores de status já definidas em `odontosys-design-system-final.md` (Seção 9 — mapeamento status → cor)
- Hook de validação de slot ao soltar o card, checando `dentist_work_schedule` + `dentist_schedule_exception`
- Feedback de erro via componente de Toast (já especificado no design system, ainda não implementado)

---

## 5. Plano de fases da Agenda (quando chegar a vez dela)

1. **Grid estático** — renderizar N colunas (dentistas) × linha do tempo, cards posicionados via CSS Grid a partir de `scheduled_date_time` + `estimated_duration_min`. Sem interação ainda.
2. **Clique pra criar** — clicar num slot vazio abre modal de novo agendamento (reaproveitando o contrato já definido em `appointments.yaml`).
3. **Drag-to-reschedule** — `@dnd-kit` + hook de validação de disponibilidade. Fase de maior risco/esforço do plano.
4. **Resize** — arrastar a borda do card pra mudar a duração estimada.
5. **Polimento** — loading states, feedback de erro (Toast) ao tentar soltar fora do expediente ou em horário indisponível.

**Validação recomendada antes de começar a Fase 3:** um spike curto (não cronometrado precisamente, mas pensado como esforço de poucas horas) só com grid + drag de mouse + snap, sem lógica de banco ainda, pra confirmar que a experiência está no nível esperado antes de investir na integração completa.

---

## 6. Onde a Agenda entra na ordem geral de desenvolvimento

Decisão tomada: a Agenda fica **por último** entre as telas principais do sistema, não porque é menos importante, mas porque:
- As outras telas já têm contrato de API e mockup fechados — dá pra codar sem parar pra decidir nada no meio do caminho.
- A Agenda tem uma peça de risco real (Fase 3 acima) que é melhor enfrentar depois de o ritmo de desenvolvimento já estar rodando.
- Componentes que a Agenda vai reaproveitar (Toast, EmptyState, Tabs — ver Seção 12 do design system) provavelmente vão amadurecer primeiro sendo usados nas telas mais simples, chegando prontos quando a Agenda for construída.

**Ordem de desenvolvimento das telas, definida nesta conversa:**

1. **Login** — tudo mais depende de autenticação funcionando; fluxo de criação de usuário (username/email/senha) já definido.
2. **Configurações** — dados da clínica, horário de funcionamento (`clinic.opening_time/closing_time`), já que `dentist_work_schedule` e regras de disponibilidade dependem disso existir primeiro.
3. **Auxiliares** — tabelas de referência (especialidades, tipos de anexo, motivos de cancelamento etc.), já que Dentistas/Pacientes referenciam essas tabelas.
4. **Dentistas, Recepcionistas, Pacientes** — cadastros principais, sem muita dependência entre si.
5. **Dashboards** — por último desse grupo, já que agregam dado de tudo que vem antes.
6. **Agenda/Calendário** — por último de todos, pelos motivos da Seção 6 acima.

---

## 7. Riscos conhecidos e aceitos

- Construir a camada de drag-and-drop/validação por conta própria significa que a manutenção de bugs e casos extremos (edge cases) fica 100% por sua conta — bibliotecas prontas recebem correções da comunidade; aqui não.
- Acessibilidade além do que o `@dnd-kit` já resolve de fábrica (ex: navegação por teclado em cenários mais complexos) ainda pode exigir atenção manual.
- Se no futuro a Agenda precisar rodar em mobile/tablet (hoje fora do escopo do MVP), o suporte a gestos de toque no drag-and-drop será um trabalho adicional não coberto por este plano.

---

## 8. Decisões técnicas relacionadas, já fechadas

- Unidades de CSS em **rem** desde o início da Agenda, não px (decisão tomada nesta mesma conversa, pra evitar migração futura).
- Agenda roda só em **desktop** no MVP; mobile fica restrito à parte administrativa do Gerente.
