package com.odontrix.repository;

import com.odontrix.entity.Dentist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DentistRepository extends JpaRepository<Dentist, Integer> {

	List<Dentist> findByActiveTrueOrderByFullNameAsc();
}
