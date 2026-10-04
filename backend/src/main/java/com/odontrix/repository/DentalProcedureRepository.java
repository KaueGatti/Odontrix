package com.odontrix.repository;

import com.odontrix.entity.DentalProcedure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DentalProcedureRepository extends JpaRepository<DentalProcedure, Integer> {

	List<DentalProcedure> findByActiveTrueOrderByNameAsc();
}
