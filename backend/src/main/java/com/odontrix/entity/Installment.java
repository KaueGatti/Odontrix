package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Parcela de uma cobrança (billing). */
@Entity
@Table(name = "installment")
@Getter
@Setter
@NoArgsConstructor
public class Installment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "billing_id", nullable = false)
	private Billing billing;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal amount;

	@Column(name = "paid_amount", nullable = false, precision = 10, scale = 2)
	private BigDecimal paidAmount = BigDecimal.ZERO;

	@Column(name = "due_date", nullable = false)
	private LocalDate dueDate;

	/** NULL = em aberto. */
	@Column(name = "payment_date")
	private LocalDate paymentDate;

	/**
	 * Forma de pagamento COMBINADA (intenção do orçamento aprovado).
	 * NULL em cobranças avulsas — a forma REAL é escolhida no recebimento
	 * (payment.paymentMethod).
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "intended_payment_method")
	private PaymentMethod intendedPaymentMethod;
}
