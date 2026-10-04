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

/** Responsável financeiro/legal — obrigatório para pacientes menores de idade. */
@Entity
@Table(name = "responsible")
@Getter
@Setter
@NoArgsConstructor
public class Responsible {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "full_name", nullable = false, length = 150)
	private String fullName;

	@Column(unique = true, length = 14)
	private String cpf;

	@Column(unique = true, length = 14)
	private String rg;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;
}
