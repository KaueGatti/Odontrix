package com.odontrix.dto;

import com.odontrix.entity.ClinicSettings;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Parâmetros administrativos da clínica (GET/PATCH /clinic-settings). */
public record ClinicSettingsDto(Integer id, BigDecimal lateInterestPercent, BigDecimal lateFeePercent,
                                Integer defaultDueDays, Integer appointmentReminderLeadHours,
                                Integer sessionTimeoutMinutes, OffsetDateTime updatedAt) {

	public static ClinicSettingsDto from(ClinicSettings settings) {
		return new ClinicSettingsDto(settings.getId(), settings.getLateInterestPercent(),
				settings.getLateFeePercent(), settings.getDefaultDueDays(),
				settings.getAppointmentReminderLeadHours(), settings.getSessionTimeoutMinutes(),
				settings.getUpdatedAt());
	}
}