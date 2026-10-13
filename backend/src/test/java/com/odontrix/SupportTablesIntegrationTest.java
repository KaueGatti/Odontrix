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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração das tabelas de apoio e do catálogo de procedimentos
 * contra um PostgreSQL 16 efêmero (Testcontainers) com o seed do Flyway.
 *
 * Cobertura por recurso: paginação, filtros, CRUD com soft-delete,
 * duplicados (422), 403 por perfil, 404 e 401.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(OrderAnnotation.class)
class SupportTablesIntegrationTest {

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
	// Autenticação
	// ------------------------------------------------------------

	@Test
	@Order(1)
	void qualquerEndpointSemTokenRetorna401ProblemJson() throws Exception {
		mockMvc.perform(get("/appointment-types"))
				.andExpect(status().isUnauthorized())
				.andExpect(content().contentTypeCompatibleWith("application/problem+json"));
	}

	// ------------------------------------------------------------
	// /appointment-types — GET todos; POST/PATCH manager+receptionist
	// ------------------------------------------------------------

	@Test
	@Order(3)
	void appointmentTypesFluxoCompleto() throws Exception {
		// GET liberado a todos os perfis (seed tem 4 tipos)
		mockMvc.perform(get("/appointment-types").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(4)))
				.andExpect(jsonPath("$.meta.total").value(4))
				.andExpect(jsonPath("$.data[0].name").value("Consulta de rotina"))
				.andExpect(jsonPath("$.data[0].active").value(true));

		// Receptionist pode criar
		MvcResult created = mockMvc.perform(post("/appointment-types")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Retorno", "description": "Consulta de retorno"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.name").value("Retorno"))
				.andExpect(jsonPath("$.data.active").value(true))
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		// Nome duplicado (ignore case) → 422
		mockMvc.perform(post("/appointment-types")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "limpeza"}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.fields.name").exists());

		// Inativação via active:false
		mockMvc.perform(patch("/appointment-types/" + id)
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Retorno", "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.active").value(false));

		// Dentista não pode criar
		mockMvc.perform(post("/appointment-types")
						.header("Authorization", "Bearer " + dentistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Cirurgia"}"""))
				.andExpect(status().isForbidden());

		// 404 em recurso inexistente
		mockMvc.perform(get("/appointment-types/999").header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isNotFound());
	}
	@Test
	@Order(2)
	void appointmentTypesPaginacao() throws Exception {
		mockMvc.perform(get("/appointment-types?page=1&limit=2")
						.header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(2)))
				.andExpect(jsonPath("$.meta.total").value(4))
				.andExpect(jsonPath("$.meta.page").value(1))
				.andExpect(jsonPath("$.meta.perPage").value(2))
				.andExpect(jsonPath("$.meta.totalPages").value(2));

		// Página além do fim retorna lista vazia
		mockMvc.perform(get("/appointment-types?page=3&limit=2")
						.header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(0)));

		// limit=0 viola @Positive → 422
		mockMvc.perform(get("/appointment-types?limit=0")
						.header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isUnprocessableEntity());
	}

	// ------------------------------------------------------------
	// /cancellation-reasons — GET todos; POST/PATCH manager+receptionist
	// ------------------------------------------------------------

	@Test
	@Order(4)
	void cancellationReasonsFluxoCompleto() throws Exception {
		mockMvc.perform(get("/cancellation-reasons").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(3)))
				.andExpect(jsonPath("$.data[0].description").value("Paciente solicitou cancelamento"));

		MvcResult created = mockMvc.perform(post("/cancellation-reasons")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Viagem do paciente"}"""))
				.andExpect(status().isCreated())
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		mockMvc.perform(post("/cancellation-reasons")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "VIAGEM DO PACIENTE"}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.fields.description").exists());

		mockMvc.perform(patch("/cancellation-reasons/" + id)
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Viagem do paciente", "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.active").value(false));

		mockMvc.perform(post("/cancellation-reasons")
						.header("Authorization", "Bearer " + dentistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Outro motivo"}"""))
				.andExpect(status().isForbidden());
	}

	// ------------------------------------------------------------
	// /specialties — GET todos; POST/PATCH manager+receptionist
	// ------------------------------------------------------------

	@Test
	@Order(5)
	void specialtiesFluxoCompleto() throws Exception {
		mockMvc.perform(get("/specialties").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(4)))
				.andExpect(jsonPath("$.data[0].name").value("Clínico Geral"));

		MvcResult created = mockMvc.perform(post("/specialties")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Periodontia"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.name").value("Periodontia"))
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		mockMvc.perform(post("/specialties")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "ortodontia"}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.fields.name").exists());

		mockMvc.perform(patch("/specialties/" + id)
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Periodontia", "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.active").value(false));

		mockMvc.perform(post("/specialties")
						.header("Authorization", "Bearer " + dentistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Odontopediatria"}"""))
				.andExpect(status().isForbidden());
	}
	// ------------------------------------------------------------
	// /referral-sources — GET manager+receptionist; POST/PATCH manager
	// ------------------------------------------------------------

	@Test
	@Order(6)
	void referralSourcesFluxoCompleto() throws Exception {
		// Dentista não tem acesso de leitura
		mockMvc.perform(get("/referral-sources").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/referral-sources").header("Authorization", "Bearer " + receptionistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(4)))
				.andExpect(jsonPath("$.data[0].description").value("Indicação"));

		// Receptionist não pode criar
		mockMvc.perform(post("/referral-sources")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Cartazes"}"""))
				.andExpect(status().isForbidden());

		MvcResult created = mockMvc.perform(post("/referral-sources")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Cartazes"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.active").value(true))
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		mockMvc.perform(patch("/referral-sources/" + id)
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Cartazes e banners", "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.description").value("Cartazes e banners"))
				.andExpect(jsonPath("$.data.active").value(false));

		// Receptionist não pode editar
		mockMvc.perform(patch("/referral-sources/" + id)
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "X"}"""))
				.andExpect(status().isForbidden());
	}

	// ------------------------------------------------------------
	// /referral-types — GET manager+receptionist; POST/PATCH manager
	// ------------------------------------------------------------

	@Test
	@Order(7)
	void referralTypesFluxoCompleto() throws Exception {
		mockMvc.perform(get("/referral-types").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/referral-types").header("Authorization", "Bearer " + receptionistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(6)))
				.andExpect(jsonPath("$.data[0].description").value("Paciente"))
				.andExpect(jsonPath("$.data[0].requiresReferrer").value(true))
				.andExpect(jsonPath("$.data[5].description").value("Outro"))
				.andExpect(jsonPath("$.data[5].requiresReferrer").value(false));

		MvcResult created = mockMvc.perform(post("/referral-types")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Parceiro comercial"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.requiresReferrer").value(false))
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		mockMvc.perform(patch("/referral-types/" + id)
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Parceiro comercial", "requiresReferrer": true, "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.requiresReferrer").value(true))
				.andExpect(jsonPath("$.data.active").value(false));

		mockMvc.perform(post("/referral-types")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Site"}"""))
				.andExpect(status().isForbidden());
	}

	// ------------------------------------------------------------
	// /attachment-types — GET todos; POST/PATCH apenas manager
	// ------------------------------------------------------------

	@Test
	@Order(8)
	void attachmentTypesFluxoCompleto() throws Exception {
		mockMvc.perform(get("/attachment-types").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(4)))
				.andExpect(jsonPath("$.data[0].description").value("Radiografia"));

		// Receptionist não pode criar (manager-only)
		mockMvc.perform(post("/attachment-types")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Documento"}"""))
				.andExpect(status().isForbidden());

		MvcResult created = mockMvc.perform(post("/attachment-types")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Documento"}"""))
				.andExpect(status().isCreated())
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		mockMvc.perform(patch("/attachment-types/" + id)
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Documento", "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.active").value(false));
	}
	// ------------------------------------------------------------
	// /payment-methods — GET todos; POST/PATCH manager; sem paginação
	// ------------------------------------------------------------

	@Test
	@Order(9)
	void paymentMethodsFluxoCompleto() throws Exception {
		mockMvc.perform(get("/payment-methods").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(4)))
				.andExpect(jsonPath("$.data[0].description").value("Cartão de Débito"))
				// Sem soft-delete no schema — resposta não possui "active"
				.andExpect(jsonPath("$.data[0].active").doesNotExist());

		mockMvc.perform(post("/payment-methods")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Pix"}"""))
				.andExpect(status().isForbidden());

		MvcResult created = mockMvc.perform(post("/payment-methods")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Pix"}"""))
				.andExpect(status().isCreated())
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		mockMvc.perform(patch("/payment-methods/" + id)
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"description": "Pix (chave)"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.description").value("Pix (chave)"))
				.andExpect(jsonPath("$.data.active").doesNotExist());
	}
	// ------------------------------------------------------------
	// /cost-centers — GET manager+receptionist com filtros; POST/PATCH manager
	// ------------------------------------------------------------

	@Test
	@Order(10)
	void costCentersFluxoCompleto() throws Exception {
		mockMvc.perform(get("/cost-centers").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/cost-centers").header("Authorization", "Bearer " + receptionistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(3)))
				.andExpect(jsonPath("$.data[0].name").value("Consultório"))
				.andExpect(jsonPath("$.data[0].type").value("income"));

		// Filtros deepObject da spec
		mockMvc.perform(get("/cost-centers?filter[type]=income")
						.header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(1)))
				.andExpect(jsonPath("$.data[0].type").value("income"));

		mockMvc.perform(get("/cost-centers?filter[type]=expense")
						.header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(2)));

		mockMvc.perform(get("/cost-centers?filter[type]=income&filter[active]=true")
						.header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(1)));

		mockMvc.perform(post("/cost-centers")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Insumos", "type": "expense"}"""))
				.andExpect(status().isForbidden());

		MvcResult created = mockMvc.perform(post("/cost-centers")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Insumos", "description": "Materiais odontológicos", "type": "expense"}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.type").value("expense"))
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		// Nome duplicado (ignore case) → 422
		mockMvc.perform(post("/cost-centers")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "marketing", "type": "expense"}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.fields.name").exists());

		mockMvc.perform(patch("/cost-centers/" + id)
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Insumos", "type": "expense", "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.active").value(false));

		// Sem "type" (required na spec) → 422
		mockMvc.perform(post("/cost-centers")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Sem tipo"}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.fields.type").exists());
	}
	// ------------------------------------------------------------
	// /procedures — GET todos com filtros; POST/PATCH manager+receptionist
	// ------------------------------------------------------------

	@Test
	@Order(11)
	void proceduresFluxoCompleto() throws Exception {
		mockMvc.perform(get("/procedures").header("Authorization", "Bearer " + dentistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(5)))
				.andExpect(jsonPath("$.meta.total").value(5))
				.andExpect(jsonPath("$.data[0].referencePrice").value(150.00));

		// Busca parcial por nome
		mockMvc.perform(get("/procedures?filter[name]=canal")
						.header("Authorization", "Bearer " + receptionistToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data", hasSize(1)))
				.andExpect(jsonPath("$.data[0].name").value("Tratamento de canal"));

		mockMvc.perform(get("/procedures?filter[active]=true")
						.header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.meta.total").value(5));

		// Dentista não pode criar (catálogo é gestão de recepção/gerência)
		mockMvc.perform(post("/procedures")
						.header("Authorization", "Bearer " + dentistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Extração de siso", "referencePrice": 350.00}"""))
				.andExpect(status().isForbidden());

		MvcResult created = mockMvc.perform(post("/procedures")
						.header("Authorization", "Bearer " + receptionistToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Extração de siso", "referencePrice": 350.00}"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.referencePrice").value(350.00))
				.andExpect(jsonPath("$.data.active").value(true))
				.andReturn();

		Integer id = JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

		// Sem referencePrice (required) → 422
		mockMvc.perform(post("/procedures")
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Sem preço"}"""))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.fields.referencePrice").exists());

		mockMvc.perform(patch("/procedures/" + id)
						.header("Authorization", "Bearer " + managerToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name": "Extração de siso", "referencePrice": 380.00, "active": false}"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.referencePrice").value(380.00))
				.andExpect(jsonPath("$.data.active").value(false));

		mockMvc.perform(get("/procedures/999").header("Authorization", "Bearer " + managerToken))
				.andExpect(status().isNotFound());
	}
}

