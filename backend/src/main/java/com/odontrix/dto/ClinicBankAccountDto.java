package com.odontrix.dto;

import com.odontrix.entity.ClinicBankAccount;

import java.time.OffsetDateTime;

/** Conta bancária usada na emissão de boletos. */
public record ClinicBankAccountDto(Integer id, String bankName, String agency, String account,
                                   String cedenteCode, boolean active, OffsetDateTime updatedAt) {

	public static ClinicBankAccountDto from(ClinicBankAccount account) {
		return new ClinicBankAccountDto(account.getId(), account.getBankName(), account.getAgency(),
				account.getAccount(), account.getCedenteCode(),
				Boolean.TRUE.equals(account.getActive()), account.getUpdatedAt());
	}
}