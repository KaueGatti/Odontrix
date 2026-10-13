package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.ClinicSettingsDto;
import com.odontrix.dto.ClinicSettingsPatch;
import com.odontrix.entity.ClinicSettings;
import com.odontrix.service.ClinicSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Parâmetros administrativos da clínica — x-required-roles: manager em
 * todas as operações (ver api/entities/clinic.yaml).
 */
@RestController
@RequestMapping("/clinic-settings")
public class ClinicSettingsController {

	private final ClinicSettingsService clinicSettingsService;

	public ClinicSettingsController(ClinicSettingsService clinicSettingsService) {
		this.clinicSettingsService = clinicSettingsService;
	}

	@GetMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ClinicSettingsDto>> get() {
		return ResponseEntity.ok(ApiResponse.of(ClinicSettingsDto.from(clinicSettingsService.get())));
	}

	@PatchMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ClinicSettingsDto>> update(
			@Valid @RequestBody ClinicSettingsPatch patch) {
		ClinicSettings updated = clinicSettingsService.update(patch);
		return ResponseEntity.ok(ApiResponse.of(ClinicSettingsDto.from(updated)));
	}
}