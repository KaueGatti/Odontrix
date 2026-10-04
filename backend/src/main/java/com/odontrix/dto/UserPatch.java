package com.odontrix.dto;

import jakarta.validation.constraints.Email;

/**
 * Edição parcial de usuário — "profile" é imutável por design (não existe aqui).
 */
public record UserPatch(String username, @Email String email, Boolean active) {
}
