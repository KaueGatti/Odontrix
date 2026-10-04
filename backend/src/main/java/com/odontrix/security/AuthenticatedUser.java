package com.odontrix.security;

import com.odontrix.entity.UserProfile;

/**
 * Principal da autenticação JWT — extraído dos claims do token e revalidado
 * contra o banco a cada requisição pelo {@link JwtAuthFilter}.
 */
public record AuthenticatedUser(Integer id, String email, UserProfile profile) {
}
