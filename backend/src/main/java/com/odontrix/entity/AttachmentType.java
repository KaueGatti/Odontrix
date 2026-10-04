package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Tipo de anexo (radiografia, foto intraoral, anamnese, outro). */
@Entity
@Table(name = "attachment_type")
@Getter
@Setter
@NoArgsConstructor
public class AttachmentType {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false, length = 50)
	private String description;

	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;
}
