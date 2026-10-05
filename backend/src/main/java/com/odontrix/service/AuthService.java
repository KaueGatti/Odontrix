package com.odontrix.service;

import com.odontrix.dto.ChangePasswordInput;
import com.odontrix.dto.LoginInput;
import com.odontrix.dto.LoginResult;
import com.odontrix.dto.UserDto;
import com.odontrix.entity.ClinicSettings;
import com.odontrix.entity.User;
import com.odontrix.entity.UserProfile;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.ClinicSettingsRepository;
import com.odontrix.repository.UserRepository;
import com.odontrix.security.AuthenticatedUser;
import com.odontrix.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
public class AuthService {

	/** Fallback caso clinic_settings esteja vazia (ex.: banco recém-migrado). */
	private static final int DEFAULT_SESSION_TIMEOUT_MINUTES = 15;

	private final UserRepository userRepository;
	private final ClinicSettingsRepository clinicSettingsRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, ClinicSettingsRepository clinicSettingsRepository,
			PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.clinicSettingsRepository = clinicSettingsRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	/**
	 * Login por nome de usuário OU e-mail (ambos únicos) + senha.
	 * Diferencia deliberadamente 401 (credenciais inválidas) de 403
	 * (conta inativa), conforme o contrato de /auth/login.
	 */
	@Transactional(readOnly = true)
	public LoginResult login(LoginInput input) {
		User user = userRepository.findByEmailIgnoreCase(input.login())
				.or(() -> userRepository.findByUsernameIgnoreCase(input.login()))
				.orElseThrow(() -> ApiException.unauthorized("E-mail ou senha inválidos"));

		if (!passwordEncoder.matches(input.password(), user.getPasswordHash())) {
			throw ApiException.unauthorized("E-mail ou senha inválidos");
		}

		if (!Boolean.TRUE.equals(user.getActive()) || user.getProfile() == UserProfile.system) {
			throw ApiException.forbidden("Conta inativa");
		}

		String token = jwtService.issue(user, sessionTimeout());
		return new LoginResult(token, UserDto.from(user), Boolean.TRUE.equals(user.getForcePasswordChange()));
	}

	@Transactional(readOnly = true)
	public UserDto me(AuthenticatedUser current) {
		return userRepository.findById(current.id())
				.map(UserDto::from)
				.orElseThrow(() -> ApiException.notFound("Usuário não encontrado"));
	}

	@Transactional
	public void changePassword(AuthenticatedUser current, ChangePasswordInput input) {
		User user = userRepository.findById(current.id())
				.orElseThrow(() -> ApiException.notFound("Usuário não encontrado"));

		if (!passwordEncoder.matches(input.currentPassword(), user.getPasswordHash())) {
			throw ApiException.unauthorized("Senha atual incorreta");
		}

		user.setPasswordHash(passwordEncoder.encode(input.newPassword()));
		user.setForcePasswordChange(Boolean.FALSE);
		userRepository.save(user);
	}

	/** Expiração do token = session_timeout_minutes da clínica (spec do MINI-WORLD). */
	private Duration sessionTimeout() {
		return clinicSettingsRepository.findAll().stream()
				.findFirst()
				.map(ClinicSettings::getSessionTimeoutMinutes)
				.map(minutes -> Duration.ofMinutes(Math.max(1, minutes)))
				.orElse(Duration.ofMinutes(DEFAULT_SESSION_TIMEOUT_MINUTES));
	}
}
