package com.odontrix.repository;

import com.odontrix.entity.ContractTemplateVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractTemplateVersionRepository extends JpaRepository<ContractTemplateVersion, Integer> {

	Optional<ContractTemplateVersion> findFirstByContractTemplateIdOrderByVersionNumberDesc(Integer contractTemplateId);

	List<ContractTemplateVersion> findByContractTemplateIdOrderByVersionNumberDesc(Integer contractTemplateId);
}
