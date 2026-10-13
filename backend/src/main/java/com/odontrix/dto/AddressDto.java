package com.odontrix.dto;

import com.odontrix.entity.Address;

/** Representação do endereço na API — value object embutido (ver api/common.yaml#Address). */
public record AddressDto(String cep, String street, String number, String complement,
                         String neighborhood, String city, String state, String country) {

	public static AddressDto from(Address address) {
		return new AddressDto(address.getCep(), address.getStreet(), address.getNumber(),
				address.getComplement(), address.getNeighborhood(), address.getCity(),
				address.getState(), address.getCountry());
	}
}