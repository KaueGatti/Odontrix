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

/** Alocação de um pagamento a parcelas de cobrança (quitação parcial/total). */
@Entity
@Table(name = "payment_installment")
@Getter
@Setter
@NoArgsConstructor
public class PaymentInstallment {

	@EmbeddedId
	private PaymentInstallmentId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("paymentId")
	@JoinColumn(name = "payment_id", nullable = false)
	private Payment payment;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("installmentId")
	@JoinColumn(name = "installment_id", nullable = false)
	private Installment installment;

	@Column(name = "amount_applied", nullable = false, precision = 10, scale = 2)
	private BigDecimal amountApplied;

	public PaymentInstallment(Payment payment, Installment installment, BigDecimal amountApplied) {
		this.payment = payment;
		this.installment = installment;
		this.amountApplied = amountApplied;
		this.id = new PaymentInstallmentId(payment.getId(), installment.getId());
	}
}
