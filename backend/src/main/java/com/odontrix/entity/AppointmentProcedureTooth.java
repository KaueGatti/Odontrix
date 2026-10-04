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

/**
 * Dente envolvido num procedimento da consulta — notação FDI (11–48).
 */
@Entity
@Table(name = "appointment_procedure_tooth")
@Getter
@Setter
@NoArgsConstructor
public class AppointmentProcedureTooth {

	@EmbeddedId
	private AppointmentProcedureToothId id;

	@ManyToOne(fetch = FetchType.LAZY)
	@MapsId("appointmentProcedureId")
	@JoinColumn(name = "appointment_procedure_id", nullable = false)
	private AppointmentProcedure appointmentProcedure;

	public AppointmentProcedureTooth(AppointmentProcedure appointmentProcedure, Short toothFdi) {
		this.appointmentProcedure = appointmentProcedure;
		this.id = new AppointmentProcedureToothId(appointmentProcedure.getId(), toothFdi);
	}
}
