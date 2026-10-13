package com.odontrix.dto;

import com.odontrix.entity.ReferralSource;

/** Origem do paciente (tabela de apoio). */
public record ReferralSourceDto(Integer id, String description, boolean active) {

	public static ReferralSourceDto from(ReferralSource source) {
		return new ReferralSourceDto(source.getId(), source.getDescription(),
				Boolean.TRUE.equals(source.getActive()));
	}
}