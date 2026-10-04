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

/** Motivo de cancelamento — obrigatório ao cancelar consulta (CHECK no banco). */
@Entity
@Table(name = "cancellation_reason")
@Getter
@Setter
@NoArgsConstructor
public class CancellationReason {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false, unique = true, length = 100)
	private String description;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;
}
