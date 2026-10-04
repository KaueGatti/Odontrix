package com.odontrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Horário padrão semanal do dentista — VERSIONADO: nunca atualizar registro
 * vigente; fechar {@code validTo} e inserir novo. Exclusion constraint GIST
 * impede sobreposição de períodos (dentista + dia da semana).
 */
@Entity
@Table(name = "dentist_work_schedule")
@Getter
@Setter
@NoArgsConstructor
public class DentistWorkSchedule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dentist_id", nullable = false)
	private Dentist dentist;

	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(name = "day_of_week", nullable = false)
	private DayOfWeek dayOfWeek;

	@Column(name = "start_time", nullable = false)
	private LocalTime startTime;

	@Column(name = "end_time", nullable = false)
	private LocalTime endTime;

	@Column(name = "start_break")
	private LocalTime startBreak;

	@Column(name = "end_break")
	private LocalTime endBreak;

	/** FALSE = não trabalha nesse dia. */
	@Column(nullable = false)
	private Boolean active = Boolean.TRUE;

	@Column(name = "valid_from", nullable = false)
	private LocalDate validFrom = LocalDate.now();

	/** NULL = vigente. */
	@Column(name = "valid_to")
	private LocalDate validTo;
}
