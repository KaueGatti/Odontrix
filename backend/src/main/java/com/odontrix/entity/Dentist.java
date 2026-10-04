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

/** Dentista — 1:1 com {@link User}; N:N com especialidades. */
@Entity
@Table(name = "dentist")
@Getter
@Setter
@NoArgsConstructor
public class Dentist {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(name = "full_name", nullable = false, length = 150)
	private String fullName;

	@Column(unique = true, length = 14)
	private String cpf;

	@Column(unique = true, length = 14)
	private String rg;

	@Column(unique = true, length = 18)
	private String cnpj;

	@Column(name = "cro_number", length = 30)
	private String croNumber;

	@Column(name = "cro_state", nullable = false, length = 2)
	private String croState;

	@Column(nullable = false, length = 20)
	private String phone;

	@Column(length = 150)
	private String email;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Column(name = "appointment_price", precision = 10, scale = 2)
	private BigDecimal appointmentPrice;

	@Column(name = "commission_percent", precision = 5, scale = 2)
	private BigDecimal commissionPercent;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false)
	private PersonType personType;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
