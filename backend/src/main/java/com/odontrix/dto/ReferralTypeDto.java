package com.odontrix.dto;

import com.odontrix.entity.ReferralType;

/**
 * Tipo de indicação (tabela de apoio) — {@code requiresReferrer = true}
 * obriga o nome de quem indicou no cadastro do paciente.
 */
public record ReferralTypeDto(Integer id, String description, boolean requiresReferrer, boolean active) {

	public static ReferralTypeDto from(ReferralType type) {
		return new ReferralTypeDto(type.getId(), type.getDescription(),
				Boolean.TRUE.equals(type.getRequiresReferrer()),
				Boolean.TRUE.equals(type.getActive()));
	}
}