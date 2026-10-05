package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;

/** Login por nome de usuário OU e-mail (ambos únicos) + senha. */
public record LoginInput(
		@NotBlank(message = "Informe o usuário ou e-mail") String login,
		@NotBlank String password) {
}
