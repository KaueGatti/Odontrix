package com.odontrix.repository;

import com.odontrix.entity.AppointmentProcedure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentProcedureRepository extends JpaRepository<AppointmentProcedure, Integer> {

	List<AppointmentProcedure> findByAppointmentId(Integer appointmentId);
}
