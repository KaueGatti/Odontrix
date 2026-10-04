package com.odontrix.repository;

import com.odontrix.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {

	List<Attachment> findByPatientIdOrderBySentAtDesc(Integer patientId);
}
