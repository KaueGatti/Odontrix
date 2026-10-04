package com.odontrix.repository;

import com.odontrix.entity.Boleto;
import com.odontrix.entity.BoletoStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BoletoRepository extends JpaRepository<Boleto, Integer> {

	List<Boleto> findByInstallmentIdOrderByIssuedAtDesc(Integer installmentId);

	/** Candidatos a "vencido" (status em aberto + data passada) — isOverdue computado. */
	List<Boleto> findByStatusInAndDueDateBeforeAndPaidAtIsNull(List<BoletoStatus> statuses, LocalDate date);
}
