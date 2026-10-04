package com.odontrix.repository;

import com.odontrix.entity.PaymentInstallment;
import com.odontrix.entity.PaymentInstallmentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentInstallmentRepository
		extends JpaRepository<PaymentInstallment, PaymentInstallmentId> {

	List<PaymentInstallment> findByIdInstallmentId(Integer installmentId);
}
