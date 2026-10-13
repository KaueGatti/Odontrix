package com.odontrix.service;

import com.odontrix.dto.CancellationReasonInput;
import com.odontrix.entity.CancellationReason;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.CancellationReasonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/** Motivos de cancelamento (tabela de apoio) — soft-delete via active:false. */
@Service
public class CancellationReasonService {

	private final CancellationReasonRepository cancellationReasonRepository;

	public CancellationReasonService(CancellationReasonRepository cancellationReasonRepository) {
		this.cancellationReasonRepository = cancellationReasonRepository;
	}

	@Transactional(readOnly = true)
	public Page<CancellationReason> list(int page, int limit) {
		Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by(Sort.Direction.ASC, "id"));
		return cancellationReasonRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public CancellationReason get(Integer id) {
		return cancellationReasonRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Motivo de cancelamento não encontrado"));
	}

	@Transactional
	public CancellationReason create(CancellationReasonInput input) {
		if (cancellationReasonRepository.existsByDescriptionIgnoreCase(input.description())) {
			throw ApiException.unprocessable("Erro de validação",
					Map.of("description", "Descrição já cadastrada"));
		}
		CancellationReason reason = new CancellationReason();
		reason.setDescription(input.description());
		reason.setActive(input.active() == null || input.active());
		return cancellationReasonRepository.save(reason);
	}

	@Transactional
	public CancellationReason update(Integer id, CancellationReasonInput input) {
		CancellationReason reason = get(id);
		if (cancellationReasonRepository.existsByDescriptionIgnoreCaseAndIdNot(input.description(), id)) {
			throw ApiException.unprocessable("Erro de validação",
					Map.of("description", "Descrição já cadastrada"));
		}
		reason.setDescription(input.description());
		if (input.active() != null) {
			reason.setActive(input.active());
		}
		return cancellationReasonRepository.save(reason);
	}
}