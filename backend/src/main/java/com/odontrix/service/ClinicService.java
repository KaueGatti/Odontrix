package com.odontrix.service;

import com.odontrix.dto.ClinicPatch;
import com.odontrix.entity.Address;
import com.odontrix.entity.Clinic;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.AddressRepository;
import com.odontrix.repository.ClinicRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Dados cadastrais da clínica — recurso singleton (o piloto considera uma
 * única clínica, sem clinic_id nas demais tabelas).
 */
@Service
public class ClinicService {

	private final ClinicRepository clinicRepository;
	private final AddressRepository addressRepository;

	public ClinicService(ClinicRepository clinicRepository, AddressRepository addressRepository) {
		this.clinicRepository = clinicRepository;
		this.addressRepository = addressRepository;
	}

	@Transactional(readOnly = true)
	public Clinic get() {
		return clinicRepository.findAll(PageRequest.of(0, 1)).stream().findFirst()
				.orElseThrow(() -> ApiException.notFound("Clínica não cadastrada"));
	}

	/**
	 * PATCH parcial: campos nulos/em branco preservam o valor atual; o
	 * endereço embutido é atualizado in-place (criado apenas se inexistente).
	 */
	@Transactional
	public Clinic update(ClinicPatch patch) {
		Clinic clinic = get();

		if (patch.name() != null && !patch.name().isBlank()) {
			clinic.setName(patch.name());
		}
		if (patch.cnpj() != null && !patch.cnpj().isBlank()) {
			if (clinicRepository.existsByCnpjAndIdNot(patch.cnpj(), clinic.getId())) {
				throw ApiException.unprocessable("Erro de validação", Map.of("cnpj", "CNPJ já cadastrado"));
			}
			clinic.setCnpj(patch.cnpj());
		}
		if (patch.logoUrl() != null && !patch.logoUrl().isBlank()) {
			clinic.setLogoUrl(patch.logoUrl());
		}
		if (patch.phone() != null && !patch.phone().isBlank()) {
			clinic.setPhone(patch.phone());
		}
		if (patch.contactEmail() != null && !patch.contactEmail().isBlank()) {
			clinic.setContactEmail(patch.contactEmail());
		}
		if (patch.openingTime() != null) {
			clinic.setOpeningTime(patch.openingTime());
		}
		if (patch.closingTime() != null) {
			clinic.setClosingTime(patch.closingTime());
		}
		applyAddress(clinic, patch.address());

		return clinicRepository.save(clinic);
	}

	private void applyAddress(Clinic clinic, com.odontrix.dto.AddressInput input) {
		if (input == null) {
			return;
		}
		Address address = clinic.getAddress();
		if (address == null) {
			address = new Address();
		}
		address.setCep(input.cep());
		address.setStreet(input.street());
		address.setNumber(input.number());
		// Coluna complement é NOT NULL no schema — ausência vira string vazia
		address.setComplement(input.complement() == null ? "" : input.complement());
		address.setNeighborhood(input.neighborhood());
		address.setCity(input.city());
		address.setState(input.state());
		address.setCountry(input.country() == null || input.country().isBlank() ? "Brasil" : input.country());
		clinic.setAddress(addressRepository.save(address));
	}
}