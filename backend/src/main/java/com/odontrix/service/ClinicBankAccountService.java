package com.odontrix.service;

import com.odontrix.dto.ClinicBankAccountInput;
import com.odontrix.entity.ClinicBankAccount;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.ClinicBankAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Contas bancárias usadas na emissão de boletos — gestão restrita ao manager. */
@Service
public class ClinicBankAccountService {

	private final ClinicBankAccountRepository clinicBankAccountRepository;

	public ClinicBankAccountService(ClinicBankAccountRepository clinicBankAccountRepository) {
		this.clinicBankAccountRepository = clinicBankAccountRepository;
	}

	@Transactional(readOnly = true)
	public List<ClinicBankAccount> list() {
		return clinicBankAccountRepository.findAll(org.springframework.data.domain.Sort.by(
				org.springframework.data.domain.Sort.Direction.ASC, "id"));
	}

	@Transactional(readOnly = true)
	public ClinicBankAccount get(Integer id) {
		return clinicBankAccountRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Conta bancária não encontrada"));
	}

	@Transactional
	public ClinicBankAccount create(ClinicBankAccountInput input) {
		ClinicBankAccount account = new ClinicBankAccount();
		account.setBankName(input.bankName());
		account.setAgency(input.agency());
		account.setAccount(input.account());
		account.setCedenteCode(input.cedenteCode());
		account.setActive(input.active() == null || input.active());
		return clinicBankAccountRepository.save(account);
	}

	/** Não há exclusão — apenas inativação via "active:false". */
	@Transactional
	public ClinicBankAccount update(Integer id, ClinicBankAccountInput input) {
		ClinicBankAccount account = get(id);
		account.setBankName(input.bankName());
		account.setAgency(input.agency());
		account.setAccount(input.account());
		account.setCedenteCode(input.cedenteCode());
		if (input.active() != null) {
			account.setActive(input.active());
		}
		return clinicBankAccountRepository.save(account);
	}
}