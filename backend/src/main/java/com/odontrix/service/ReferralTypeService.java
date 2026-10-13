package com.odontrix.service;

import com.odontrix.dto.ReferralTypeInput;
import com.odontrix.entity.ReferralType;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.ReferralTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tipos de indicação (tabela de apoio) — classifica QUEM indicou o paciente;
 * {@code requiresReferrer = true} obriga o nome do indicador no cadastro.
 */
@Service
public class ReferralTypeService {

	private final ReferralTypeRepository referralTypeRepository;

	public ReferralTypeService(ReferralTypeRepository referralTypeRepository) {
		this.referralTypeRepository = referralTypeRepository;
	}

	@Transactional(readOnly = true)
	public Page<ReferralType> list(int page, int limit) {
		Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by(Sort.Direction.ASC, "id"));
		return referralTypeRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public ReferralType get(Integer id) {
		return referralTypeRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Tipo de indicação não encontrado"));
	}

	@Transactional
	public ReferralType create(ReferralTypeInput input) {
		ReferralType type = new ReferralType();
		type.setDescription(input.description());
		type.setRequiresReferrer(Boolean.TRUE.equals(input.requiresReferrer()));
		type.setActive(input.active() == null || input.active());
		return referralTypeRepository.save(type);
	}

	@Transactional
	public ReferralType update(Integer id, ReferralTypeInput input) {
		ReferralType type = get(id);
		type.setDescription(input.description());
		if (input.requiresReferrer() != null) {
			type.setRequiresReferrer(input.requiresReferrer());
		}
		if (input.active() != null) {
			type.setActive(input.active());
		}
		return referralTypeRepository.save(type);
	}
}