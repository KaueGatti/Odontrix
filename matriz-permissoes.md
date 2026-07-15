# Matriz de Permissões — Sistema de Clínicas Odontológicas

> Referência para implementação dos guards de autorização no backend (middleware por rota + perfil) e das condicionais de UI (exibir/ocultar/desabilitar por perfil e status).
>
> Perfis: **Gerente**, **Recepcionista**, **Dentista**

---

## Pacientes

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Criar / editar / inativar | ✅ | ✅ | ❌ |
| Visualizar | ✅ (todos) | ✅ (todos) | ✅ (apenas dos seus atendimentos) |

---

## Dentistas

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Criar / editar / inativar (cadastro geral) | ✅ | ✅ | ❌ |
| Editar próprios horários de disponibilidade | ✅ | ✅ | ❌ |

---

## Consultas

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Agendar / reagendar / cancelar | ✅ | ✅ | ❌ |
| Finalizar (preencher dados pós-consulta) | ❌ | ❌ | ✅ (apenas a própria consulta) |
| Editar consulta com status **Realizada** | ❌ | ❌ (apenas visualizar) | ❌ (já finalizada) |

---

## Planos Odontológicos

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Criar / editar / inativar | ✅ | ❌ | ❌ |

---

## Financeiro

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Registrar pagamento tipo "Recebido" | ✅ | ✅ | ❌ |
| Registrar pagamento tipo "Pago" (gastos da clínica) | ✅ | ❌ | ❌ |
| Estornar pagamento | ✅ | ❌ | ❌ |

---

## Contratos

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Criar / editar templates de contrato | ✅ | ❌ | ❌ |
| Editar conteúdo do contrato (antes da assinatura) | ✅ | ❌ | ❌ |

---

## Usuários e Permissões

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Criar / editar / inativar outros usuários | ✅ | ❌ | ❌ |
| Alterar o próprio perfil de acesso | ❌ (ninguém pode, nem Gerente) | ❌ | ❌ |

---

## Log de Auditoria

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Visualizar | ✅ | ❌ | ❌ |
| Editar / excluir | ❌ (ninguém pode) | ❌ | ❌ |

---

## Configurações da Clínica

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Editar (nome, CNPJ, logo, horário de funcionamento) | ✅ | ❌ | ❌ |

---

## Relatórios Exportáveis

| Ação | Gerente | Recepcionista | Dentista |
|---|:---:|:---:|:---:|
| Exportar relatórios (PDF/Excel) | ✅ (todo o escopo) | ✅ (mesmo escopo do seu dashboard) | ✅ (mesmo escopo do seu dashboard) |

> Regra: o escopo do relatório exportável segue o mesmo escopo de dados já definido no dashboard de cada perfil (ex: Recepcionista não exporta relatório de comissão por dentista).

---

## Notas de implementação

- Esta matriz deve virar a fonte única de verdade para o middleware de autorização por rota (`role` + `action`) no backend.
- No frontend, os mesmos pares (perfil, ação) devem controlar visibilidade/estado de botões e campos — evitar duplicar a regra com lógica diferente em cada tela.
- Regras que dependem também do **status** do registro (ex: consulta *Realizada* não editável pela Recepcionista) precisam ser combinadas com a máquina de estados de cada entidade (Appointment, Contract, Boleto) — próxima etapa de definição.
