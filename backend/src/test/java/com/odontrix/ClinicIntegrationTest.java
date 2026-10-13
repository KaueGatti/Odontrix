package com.odontrix;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração de /clinic, /clinic-settings e /clinic/bank-accounts
 * contra um PostgreSQL 16 efêmero (Testcontainers) com o seed do Flyway.
 *
 * Senha de todos os usuários do seed: dev12345.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(OrderAnnotation.class)
class ClinicIntegrationTest {

	@Container
	@ServiceConnection
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

	@Autowired
	MockMvc mockMvc;

	String managerToken;
	String receptionistToken;
	String dentistToken;

	@BeforeAll
	void loginUsers() throws Exception {
		managerToken = login("gerente.ana");
		receptionistToken = login("recepcao.bruna");
		dentistToken = login("dr.eduardo");
	}

	private String login(String login) throws Exception {
		MvcResult result = mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"login": "%s", "password": "dev12345"}""".formatted(login)))
				.andExpect(status().isOk())
				.andReturn();
		return JsonPath.read(result.getResponse().getContentAsString(), "$.data.token");
	}

	// ------------------------------------------------------------
	// GET /clinic — singleton, leitura liberada a todos os perfis
	// ------------------------------------------------------------

	@Test
	@Order(1)
	void getClinicaRetornaDadosDoSeed() throws Exception {
		mockMvc.perform(get("/clinic").header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.name").value("Clínica Odontológica Sorriso Pleno"))
				.andExpect(jsonPath("$.data.cnpj").value("12.345.678/0001-90"))
				.andExpect(jsonPath("$.data.phone").value("(19) 3333-4444"))
				.andExpect(jsonPath("$.data.contactEmail").value("contato@sorrisopleno.com.br"))
				.andExpect(jsonPath("$.data.openingTime").value("08:00:00"))
				.andExpect(jsonPath("$.data.closingTime").value("19:00:00"))
				.andExpect(jsonPath("$.data.active").value(true))
				.andExpect(jsonPath("$.data.address.cep").value("13500-000"))
				.andExpect(jsonPath("$.data.address.city").value("Rio Claro"))
				.andExpect(jsonPath("$.data.address.state").value("SP"));
	}

	@Test
	@Order(2)
	void getClinicaLiberadaParaTodosOsPerfis() throws Exception {
		mockMvc.perform(get("/clinic").header("Authorization", "Bearer " + receptionistToken))
				.andExpect(status().isOk());
		mockMvc.perform(get("/clinic").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isOk());
	}

	@Test
	@Order(3)
	void getClinicaSemTokenRetorna401ProblemJson() throws Exception {
		mockMvc.perform(get("/clinic"))
				.andExpect(status().isUnauthorized())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"));
	}

	// ------------------------------------------------------------
	// PATCH /clinic — somente manager
	// ------------------------------------------------------------

	@Test
	@Order(4)
	void patchClinicaBloqueadaParaRecepcionistaEDentista() throws Exception {
		String body = """
				{"name": "Outra Clínica"}""";

		mockMvc.perform(patch("/clinic")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isForbidden())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"));

		mockMvc.perform(patch("/clinic")
						.header("Authorization", "Bearer " + dentistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isForbidden());
	}

	@Test
	@Order(5)
	void patchClinicaComCnpjVazioNaoAltera() throws Exception {
		// Campos em branco preservam o valor atual (PATCH parcial)
		mockMvc.perform(patch("/clinic")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"cnpj": "", "phone": "(19) 3333-4444"}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.cnpj").value("12.345.678/0001-90"))
				.andExpect(jsonPath("$.data.cnpj").value(not("")));
	}
	@Test
	@Order(6)
	void patchClinicaAtualizaDadosEEndereco() throws Exception {
		mockMvc.perform(patch("/clinic")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "name": "Clínica Sorriso Pleno Odontologia",
								  "phone": "(19) 3555-6666",
								  "contactEmail": "novo@sorrisopleno.com.br",
								  "openingTime": "07:30",
								  "closingTime": "18:30",
								  "address": {
								    "cep": "13500-100",
								    "street": "Avenida Nova",
								    "number": "1000",
								    "neighborhood": "Jardim Novo",
								    "city": "Rio Claro",
								    "state": "SP"
								  }
								}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.name").value("Clínica Sorriso Pleno Odontologia"))
				.andExpect(jsonPath("$.data.cnpj").value("12.345.678/0001-90"))
				.andExpect(jsonPath("$.data.openingTime").value("07:30:00"))
				.andExpect(jsonPath("$.data.closingTime").value("18:30:00"))
				.andExpect(jsonPath("$.data.address.cep").value("13500-100"))
				.andExpect(jsonPath("$.data.address.complement").value(""));

		// Persistência: GET retorna os valores atualizados
		mockMvc.perform(get("/clinic").header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.name").value("Clínica Sorriso Pleno Odontologia"))
				.andExpect(jsonPath("$.data.address.street").value("Avenida Nova"))
				.andExpect(jsonPath("$.data.address.complement").value(""));
	}

	@Test
	@Order(7)
	void patchClinicaComEnderecoIncompletoRetorna422ComCampos() throws Exception {
		mockMvc.perform(patch("/clinic")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "address": {
								    "cep": "",
								    "street": "Avenida Nova",
								    "number": "1000",
								    "neighborhood": "Jardim Novo",
								    "city": "Rio Claro"
								  }
								}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"))
				// Campos aninhados chegam prefixados com o caminho do objeto
				.andExpect(jsonPath("$.fields['address.cep']").exists())
				.andExpect(jsonPath("$.fields['address.state']").exists());
	}
	// ------------------------------------------------------------
	// /clinic-settings — somente manager, PATCH com minimums da spec
	// ------------------------------------------------------------

	@Test
	@Order(8)
	void getSettingsSomenteManager() throws Exception {
		mockMvc.perform(get("/clinic-settings").header("Authorization", "Bearer " + receptionistToken))
				.andExpect(status().isForbidden())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"));

		mockMvc.perform(get("/clinic-settings").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/clinic-settings").header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.lateInterestPercent").value(1.0))
				.andExpect(jsonPath("$.data.lateFeePercent").value(2.0))
				.andExpect(jsonPath("$.data.defaultDueDays").value(30))
				.andExpect(jsonPath("$.data.appointmentReminderLeadHours").value(24))
				.andExpect(jsonPath("$.data.sessionTimeoutMinutes").value(15));
	}

	@Test
	@Order(9)
	void patchSettingsAtualizaValores() throws Exception {
		mockMvc.perform(patch("/clinic-settings")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "lateInterestPercent": 1.5,
								  "defaultDueDays": 45,
								  "sessionTimeoutMinutes": 30
								}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.lateInterestPercent").value(1.5))
				.andExpect(jsonPath("$.data.lateFeePercent").value(2.0))
				.andExpect(jsonPath("$.data.defaultDueDays").value(45))
				.andExpect(jsonPath("$.data.sessionTimeoutMinutes").value(30));
	}

	@Test
	@Order(10)
	void patchSettingsComValoresAbaixoDoMinimoRetorna422() throws Exception {
		mockMvc.perform(patch("/clinic-settings")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "lateFeePercent": -1,
								  "defaultDueDays": 0,
								  "appointmentReminderLeadHours": 0
								}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"))
				.andExpect(jsonPath("$.fields.lateFeePercent").exists())
				.andExpect(jsonPath("$.fields.defaultDueDays").exists())
				.andExpect(jsonPath("$.fields.appointmentReminderLeadHours").exists());
	}
	// ------------------------------------------------------------
	// /clinic/bank-accounts — todas as operações somente manager
	// ------------------------------------------------------------

	@Test
	@Order(11)
	void bankAccountsSomenteManager() throws Exception {
		mockMvc.perform(get("/clinic/bank-accounts").header("Authorization", "Bearer " + receptionistToken))
				.andExpect(status().isForbidden())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"));

		mockMvc.perform(get("/clinic/bank-accounts").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/clinic/bank-accounts")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"bankName": "Itaú", "agency": "0001", "account": "55555-5", "cedenteCode": "111222"}"""))
				.andExpect(status().isForbidden());
	}

	@Test
	@Order(12)
	void bankAccountsListaContaDoSeed() throws Exception {
		mockMvc.perform(get("/clinic/bank-accounts").header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(1)))
				.andExpect(jsonPath("$.data[0].bankName").value("Sicredi"))
				.andExpect(jsonPath("$.data[0].agency").value("0748"))
				.andExpect(jsonPath("$.data[0].cedenteCode").value("748900"))
				.andExpect(jsonPath("$.data[0].active").value(true));
	}

	@Test
	@Order(13)
	void bankAccountsCriaEditaEInativa() throws Exception {
		MvcResult created = mockMvc.perform(post("/clinic/bank-accounts")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"bankName": "Bradesco", "agency": "1234", "account": "98765-4", "cedenteCode": "123456"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.id").exists())
				.andExpect(jsonPath("$.data.bankName").value("Bradesco"))
				.andExpect(jsonPath("$.data.active").value(true))
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		// Inativação via active:false — não há DELETE na spec
		mockMvc.perform(patch("/clinic/bank-accounts/" + id)
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"bankName": "Bradesco S.A.", "agency": "1234", "account": "98765-4",
								 "cedenteCode": "123456", "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.bankName").value("Bradesco S.A."))
				.andExpect(jsonPath("$.data.active").value(false))
				.andExpect(jsonPath("$.data.updatedAt").exists());

		mockMvc.perform(get("/clinic/bank-accounts").header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(2)));

		// Recurso inexistente → 404
		mockMvc.perform(patch("/clinic/bank-accounts/999")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"bankName": "X", "agency": "1", "account": "1", "cedenteCode": "1"}"""))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(14)
	void bankAccountsPostSemCamposObrigatoriosRetorna422() throws Exception {
		mockMvc.perform(post("/clinic/bank-accounts")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"bankName": "Itaú"}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"))
				.andExpect(jsonPath("$.fields.agency").exists())
				.andExpect(jsonPath("$.fields.account").exists())
				.andExpect(jsonPath("$.fields.cedenteCode").exists());
	}
}
