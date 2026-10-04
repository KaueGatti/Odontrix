package com.odontrix.repository;

import com.odontrix.entity.PaymentExpense;
import com.odontrix.entity.PaymentExpenseId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentExpenseRepository extends JpaRepository<PaymentExpense, PaymentExpenseId> {

	List<PaymentExpense> findByIdExpenseId(Integer expenseId);
}
