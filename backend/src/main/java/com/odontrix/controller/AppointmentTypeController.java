package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.AppointmentTypeDto;
import com.odontrix.dto.AppointmentTypeInput;
import com.odontrix.dto.PaginationMeta;
import com.odontrix.entity.AppointmentType;
import com.odontrix.service.AppointmentTypeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Tipos de consulta (tabela de apoio) — GET liberado a todos os perfis;
 * POST/PATCH para manager e receptionist (ver api/entities/appointments.yaml).
 */
@RestController
@RequestMapping("/appointment-types")
public class AppointmentTypeController {

	private final AppointmentTypeService appointmentTypeService;

	public AppointmentTypeController(AppointmentTypeService appointmentTypeService) {
		this.appointmentTypeService = appointmentTypeService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<List<AppointmentTypeDto>>> list(
			@RequestParam(defaultValue = "1") @Positive int page,
			@RequestParam(defaultValue = "20") @Positive @Max(100) int limit) {
		Page<AppointmentType> result = appointmentTypeService.list(page, limit);
		return ResponseEntity.ok(ApiResponse.of(
				result.getContent().stream().map(AppointmentTypeDto::from).toList(),
				PaginationMeta.from(result, page, limit)));
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<AppointmentTypeDto>> create(
			@Valid @RequestBody AppointmentTypeInput input) {
		AppointmentType created = appointmentTypeService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.of(AppointmentTypeDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<AppointmentTypeDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(AppointmentTypeDto.from(appointmentTypeService.get(id))));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<AppointmentTypeDto>> update(@PathVariable Integer id,
			@Valid @RequestBody AppointmentTypeInput input) {
		AppointmentType updated = appointmentTypeService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(AppointmentTypeDto.from(updated)));
	}
}