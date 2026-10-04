package com.odontrix.dto;

/**
 * Resultado do login — espelha {@code api/entities/users.yaml#LoginResult}.
 */
public record LoginResult(String token, UserDto user, boolean forcePasswordChange) {
}
