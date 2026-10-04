package com.odontrix;

import com.odontrix.entity.Boleto;
import com.odontrix.entity.BoletoStatus;
import com.odontrix.repository.AuditLogRepository;
import com.odontrix.repository.BoletoRepository;
import com.odontrix.repository.DentistSpecialtyRepository;
import com.odontrix.repository.DentistWorkScheduleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Smoke test de leitura sobre o seed do Flyway — valida que os mapeamentos
 * das entities (enums nativos, JSONB, relações, chaves compostas) casam com
 * o schema e leem os dados corretamente. O contexto subir com
 * {@code ddl-auto: validate} já é a prova de mapeamento; aqui validamos
 * conteúdo.
 */
@SpringBootTest
@Testcontainers
class DomainEntitiesTest {

	@Container
	@ServiceConnection
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

	@Autowired
	BoletoRepository boletoRepository;

	@Autowired
	DentistSpecialtyRepository dentistSpecialtyRepository;

	@Autowired
	DentistWorkScheduleRepository workScheduleRepository;

	@Autowired
	AuditLogRepository auditLogRepository;

	@Test
	@Transactional(readOnly = true)
	void boletoSeedVencidoEComputadoCorretamente() {
		// boleto id=1 do seed: registered + due_date no passado (ver notas da V2)
		Boleto boleto = boletoRepository.findById(1).orElseThrow();

		assertThat(boleto.getStatus()).isEqualTo(BoletoStatus.registered);
		assertThat(boleto.getPaidAt()).isNull();
		assertThat(boleto.isOverdue()).isTrue();
	}

	@Test
	@Transactional(readOnly = true)
	void dentistaEduardoTemDuasEspecialidadesESabadoNoHorario() {
		// seed: Eduardo (dentist_id 1) tem especialidades 1 e 2
		assertThat(dentistSpecialtyRepository.findByIdDentistId(1)).hasSize(2);

		// seed: seg-sex 08:00-18:00 + sábado 08:00-12:00
		assertThat(workScheduleRepository.findByDentistId(1)).hasSize(6);
	}

	@Test
	@Transactional(readOnly = true)
	void auditoriaTemRegistrosDeAmostraDoSeed() {
		// seed insere 3 registros de auditoria manualmente
		assertThat(auditLogRepository.count()).isGreaterThanOrEqualTo(3);
	}
}
