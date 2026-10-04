package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tipo de indicação — classifica QUEM indicou o paciente.
 * {@code requiresReferrer = true} obriga {@code patient.referredByName}.
 */
@Entity
@Table(name = "referral_type")
@Getter
@Setter
@NoArgsConstructor
public class ReferralType {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false, length = 50)
	private String description;

	@Column(name = "requires_referrer", nullable = false)
	private Boolean requiresReferrer = Boolean.FALSE;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;
}
