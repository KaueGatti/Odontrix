package com.odontrix.repository;

import com.odontrix.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Integer> {

	List<Contract> findByPatientIdOrderByGeneratedAtDesc(Integer patientId);
}
