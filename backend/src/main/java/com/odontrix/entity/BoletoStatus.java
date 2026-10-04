package com.odontrix.entity;

import java.time.LocalDate;

/**
 * Status do boleto (enum nativo {@code boleto_status}).
 *
 * <p>IMPORTANTE: "vencido" NÃO é um valor persistido — é computado em
 * runtime via {@code isOverdue()} (decisão fechada, ver V2 e
 * {@code api/entities/boletos.yaml}).</p>
 */
public enum BoletoStatus {
	issued, registered, paid, cancelled;

	/** Um boleto ainda pode ser pago enquanto não é cancelado/pago. */
	public boolean canBeOverdue() {
		return this == issued || this == registered;
	}

	/** Condição de "vencido": status em aberto + data de vencimento passada. */
	public static boolean isOverdue(BoletoStatus status, LocalDate dueDate) {
		return status != null && status.canBeOverdue()
				&& dueDate != null && dueDate.isBefore(LocalDate.now());
	}
}
