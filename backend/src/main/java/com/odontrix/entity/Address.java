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

/** Endereço — value object compartilhado (paciente, dentista, clínica). */
@Entity
@Table(name = "address")
@Getter
@Setter
@NoArgsConstructor
public class Address {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false, length = 10)
	private String cep;

	@Column(nullable = false, length = 200)
	private String street;

	@Column(nullable = false, length = 20)
	private String number;

	@Column(nullable = false, length = 50)
	private String complement;

	@Column(nullable = false, length = 100)
	private String neighborhood;

	@Column(nullable = false, length = 100)
	private String city;

	@Column(nullable = false, length = 50)
	private String state;

	@Column(nullable = false, length = 50)
	private String country = "Brasil";
}
