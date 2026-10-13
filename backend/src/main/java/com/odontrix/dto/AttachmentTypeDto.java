package com.odontrix.dto;

import com.odontrix.entity.AttachmentType;

/** Tipo de anexo (tabela de apoio). */
public record AttachmentTypeDto(Integer id, String description, boolean active) {

	public static AttachmentTypeDto from(AttachmentType type) {
		return new AttachmentTypeDto(type.getId(), type.getDescription(),
				Boolean.TRUE.equals(type.getActive()));
	}
}