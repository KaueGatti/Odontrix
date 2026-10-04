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
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Parâmetros administrativos da clínica (tabela singleton {@code clinic_settings}).
 */
@Entity
@Table(name = "clinic_settings")
@Getter
@Setter
@NoArgsConstructor
public class ClinicSettings {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "late_interest_percent", nullable = false)
	private BigDecimal lateInterestPercent;

	@Column(name = "late_fee_percent", nullable = false)
	private BigDecimal lateFeePercent;

	@Column(name = "default_due_days", nullable = false)
	private Integer defaultDueDays;

	@Column(name = "appointment_reminder_lead_hours", nullable = false)
	private Integer appointmentReminderLeadHours;

	/** Usado como expiração do JWT emitido no login. */
	@Column(name = "session_timeout_minutes", nullable = false)
	private Integer sessionTimeoutMinutes;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;
}
