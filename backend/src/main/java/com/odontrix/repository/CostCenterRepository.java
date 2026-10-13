package com.odontrix.repository;

import com.odontrix.entity.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface CostCenterRepository extends JpaRepository<CostCenter, Integer>,
		JpaSpecificationExecutor<CostCenter> {

	List<CostCenter> findByActiveTrueOrderByNameAsc();

	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndIdNot(String name, Integer id);
}
