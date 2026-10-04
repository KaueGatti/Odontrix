package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

/**
 * Contrato gerado para um paciente/consulta. O snapshot dos dados do paciente
 * (JSONB) é capturado na geração — o contrato mantém o estado original mesmo
 * se os dados mudarem depois. {@code signed} é terminal.
 */
@Entity
@Table(name = "contract")
@Getter
@Setter
@NoArgsConstructor
public class Contract {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "appointment_id", nullable = false)
	private Appointment appointment;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "template_version_id", nullable = false)
	private ContractTemplateVersion templateVersion;

	/** Snapshot dos dados do paciente no momento da geração. */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "snapshot_data", nullable = false, columnDefinition = "jsonb")
	private String snapshotData;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false)
	private ContractStatus status = ContractStatus.generated;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "generated_by", nullable = false)
	private User generatedBy;

	@CreationTimestamp
	@Column(name = "generated_at", nullable = false)
	private OffsetDateTime generatedAt;

	@Column(name = "signed_at")
	private OffsetDateTime signedAt;

	@Column(name = "cancelled_at")
	private OffsetDateTime cancelledAt;

	@Column(name = "cancellation_reason", columnDefinition = "text")
	private String cancellationReason;
}
