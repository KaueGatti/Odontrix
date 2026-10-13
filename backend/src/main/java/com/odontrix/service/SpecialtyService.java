package com.odontrix.service;

import com.odontrix.dto.SpecialtyInput;
import com.odontrix.entity.Specialty;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.SpecialtyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/** Especialidades odontológicas (tabela de apoio) — soft-delete via active:false. */
@Service
public class SpecialtyService {

	private final SpecialtyRepository specialtyRepository;

	public SpecialtyService(SpecialtyRepository specialtyRepository) {
		this.specialtyRepository = specialtyRepository;
	}

	@Transactional(readOnly = true)
	public Page<Specialty> list(int page, int limit) {
		Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by(Sort.Direction.ASC, "id"));
		return specialtyRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public Specialty get(Integer id) {
		return specialtyRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Especialidade não encontrada"));
	}

	@Transactional
	public Specialty create(SpecialtyInput input) {
		if (specialtyRepository.existsByNameIgnoreCase(input.name())) {
			throw ApiException.unprocessable("Erro de validação", Map.of("name", "Nome já cadastrado"));
		}
		Specialty specialty = new Specialty();
		specialty.setName(input.name());
		specialty.setActive(input.active() == null || input.active());
		return specialtyRepository.save(specialty);
	}

	@Transactional
	public Specialty update(Integer id, SpecialtyInput input) {
		Specialty specialty = get(id);
		if (specialtyRepository.existsByNameIgnoreCaseAndIdNot(input.name(), id)) {
			throw ApiException.unprocessable("Erro de validação", Map.of("name", "Nome já cadastrado"));
		}
		specialty.setName(input.name());
		if (input.active() != null) {
			specialty.setActive(input.active());
		}
		return specialtyRepository.save(specialty);
	}
}