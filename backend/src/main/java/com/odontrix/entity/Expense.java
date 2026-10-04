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
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Conta a pagar da clínica (expense). Quitação via Payment (payment_expense). */
@Entity
@Table(name = "expense")
@Getter
@Setter
@NoArgsConstructor
public class Expense {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cost_center_id", nullable = false)
	private CostCenter costCenter;

	@Column(nullable = false, length = 200)
	private String description;

	@Column(columnDefinition = "text")
	private String observation;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal amount;

	@Column(name = "issued_on", nullable = false)
	private LocalDate issuedOn;

	@Column(name = "due_date", nullable = false)
	private LocalDate dueDate;

	/** NULL = ainda não paga. */
	@Column(name = "payment_date")
	private LocalDate paymentDate;

	/** FALSE = cancelada (soft-delete). */
	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by", nullable = false)
	private User createdBy;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
