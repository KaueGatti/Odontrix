package com.odontrix.repository;

import com.odontrix.entity.DentalProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface DentalProcedureRepository extends JpaRepository<DentalProcedure, Integer>,
		JpaSpecificationExecutor<DentalProcedure> {

	List<DentalProcedure> findByActiveTrueOrderByNameAsc();
}
