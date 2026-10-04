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

import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Paciente — documento único (CPF ou RG), soft-delete, plano opcional. */
@Entity
@Table(name = "patient")
@Getter
@Setter
@NoArgsConstructor
public class Patient {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "full_name", nullable = false, length = 150)
	private String fullName;

	@Column(unique = true, length = 14)
	private String cpf;

	@Column(unique = true, length = 14)
	private String rg;

	@Column(name = "landline_phone", nullable = false, length = 20)
	private String landlinePhone;

	@Column(name = "cell_phone", nullable = false, length = 20)
	private String cellPhone;

	@Column(name = "emergency_phone", nullable = false, length = 20)
	private String emergencyPhone;

	@Column(length = 150)
	private String email;

	@Column(name = "birth_date", nullable = false)
	private LocalDate birthDate;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "address_id", nullable = false)
	private Address address;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "referral_source_id", nullable = false)
	private ReferralSource referralSource;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "referral_type_id")
	private ReferralType referralType;

	/** Quem indicou — obrigatório quando referral_type.requires_referrer = true. */
	@Column(name = "referred_by_name", length = 150)
	private String referredByName;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "responsible_id")
	private Responsible responsible;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "plan_id")
	private DentalPlan plan;

	@Column(name = "plan_started_at")
	private LocalDate planStartedAt;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
