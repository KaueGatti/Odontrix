package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Criação/edição de tipo de consulta — spec: required [name]. */
public record AppointmentTypeInput(
		@NotBlank @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres") String name,
		String description,
		Boolean active) {
}