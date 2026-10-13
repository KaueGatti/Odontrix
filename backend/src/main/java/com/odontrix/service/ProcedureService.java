package com.odontrix.service;

import com.odontrix.dto.ProcedureInput;
import com.odontrix.entity.DentalProcedure;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.DentalProcedureRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Locale;

/**
 * Catálogo de procedimentos odontológicos e preços de referência. Alterar
 * {@code referencePrice} aqui não afeta os snapshots congelados em
 * appointment_procedure / quote_procedure.
 */
@Service
public class ProcedureService {

	private final DentalProcedureRepository dentalProcedureRepository;

	public ProcedureService(DentalProcedureRepository dentalProcedureRepository) {
		this.dentalProcedureRepository = dentalProcedureRepository;
	}

	@Transactional(readOnly = true)
	public Page<DentalProcedure> list(Boolean active, String name, int page, int limit) {
		Specification<DentalProcedure> spec = (root, query, cb) -> {
			var predicates = new ArrayList<Predicate>();
			if (active != null) {
				predicates.add(cb.equal(root.get("active"), active));
			}
			if (name != null && !name.isBlank()) {
				predicates.add(cb.like(cb.lower(root.get("name")),
						"%" + name.trim().toLowerCase(Locale.ROOT) + "%"));
			}
			return cb.and(predicates.toArray(new Predicate[0]));
		};
		Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by(Sort.Direction.ASC, "id"));
		return dentalProcedureRepository.findAll(spec, pageable);
	}

	@Transactional(readOnly = true)
	public DentalProcedure get(Integer id) {
		return dentalProcedureRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Procedimento não encontrado"));
	}

	@Transactional
	public DentalProcedure create(ProcedureInput input) {
		DentalProcedure procedure = new DentalProcedure();
		procedure.setName(input.name());
		procedure.setDescription(input.description());
		procedure.setReferencePrice(input.referencePrice());
		procedure.setActive(input.active() == null || input.active());
		return dentalProcedureRepository.save(procedure);
	}

	@Transactional
	public DentalProcedure update(Integer id, ProcedureInput input) {
		DentalProcedure procedure = get(id);
		procedure.setName(input.name());
		if (input.description() != null) {
			procedure.setDescription(input.description());
		}
		procedure.setReferencePrice(input.referencePrice());
		if (input.active() != null) {
			procedure.setActive(input.active());
		}
		return dentalProcedureRepository.save(procedure);
	}
}