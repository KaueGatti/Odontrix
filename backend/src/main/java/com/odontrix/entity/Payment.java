package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Pagamento (receita, gasto ou crédito do paciente).
 *
 * <p>{@code credit} (unearned): entrada paga na aprovação do orçamento —
 * exige {@code patient}; {@code quote} documenta a origem. Sobrevive a
 * no_show/cancelamento e é alocado FIFO à 1ª parcela quando a billing nasce.
 * Pagamento nunca é excluído — apenas estornado (refundRef).</p>
 */
@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false)
	private PaymentType type;

	@Column(columnDefinition = "text")
	private String notes;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal amount;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "payment_method", nullable = false)
	private PaymentMethod paymentMethod;

	/** Momento do pagamento — default agora; serviço pode retroagir. */
	@Column(name = "date_time", nullable = false)
	private OffsetDateTime dateTime = OffsetDateTime.now();

	/** Estorno: pagamento que este registro reverte. */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "refund_ref_id")
	private Payment refundRef;

	/** Obrigatório para type=credit (de quem é o dinheiro). */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id")
	private Patient patient;

	/** Orçamento de origem (documentação do crédito). */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "quote_id")
	private Quote quote;
}
