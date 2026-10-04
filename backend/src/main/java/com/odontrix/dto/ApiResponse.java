package com.odontrix.dto;

/**
 * Envelope padronizado de resposta da API: {@code { "data": ..., "meta": ... }}.
 */
public record ApiResponse<T>(T data, PaginationMeta meta) {

	public static <T> ApiResponse<T> of(T data) {
		return new ApiResponse<>(data, null);
	}

	public static <T> ApiResponse<T> of(T data, PaginationMeta meta) {
		return new ApiResponse<>(data, meta);
	}
}
