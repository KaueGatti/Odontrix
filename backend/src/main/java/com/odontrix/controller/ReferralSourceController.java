package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.PaginationMeta;
import com.odontrix.dto.ReferralSourceDto;
import com.odontrix.dto.ReferralSourceInput;
import com.odontrix.entity.ReferralSource;
import com.odontrix.service.ReferralSourceService;
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
 * Origens do paciente (tabela de apoio) — GET para manager e receptionist;
 * POST/PATCH apenas manager (ver api/entities/patients.yaml).
 */
@RestController
@RequestMapping("/referral-sources")
public class ReferralSourceController {

	private final ReferralSourceService referralSourceService;

	public ReferralSourceController(ReferralSourceService referralSourceService) {
		this.referralSourceService = referralSourceService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<List<ReferralSourceDto>>> list(
			@RequestParam(defaultValue = "1") @Positive int page,
			@RequestParam(defaultValue = "20") @Positive @Max(100) int limit) {
		Page<ReferralSource> result = referralSourceService.list(page, limit);
		return ResponseEntity.ok(ApiResponse.of(
				result.getContent().stream().map(ReferralSourceDto::from).toList(),
				PaginationMeta.from(result, page, limit)));
	}

	@PostMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ReferralSourceDto>> create(
			@Valid @RequestBody ReferralSourceInput input) {
		ReferralSource created = referralSourceService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.of(ReferralSourceDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<ReferralSourceDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(ReferralSourceDto.from(referralSourceService.get(id))));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ReferralSourceDto>> update(@PathVariable Integer id,
			@Valid @RequestBody ReferralSourceInput input) {
		ReferralSource updated = referralSourceService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(ReferralSourceDto.from(updated)));
	}
}