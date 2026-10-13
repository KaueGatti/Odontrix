package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.PaginationMeta;
import com.odontrix.dto.ProcedureDto;
import com.odontrix.dto.ProcedureInput;
import com.odontrix.entity.DentalProcedure;
import com.odontrix.service.ProcedureService;
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
 * Catálogo de procedimentos — leitura liberada a todos os perfis (usado na
 * finalização de consultas e na montagem de orçamentos); POST/PATCH para
 * manager e receptionist (ver api/entities/procedures.yaml).
 */
@RestController
@RequestMapping("/procedures")
public class ProcedureController {

	private final ProcedureService procedureService;

	public ProcedureController(ProcedureService procedureService) {
		this.procedureService = procedureService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<List<ProcedureDto>>> list(
			@RequestParam(defaultValue = "1") @Positive int page,
			@RequestParam(defaultValue = "20") @Positive @Max(100) int limit,
			@RequestParam(name = "filter[active]", required = false) Boolean active,
			@RequestParam(name = "filter[name]", required = false) String name) {
		Page<DentalProcedure> result = procedureService.list(active, name, page, limit);
		return ResponseEntity.ok(ApiResponse.of(
				result.getContent().stream().map(ProcedureDto::from).toList(),
				PaginationMeta.from(result, page, limit)));
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<ProcedureDto>> create(@Valid @RequestBody ProcedureInput input) {
		DentalProcedure created = procedureService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(ProcedureDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<ProcedureDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(ProcedureDto.from(procedureService.get(id))));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<ProcedureDto>> update(@PathVariable Integer id,
			@Valid @RequestBody ProcedureInput input) {
		DentalProcedure updated = procedureService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(ProcedureDto.from(updated)));
	}
}