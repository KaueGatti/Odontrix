package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.AttachmentTypeDto;
import com.odontrix.dto.AttachmentTypeInput;
import com.odontrix.dto.PaginationMeta;
import com.odontrix.entity.AttachmentType;
import com.odontrix.service.AttachmentTypeService;
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
 * Tipos de anexo (tabela de apoio) — GET liberado a todos os perfis;
 * POST/PATCH apenas manager (ver api/entities/patients.yaml).
 */
@RestController
@RequestMapping("/attachment-types")
public class AttachmentTypeController {

	private final AttachmentTypeService attachmentTypeService;

	public AttachmentTypeController(AttachmentTypeService attachmentTypeService) {
		this.attachmentTypeService = attachmentTypeService;
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<List<AttachmentTypeDto>>> list(
			@RequestParam(defaultValue = "1") @Positive int page,
			@RequestParam(defaultValue = "20") @Positive @Max(100) int limit) {
		Page<AttachmentType> result = attachmentTypeService.list(page, limit);
		return ResponseEntity.ok(ApiResponse.of(
				result.getContent().stream().map(AttachmentTypeDto::from).toList(),
				PaginationMeta.from(result, page, limit)));
	}

	@PostMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<AttachmentTypeDto>> create(
			@Valid @RequestBody AttachmentTypeInput input) {
		AttachmentType created = attachmentTypeService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.of(AttachmentTypeDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'DENTIST')")
	public ResponseEntity<ApiResponse<AttachmentTypeDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(AttachmentTypeDto.from(attachmentTypeService.get(id))));
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@PatchMapping("/{id}")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<AttachmentTypeDto>> update(@PathVariable Integer id,
			@Valid @RequestBody AttachmentTypeInput input) {
		AttachmentType updated = attachmentTypeService.update(id, input);
		return ResponseEntity.ok(ApiResponse.of(AttachmentTypeDto.from(updated)));
	}
}