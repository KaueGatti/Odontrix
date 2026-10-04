package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Reset administrativo de senha — troca obrigatória no próximo login. */
public record AdminResetPasswordInput(
        @NotBlank @Size(min = 8, message = "A nova senha deve ter ao menos 8 caracteres") String newPassword) {
}
