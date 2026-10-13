package com.odontrix.service;

import com.odontrix.dto.PaymentMethodInput;
import com.odontrix.entity.PaymentMethod;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.PaymentMethodRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Formas de pagamento (tabela de apoio) — sem soft-delete no schema,
 * por isso o PATCH edita apenas a descrição.
 */
@Service
public class PaymentMethodService {

	private final PaymentMethodRepository paymentMethodRepository;

	public PaymentMethodService(PaymentMethodRepository paymentMethodRepository) {
		this.paymentMethodRepository = paymentMethodRepository;
	}

	@Transactional(readOnly = true)
	public List<PaymentMethod> list() {
		return paymentMethodRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
	}

	@Transactional(readOnly = true)
	public PaymentMethod get(Integer id) {
		return paymentMethodRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Forma de pagamento não encontrada"));
	}

	@Transactional
	public PaymentMethod create(PaymentMethodInput input) {
		PaymentMethod method = new PaymentMethod();
		method.setDescription(input.description());
		return paymentMethodRepository.save(method);
	}

	@Transactional
	public PaymentMethod update(Integer id, PaymentMethodInput input) {
		PaymentMethod method = get(id);
		method.setDescription(input.description());
		return paymentMethodRepository.save(method);
	}
}