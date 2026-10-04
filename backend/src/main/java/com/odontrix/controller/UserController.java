package com.odontrix.controller;

import com.odontrix.dto.AdminResetPasswordInput;
import com.odontrix.dto.ApiResponse;
import com.odontrix.dto.PaginationMeta;
import com.odontrix.dto.UserDto;
import com.odontrix.dto.UserInput;
import com.odontrix.dto.UserPatch;
import com.odontrix.entity.User;
import com.odontrix.entity.UserProfile;
import com.odontrix.security.AuthenticatedUser;
import com.odontrix.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Gestão de contas de usuário — x-required-roles: manager em todas as
 * operações (ver api/entities/users.yaml e matriz-permissoes.md).
 */
@RestController
@RequestMapping("/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<List<UserDto>>> list(
			@RequestParam(defaultValue = "1") @Positive int page,
			@RequestParam(defaultValue = "20") @Positive @Max(100) int limit,
			@RequestParam(name = "filter[profile]", required = false) UserProfile profile,
			@RequestParam(name = "filter[active]", required = false) Boolean active) {
		Page<User> result = userService.list(profile, active, page, limit);
		return ResponseEntity.ok(ApiResponse.of(
				result.getContent().stream().map(UserDto::from).toList(),
				PaginationMeta.from(result, page, limit)));
	}

	@PostMapping
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<UserDto>> create(@Valid @RequestBody UserInput input) {
		User created = userService.create(input);
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(UserDto.from(created)));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<UserDto>> get(@PathVariable Integer id) {
		return ResponseEntity.ok(ApiResponse.of(UserDto.from(userService.get(id))));
	}

	@PatchMapping("/{id}")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<UserDto>> patch(@PathVariable Integer id,
			@Valid @RequestBody UserPatch patch,
			@AuthenticationPrincipal AuthenticatedUser current) {
		return ResponseEntity.ok(ApiResponse.of(UserDto.from(userService.patch(id, patch, current))));
	}

	@PostMapping("/{id}/reset-password")
	@PreAuthorize("hasRole('MANAGER')")
	public ResponseEntity<ApiResponse<Map<String, Boolean>>> resetPassword(@PathVariable Integer id,
			@Valid @RequestBody AdminResetPasswordInput input) {
		userService.resetPassword(id, input);
		return ResponseEntity.ok(ApiResponse.of(Map.of("forcePasswordChange", Boolean.TRUE)));
	}
}
