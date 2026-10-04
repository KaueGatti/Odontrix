package com.odontrix.entity;

/**
 * Perfis de acesso (enum nativo {@code user_profile} do PostgreSQL).
 *
 * <p>Os nomes das constantes são minúsculos de propósito: são exatamente os
 * valores persistidos no banco e serializados no JSON da API
 * ('manager' | 'receptionist' | 'dentist' | 'system').</p>
 */
public enum UserProfile {

	manager,
	receptionist,
	dentist,
	/// conta de ações automáticas (job de no_show, webhook de boleto) — nunca faz login
	system;

	/** Autoridade Spring Security correspondente (ROLE_MANAGER etc.). */
	public String authority() {
		return "ROLE_" + name().toUpperCase();
	}
}
