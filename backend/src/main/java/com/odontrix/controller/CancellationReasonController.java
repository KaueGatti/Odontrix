package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.CancellationReasonDto;
import com.odontrix.dto.CancellationReasonInput;
import com.odontrix.dto.PaginationMeta;
import com.odontrix.entity.CancellationReason;
import com.odontrix.service.CancellationReasonService;
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
 * Motivos de cancelamento (tabela de apoio) — GET liberado a todos os perfis;
 * POST/PATCH para manager e receptionist (ver api/entities/appointments.yaml).
 */
@RestController
@RequestMapping("/cancellation-reasons")
public class CancellationReasonController {

	private final CancellationReasonService cancellationReasonService;

	public CancellationReasonController(CancellationReasonService cancellationReasonService) {
		this.cancellationReasonService = cancellationReasonService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<List<CancellationReasonDto>>> list(
			@RequestParam(defaultValue = "1") @Positive int page,
			@RequestParam(defaultValue = "20") @Positive @Max(100) int limit) {
		Page<CancellationReason> result = cancellationReasonService.list(page, limit);
		return ResponseEntity.ok(ApiResponse.of(
				result.getContent().stream().map(CancellationReasonDto::from).toList(),
				PaginationMeta.from(result, page, limit)));
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<CancellationReasonDto>> create(
			@Valid @RequestBody CancellationReasonInput input) {
		CancellationReason created = cancellationReasonService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.of(CancellationReasonDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<CancellationReasonDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(
				CancellationReasonDto.from(cancellationReasonService.get(id))));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<CancellationReasonDto>> update(@PathVariable Integer id,
			@Valid @RequestBody CancellationReasonInput input) {
		CancellationReason updated = cancellationReasonService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(CancellationReasonDto.from(updated)));
	}
}