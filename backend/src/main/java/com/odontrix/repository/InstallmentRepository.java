package com.odontrix.repository;

import com.odontrix.entity.Installment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface InstallmentRepository extends JpaRepository<Installment, Integer> {

	List<Installment> findByBillingIdOrderByDueDateAsc(Integer billingId);

	List<Installment> findByPaymentDateIsNullAndDueDateBefore(LocalDate date);
}
