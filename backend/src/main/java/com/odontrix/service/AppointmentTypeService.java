package com.odontrix.service;

import com.odontrix.dto.AppointmentTypeInput;
import com.odontrix.entity.AppointmentType;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.AppointmentTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/** Tipos de consulta (tabela de apoio) — soft-delete via active:false. */
@Service
public class AppointmentTypeService {

	private final AppointmentTypeRepository appointmentTypeRepository;

	public AppointmentTypeService(AppointmentTypeRepository appointmentTypeRepository) {
		this.appointmentTypeRepository = appointmentTypeRepository;
	}

	@Transactional(readOnly = true)
	public Page<AppointmentType> list(int page, int limit) {
		Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by(Sort.Direction.ASC, "id"));
		return appointmentTypeRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public AppointmentType get(Integer id) {
		return appointmentTypeRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Tipo de consulta não encontrado"));
	}

	@Transactional
	public AppointmentType create(AppointmentTypeInput input) {
		if (appointmentTypeRepository.existsByNameIgnoreCase(input.name())) {
			throw ApiException.unprocessable("Erro de validação", Map.of("name", "Nome já cadastrado"));
		}
		AppointmentType type = new AppointmentType();
		type.setName(input.name());
		type.setDescription(input.description());
		type.setActive(input.active() == null || input.active());
		return appointmentTypeRepository.save(type);
	}

	@Transactional
	public AppointmentType update(Integer id, AppointmentTypeInput input) {
		AppointmentType type = get(id);
		if (appointmentTypeRepository.existsByNameIgnoreCaseAndIdNot(input.name(), id)) {
			throw ApiException.unprocessable("Erro de validação", Map.of("name", "Nome já cadastrado"));
		}
		type.setName(input.name());
		if (input.description() != null) {
			type.setDescription(input.description());
		}
		if (input.active() != null) {
			type.setActive(input.active());
		}
		return appointmentTypeRepository.save(type);
	}
}