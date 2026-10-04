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

/** Recepcionista — 1:1 com {@link User} (criação conjunta via POST /receptionists). */
@Entity
@Table(name = "receptionist")
@Getter
@Setter
@NoArgsConstructor
public class Receptionist {

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

	@Column(nullable = false, length = 20)
	private String phone;

	@Column(length = 150)
	private String email;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Column(name = "hire_date", nullable = false)
	private LocalDate hireDate;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
