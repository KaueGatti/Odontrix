package com.odontrix.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

/** PK composta de {@link AppointmentProcedureTooth} (appointment_procedure_id, tooth_fdi). */
@Embeddable
public record AppointmentProcedureToothId(Integer appointmentProcedureId, Short toothFdi) implements Serializable {
}
