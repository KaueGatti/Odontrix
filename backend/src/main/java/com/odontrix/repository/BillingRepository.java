package com.odontrix.repository;

import com.odontrix.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillingRepository extends JpaRepository<Billing, Integer> {

	Optional<Billing> findByAppointmentId(Integer appointmentId);

	List<Billing> findByPatientIdOrderByCreatedAtDesc(Integer patientId);
}
