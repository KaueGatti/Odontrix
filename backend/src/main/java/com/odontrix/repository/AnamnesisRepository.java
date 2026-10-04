package com.odontrix.repository;

import com.odontrix.entity.Anamnesis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnamnesisRepository extends JpaRepository<Anamnesis, Integer> {

	List<Anamnesis> findByPatientIdOrderByRecordDateDesc(Integer patientId);
}
