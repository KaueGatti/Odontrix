package com.odontrix.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

/** Edição dos dados cadastrais da clínica — PATCH /clinic (manager). */
public record ClinicPatch(
		@Size(max = 150, message = "Nome deve ter no máximo 150 caracteres") String name,
		@Size(max = 18, message = "CNPJ deve ter no máximo 18 caracteres") String cnpj,
		String logoUrl,
		@Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres") String phone,
		@Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres") String contactEmail,
		@Valid AddressInput address,
		LocalTime openingTime,
		LocalTime closingTime) {
}