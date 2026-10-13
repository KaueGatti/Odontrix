package com.odontrix.dto;

import com.odontrix.entity.CancellationReason;

/** Motivo de cancelamento (tabela de apoio). */
public record CancellationReasonDto(Integer id, String description, boolean active) {

	public static CancellationReasonDto from(CancellationReason reason) {
		return new CancellationReasonDto(reason.getId(), reason.getDescription(),
				Boolean.TRUE.equals(reason.getActive()));
	}
}