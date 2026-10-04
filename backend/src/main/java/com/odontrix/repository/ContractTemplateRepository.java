package com.odontrix.repository;

import com.odontrix.entity.ContractTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractTemplateRepository extends JpaRepository<ContractTemplate, Integer> {

	List<ContractTemplate> findByActiveTrueOrderByNameAsc();
}
