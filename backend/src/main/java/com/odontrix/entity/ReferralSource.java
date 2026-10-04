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

/** Origem do paciente na clínica (Google, Instagram, indicação...). */
@Entity
@Table(name = "referral_source")
@Getter
@Setter
@NoArgsConstructor
public class ReferralSource {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false, length = 50)
	private String description;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;
}
