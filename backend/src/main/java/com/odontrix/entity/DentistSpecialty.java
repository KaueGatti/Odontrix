package com.odontrix.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Associação N:N dentista × especialidade. */
@Entity
@Table(name = "dentist_specialty")
@Getter
@Setter
@NoArgsConstructor
public class DentistSpecialty {

	@EmbeddedId
	private DentistSpecialtyId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("dentistId")
	@JoinColumn(name = "dentist_id", nullable = false)
	private Dentist dentist;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("specialtyId")
	@JoinColumn(name = "specialty_id", nullable = false)
	private Specialty specialty;

	public DentistSpecialty(Dentist dentist, Specialty specialty) {
		this.dentist = dentist;
		this.specialty = specialty;
		this.id = new DentistSpecialtyId(dentist.getId(), specialty.getId());
	}
}
