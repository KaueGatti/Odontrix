package com.odontrix;

import com.jayway.jsonpath.JsonPath;
import com.odontrix.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração de /auth e /users contra um PostgreSQL 16 efêmero
 * (Testcontainers) com o seed completo do Flyway aplicado.
 *
 * Senha de todos os usuários do seed: dev12345.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class AuthIntegrationTest {

	@Container
	@ServiceConnection
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

	@Autowired
	MockMvc mockMvc;

	@Autowired
	UserRepository userRepository;

	// ------------------------------------------------------------
	// login
	// ------------------------------------------------------------

	@Test
	void loginComCredenciaisValidasRetornaTokenEUsuario() throws Exception {
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "ana.gerente@sorrisopleno.com.br", "password": "dev12345"}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.token").isNotEmpty())
				.andExpect(jsonPath("$.data.user.username").value("gerente.ana"))
				.andExpect(jsonPath("$.data.user.profile").value("manager"))
				.andExpect(jsonPath("$.data.user.active").value(true))
				.andExpect(jsonPath("$.data.forcePasswordChange").value(false));
	}

	@Test
	void loginPorUsernameRetornaTokenEUsuario() throws Exception {
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "gerente.ana", "password": "dev12345"}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.token").isNotEmpty())
				.andExpect(jsonPath("$.data.user.username").value("gerente.ana"))
				.andExpect(jsonPath("$.data.user.email").value("ana.gerente@sorrisopleno.com.br"));
	}

	@Test
	void loginComSenhaErraRetorna401ProblemJson() throws Exception {
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "ana.gerente@sorrisopleno.com.br", "password": "senha-errada"}"""))
				.andExpect(status().isUnauthorized())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"))
				.andExpect(jsonPath("$.title").value("E-mail ou senha inválidos"));
	}

	@Test
	void loginDeEmailInexistenteRetorna401() throws Exception {
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "ninguem@sorrisopleno.com.br", "password": "dev12345"}"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginDeContaInativaRetorna403() throws Exception {
		// usuário "sistema" (profile system, active=false) nunca pode logar
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "sistema@sorrisopleno.internal", "password": "dev12345"}"""))
				.andExpect(status().isForbidden())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"));
	}

	@Test
	void loginComBodyInvalidoRetorna422ComCampos() throws Exception {
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "", "password": ""}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.fields.login").exists())
				.andExpect(jsonPath("$.fields.password").exists());
	}

	// ------------------------------------------------------------
	// /auth/me
	// ------------------------------------------------------------

	@Test
	void meSemTokenRetorna401() throws Exception {
		mockMvc.perform(get("/auth/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"));
	}

	@Test
	void meComTokenRetornaUsuarioAtual() throws Exception {
		String token = login("ana.gerente@sorrisopleno.com.br", "dev12345");

		mockMvc.perform(get("/auth/me").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.email").value("ana.gerente@sorrisopleno.com.br"))
				.andExpect(jsonPath("$.data.profile").value("manager"))
				.andExpect(jsonPath("$.data.forcePasswordChange").value(false));
	}

	@Test
	void meComTokenInvalidoRetorna401() throws Exception {
		mockMvc.perform(get("/auth/me").header("Authorization", "Bearer token-invalido"))
				.andExpect(status().isUnauthorized());
	}

	// ------------------------------------------------------------
	// /users (x-required-roles: manager)
	// ------------------------------------------------------------

	@Test
	void usersSemTokenRetorna401() throws Exception {
		mockMvc.perform(get("/users"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void usersComTokenDeRecepcionistaRetorna403() throws Exception {
		String token = login("bruna.recepcao@sorrisopleno.com.br", "dev12345");

		mockMvc.perform(get("/users").header("Authorization", "Bearer " + token))
				.andExpect(status().isForbidden())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"));
	}

	@Test
	void usersComTokenDeGerenteListaSemContaSystemaEPaginado() throws Exception {
		String token = login("ana.gerente@sorrisopleno.com.br", "dev12345");

		mockMvc.perform(get("/users")
						.param("page", "1")
						.param("limit", "2")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.meta.total").value(5))
				.andExpect(jsonPath("$.meta.page").value(1))
				.andExpect(jsonPath("$.meta.perPage").value(2))
				.andExpect(jsonPath("$.meta.totalPages").value(3))
				.andExpect(jsonPath("$.data", hasSize(2)))
				// a conta 'sistema' (id 6) nunca aparece no diretório
				.andExpect(jsonPath("$.data[*].username", everyItem(not(equalTo("sistema")))));
	}

	@Test
	void usersCreateDeGerenteCriaManager() throws Exception {
		String token = login("ana.gerente@sorrisopleno.com.br", "dev12345");

		mockMvc.perform(post("/users")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username": "gerente.novo", "email": "novo.gerente@sorrisopleno.com.br", "password": "senha-forte-123"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.profile").value("manager"))
				.andExpect(jsonPath("$.data.active").value(true));

		// limpa o usuário criado para não vazar estado para os demais testes
		// (o teste de listagem depende do total exato de usuários do seed)
		userRepository.findByEmailIgnoreCase("novo.gerente@sorrisopleno.com.br")
				.ifPresent(userRepository::delete);
	}

	@Test
	void usersCreateComEmailDuplicadoRetorna422() throws Exception {
		String token = login("ana.gerente@sorrisopleno.com.br", "dev12345");

		mockMvc.perform(post("/users")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username": "gerente.outro", "email": "ana.gerente@sorrisopleno.com.br", "password": "senha-forte-123"}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.fields.email").exists());
	}

	@Test
	void usersPatchPropriaContaRetorna403() throws Exception {
		String token = login("ana.gerente@sorrisopleno.com.br", "dev12345");

		// id 1 = ana.gerente — não pode alterar a própria conta
		mockMvc.perform(patch("/users/1")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"active": false}"""))
				.andExpect(status().isForbidden());
	}

	// ------------------------------------------------------------
	// troca e reset de senha
	// ------------------------------------------------------------

	@Test
	void changePasswordAlteraSenhaEFazNovoLoginComNovaSenha() throws Exception {
		String token = login("carla.recepcao@sorrisopleno.com.br", "dev12345");

		mockMvc.perform(post("/auth/change-password")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"currentPassword": "dev12345", "newPassword": "nova-senha-678"}"""))
				.andExpect(status().isNoContent());

		// senha antiga não funciona mais
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "carla.recepcao@sorrisopleno.com.br", "password": "dev12345"}"""))
				.andExpect(status().isUnauthorized());

		// a nova senha autentica
		login("carla.recepcao@sorrisopleno.com.br", "nova-senha-678");
	}

	@Test
	void resetPasswordForcaTrocaNoProximoLogin() throws Exception {
		String token = login("ana.gerente@sorrisopleno.com.br", "dev12345");

		// id 5 = dra.fernanda — reset administrativo
		mockMvc.perform(post("/users/5/reset-password")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"newPassword": "senha-provisoria-9"}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.forcePasswordChange").value(true));

		// próximo login reporta a troca obrigatória
		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "fernanda.dentista@sorrisopleno.com.br", "password": "senha-provisoria-9"}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.forcePasswordChange").value(true));
	}

	// ------------------------------------------------------------
	// helpers
	// ------------------------------------------------------------

	private String login(String email, String password) throws Exception {
		MvcResult result = mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "%s", "password": "%s"}""".formatted(email, password)))
				.andExpect(status().isOk())
				.andReturn();
		return JsonPath.read(result.getResponse().getContentAsString(), "$.data.token");
	}
}
