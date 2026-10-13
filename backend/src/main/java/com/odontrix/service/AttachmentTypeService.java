package com.odontrix.service;

import com.odontrix.dto.AttachmentTypeInput;
import com.odontrix.entity.AttachmentType;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.AttachmentTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Tipos de anexo (tabela de apoio) — soft-delete via active:false. */
@Service
public class AttachmentTypeService {

	private final AttachmentTypeRepository attachmentTypeRepository;

	public AttachmentTypeService(AttachmentTypeRepository attachmentTypeRepository) {
		this.attachmentTypeRepository = attachmentTypeRepository;
	}

	@Transactional(readOnly = true)
	public Page<AttachmentType> list(int page, int limit) {
		Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by(Sort.Direction.ASC, "id"));
		return attachmentTypeRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public AttachmentType get(Integer id) {
		return attachmentTypeRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Tipo de anexo não encontrado"));
	}

	@Transactional
	public AttachmentType create(AttachmentTypeInput input) {
		AttachmentType type = new AttachmentType();
		type.setDescription(input.description());
		type.setActive(input.active() == null || input.active());
		return attachmentTypeRepository.save(type);
	}

	@Transactional
	public AttachmentType update(Integer id, AttachmentTypeInput input) {
		AttachmentType type = get(id);
		type.setDescription(input.description());
		if (input.active() != null) {
			type.setActive(input.active());
		}
		return attachmentTypeRepository.save(type);
	}
}