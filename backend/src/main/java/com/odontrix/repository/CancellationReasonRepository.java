package com.odontrix.repository;

import com.odontrix.entity.CancellationReason;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CancellationReasonRepository extends JpaRepository<CancellationReason, Integer> {
}
