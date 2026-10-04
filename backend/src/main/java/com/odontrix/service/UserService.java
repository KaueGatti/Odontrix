package com.odontrix.service;

import com.odontrix.dto.AdminResetPasswordInput;
import com.odontrix.dto.UserInput;
import com.odontrix.dto.UserPatch;
import com.odontrix.entity.User;
import com.odontrix.entity.UserProfile;
import com.odontrix.exception.ApiException;
import com.odontrix.repository.UserRepository;
import com.odontrix.security.AuthenticatedUser;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	/**
	 * Diretório de contas — a conta 'system' (ações automáticas) nunca é
	 * exposta, respeitando o filtro da spec (UserFilter sem esse valor).
	 */
	@Transactional(readOnly = true)
	public Page<User> list(UserProfile profile, Boolean active, int page, int limit) {
		Specification<User> spec = (root, query, cb) -> {
			var predicates = new ArrayList<Predicate>();
			predicates.add(cb.notEqual(root.get("profile"), UserProfile.system));
			if (profile != null) {
				predicates.add(cb.equal(root.get("profile"), profile));
			}
			if (active != null) {
				predicates.add(cb.equal(root.get("active"), active));
			}
			return cb.and(predicates.toArray(new Predicate[0]));
		};
		Pageable pageable = PageRequest.of(Math.max(0, page - 1), limit, Sort.by(Sort.Direction.ASC, "id"));
		return userRepository.findAll(spec, pageable);
	}

	/** POST /users cria apenas contas manager — único perfil sem tabela própria. */
	@Transactional
	public User create(UserInput input) {
		Map<String, String> fields = new LinkedHashMap<>();
		if (userRepository.existsByEmailIgnoreCase(input.email())) {
			fields.put("email", "E-mail já cadastrado");
		}
		if (userRepository.existsByUsernameIgnoreCase(input.username())) {
			fields.put("username", "Nome de usuário já cadastrado");
		}
		if (!fields.isEmpty()) {
			throw ApiException.unprocessable("Erro de validação", fields);
		}

		User user = new User();
		user.setUsername(input.username());
		user.setEmail(input.email());
		user.setPasswordHash(passwordEncoder.encode(input.password()));
		user.setProfile(UserProfile.manager);
		user.setForcePasswordChange(Boolean.FALSE);
		user.setActive(Boolean.TRUE);
		return userRepository.save(user);
	}

	@Transactional(readOnly = true)
	public User get(Integer id) {
		return userRepository.findById(id)
				.orElseThrow(() -> ApiException.notFound("Usuário não encontrado"));
	}

	/** "profile" é imutável (não existe no patch); auto-edição/inativação → 403. */
	@Transactional
	public User patch(Integer id, UserPatch patch, AuthenticatedUser current) {
		if (id.equals(current.id())) {
			throw ApiException.forbidden("Não é permitido alterar a própria conta por este endpoint");
		}
		User user = get(id);

		if (patch.username() != null && !patch.username().isBlank()) {
			if (userRepository.existsByUsernameIgnoreCaseAndIdNot(patch.username(), id)) {
				throw ApiException.unprocessable("Erro de validação", Map.of("username", "Nome de usuário já cadastrado"));
			}
			user.setUsername(patch.username());
		}
		if (patch.email() != null && !patch.email().isBlank()) {
			if (userRepository.existsByEmailIgnoreCaseAndIdNot(patch.email(), id)) {
				throw ApiException.unprocessable("Erro de validação", Map.of("email", "E-mail já cadastrado"));
			}
			user.setEmail(patch.email());
		}
		if (patch.active() != null) {
			user.setActive(patch.active());
		}
		return userRepository.save(user);
	}

	/** Reset administrativo: senha provisória + troca obrigatória no próximo login. */
	@Transactional
	public void resetPassword(Integer id, AdminResetPasswordInput input) {
		User user = get(id);
		user.setPasswordHash(passwordEncoder.encode(input.newPassword()));
		user.setForcePasswordChange(Boolean.TRUE);
		userRepository.save(user);
	}
}
