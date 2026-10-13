package com.odontrix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Endereço no corpo de requisições (value object da spec — required
 * [cep, street, number, neighborhood, city, state]; country assume "Brasil").
 */
public record AddressInput(
		@NotBlank @Size(max = 10, message = "CEP deve ter no máximo 10 caracteres") String cep,
		@NotBlank @Size(max = 200, message = "Logradouro deve ter no máximo 200 caracteres") String street,
		@NotBlank @Size(max = 20, message = "Número deve ter no máximo 20 caracteres") String number,
		@Size(max = 50, message = "Complemento deve ter no máximo 50 caracteres") String complement,
		@NotBlank @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres") String neighborhood,
		@NotBlank @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres") String city,
		@NotBlank @Size(max = 50, message = "Estado deve ter no máximo 50 caracteres") String state,
		@Size(max = 50, message = "País deve ter no máximo 50 caracteres") String country) {
}