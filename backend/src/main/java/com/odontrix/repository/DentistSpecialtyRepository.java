package com.odontrix.repository;

import com.odontrix.entity.DentistSpecialty;
import com.odontrix.entity.DentistSpecialtyId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DentistSpecialtyRepository extends JpaRepository<DentistSpecialty, DentistSpecialtyId> {

	List<DentistSpecialty> findByIdDentistId(Integer dentistId);
}
