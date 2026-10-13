package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.ClinicBankAccountDto;
import com.odontrix.dto.ClinicBankAccountInput;
import com.odontrix.entity.ClinicBankAccount;
import com.odontrix.service.ClinicBankAccountService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Contas bancárias usadas na emissão de boletos — x-required-roles: manager
 * em todas as operações (ver api/entities/clinic.yaml).
 */
@RestController
@RequestMapping("/clinic/bank-accounts")
public class ClinicBankAccountController {

	private final ClinicBankAccountService clinicBankAccountService;

	public ClinicBankAccountController(ClinicBankAccountService clinicBankAccountService) {
		this.clinicBankAccountService = clinicBankAccountService;
	}

	@GetMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<List<ClinicBankAccountDto>>> list() {
		List<ClinicBankAccount> accounts = clinicBankAccountService.list();
		return ResponseEntity.ok(ApiResponse.of(
				accounts.stream().map(ClinicBankAccountDto::from).toList()));
	}

	@PostMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ClinicBankAccountDto>> create(
			@Valid @RequestBody ClinicBankAccountInput input) {
		ClinicBankAccount created = clinicBankAccountService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.of(ClinicBankAccountDto.from(created)));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<ClinicBankAccountDto>> update(@PathVariable Integer id,
			@Valid @RequestBody ClinicBankAccountInput input) {
		ClinicBankAccount updated = clinicBankAccountService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(ClinicBankAccountDto.from(updated)));
	}
}