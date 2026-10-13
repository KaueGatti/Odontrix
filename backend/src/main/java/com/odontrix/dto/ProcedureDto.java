package com.odontrix.dto;

import com.odontrix.entity.DentalProcedure;

import java.math.BigDecimal;

/** Procedimento do catálogo odontológico e seu preço de referência. */
public record ProcedureDto(Integer id, String name, String description, BigDecimal referencePrice,
                           boolean active) {

	public static ProcedureDto from(DentalProcedure procedure) {
		return new ProcedureDto(procedure.getId(), procedure.getName(), procedure.getDescription(),
				procedure.getReferencePrice(), Boolean.TRUE.equals(procedure.getActive()));
	}
}