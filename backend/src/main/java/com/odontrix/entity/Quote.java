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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Orçamento de tratamento. {@code expired} é computado/acionado em runtime —
 * nunca por edição manual.
 */
@Entity
@Table(name = "quote")
@Getter
@Setter
@NoArgsConstructor
public class Quote {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by", nullable = false)
	private User createdBy;

	@Column(nullable = false, length = 150)
	private String description;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false)
	private QuoteStatus status = QuoteStatus.draft;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal discount = BigDecimal.ZERO;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(name = "discount_type", nullable = false)
	private DiscountType discountType = DiscountType.percent;

	@Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalAmount;

	@Column(name = "valid_until")
	private LocalDate validUntil;

	@Column(columnDefinition = "text")
	private String notes;

	@Column(name = "payment_notes", columnDefinition = "text")
	private String paymentNotes;

	// ---- combinado de pagamento (expectativa; a forma REAL é no recebimento) ----

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "planned_payment_method")
	private PaymentMethod plannedPaymentMethod;

	@Column(name = "planned_installments", nullable = false)
	private Short plannedInstallments = (short) 1;

	@Column(name = "entrance_amount", nullable = false, precision = 10, scale = 2)
	private BigDecimal entranceAmount = BigDecimal.ZERO;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
