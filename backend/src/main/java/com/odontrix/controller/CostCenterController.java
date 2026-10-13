package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.CostCenterDto;
import com.odontrix.dto.CostCenterInput;
import com.odontrix.entity.CostCenter;
import com.odontrix.entity.PaymentType;
import com.odontrix.service.CostCenterService;
import jakarta.validation.Valid;
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
 * Centros de custo (tabela de apoio, compartilhada com Expenses) — GET para
 * manager e receptionist com filtros filter[type]/filter[active]; POST/PATCH
 * apenas manager (ver api/entities/billing.yaml).
 */
@RestController
@RequestMapping("/cost-centers")
public class CostCenterController {

	private final CostCenterService costCenterService;

	public CostCenterController(CostCenterService costCenterService) {
		this.costCenterService = costCenterService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<List<CostCenterDto>>> list(
			@RequestParam(name = "filter[type]", required = false) PaymentType type,
			@RequestParam(name = "filter[active]", required = false) Boolean active) {
		List<CostCenter> result = costCenterService.list(type, active);
		return ResponseEntity.ok(ApiResponse.of(result.stream().map(CostCenterDto::from).toList()));
	}

	@PostMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<CostCenterDto>> create(@Valid @RequestBody CostCenterInput input) {
		CostCenter created = costCenterService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(CostCenterDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
	public ResponseEntity<ApiResponse<CostCenterDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(CostCenterDto.from(costCenterService.get(id))));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<CostCenterDto>> update(@PathVariable Integer id,
			@Valid @RequestBody CostCenterInput input) {
		CostCenter updated = costCenterService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(CostCenterDto.from(updated)));
	}
}