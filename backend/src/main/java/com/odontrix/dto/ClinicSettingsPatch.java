package com.odontrix.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

/**
 * Edição dos parâmetros administrativos — spec ClinicSettingsPatch:
 * minimum 0 para percentuais, minimum 1 para dias e horas.
 */
public record ClinicSettingsPatch(
		@DecimalMin(value = "0", message = "Juros de mora não pode ser negativo") BigDecimal lateInterestPercent,
		@DecimalMin(value = "0", message = "Multa não pode ser negativa") BigDecimal lateFeePercent,
		@Min(value = 1, message = "Prazo padrão de vencimento deve ser de no mínimo 1 dia") Integer defaultDueDays,
		@Min(value = 1, message = "Antecedência do lembrete deve ser de no mínimo 1 hora") Integer appointmentReminderLeadHours,
		Integer sessionTimeoutMinutes) {
}