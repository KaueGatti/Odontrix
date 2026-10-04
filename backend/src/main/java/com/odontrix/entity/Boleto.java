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
 * Boleto bancário vinculado a uma parcela. Integração via {@code BoletoGateway}
 * (Port/Adapter — MockSicrediAdapter em dev). {@code vencido} NÃO é coluna:
 * ver {@link #isOverdue()} e {@code api/entities/boletos.yaml}.
 */
@Entity
@Table(name = "boleto")
@Getter
@Setter
@NoArgsConstructor
public class Boleto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "installment_id", nullable = false)
	private Installment installment;

	@Column(name = "due_date", nullable = false)
	private LocalDate dueDate;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal amount;

	@CreationTimestamp
	@Column(name = "issued_at", nullable = false)
	private OffsetDateTime issuedAt;

	/** Nosso número — preenchido no registro bancário. */
	@Column(name = "our_number", unique = true, columnDefinition = "text")
	private String ourNumber;

	@Column(name = "bar_code", columnDefinition = "text")
	private String barCode;

	@Column(name = "digitable_line", columnDefinition = "text")
	private String digitableLine;

	@Column(name = "registered_at")
	private OffsetDateTime registeredAt;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false)
	private BoletoStatus status = BoletoStatus.issued;

	@Column(name = "cancelled_at")
	private OffsetDateTime cancelledAt;

	@Column(name = "paid_at")
	private OffsetDateTime paidAt;

	/** Payload cru devolvido pelo banco (JSONB). */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "bank_payload", columnDefinition = "jsonb")
	private String bankPayload;

	/**
	 * "Vencido" — SEMPRE computado em runtime (decisão fechada):
	 * status em aberto (issued/registered) + data de vencimento passada.
	 */
	public boolean isOverdue() {
		return BoletoStatus.isOverdue(status, dueDate);
	}
}
