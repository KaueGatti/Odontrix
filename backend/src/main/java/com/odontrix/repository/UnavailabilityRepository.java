package com.odontrix.repository;

import com.odontrix.entity.Unavailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface UnavailabilityRepository extends JpaRepository<Unavailability, Integer> {

	/** Indisponibilidades que cobrem a data informada (start <= date <= end). */
	@Query("""
			select u from Unavailability u
			where u.dentist.id = :dentistId
			  and u.startDate <= :date
			  and u.endDate >= :date
			""")
	List<Unavailability> findCoveringDate(@Param("dentistId") Integer dentistId, @Param("date") LocalDate date);
}
