package com.odontrix.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

/** PK composta de {@link DentistSpecialty} (dentist_id, specialty_id). */
@Embeddable
public record DentistSpecialtyId(Integer dentistId, Integer specialtyId) implements Serializable {
}
