package com.odontrix.repository;

import com.odontrix.entity.DentalPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DentalPlanRepository extends JpaRepository<DentalPlan, Integer> {
}
