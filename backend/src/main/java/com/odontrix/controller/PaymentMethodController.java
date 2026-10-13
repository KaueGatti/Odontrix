package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.PaymentMethodDto;
import com.odontrix.dto.PaymentMethodInput;
import com.odontrix.entity.PaymentMethod;
import com.odontrix.service.PaymentMethodService;
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
 * Formas de pagamento (tabela de apoio) — GET liberado a todos os perfis;
 * POST/PATCH apenas manager. Lista simples, sem paginação na spec.
 */
@RestController
@RequestMapping("/payment-methods")
public class PaymentMethodController {

	private final PaymentMethodService paymentMethodService;

	public PaymentMethodController(PaymentMethodService paymentMethodService) {
		this.paymentMethodService = paymentMethodService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<List<PaymentMethodDto>>> list() {
		List<PaymentMethod> methods = paymentMethodService.list();
		return ResponseEntity.ok(ApiResponse.of(methods.stream().map(PaymentMethodDto::from).toList()));
	}

	@PostMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<PaymentMethodDto>> create(
			@Valid @RequestBody PaymentMethodInput input) {
		PaymentMethod created = paymentMethodService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.of(PaymentMethodDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<PaymentMethodDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(PaymentMethodDto.from(paymentMethodService.get(id))));
	}

	/** Sem soft-delete no schema — o PATCH edita apenas a descrição. */
	@PatchMapping("/{id}")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<PaymentMethodDto>> update(@PathVariable Integer id,
			@Valid @RequestBody PaymentMethodInput input) {
		PaymentMethod updated = paymentMethodService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(PaymentMethodDto.from(updated)));
	}
}