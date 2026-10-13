package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Criação/edição de origem do paciente — spec: required [description]. */
public record ReferralSourceInput(
		@NotBlank @Size(max = 50, message = "Descrição deve ter no máximo 50 caracteres") String description,
		Boolean active) {
}