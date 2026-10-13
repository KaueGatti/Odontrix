package com.odontrix.service;

import com.odontrix.dto.ClinicSettingsPatch;
import com.odontrix.entity.ClinicSettings;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.ClinicSettingsRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Parâmetros administrativos da clínica (singleton). Alterações em
 * {@code sessionTimeoutMinutes} valem para os próximos logins — o JWT já
 * emitido carrega a expiração calculada no momento da autenticação.
 */
@Service
public class ClinicSettingsService {

	private final ClinicSettingsRepository clinicSettingsRepository;

	public ClinicSettingsService(ClinicSettingsRepository clinicSettingsRepository) {
		this.clinicSettingsRepository = clinicSettingsRepository;
	}

	@Transactional(readOnly = true)
	public ClinicSettings get() {
		return clinicSettingsRepository.findAll(PageRequest.of(0, 1)).stream().findFirst()
				.orElseThrow(() -> ApiException.notFound("Configurações da clínica não encontradas"));
	}

	@Transactional
	public ClinicSettings update(ClinicSettingsPatch patch) {
		ClinicSettings settings = get();
		if (patch.lateInterestPercent() != null) {
			settings.setLateInterestPercent(patch.lateInterestPercent());
		}
		if (patch.lateFeePercent() != null) {
			settings.setLateFeePercent(patch.lateFeePercent());
		}
		if (patch.defaultDueDays() != null) {
			settings.setDefaultDueDays(patch.defaultDueDays());
		}
		if (patch.appointmentReminderLeadHours() != null) {
			settings.setAppointmentReminderLeadHours(patch.appointmentReminderLeadHours());
		}
		if (patch.sessionTimeoutMinutes() != null) {
			settings.setSessionTimeoutMinutes(patch.sessionTimeoutMinutes());
		}
		return clinicSettingsRepository.save(settings);
	}
}