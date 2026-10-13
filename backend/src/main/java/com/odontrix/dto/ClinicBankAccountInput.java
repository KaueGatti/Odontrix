package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Criação/edição de conta bancária — spec: required [bankName, agency, account, cedenteCode]. */
public record ClinicBankAccountInput(
		@NotBlank @Size(max = 100, message = "Nome do banco deve ter no máximo 100 caracteres") String bankName,
		@NotBlank @Size(max = 20, message = "Agência deve ter no máximo 20 caracteres") String agency,
		@NotBlank @Size(max = 20, message = "Conta deve ter no máximo 20 caracteres") String account,
		@NotBlank @Size(max = 30, message = "Código do cedente deve ter no máximo 30 caracteres") String cedenteCode,
		Boolean active) {
}