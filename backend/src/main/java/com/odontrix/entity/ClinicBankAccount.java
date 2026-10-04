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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/** Conta bancária usada na emissão de boletos. */
@Entity
@Table(name = "clinic_bank_account")
@Getter
@Setter
@NoArgsConstructor
public class ClinicBankAccount {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "bank_name", nullable = false, length = 100)
	private String bankName;

	@Column(nullable = false, length = 20)
	private String agency;

	@Column(nullable = false, length = 20)
	private String account;

	/** Código do cedente / convênio junto ao banco. */
	@Column(name = "cedente_code", nullable = false, length = 30)
	private String cedenteCode;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;
}
