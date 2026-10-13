package com.odontrix.dto;

import com.odontrix.entity.CostCenter;
import com.odontrix.entity.PaymentType;

/** Centro de custo para classificação de receitas e gastos. */
public record CostCenterDto(Integer id, String name, String description, PaymentType type, boolean active) {

	public static CostCenterDto from(CostCenter costCenter) {
		return new CostCenterDto(costCenter.getId(), costCenter.getName(), costCenter.getDescription(),
				costCenter.getType(), Boolean.TRUE.equals(costCenter.getActive()));
	}
}