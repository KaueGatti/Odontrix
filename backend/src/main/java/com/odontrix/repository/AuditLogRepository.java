package com.odontrix.repository;

import com.odontrix.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {

	List<AuditLog> findByTableNameAndRecordIdOrderByOccurredAtDesc(String tableName, Integer recordId);
}
