package com.odontrix.dto;

import com.odontrix.entity.Clinic;

import java.time.OffsetDateTime;
import java.time.LocalTime;

/** Dados cadastrais da clínica — recurso singleton (GET/PATCH /clinic). */
public record ClinicDto(Integer id, String name, String cnpj, String logoUrl, String phone,
                        String contactEmail, AddressDto address, LocalTime openingTime, LocalTime closingTime,
                        boolean active, OffsetDateTime createdAt) {

	public static ClinicDto from(Clinic clinic) {
		return new ClinicDto(clinic.getId(), clinic.getName(), clinic.getCnpj(), clinic.getLogoUrl(),
				clinic.getPhone(), clinic.getContactEmail(),
				clinic.getAddress() == null ? null : AddressDto.from(clinic.getAddress()),
				clinic.getOpeningTime(), clinic.getClosingTime(),
				Boolean.TRUE.equals(clinic.getActive()), clinic.getCreatedAt());
	}
}