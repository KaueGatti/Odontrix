package com.odontrix.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Criação de conta — apenas perfil manager (ver descrição de POST /users na spec).
 */
public record UserInput(@NotBlank String username,
                        @NotBlank @Email String email,
                        @NotBlank @Size(min = 8, message = "A senha deve ter ao menos 8 caracteres") String password) {
}
