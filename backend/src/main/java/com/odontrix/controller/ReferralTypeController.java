package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.PaginationMeta;
import com.odontrix.dto.ReferralTypeDto;
import com.odontrix.dto.ReferralTypeInput;
import com.odontrix.entity.ReferralType;
import com.odontrix.service.ReferralTypeService;
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
 * Tipos de indicação (tabela de apoio) — GET para manager e receptionist;
 * POST/PATCH apenas manager (ver api/entities/patients.yaml).
 */
@RestController
@RequestMapping("/referral-types")
public class ReferralTypeController {

	private final ReferralTypeService referralTypeService;

	public ReferralTypeController(ReferralTypeService referralTypeService) {
		this.referralTypeService = referralTypeService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<List<ReferralTypeDto>>> list(
			@RequestParam(defaultValue = "1") @Positive int page,
			@RequestParam(defaultValue = "20") @Positive @Max(100) int limit) {
		Page<ReferralType> result = referralTypeService.list(page, limit);
		return ResponseEntity.ok(ApiResponse.of(
				result.getContent().stream().map(ReferralTypeDto::from).toList(),
				PaginationMeta.from(result, page, limit)));
	}

	@PostMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ReferralTypeDto>> create(
			@Valid @RequestBody ReferralTypeInput input) {
		ReferralType created = referralTypeService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.of(ReferralTypeDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<ReferralTypeDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(ReferralTypeDto.from(referralTypeService.get(id))));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ReferralTypeDto>> update(@PathVariable Integer id,
			@Valid @RequestBody ReferralTypeInput input) {
		ReferralType updated = referralTypeService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(ReferralTypeDto.from(updated)));
	}
}