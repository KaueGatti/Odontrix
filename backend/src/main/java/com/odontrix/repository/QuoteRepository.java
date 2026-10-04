package com.odontrix.repository;

import com.odontrix.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface QuoteRepository extends JpaRepository<Quote, Integer>, JpaSpecificationExecutor<Quote> {

	List<Quote> findByPatientIdOrderByCreatedAtDesc(Integer patientId);
}
