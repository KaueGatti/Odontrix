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
import java.time.OffsetDateTime;

/**
 * Cobrança gerada (1:1 com consulta via appointment_id UNIQUE) ou avulsa.
 * Nascida automaticamente na finalização da consulta, com o valor real.
 */
@Entity
@Table(name = "billing")
@Getter
@Setter
@NoArgsConstructor
public class Billing {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** 1:1 com consulta — NULL para cobranças avulsas. */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "appointment_id", unique = true)
	private Appointment appointment;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id")
	private Patient patient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cost_center_id")
	private CostCenter costCenter;

	@Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalAmount;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal discount = BigDecimal.ZERO;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
