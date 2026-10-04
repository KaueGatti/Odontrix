package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Versão de template de contrato — IMUTÁVEL: nunca atualizar, sempre inserir
 * nova versão (UNIQUE contract_template_id + version_number no banco).
 */
@Entity
@Table(name = "contract_template_version")
@Getter
@Setter
@NoArgsConstructor
public class ContractTemplateVersion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contract_template_id", nullable = false)
	private ContractTemplate contractTemplate;

	@Column(name = "version_number", nullable = false)
	private Integer versionNumber;

	@Column(nullable = false, columnDefinition = "text")
	private String content;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by", nullable = false)
	private User createdBy;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;
}
