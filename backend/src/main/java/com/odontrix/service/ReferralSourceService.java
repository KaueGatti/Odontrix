package com.odontrix.service;

import com.odontrix.dto.ReferralSourceInput;
import com.odontrix.entity.ReferralSource;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.ReferralSourceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Origens do paciente (tabela de apoio) — soft-delete via active:false. */
@Service
public class ReferralSourceService {

	private final ReferralSourceRepository referralSourceRepository;

	public ReferralSourceService(ReferralSourceRepository referralSourceRepository) {
		this.referralSourceRepository = referralSourceRepository;
	}

	@Transactional(readOnly = true)
	public Page<ReferralSource> list(int page, int limit) {
		Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by(Sort.Direction.ASC, "id"));
		return referralSourceRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public ReferralSource get(Integer id) {
		return referralSourceRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Origem não encontrada"));
	}

	@Transactional
	public ReferralSource create(ReferralSourceInput input) {
		ReferralSource source = new ReferralSource();
		source.setDescription(input.description());
		source.setActive(input.active() == null || input.active());
		return referralSourceRepository.save(source);
	}

	@Transactional
	public ReferralSource update(Integer id, ReferralSourceInput input) {
		ReferralSource source = get(id);
		source.setDescription(input.description());
		if (input.active() != null) {
			source.setActive(input.active());
		}
		return referralSourceRepository.save(source);
	}
}