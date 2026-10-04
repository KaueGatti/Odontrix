package com.odontrix.repository;

import com.odontrix.entity.QuoteProcedure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuoteProcedureRepository extends JpaRepository<QuoteProcedure, Integer> {

	List<QuoteProcedure> findByQuoteId(Integer quoteId);
}
