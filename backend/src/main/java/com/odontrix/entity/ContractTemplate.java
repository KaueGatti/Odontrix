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
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/** Modelo de contrato — gerenciado apenas pelo Gerente. */
@Entity
@Table(name = "contract_template")
@Getter
@Setter
@NoArgsConstructor
public class ContractTemplate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false, unique = true, length = 150)
	private String name;

	@Column(columnDefinition = "text")
	private String description;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
