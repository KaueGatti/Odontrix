package com.odontrix.controller;

import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.ChangePasswordInput;
import com.odontrix.dto.LoginInput;
import com.odontrix.dto.LoginResult;
import com.odontrix.dto.UserDto;
import com.odontrix.security.AuthenticatedUser;
import com.odontrix.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<LoginResult>> login(@Valid @RequestBody LoginInput input) {
		return ResponseEntity.ok(ApiResponse.of(authService.login(input)));
	}

	/**
	 * Sessão stateless (JWT): o logout se efetiva pelo descarte do token no
	 * cliente; o token expira sozinho em session_timeout_minutes. Endpoint
	 * mantido por compatibilidade com o contrato da spec.
	 */
	@PostMapping("/logout")
	public ResponseEntity<Void> logout() {
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/me")
	public ResponseEntity<ApiResponse<UserDto>> me(@AuthenticationPrincipal AuthenticatedUser current) {
		return ResponseEntity.ok(ApiResponse.of(authService.me(current)));
	}

	@PostMapping("/change-password")
	public ResponseEntity<Void> changePassword(@AuthenticationPrincipal AuthenticatedUser current,
			@Valid @RequestBody ChangePasswordInput input) {
		authService.changePassword(current, input);
		return ResponseEntity.noContent().build();
	}
}
