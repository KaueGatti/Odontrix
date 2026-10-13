package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.ClinicDto;
import com.odontrix.dto.ClinicPatch;
import com.odontrix.entity.Clinic;
import com.odontrix.service.ClinicService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dados cadastrais da clínica — recurso singleton. Leitura liberada a todos
 * os perfis; edição apenas manager (ver api/entities/clinic.yaml).
 */
@RestController
@RequestMapping("/clinic")
public class ClinicController {

	private final ClinicService clinicService;

	public ClinicController(ClinicService clinicService) {
		this.clinicService = clinicService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<ClinicDto>> get() {
		return ResponseEntity.ok(ApiResponse.of(ClinicDto.from(clinicService.get())));
	}

	@PatchMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ClinicDto>> update(@Valid @RequestBody ClinicPatch patch) {
		Clinic updated = clinicService.update(patch);
		return ResponseEntity.ok(ApiResponse.of(ClinicDto.from(updated)));
	}
}