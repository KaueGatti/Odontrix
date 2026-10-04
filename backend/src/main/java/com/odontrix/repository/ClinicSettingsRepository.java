package com.odontrix.repository;

import com.odontrix.entity.ClinicSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, Integer> {
}
