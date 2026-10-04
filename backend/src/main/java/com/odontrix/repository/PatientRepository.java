package com.odontrix.repository;

import com.odontrix.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Integer> {

	Optional<Patient> findByCpf(String cpf);

	Optional<Patient> findByRg(String rg);
}
