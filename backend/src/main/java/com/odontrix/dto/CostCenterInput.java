package com.odontrix.dto;

import com.odontrix.entity.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Criação/edição de centro de custo — spec: required [name, type]. */
public record CostCenterInput(
		@NotBlank @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres") String name,
		String description,
		@NotNull(message = "Informe o tipo (income ou expense)") PaymentType type,
		Boolean active) {
}