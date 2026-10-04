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

import java.time.OffsetDateTime;

/** Histórico de anamnese do paciente — evolutivo, um registro por avaliação. */
@Entity
@Table(name = "anamnesis")
@Getter
@Setter
@NoArgsConstructor
public class Anamnesis {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dentist_id", nullable = false)
	private Dentist dentist;

	@CreationTimestamp
	@Column(name = "record_date", nullable = false)
	private OffsetDateTime recordDate;

	@Column(columnDefinition = "text")
	private String allergies;

	@Column(name = "current_medications", columnDefinition = "text")
	private String currentMedications;

	@Column(name = "preexisting_conditions", columnDefinition = "text")
	private String preexistingConditions;

	@Column(columnDefinition = "text")
	private String observations;
}
