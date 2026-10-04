package com.odontrix.dto;

import org.springframework.data.domain.Page;

/** Metadados de paginação — espelha {@code api/common.yaml#PaginationMeta}. */
public record PaginationMeta(long total, int page, int perPage, int totalPages) {

	public static PaginationMeta from(Page<?> page, int requestedPage, int requestedPerPage) {
		return new PaginationMeta(page.getTotalElements(), requestedPage, requestedPerPage, page.getTotalPages());
	}
}
