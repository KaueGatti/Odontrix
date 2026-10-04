package com.odontrix;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Smoke test: sobe o contexto completo com um PostgreSQL 16 efêmero
 * (Testcontainers). Valida de uma vez:
 * - o contexto do Spring Boot sobe;
 * - o Flyway aplica V1 (schema) + V2 (seed) sem erro;
 * - o Hibernate valida as entities contra o schema (ddl-auto: validate).
 *
 * Requer Docker rodando na máquina.
 */
@SpringBootTest
@Testcontainers
class OdontrixApplicationTests {

	@Container
	@ServiceConnection
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

	@Test
	void contextLoads() {
	}

}
