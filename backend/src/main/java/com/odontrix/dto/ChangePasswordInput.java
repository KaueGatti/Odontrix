package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordInput(@NotBlank String currentPassword,
                                  @NotBlank @Size(min = 8, message = "A nova senha deve ter ao menos 8 caracteres") String newPassword) {
}
