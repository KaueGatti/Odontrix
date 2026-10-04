package com.odontrix.repository;

import com.odontrix.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

	Optional<Payment> findByRefundRefId(Integer originalPaymentId);

	List<Payment> findByPatientIdOrderByDateTimeDesc(Integer patientId);

	List<Payment> findByQuoteId(Integer quoteId);
}
