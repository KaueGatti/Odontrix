package com.odontrix.service;

import com.odontrix.dto.CostCenterInput;
import com.odontrix.entity.CostCenter;
import com.odontrix.entity.PaymentType;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.CostCenterRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Centros de custo (tabela de apoio) — soft-delete via active:false. */
@Service
public class CostCenterService {

	private final CostCenterRepository costCenterRepository;

	public CostCenterService(CostCenterRepository costCenterRepository) {
		this.costCenterRepository = costCenterRepository;
	}

	@Transactional(readOnly = true)
	public List<CostCenter> list(PaymentType type, Boolean active) {
		Specification<CostCenter> spec = (root, query, cb) -> {
			var predicates = new ArrayList<Predicate>();
			if (type != null) {
				predicates.add(cb.equal(root.get("type"), type));
			}
			if (active != null) {
				predicates.add(cb.equal(root.get("active"), active));
			}
			return cb.and(predicates.toArray(new Predicate[0]));
		};
		return costCenterRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "id"));
	}

	@Transactional(readOnly = true)
	public CostCenter get(Integer id) {
		return costCenterRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Centro de custo não encontrado"));
	}

	@Transactional
	public CostCenter create(CostCenterInput input) {
		if (costCenterRepository.existsByNameIgnoreCase(input.name())) {
			throw ApiException.unprocessable("Erro de validação", Map.of("name", "Nome já cadastrado"));
		}
		CostCenter costCenter = new CostCenter();
		costCenter.setName(input.name());
		costCenter.setDescription(input.description());
		costCenter.setType(input.type());
		costCenter.setActive(input.active() == null || input.active());
		return costCenterRepository.save(costCenter);
	}

	@Transactional
	public CostCenter update(Integer id, CostCenterInput input) {
		CostCenter costCenter = get(id);
		if (costCenterRepository.existsByNameIgnoreCaseAndIdNot(input.name(), id)) {
			throw ApiException.unprocessable("Erro de validação", Map.of("name", "Nome já cadastrado"));
		}
		costCenter.setName(input.name());
		if (input.description() != null) {
			costCenter.setDescription(input.description());
		}
		if (input.type() != null) {
			costCenter.setType(input.type());
		}
		if (input.active() != null) {
			costCenter.setActive(input.active());
		}
		return costCenterRepository.save(costCenter);
	}
}