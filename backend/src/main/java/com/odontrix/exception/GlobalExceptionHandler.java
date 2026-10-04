package com.odontrix.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Converte erros da aplicação em problem+json (RFC 7807), no formato
 * definido em {@code api/common.yaml} (Problem / ProblemValidation).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ProblemDetail> handleApiException(ApiException ex) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(ex.getStatus(), ex.getMessage());
		problem.setTitle(ex.getMessage());
		if (!ex.getFields().isEmpty()) {
			problem.setProperty("fields", ex.getFields());
		}
		return build(ex.getStatus(), problem);
	}

	/** Corpo inválido (@Valid no @RequestBody) → 422 com mapa de campos. */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, "Erro de validação");
		problem.setTitle("Erro de validação");
		Map<String, String> fields = new LinkedHashMap<>();
		ex.getBindingResult().getFieldErrors()
				.forEach(fieldError -> fields.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage()));
		problem.setProperty("fields", fields);
		return build(HttpStatus.UNPROCESSABLE_ENTITY, problem);
	}

	/** Constraints em parâmetros de handler (@RequestParam) → 422. */
	@ExceptionHandler(HandlerMethodValidationException.class)
	public ResponseEntity<ProblemDetail> handleHandlerMethodValidation(HandlerMethodValidationException ex) {
		return build(HttpStatus.UNPROCESSABLE_ENTITY,
				problem(HttpStatus.UNPROCESSABLE_ENTITY, "Erro de validação de parâmetros"));
	}

	/** @PreAuthorize negado dentro da camada MVC → 403. */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ProblemDetail> handleAccessDenied(AccessDeniedException ex) {
		return build(HttpStatus.FORBIDDEN,
				problem(HttpStatus.FORBIDDEN, "Sem permissão para esta ação"));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ProblemDetail> handleIntegrity(DataIntegrityViolationException ex) {
		log.debug("Violação de integridade", ex);
		return build(HttpStatus.CONFLICT,
				problem(HttpStatus.CONFLICT, "Operação em conflito com dados existentes"));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ProblemDetail> handleGeneric(Exception ex) {
		log.error("Erro não tratado", ex);
		return build(HttpStatus.INTERNAL_SERVER_ERROR,
				problem(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno inesperado"));
	}

	private ProblemDetail problem(HttpStatus status, String message) {
		ProblemDetail detail = ProblemDetail.forStatusAndDetail(status, message);
		detail.setTitle(message);
		return detail;
	}

	private ResponseEntity<ProblemDetail> build(HttpStatus status, ProblemDetail problem) {
		return ResponseEntity.status(status).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(problem);
	}
}
