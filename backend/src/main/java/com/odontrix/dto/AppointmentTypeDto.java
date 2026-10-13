package com.odontrix.dto;

import com.odontrix.entity.AppointmentType;

/** Tipo de consulta (tabela de apoio). */
public record AppointmentTypeDto(Integer id, String name, String description, boolean active) {

	public static AppointmentTypeDto from(AppointmentType type) {
		return new AppointmentTypeDto(type.getId(), type.getName(), type.getDescription(),
				Boolean.TRUE.equals(type.getActive()));
	}
}