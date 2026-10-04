package com.odontrix.entity;

/**
 * Tipo de pagamento (enum nativo {@code payment_type}).
 *
 * <p>{@code credit} = dinheiro recebido antes de existir recebível (entrada
 * combinada no orçamento aprovado — unearned). A receita só se realiza quando
 * o crédito é alocado a parcelas.</p>
 */
public enum PaymentType {
	income, expense, credit
}
