package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Quitação de contas a pagar (expense) por um pagamento. */
@Entity
@Table(name = "payment_expense")
@Getter
@Setter
@NoArgsConstructor
public class PaymentExpense {

	@EmbeddedId
	private PaymentExpenseId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("paymentId")
	@JoinColumn(name = "payment_id", nullable = false)
	private Payment payment;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("expenseId")
	@JoinColumn(name = "expense_id", nullable = false)
	private Expense expense;

	@Column(name = "amount_applied", nullable = false, precision = 10, scale = 2)
	private BigDecimal amountApplied;

	public PaymentExpense(Payment payment, Expense expense, BigDecimal amountApplied) {
		this.payment = payment;
		this.expense = expense;
		this.amountApplied = amountApplied;
		this.id = new PaymentExpenseId(payment.getId(), expense.getId());
	}
}
