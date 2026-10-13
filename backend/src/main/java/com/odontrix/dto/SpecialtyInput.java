package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Criação/edição de especialidade — spec: required [name]. */
public record SpecialtyInput(
		@NotBlank @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres") String name,
		Boolean active) {
}