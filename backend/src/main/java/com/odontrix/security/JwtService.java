package com.odontrix.security;

import com.odontrix.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

	private final SecretKey key;

	public JwtService(@Value("${odontrix.security.jwt-secret}") String secret) {
		// Deriva via SHA-256 para aceitar secrets de qualquer tamanho e
		// garantir os 256 bits exigidos pelo HMAC-SHA256.
		this.key = Keys.hmacShaKeyFor(sha256(secret));
	}

	/**
	 * Emite um JWT assinado (HS256) com subject = e-mail e claims uid/profile.
	 */
	public String issue(User user, Duration ttl) {
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(user.getEmail())
				.claim("uid", user.getId())
				.claim("profile", user.getProfile().name())
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plus(ttl)))
				.signWith(key)
				.compact();
	}

	/**
	 * Valida assinatura e expiração e devolve os claims.
	 *
	 * @throws io.jsonwebtoken.JwtException token inválido ou expirado
	 */
	public Claims parse(String token) {
		return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
	}

	private static byte[] sha256(String secret) {
		try {
			return MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
		}
		catch (NoSuchAlgorithmException ex) {
			// SHA-256 é obrigatório em toda JVM — não deve acontecer nunca
			throw new IllegalStateException("SHA-256 indisponível", ex);
		}
	}
}
