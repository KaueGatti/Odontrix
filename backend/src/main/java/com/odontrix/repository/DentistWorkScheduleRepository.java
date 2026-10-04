package com.odontrix.repository;

import com.odontrix.entity.DentistWorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DentistWorkScheduleRepository extends JpaRepository<DentistWorkSchedule, Integer> {

	List<DentistWorkSchedule> findByDentistIdAndValidToIsNullOrderByDayOfWeekAscStartTimeAsc(Integer dentistId);

	List<DentistWorkSchedule> findByDentistId(Integer dentistId);
}
