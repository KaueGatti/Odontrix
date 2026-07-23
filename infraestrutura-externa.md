# Infraestrutura Externa — Sistema de Clínicas Odontológicas

> Decisões sobre integrações de terceiros e o padrão de implementação adotado para permitir troca de provedor sem impacto no resto do backend.

---

## Padrão adotado: Port/Adapter (Hexagonal)

Toda integração externa é acessada pelo resto do sistema **apenas através de uma interface (porta)** — nunca diretamente. A implementação concreta (adapter) fica isolada e é trocada via `@Profile` do Spring, sem alterar nenhuma regra de negócio.

```java
public interface BoletoGateway {
    BoletoRegistrationResult register(Boleto boleto);
    void cancel(String ourNumber);
}

public interface NotificationGateway {
    void send(NotificationChannel channel, String recipient, String template, Map<String, Object> params);
}
```

```
BoletoGateway
 ├── MockSicrediAdapter        (@Profile("dev") — atual)
 └── SicrediAdapter            (@Profile("prod") — futuro)

NotificationGateway
 ├── NoOpNotificationAdapter   (@Profile("dev") — atual, só loga)
 └── (adapter real, quando o provedor for escolhido)
```

Serviços de domínio (`BillingService`, `AppointmentService` etc.) dependem apenas da interface. Trocar de mock para integração real é uma mudança de configuração (`application.yml`), não de código de negócio.

---

## Boleto bancário (Sicredi)

| Decisão | Status |
|---|---|
| Integração agora | **Simulação/mock** — sandbox real fica para depois |
| Padrão de implementação | `BoletoGateway` interface + `MockSicrediAdapter` |

**O que o mock precisa simular fielmente:**
- `register()` retorna imediatamente um "nosso número" e linha digitável fake — permite a transição `Emitido → Registrado` funcionar sem esperar qualquer resposta assíncrona.
- **Nenhuma confirmação automática de pagamento é disparada pelo mock.** Como já decidimos que a confirmação de pagamento é "webhook primário + manual como fallback", o mock nunca simula o webhook — isso força todo pagamento a passar pelo caminho manual (Recepcionista/Gerente) enquanto a integração real não existe, validando esse fluxo desde já em vez de deixá-lo sem teste.

**Quando for integrar de verdade:** trocar `MockSicrediAdapter` por `SicrediAdapter` implementando a mesma interface, ativado via profile de produção. Nenhuma mudança esperada em `BillingService`, nos endpoints de `boletos.yaml`, ou na máquina de estados do Boleto.

---

## Notificações (WhatsApp / e-mail / SMS)

| Decisão | Status |
|---|---|
| Provedor | **Ainda não decidido** |
| Implementação agora | Stub — `NoOpNotificationAdapter`, apenas loga a notificação simulada |
| Padrão de implementação | `NotificationGateway` interface |

**O que o stub precisa fazer:**
- Logar a notificação simulada (`log.info("Notificação simulada: {} para {}", template, recipient)`) ou gravar num histórico simples.
- Suficiente para validar que o job de lembrete automático de consulta está disparando no horário certo (`appointmentReminderLeadHours`, já modelado em `clinic-settings`), sem depender de escolher provedor nem gastar créditos de API externa antes da hora.

**Candidatos avaliados, a decidir quando for integrar:**
- WhatsApp Business API (oficial, Meta)
- Twilio (WhatsApp + SMS + e-mail)
- Zenvia (BR, WhatsApp + SMS)

**Quando o provedor for escolhido:** implementar o adapter correspondente contra a mesma interface `NotificationGateway`. Nenhuma mudança esperada nos serviços que disparam notificações (lembrete de consulta, etc.).

---

## Resumo de decisões

| Item | Decisão |
|---|---|
| Padrão de integração externa | Port/Adapter — interface estável + adapter trocável via `@Profile` |
| Boleto — Sicredi | Mock por enquanto; integração real depois, mesma interface |
| Boleto — confirmação de pagamento no mock | Nunca automática — força teste do fluxo manual (webhook + fallback) |
| Notificações — provedor | Não decidido; stub (`NoOpNotificationAdapter`) por enquanto |
