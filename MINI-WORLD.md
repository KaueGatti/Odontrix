# Template para Clínicas Odontológicas

## Resumo

Um template de sistemas para clínicas odontológicas.

O sistema deve ajudar no gerenciamento de Pacientes, dentistas, consultas, planos, pagamentos, cobranças, gastos e demais atividades administrativas que clínicas odontológicas possam ter.

---

## Perfis de Usuário

| Perfil | Acesso |
|---|---|
| **Gerente** | Acesso completo a todas as funcionalidades e áreas do sistema |
| **Recepcionista** | Consultas, pagamentos, manutenção de Pacientes, médicos e cobranças |
| **Dentista** | Finalização e preenchimento de dados após a realização de consultas |

---

## Principais Funcionalidades

### Pacientes

Campos obrigatórios marcados com `*`

- `*` Nome Completo
- `*` Documento (CPF/RG)
- `*` Telefone para contato
- `*` Telefone para emergências
- `*` Data de Nascimento
- `*` Endereço completo
- Email para contato
- Plano (Plano odontológico)
- Conta (Total a pagar)
- Responsável financeiro/legal *(se aplicável)*
- Histórico de anamnese *(alergias, medicamentos em uso, doenças — evolui ao longo do tempo)*
- Anexos *(radiografias, fotos intraorais vinculadas ao paciente)*
- Indicação *(como o paciente chegou à clínica: indicação, Google, Instagram, etc.)*

---

### Dentistas

Campos obrigatórios marcados com `*`

- `*` Nome completo
- `*` Documento (CPF/RG/CNPJ)
- `*` Telefone para contato
- `*` Especialidade
- `*` Horários de disponibilidade *(dias e horários que o dentista atende)*
- Registro profissional *(se aplicável)*
- Email para contato
- Data de Nascimento
- Valor por Consulta *(se aplicável)*
- Percentual de comissão *(se aplicável)*

---

### Consultas

#### Durante o agendamento — preenchido pela recepcionista

- Data e horário marcado
- Duração estimada
- Dentista responsável
- Paciente
- Tipo de consulta
- Status
- Quem agendou (recepcionista)
- Valor *(se aplicável)*
- Observações do agendamento *(ex: "paciente tem ansiedade")*

#### Após a consulta — preenchido pelo dentista responsável

- Data/hora de início e fim reais
- Procedimentos realizados *(pode ser mais de um)*
- Dentes envolvidos *(notação FDI: ex. dente 11, 36...)*
- Anamnese *(histórico de saúde do paciente: alergias, medicamentos em uso, doenças)*
- Queixa principal do paciente
- Diagnóstico
- Observações clínicas do dentista
- Plano de tratamento *(o que ainda precisa ser feito)*
- Próxima consulta recomendada
- Arquivos anexos *(radiografias e fotos vinculadas àquela consulta)*

---

### Planos Odontológicos

- Nome
- Descrição
- Validade (em dias)
- Valor

---

### Pagamentos

- Data e hora em que foi realizado
- Tipo (Recebido, Pago)
- Centro de Custo *(caso for do tipo "Pago")*
- Descrição
- Observação
- Forma de pagamento *(Cartão de Débito, Cartão de Crédito, Dinheiro, Boleto)*
- Valor
- Parcelamento *(número de parcelas, vencimentos e status de cada parcela)*
- Consulta vinculada *(rastreabilidade de qual consulta gerou a cobrança, se aplicável)*
- Status da cobrança *(Pendente, Pago, Em atraso, Cancelado)*

---

### Funcionalidades Adicionais

- Notificações e lembretes automáticos de consulta para o paciente (WhatsApp, e-mail ou SMS)
- Relatórios exportáveis em PDF e Excel (pagamentos, consultas, inadimplência)
- Log de auditoria registrando quem alterou o quê e quando em todas as áreas do sistema
- Configurações da clínica (nome, CNPJ, logo, horário de funcionamento — utilizados em documentos gerados pelo sistema)

---

### Dashboard por Perfil

#### Gerente
- Total recebido em diferentes períodos
- Total gasto em diferentes períodos
- Total de consultas agendadas, confirmadas, canceladas, reagendadas e realizadas em diferentes períodos
- Ranking de médicos *(por valor total das consultas realizadas e quantidade de consultas)*
- Ranking de recepcionistas *(por consultas agendadas)*
- Centro de Custos
- Tipos de consultas mais realizados
- Taxa de cancelamento e no-show *(paciente que não compareceu)*
- Novos pacientes por período
- Procedimentos mais realizados
- Inadimplência total

#### Recepcionista
- Total a receber em diferentes períodos
- Total de consultas em diferentes períodos
- Consultas a confirmar
- Pagamentos a cobrar
- Pacientes aguardando no momento
- Próximo horário livre por dentista

#### Dentista
- Consultas a realizar em diferentes períodos
- Próximo paciente com resumo rápido *(anamnese e última consulta)*
- Tratamentos em andamento *(plano de tratamento incompleto)*

---

## Regras de Negócio

### Pacientes

- Nome completo, CPF/RG, telefones, data de nascimento e endereço são obrigatórios
- O documento (CPF/RG) deve ser único no sistema — não é permitido cadastrar dois Pacientes com o mesmo documento
- Menores de idade devem obrigatoriamente ter um responsável financeiro/legal vinculado
- Um paciente só pode ter um plano odontológico ativo por vez
- A exclusão de Pacientes não é permitida — apenas inativação

---

### Consultas

- Não é permitido agendar consultas para Pacientes com débito ou inadimplência
- Não é permitido agendar consultas em datas retroativas
- Não é permitido agendar consultas em dias em que a clínica não funciona
- Não é permitido agendar dois horários conflitantes para o mesmo médico ou paciente
- A duração estimada deve ser respeitada — ex: consulta às 12:00 com 30min de duração bloqueia o horário até 12:30
- Consultas só podem ser canceladas, nunca excluídas
- Ao cancelar uma consulta, o motivo do cancelamento é obrigatório
- O status da consulta segue um fluxo definido e não pode regredir:

```
Agendada → Confirmada → Realizada
Agendada → Cancelada
Confirmada → Cancelada
```

- Consultas com status "Reaãolizada" n podem ser editadas pela recepcionista — apenas visualizadas
- A finalização da consulta só é permitida ao dentista responsável por ela
- O campo "Próxima consulta recomendada" preenchido pelo dentista deve gerar automaticamente uma sugestão de agendamento para a recepcionista
- Apenas recepcionistas e gerentes podem gerenciar consultas

---

### Dentistas

- Nome, documento, telefone, especialidade e horários de disponibilidade são obrigatórios
- O documento (CPF/RG/CNPJ) deve ser único no sistema
- A exclusão de dentistas não é permitida — apenas inativação
- Um dentista inativo não pode receber novos agendamentos
- Os horários de disponibilidade não podem ter conflitos internos *(ex: segunda 08:00–12:00 e segunda 11:00–13:00)*

---

### Planos Odontológicos

- Um plano com Pacientes vinculados não pode ser excluído — apenas inativado
- A validade do plano deve ser controlada por data — o sistema deve alertar ou bloquear consultas de pacientes com plano vencido

---

### Financeiro

- Um pagamento registrado não pode ser excluído — apenas estornado, gerando um registro de estorno vinculado ao original
- O parcelamento deve respeitar a forma de pagamento: apenas Cartão de Crédito e Boleto podem ser parcelados
- A data de vencimento das parcelas deve ser gerada automaticamente a partir da data do primeiro pagamento
- Parcelas em atraso devem atualizar automaticamente o status de inadimplência do paciente
- Apenas gerentes podem registrar pagamentos do tipo "Pago" (gastos da clínica)

---

### Usuários e Permissões

- Um usuário não pode alterar seu próprio perfil de acesso
- Apenas gerentes podem criar, editar ou inativar outros usuários
- O sistema deve encerrar a sessão automaticamente após um período de inatividade

---

### Log de Auditoria

- Toda criação, edição e inativação deve gerar um registro de log contendo: usuário responsável, data/hora e dados alterados
- Logs não podem ser editados ou excluídos por nenhum tipo de usuário

---

### Contratos

- Criação de modelos de contratos (templates)
- Versões dos templates *(imutável — nunca atualizar, sempre inserir nova versão)*
- Geração de contratos vinculados a consultas
- Snapshot dos dados do paciente no momento da geração *(dados podem mudar, mas o contrato mantém o estado original)*
- Status do contrato *(Gerado, Aguardando Assinatura, Assinado, Cancelado)*
- Assinatura digital do contrato
- Impressão do contrato
- Edição personalizada do conteúdo do contrato *(após geração, antes da assinatura)*

#### Templates de Contratos

- `*` Nome do template
- Descrição
- Status ativado/desativado
- Versões *(número da versão + conteúdo)*

#### Contrato

- `*` Paciente
- `*` Consulta vinculada
- `*` Versão do template utilizada
- `*` Dados do paciente no momento da geração *(snapshot)*
- `*` Status
- `*` Gerado por *(usuário)*
- `*` Data de geração
- Data de assinatura *(se aplicável)*
- Data de cancelamento *(se aplicável)*
- Motivo do cancelamento *(se aplicável)*