package com.odontrix.repository;

import com.odontrix.entity.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CostCenterRepository extends JpaRepository<CostCenter, Integer> {

	List<CostCenter> findByActiveTrueOrderByNameAsc();
}
