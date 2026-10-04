package com.odontrix.repository;

import com.odontrix.entity.Appointment;
import com.odontrix.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.OffsetDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer>, JpaSpecificationExecutor<Appointment> {

	List<Appointment> findByDentistIdAndStatusNotAndScheduledDateTimeBetween(
			Integer dentistId, AppointmentStatus status, OffsetDateTime start, OffsetDateTime end);

	List<Appointment> findByPatientIdOrderByScheduledDateTimeDesc(Integer patientId);
}
