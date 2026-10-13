package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Criação/edição de motivo de cancelamento — spec: required [description]. */
public record CancellationReasonInput(
		@NotBlank @Size(max = 100, message = "Descrição deve ter no máximo 100 caracteres") String description,
		Boolean active) {
}