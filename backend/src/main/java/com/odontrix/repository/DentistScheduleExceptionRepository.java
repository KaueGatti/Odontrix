package com.odontrix.repository;

import com.odontrix.entity.DentistScheduleException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DentistScheduleExceptionRepository extends JpaRepository<DentistScheduleException, Integer> {

	Optional<DentistScheduleException> findByDentistIdAndExceptionDate(Integer dentistId, LocalDate exceptionDate);

	List<DentistScheduleException> findByDentistIdAndExceptionDateBetween(Integer dentistId, LocalDate start, LocalDate end);
}
