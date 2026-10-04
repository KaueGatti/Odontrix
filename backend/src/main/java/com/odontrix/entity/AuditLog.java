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
 * Log de auditoria — append-only: nenhum perfil pode editar ou excluir
 * (visualização apenas pelo Gerente).
 */
@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "table_name", nullable = false, length = 100)
	private String tableName;

	@Column(name = "record_id", nullable = false)
	private Integer recordId;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(nullable = false)
	private AuditAction action;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "previous_data", columnDefinition = "jsonb")
	private String previousData;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "new_data", columnDefinition = "jsonb")
	private String newData;

	@CreationTimestamp
	@Column(name = "occurred_at", nullable = false)
	private OffsetDateTime occurredAt;
}
