package com.odontrix.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Exceção de domínio com status HTTP associado — o {@link GlobalExceptionHandler}
 * a converte em problem+json (RFC 7807).
 */
public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final Map<String, String> fields;

	public ApiException(HttpStatus status, String message) {
		this(status, message, Map.of());
	}

	public ApiException(HttpStatus status, String message, Map<String, String> fields) {
		super(message);
		this.status = status;
		this.fields = fields;
	}

	public static ApiException unauthorized(String message) {
		return new ApiException(HttpStatus.UNAUTHORIZED, message);
	}

	public static ApiException forbidden(String message) {
		return new ApiException(HttpStatus.FORBIDDEN, message);
	}

	public static ApiException notFound(String message) {
		return new ApiException(HttpStatus.NOT_FOUND, message);
	}

	public static ApiException conflict(String message) {
		return new ApiException(HttpStatus.CONFLICT, message);
	}

	public static ApiException unprocessable(String message, Map<String, String> fields) {
		return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, message, fields);
	}

	public HttpStatus getStatus() {
		return status;
	}

	public Map<String, String> getFields() {
		return fields;
	}
}
