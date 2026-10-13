package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Criação/edição de procedimento — spec: required [name, referencePrice].
 * Alterar o preço aqui não afeta snapshots já registrados em
 * appointment_procedure / quote_procedure.
 */
public record ProcedureInput(
		@NotBlank @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres") String name,
		String description,
		@NotNull(message = "Informe o preço de referência") BigDecimal referencePrice,
		Boolean active) {
}