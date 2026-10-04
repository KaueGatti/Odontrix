package com.odontrix.security;

import com.odontrix.entity.UserProfile;
import com.odontrix.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Extrai o Bearer token, valida e popula o SecurityContext com o usuário
 * atual (revalidado no banco — conta inativada ou profile 'system' derrubam
 * a sessão imediatamente).
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {

		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header != null && header.startsWith("Bearer ")) {
			try {
				Claims claims = jwtService.parse(header.substring(7));
				Integer userId = claims.get("uid", Integer.class);
				if (userId != null) {
					userRepository.findById(userId)
							.filter(user -> Boolean.TRUE.equals(user.getActive()))
							.filter(user -> user.getProfile() != UserProfile.system)
							.ifPresent(user -> {
								var principal = new AuthenticatedUser(user.getId(), user.getEmail(), user.getProfile());
								var authorities = List.of(new SimpleGrantedAuthority(user.getProfile().authority()));
								var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
								SecurityContextHolder.getContext().setAuthentication(authentication);
							});
				}
			}
			catch (JwtException | IllegalArgumentException ex) {
				// token inválido/expirado → segue sem autenticação; o Spring Security responde 401
				SecurityContextHolder.clearContext();
			}
		}

		chain.doFilter(request, response);
	}
}
