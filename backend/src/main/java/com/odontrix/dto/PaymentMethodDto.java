package com.odontrix.dto;

import com.odontrix.entity.PaymentMethod;

/**
 * Forma de pagamento (tabela de apoio) — sem soft-delete no schema,
 * por isso a resposta não possui campo "active" (espelha a spec).
 */
public record PaymentMethodDto(Integer id, String description) {

	public static PaymentMethodDto from(PaymentMethod method) {
		return new PaymentMethodDto(method.getId(), method.getDescription());
	}
}