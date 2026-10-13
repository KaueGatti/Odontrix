package com.odontrix.dto;

import com.odontrix.entity.Specialty;

/** Especialidade odontológica (tabela de apoio). */
public record SpecialtyDto(Integer id, String name, boolean active) {

	public static SpecialtyDto from(Specialty specialty) {
		return new SpecialtyDto(specialty.getId(), specialty.getName(),
				Boolean.TRUE.equals(specialty.getActive()));
	}
}