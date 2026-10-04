package com.odontrix.repository;

import com.odontrix.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

	List<Expense> findByActiveTrueAndDueDateBetweenOrderByDueDateAsc(LocalDate start, LocalDate end);

	List<Expense> findByCostCenterId(Integer costCenterId);
}
