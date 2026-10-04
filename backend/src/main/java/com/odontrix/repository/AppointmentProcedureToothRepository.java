package com.odontrix.repository;

import com.odontrix.entity.AppointmentProcedureTooth;
import com.odontrix.entity.AppointmentProcedureToothId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentProcedureToothRepository
		extends JpaRepository<AppointmentProcedureTooth, AppointmentProcedureToothId> {

	List<AppointmentProcedureTooth> findByIdAppointmentProcedureId(Integer appointmentProcedureId);
}
