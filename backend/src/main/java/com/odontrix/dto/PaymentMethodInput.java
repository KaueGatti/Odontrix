package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Criação/edição de forma de pagamento — spec: required [description]. */
public record PaymentMethodInput(
		@NotBlank @Size(max = 50, message = "Descrição deve ter no máximo 50 caracteres") String description) {
}