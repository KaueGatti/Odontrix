package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.PaginationMeta;
import com.odontrix.dto.SpecialtyDto;
import com.odontrix.dto.SpecialtyInput;
import com.odontrix.entity.Specialty;
import com.odontrix.service.SpecialtyService;
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
 * Especialidades odontológicas (tabela de apoio) — GET liberado a todos os
 * perfis; POST/PATCH para manager e receptionist (ver api/entities/dentists.yaml).
 */
@RestController
@RequestMapping("/specialties")
public class SpecialtyController {

	private final SpecialtyService specialtyService;

	public SpecialtyController(SpecialtyService specialtyService) {
		this.specialtyService = specialtyService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<List<SpecialtyDto>>> list(
			@RequestParam(defaultValue = "1") @Positive int page,
			@RequestParam(defaultValue = "20") @Positive @Max(100) int limit) {
		Page<Specialty> result = specialtyService.list(page, limit);
		return ResponseEntity.ok(ApiResponse.of(
				result.getContent().stream().map(SpecialtyDto::from).toList(),
				PaginationMeta.from(result, page, limit)));
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<SpecialtyDto>> create(@Valid @RequestBody SpecialtyInput input) {
		Specialty created = specialtyService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(SpecialtyDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<SpecialtyDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(SpecialtyDto.from(specialtyService.get(id))));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<SpecialtyDto>> update(@PathVariable Integer id,
			@Valid @RequestBody SpecialtyInput input) {
		Specialty updated = specialtyService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(SpecialtyDto.from(updated)));
	}
}